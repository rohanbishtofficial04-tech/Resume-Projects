import { act } from "react";
import { createRoot } from "react-dom/client";
import { ThemeProvider } from "./ThemeContext";

describe("ThemeProvider default theme", () => {
  let container;
  let root;
  let originalActEnvironment;

  beforeEach(() => {
    originalActEnvironment = globalThis.IS_REACT_ACT_ENVIRONMENT;
    globalThis.IS_REACT_ACT_ENVIRONMENT = true;
    container = document.createElement("div");
    document.body.appendChild(container);
    root = createRoot(container);
    localStorage.clear();
    window.matchMedia = jest.fn((query) => ({
      matches: window.innerWidth < 768,
      media: query,
      onchange: null,
      addListener: jest.fn(),
      removeListener: jest.fn(),
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      dispatchEvent: jest.fn(),
    }));
  });

  afterEach(() => {
    act(() => root.unmount());
    container.remove();
    delete window.matchMedia;
    localStorage.clear();
    if (originalActEnvironment === undefined) {
      delete globalThis.IS_REACT_ACT_ENVIRONMENT;
    } else {
      globalThis.IS_REACT_ACT_ENVIRONMENT = originalActEnvironment;
    }
  });

  it("defaults to Blood on mobile", () => {
    window.innerWidth = 390;

    act(() => root.render(<ThemeProvider><div /></ThemeProvider>));

    expect(document.documentElement.getAttribute("data-theme")).toBe("blood");
  });

  it("defaults to Fog on desktop", () => {
    window.innerWidth = 1024;

    act(() => root.render(<ThemeProvider><div /></ThemeProvider>));

    expect(document.documentElement.getAttribute("data-theme")).toBe("fog");
  });

  it("preserves a previously selected theme", () => {
    window.innerWidth = 390;
    localStorage.setItem("nightfall:theme", "eldritch");

    act(() => root.render(<ThemeProvider><div /></ThemeProvider>));

    expect(document.documentElement.getAttribute("data-theme")).toBe("eldritch");
  });
});
