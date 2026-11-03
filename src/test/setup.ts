import "@testing-library/jest-dom/vitest";

// jsdom n'implémente pas Element.scrollTo (ni HTMLElement.scrollIntoView) —
// un vrai manque de l'environnement, pas un comportement à tester. Sans ce
// polyfill, tout composant qui défile une liste (ChatScreen, par exemple)
// lève "scrollTo is not a function" au montage, en test seulement.
if (typeof Element !== "undefined" && !Element.prototype.scrollTo) {
  Element.prototype.scrollTo = () => {};
}

beforeEach(() => {
  localStorage.clear();
});
