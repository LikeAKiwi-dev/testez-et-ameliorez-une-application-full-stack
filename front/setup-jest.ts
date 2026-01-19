import { setupZoneTestEnv } from 'jest-preset-angular/setup-env/zone';
setupZoneTestEnv();


/* global mocks for jsdom */
const mock = () => {
  let storage: { [key: string]: string } = {};
  return {
    getItem: (key: string) => (key in storage ? storage[key] : null),
    setItem: (key: string, value: string) => (storage[key] = value || ''),
    removeItem: (key: string) => delete storage[key],
    clear: () => (storage = {}),
  };
};

const originalConsoleError = console.error;

console.error = (...args: unknown[]): void => {
  const first = args[0];

  const message =
    typeof first === 'string'
      ? first
      : typeof first === 'object' &&
      first !== null &&
      'message' in first &&
      typeof (first as { message?: unknown }).message === 'string'
        ? (first as { message: string }).message
        : '';

  if (message.includes('Could not parse CSS stylesheet')) {
    return;
  }

  originalConsoleError(...args);
};


Object.defineProperty(window, 'localStorage', { value: mock() });
Object.defineProperty(window, 'sessionStorage', { value: mock() });
Object.defineProperty(window, 'getComputedStyle', {
  value: () => ({
    getPropertyValue: () => '',
  }),
});

Object.defineProperty(document.body.style, 'transform', {
  value: () => {
    return {
      enumerable: true,
      configurable: true,
    };
  },
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  }),
});



/* output shorter and more meaningful Zone error stack traces */
// Error.stackTraceLimit = 2;
