/**
 * Global constants for the test framework
 */

// ========== Timeout Settings ==========
export const TIMEOUTS = {
  DEFAULT: 10000,      // Default timeout for actions (10s)
  SHORT: 5000,         // Short timeout (5s)
  LONG: 30000,         // Long timeout (30s)
  PAGE_LOAD: 15000,    // Page load timeout (15s)
  EXPECT: 10000,       // Assertion timeout (10s)
} as const;

// ========== Waiting States ==========
export const WAIT_STATES = {
  VISIBLE: 'visible',
  ATTACHED: 'attached',
  HIDDEN: 'hidden',
} as const;

// ========== UI Elements Selectors Pattern ==========
export const SELECTOR_PATTERNS = {
  byId: (id: string) => `#${id}`,
  byClass: (className: string) => `.${className}`,
  byAttribute: (attr: string, value: string) => `[${attr}="${value}"]`,
  byText: (text: string) => `text=${text}`,
  helperText: (fieldId: string) => `#${fieldId}-helper-text`,
} as const;

// ========== Common Attributes ==========
export const ATTRIBUTES = {
  TYPE: 'type',
  VALUE: 'value',
  DISABLED: 'disabled',
  ARIA_LABEL: 'aria-label',
} as const;

// ========== Response Codes ==========
export const API_RESPONSE_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  SERVER_ERROR: 500,
} as const;

// ========== Common Test Tags ==========
export const TEST_TAGS = {
  SMOKE: '@smoke',
  REGRESSION: '@regression',
  E2E: '@e2e',
  CRITICAL: '@critical',
} as const;
