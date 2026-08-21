import assert from "node:assert/strict";
import { test } from "node:test";
import { ErrorBoundary } from "./ErrorBoundary.tsx";

// react-dom's legacy synchronous server renderer does not unwind to error
// boundaries (only the streaming renderer does), and this repo has no
// jsdom/browser test environment wired in. A class component's render() is a
// pure function of props/state, so it can be exercised directly without a
// reconciler -- this still proves the exact contract that matters: what
// getDerivedStateFromError does to state, and what render() returns for each
// state, without ever needing a DOM.

test("ErrorBoundary starts in the non-error state and renders children through unchanged", () => {
  const boundary = new ErrorBoundary({
    children: "screen-content",
    description: "desc",
    errorCode: "TEST_CODE",
    title: "title",
  });

  assert.equal(boundary.state.hasError, false);
  assert.equal(boundary.render(), "screen-content");
});

test("getDerivedStateFromError flips to the error state without retaining the thrown error", () => {
  const derived = ErrorBoundary.getDerivedStateFromError(
    new Error("raw internal exception message"),
  );

  assert.deepEqual(derived, { hasError: true });
  assert.equal(
    "error" in derived,
    false,
    "derived state must not carry the raw error forward for rendering",
  );
});

test("once in the error state, render() shows ErrorState instead of the crashed children, with no raw error text", () => {
  const boundary = new ErrorBoundary({
    children: "screen-content",
    description: "Coś poszło nie tak, spróbuj ponownie.",
    errorCode: "TEST_CODE",
    title: "Błąd",
  });
  boundary.state = { hasError: true };

  const fallback = boundary.render() as {
    props: {
      errorCode: string;
      message: string;
      onRetry: (() => void) | undefined;
      title: string;
    };
    type: unknown;
  };

  assert.notEqual(fallback, "screen-content");
  assert.equal(fallback.props.title, "Błąd");
  assert.equal(fallback.props.message, "Coś poszło nie tak, spróbuj ponownie.");
  assert.equal(fallback.props.errorCode, "TEST_CODE");
  assert.doesNotMatch(fallback.props.message, /raw internal exception/);
  assert.equal(typeof fallback.props.onRetry, "function");
});

test("retry always resets the boundary's own error state (never an empty handler), and also runs an optional caller side effect", () => {
  let sideEffectCalls = 0;
  const boundary = new ErrorBoundary({
    children: "screen-content",
    description: "desc",
    errorCode: "TEST_CODE",
    onRetry: () => {
      sideEffectCalls += 1;
    },
    title: "title",
  });
  boundary.state = { hasError: true };
  // Minimal stand-in for the piece of React.Component's instance machinery
  // this test exercises: applying a state update produced by a setState call.
  boundary.setState = (update) => {
    boundary.state = {
      ...boundary.state,
      ...(typeof update === "function" ? update(boundary.state, boundary.props) : update),
    };
  };

  const fallbackBeforeRetry = boundary.render() as {
    props: { onRetry: () => void };
  };
  fallbackBeforeRetry.props.onRetry();

  assert.equal(sideEffectCalls, 1, "the caller-supplied onRetry side effect must run");
  assert.equal(boundary.state.hasError, false, "retry must reset the boundary's own error state");
  assert.equal(boundary.render(), "screen-content");
});

test("retry resets internal state even with no onRetry side effect supplied (screen-level boundary usage)", () => {
  const boundary = new ErrorBoundary({
    children: "screen-content",
    description: "desc",
    errorCode: "TEST_CODE",
    title: "title",
  });
  boundary.state = { hasError: true };
  boundary.setState = (update) => {
    boundary.state = {
      ...boundary.state,
      ...(typeof update === "function" ? update(boundary.state, boundary.props) : update),
    };
  };

  const fallback = boundary.render() as { props: { onRetry: () => void } };
  fallback.props.onRetry();

  assert.equal(boundary.state.hasError, false);
  assert.equal(boundary.render(), "screen-content");
});
