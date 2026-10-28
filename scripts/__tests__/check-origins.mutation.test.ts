import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

/**
 * Validation du garde d'origines PAR MUTATION (cadrage §6.3) :
 * « un garde de CI en liste blanche d'origines, validé par mutation ».
 *
 * Un garde qui n'a jamais attrapé de violation ne prouve rien : il peut
 * être silencieusement cassé. On mute donc intentionnellement des fichiers
 * et on exige que le garde échoue sur chacun. Si une mutation passe,
 * le garde est cassé et le test échoue.
 */

const execFileAsync = promisify(execFile);
const SCRIPT = path.resolve(__dirname, "..", "check-origins.mjs");

let sandbox: string;

beforeAll(async () => {
  sandbox = await mkdtemp(path.join(tmpdir(), "mana-origins-"));
});

afterAll(async () => {
  await rm(sandbox, { recursive: true, force: true });
});

async function runGuard(
  target: string,
  mode: "app" | "serveur" = "app"
): Promise<{ code: number; stdout: string; stderr: string }> {
  try {
    const { stdout } = await execFileAsync("node", [
      SCRIPT,
      target,
      mode === "serveur" ? "--serveur" : "--app",
    ]);
    return { code: 0, stdout, stderr: "" };
  } catch (err) {
    const e = err as { code?: number; stdout?: string; stderr?: string };
    return { code: e.code ?? 1, stdout: e.stdout ?? "", stderr: e.stderr ?? "" };
  }
}

describe("le garde accepte ce qui est légitime", () => {
  it("passe sur un fichier propre", async () => {
    const file = path.join(sandbox, "propre.ts");
    await writeFile(file, 'const x = await fetch("/api/health");\nexport { x };\n');
    const result = await runGuard(sandbox);
    expect(result.code).toBe(0);
    expect(result.stdout).toContain("intacte");
  });

  it("accepte les chemins relatifs internes (routes, assets)", async () => {
    const file = path.join(sandbox, "relatif.ts");
    await writeFile(file, 'import x from "./autre";\nawait fetch("/api/chat");\n');
    const result = await runGuard(sandbox);
    expect(result.code).toBe(0);
  });
});

describe("le garde attrape chaque mutation — sinon il est cassé", () => {
  it("MUTATION 1 : une origine inconnue doit échouer", async () => {
    const file = path.join(sandbox, "mut1.ts");
    await writeFile(
      file,
      'await fetch("https://service-inconnu.example.com/api");\n'
    );
    const result = await runGuard(sandbox);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain("origine non autorisée");
    await rm(file);
  });

  it("MUTATION 2 : supabase doit échouer même en commentaire actif", async () => {
    const file = path.join(sandbox, "mut2.ts");
    await writeFile(file, 'const client = createClient("supabase.co");\n');
    const result = await runGuard(sandbox);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain("supabase");
    await rm(file);
  });

  it("MUTATION 3 : rpc( doit échouer — la fuite par RPC est impossible là où il n'y a pas de RPC", async () => {
    const file = path.join(sandbox, "mut3.ts");
    await writeFile(file, 'const r = await db.rpc("ma_fonction");\n');
    const result = await runGuard(sandbox);
    expect(result.code).not.toBe(0);
    expect(result.stderr).toContain("rpc(");
    await rm(file);
  });

  it("MUTATION 4 : une URL plausible mais non listée doit échouer (le nom plausible coûte plus cher que l'absent)", async () => {
    const file = path.join(sandbox, "mut4.ts");
    await writeFile(
      file,
      'const url = "https://cdn.mana.bzh.evil.example/mana-f-v3.vrm";\n'
    );
    const result = await runGuard(sandbox);
    expect(result.code).not.toBe(0);
    await rm(file);
  });

  it("MUTATION 5 : l'API Mistral appelée depuis src/ doit échouer (le client parle à /api/chat, jamais à Mistral)", async () => {
    const file = path.join(sandbox, "mut5.ts");
    await writeFile(
      file,
      'await fetch("https://api.mistral.ai/v1/chat/completions");\n'
    );
    // l'origine api.mistral.ai est en liste blanche POUR LE SERVEUR (server/),
    // jamais pour src/ — le garde sur src/ doit donc la refuser.
    const result = await runGuard(sandbox, "app");
    expect(result.code).not.toBe(0);
    await rm(file);
  });

  it("MUTATION 6 (contrôle) : la même URL est légitime côté serveur", async () => {
    const result = await runGuard(sandbox, "serveur");
    expect(result.code).toBe(0);
    await rm(path.join(sandbox, "mut5.ts")).catch(() => {});
  });
});
