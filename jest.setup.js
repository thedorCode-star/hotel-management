import '@testing-library/jest-dom';

// Mock Next.js Request and Response
global.Request = class MockRequest {
  constructor(url, options = {}) {
    this.url = url;
    this.method = options.method || 'GET';
    this.headers = new Map(Object.entries(options.headers || {}));
    this.body = options.body;
    this.cookies = new Map();
  }

  json() {
    return Promise.resolve(JSON.parse(this.body || '{}'));
  }
};

global.Response = class MockResponse {
  constructor(body, options = {}) {
    this.body = body;
    this.status = options.status || 200;
    this.headers = new Map(Object.entries(options.headers || {}));
    this.cookies = new Map();
  }

  json() {
    return Promise.resolve(typeof this.body === 'string' ? JSON.parse(this.body) : this.body);
  }
};

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextRequest: global.Request,
  NextResponse: {
    json: (data, options = {}) => {
      const response = new global.Response(JSON.stringify(data), options);
      response.cookies = new Map();
      response.cookies.set = jest.fn();
      return response;
    },
  },
}));

// Mock next/router
jest.mock('next/router', () => ({
  useRouter() {
    return {
      route: '/',
      pathname: '/',
      query: {},
      asPath: '/',
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn().mockResolvedValue(undefined),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
      isFallback: false,
    };
  },
}));

// Mock global fetch
global.fetch = jest.fn();

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
}); 