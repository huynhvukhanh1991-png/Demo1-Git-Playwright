# Playwright Framework Best Practices Guide

## Table of Contents
1. [Using Fixtures](#using-fixtures)
2. [Page Objects](#page-objects)
3. [Testing API](#testing-api)
4. [Writing Tests](#writing-tests)
5. [Performance Tips](#performance-tips)
6. [Debugging](#debugging)

## Using Fixtures

### Standard Page Fixtures
```typescript
import { test, expect } from '../../fixtures/custom-fixtures';

test('Example with page fixtures', async ({ homePage, loginPage, registerPage }) => {
    // Each fixture is automatically initialized
    await homePage.navigateToHomePage();
    // ...
});
```

### Pre-configured States

#### loggedInHomepage
Use when you need an authenticated user already on the homepage:
```typescript
test('User can see personalized content', async ({ loggedInHomepage }) => {
    const { homePage, user } = loggedInHomepage;
    
    // User is already logged in and on homepage
    // Ready to test features requiring authentication
    expect(homePage.getWelcomeMessage()).toContain(user.hoTen);
});
```

#### loggedInUser
Use when you need authentication but want to control navigation:
```typescript
test('User can navigate to account page', async ({ loggedInUser }) => {
    const { user, loginPage } = loggedInUser;
    
    // User is logged in, but you navigate manually
    await loginPage.navigateToAccountPage();
    // ...
});
```

#### apiClient
Use for direct API testing without UI:
```typescript
test('Verify API response', async ({ apiClient }) => {
    const response = await apiClient.get('/api/QuanLyPhim/LayDanhSanhPhim', {
        headers: { 'maNhom': 'GP09' }
    });
    
    expect(response.status).toBe(200);
    expect(response.data).toBeDefined();
});
```

## Page Objects

### Creating a New Page Object

```typescript
import { Page } from '@playwright/test';
import { BaseForm } from './BaseForm';
import { CommonPage } from './CommonPage';

// Extend CommonPage if you need top bar navigation
// Extend BaseForm if working with forms
export class YourPage extends CommonPage {
    readonly page: Page;

    constructor(page: Page) {
        super(page);
        this.page = page;
    }

    // ========== Navigation ==========
    async navigateToYourPage() {
        await this.navigateToPage(pageURLs.yourPage);
    }

    // ========== Locators ==========
    get btnSubmit() {
        return this.page.locator('button:has-text("Submit")');
    }

    get inputSearch() {
        return this.page.locator('#searchInput');
    }

    // ========== Actions ==========
    async searchFor(term: string) {
        await this.setValueAndBlur(this.inputSearch, term);
    }

    async submitForm() {
        await this.clickElement(this.btnSubmit);
    }

    // ========== Verifications ==========
    async verifySubmitSuccess() {
        const successMsg = await this.getElementText(this.successMessage);
        expect(successMsg).toBe('Success!');
    }
}
```

### Using Timeouts in Page Objects

```typescript
import { TIMEOUTS } from '../../tests/config/constants';

export class YourPage {
    // Short timeout for quick operations
    async loadFastData() {
        await this.waitForElementVisible(this.dataLoader, TIMEOUTS.SHORT);
    }

    // Long timeout for slow operations
    async loadSlowData() {
        await this.waitForElementVisible(this.dataLoader, TIMEOUTS.LONG);
    }
}
```

## Testing API

### Using ApiClient

```typescript
import { test } from '../../fixtures/custom-fixtures';
import { API_RESPONSE_CODES } from '../../tests/config/constants';

test('Test API endpoint', async ({ apiClient }) => {
    // GET request
    const getResponse = await apiClient.get('/api/endpoint');
    expect(getResponse.status).toBe(API_RESPONSE_CODES.SUCCESS);

    // POST request with data
    const postResponse = await apiClient.post('/api/users', {
        taiKhoan: 'newuser',
        matKhau: 'password123',
        hoTen: 'New User'
    });
    expect(postResponse.ok).toBeDefined();

    // With custom headers
    const customResponse = await apiClient.get('/api/protected', {
        headers: {
            'Authorization': 'Bearer token123',
            'X-Custom-Header': 'value'
        }
    });

    // With timeout override
    const slowResponse = await apiClient.get('/api/slow-endpoint', {
        timeout: TIMEOUTS.LONG
    });
});
```

### Setting Authorization

```typescript
test.beforeEach(async ({ apiClient }) => {
    // Set bearer token for authenticated requests
    apiClient.setAuthToken('your-jwt-token');
});
```

## Writing Tests

### Test Structure

```typescript
import { test, expect } from '../../fixtures/custom-fixtures';

test('Feature: Specific behavior', async ({ homePage, loginPage }) => {
    // Setup
    const testData = generateTestData();

    // Test
    await test.step('Navigate to page', async () => {
        await homePage.navigateToHomePage();
    });

    await test.step('Perform action', async () => {
        await homePage.performAction(testData);
    });

    // Verify
    await test.step('Verify result', async () => {
        await homePage.verifySuccess();
    });
});
```

### Using Test Tags

```typescript
import { TEST_TAGS } from '../../tests/config/constants';

test('Critical feature @smoke @regression', async ({ homePage }) => {
    // This test runs with: npm run test:smoke
    // And with: npm run test:regression
});

// Or using constants
test(`Booking flow ${TEST_TAGS.E2E}`, async ({ homePage }) => {
    // ...
});
```

### Best Test Practices

```typescript
test('DescriptiveTestName @tag', async ({ loginPage, registerPage }) => {
    // ✅ DO: Use meaningful test names
    // ❌ DON'T: Use generic names like "Test1" or "Login Test"

    // ✅ DO: Use test.step for logical grouping
    await test.step('User registers', async () => {
        // ...
    });

    // ✅ DO: Use soft assertions when appropriate
    await expect.soft(element1).toBeVisible();
    await expect.soft(element2).toBeVisible();
    // Test continues even if one fails

    // ❌ DON'T: Use hard waits
    // await page.waitForTimeout(1000);

    // ✅ DO: Use proper waits
    await loginPage.waitForElementVisible(element);

    // ✅ DO: Use helper functions to reduce duplication
    await fillFormFields(page, { username: 'user1', password: 'pass' });
});
```

## Performance Tips

### 1. Use Efficient Selectors

```typescript
// ✅ GOOD: ID selector (fastest)
const button = page.locator('#submitBtn');

// ✅ GOOD: Text selector (readable)
const link = page.getByRole('link', { name: 'Click Here' });

// ⚠️ AVOID: Complex CSS selectors
const element = page.locator('div > section > article > span.class1.class2');

// ✅ BETTER: Simpler selector or testid
const element = page.locator('[data-testid="article"]');
```

### 2. Reuse Fixtures and Data

```typescript
// ✅ DO: Reuse pre-logged-in state
test('Feature A', async ({ loggedInHomepage }) => {
    // No need to login again
});

test('Feature B', async ({ loggedInHomepage }) => {
    // No need to login again
});

// ❌ DON'T: Login in every test
test('Feature A', async ({ loginPage }) => {
    await loginPage.login('user', 'pass');
});

test('Feature B', async ({ loginPage }) => {
    await loginPage.login('user', 'pass');
});
```

### 3. Parallel Test Execution

```typescript
// Framework supports parallel execution by default (fullyParallel: true)
// Keep tests independent:

// ✅ GOOD: Each test creates/uses different data
test('Create booking', async ({ homePage }) => {
    const bookingData = generateUniqueBooking();
    // ...
});

// ❌ AVOID: Tests depending on each other
// Don't assume another test ran before this one

// ❌ AVOID: Tests sharing resources
// Don't use global variables for test data
```

### 4. Optimize Waits

```typescript
import { TIMEOUTS } from '../../tests/config/constants';

// Use appropriate timeouts
async function waitForContent() {
    // Quick check for visible elements
    await this.wait ForElementVisible(element, TIMEOUTS.SHORT);
    
    // API responses
    await this.waitForElementVisible(loader, TIMEOUTS.DEFAULT);
    
    // Page loads
    await this.navigateToPage(url, TIMEOUTS.PAGE_LOAD);
}
```

## Debugging

### Run in Debug Mode

```bash
npm run test:debug
```

This opens Playwright Inspector where you can:
- Step through tests
- Inspect DOM elements
- Modify and re-run code

### View Test Reports

```bash
npm run report
```

Opens HTML report with:
- Test results
- Screenshots/videos
- Execution timeline

### Use Trace Viewer

```bash
npx playwright show-trace trace.zip
```

Traces are automatically captured on first retry (see config).

### Debug Tests Locally

```typescript
test('Debug test', async ({ page, homePage }) => {
    // Pause execution
    await page.pause();
    
    // Or use keyboard shortcut in debug mode

    // Check page state
    console.log('Current URL:', page.url());
    console.log('DOM HTML:', await page.content());
    
    // Take screenshot
    await page.screenshot({ path: 'screenshot.png' });
});
```

### Verbose Logging

```typescript
import { test } from '../../fixtures/custom-fixtures';

test('With logging @smoke', async ({ homePage }) => {
    console.log('Starting test...');
    
    await test.step('Navigation', async () => {
        console.log('Navigating to home page');
        await homePage.navigateToHomePage();
        console.log('Navigation complete');
    });
});
```

Run with: `npm test -- --headed --reporter=list`

## Common Patterns

### Pattern: Loading Spinner

```typescript
// Wait for spinner to appear then disappear
async function waitForLoading() {
    const spinner = this.page.locator('.loading-spinner');
    await spinner.waitFor({ state: 'visible', timeout: TIMEOUTS.SHORT });
    await spinner.waitFor({ state: 'hidden', timeout: TIMEOUTS.DEFAULT });
}
```

### Pattern: Dynamic Content

```typescript
// Retry operation if content not found
async function getUpdatedContent() {
    return await retryOperation(async () => {
        const content = await this.getElementText(this.dynamicElement);
        if (!content) throw new Error('Content not loaded');
        return content;
    }, 3, 500);
}
```

### Pattern: Form Submission with Validation

```typescript
async function submitFormWithValidation(data: FormData) {
    await fillFormFields(this.page, data, (field) => `#${field}`);
    await this.clickElement(this.submitBtn);
    
    await test.step('Verify success', async () => {
        const result = this.getSuccessMessage();
        await expect(result).toBeVisible();
    });
}
```

## Summary

Key takeaways:
1. Use appropriate fixtures for common test scenarios
2. Create Page Objects with clear, reusable methods
3. Use helper utilities to reduce duplication
4. Use constants for timeouts and configuration
5. Write readable, self-documenting tests
6. Leverage API client for API testing
7. Debug effectively with provided tools
8. Follow performance best practices for fast, reliable tests
