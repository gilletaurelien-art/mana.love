import { useState } from "react";
import { Link } from "react-router-dom";
import { useProgression } from "@/app/ProgressionContext";
import "./modes.css";

const STEPS = [
  {
    title: "Déposer la journée",
    body: "Trois respirations lentes. À chaque expiration, laissez une chose de la journée redescendre.",
    seconds: 40,
  },
  {
    title: "Nommer sans juger",
    body: "Nommez silencieusement ce qui occupe votre esprit. Pas pour le résoudre — juste pour le voir.",
    seconds: 45,
  },
  {
    title: "Inviter le calme",
    body: "Imaginez un lieu apaisant, réel ou imaginaire. Laissez la respiration devenir plus lente à chaque cycle.",
    seconds: 50,
  },
] as const;

export default function SleepScreen() {
  const { reward } = useProgression();
  const [stepIndex, setStepIndex] = useState<number | null>(null);
  const [done, setDone] = useState(false);

  function start() {
    setStepIndex(0);
    setDone(false);
  }

  function next() {
    const i = stepIndex;
    if (i === null) return;
    if (i + 1 >= STEPS.length) {
      setStepIndex(null);
      setDone(true);
      reward("sleep:session-completed", `sleep:${new Date().toISOString().slice(0, 13)}`);
    } else {
      setStepIndex(i + 1);
    }
  }

  const step = stepIndex !== null ? STEPS[stepIndex] : null;

  return (
    <div className="mode">
      <div className="page-header">
        <p className="eyebrow">MANA Sleep</p>
        <h1>Ralentir avant la nuit</h1>
        <p className="lead">
          Trois petits pas vers le sommeil. Aucun son requis, aucun autoplay —
          juste vous et votre respiration.
        </p>
      </div>

      <div className="mode__stage surface surface-pad">
        {done ? (
          <div className="stack stack-4 center">
            <h2>Bonne nuit.</h2>
            <p className="muted">
              Vous avez terminé la séance de dépose du soir. MANA vous
              accompagnera encore demain.
            </p>
            <div className="cluster center">
              <button className="btn btn-secondary" onClick={start}>
                Refaire la séance
              </button>
              <Link to="/parler?avec=luna" className="btn btn-ghost">
                Parler à Luna
              </Link>
            </div>
          </div>
        ) : step && stepIndex !== null ? (
          <div className="stack stack-5 center">
            <p className="quiet">
              Étape {stepIndex + 1} / {STEPS.length} · environ {step.seconds} secondes
            </p>
            <h2>{step.title}</h2>
            <p className="lead center-text">{step.body}</p>
            <button className="btn btn-primary btn-lg" onClick={next}>
              {stepIndex + 1 >= STEPS.length ? "Terminer la séance" : "Étape suivante"}
            </button>
          </div>
        ) : (
          <div className="stack stack-5 center">
            <span className="mode__glyph" aria-hidden="true">☾</span>
            <p className="lead center-text">
              Une séance guidée très courte pour déposer la journée et préparer
              le sommeil.
            </p>
            <button className="btn btn-primary btn-lg" onClick={start}>
              Commencer la séance
            </button>
          </div>
        )}
      </div>

      <div className="demo-banner" role="note">
        <span aria-hidden="true">✦</span>
        <p>
          <strong>Première version.</strong> Les séances guidées audio (voix,
          paysages sonores) arriveront avec l'intégration des capacités audio
          de MANA — voir le README.
        </p>
      </div>
    </div>
  );
}
