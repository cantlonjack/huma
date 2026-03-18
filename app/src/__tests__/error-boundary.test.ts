import { describe, it, expect } from "vitest";
import ErrorBoundary from "@/components/ErrorBoundary";

describe("ErrorBoundary component validation", () => {
  it("is a valid React component class that can be imported", () => {
    expect(ErrorBoundary).toBeDefined();
    expect(typeof ErrorBoundary).toBe("function");
  });

  it("has a prototype with render method (class component)", () => {
    expect(ErrorBoundary.prototype).toBeDefined();
    expect(typeof ErrorBoundary.prototype.render).toBe("function");
  });

  it("has a static getDerivedStateFromError method", () => {
    expect(typeof ErrorBoundary.getDerivedStateFromError).toBe("function");
  });

  it("getDerivedStateFromError returns { hasError: true, error } for a given Error", () => {
    const testError = new Error("Test error message");
    const state = ErrorBoundary.getDerivedStateFromError(testError);
    expect(state).toEqual({
      hasError: true,
      error: testError,
    });
  });

  it("getDerivedStateFromError returns the exact error object passed in", () => {
    const testError = new Error("Specific failure");
    testError.name = "CustomError";
    const state = ErrorBoundary.getDerivedStateFromError(testError);
    expect(state.error).toBe(testError);
    expect(state.error?.message).toBe("Specific failure");
    expect(state.error?.name).toBe("CustomError");
  });

  it("getDerivedStateFromError always sets hasError to true", () => {
    const errors = [
      new Error("Network failure"),
      new TypeError("Cannot read property of null"),
      new RangeError("Maximum call stack size exceeded"),
    ];
    for (const error of errors) {
      const state = ErrorBoundary.getDerivedStateFromError(error);
      expect(state.hasError).toBe(true);
      expect(state.error).toBe(error);
    }
  });

  it("has a componentDidCatch method on the prototype", () => {
    expect(typeof ErrorBoundary.prototype.componentDidCatch).toBe("function");
  });

  it("state shape matches the expected ErrorBoundaryState interface", () => {
    const state = ErrorBoundary.getDerivedStateFromError(new Error("test"));
    // Verify the state has exactly the expected keys
    const keys = Object.keys(state).sort();
    expect(keys).toEqual(["error", "hasError"]);
    // Verify types
    expect(typeof state.hasError).toBe("boolean");
    expect(state.error).toBeInstanceOf(Error);
  });
});
