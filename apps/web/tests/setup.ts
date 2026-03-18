import '@testing-library/jest-dom';

// Polyfill ResizeObserver for jsdom (required by @radix-ui/react-slider)
class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

if (typeof globalThis.ResizeObserver === 'undefined') {
  globalThis.ResizeObserver = ResizeObserverStub;
}
