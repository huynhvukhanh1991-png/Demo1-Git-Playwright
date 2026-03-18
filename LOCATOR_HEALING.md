# Locator Healing Guide

## Overview

Locator Healing (also known as "Resilient Locators") is a critical feature for maintaining stable automated tests when the application's DOM structure changes. This guide explains how to use locator healing strategies in your Playwright framework.

## Why Locator Healing Matters

Traditional selectors break easily when:
- Class names change
- HTML structure is refactored
- Element IDs are generated dynamically
- CSS Grid/Flexbox layouts shift

Resilient locators adapt to these changes automatically, reducing test maintenance burden.

## Implementation

### 1. **Role-Based Locators (MOST RESILIENT)**

Use `getByRole()` whenever possible. It's the most resilient because it's based on accessibility properties that rarely change.

```typescript
// ✅ BEST - Resilient to DOM structure changes
get btnLogin() {
    return this.page.getByRole('button', { name: 'Đăng nhập' });
}

get txtUsername() {
    return this.page.getByRole('textbox', { name: /tài khoản/i });
}
```

**Advantages:**
- Works even if HTML structure changes significantly
- Ensures your app remains accessible
- Easily readable and maintainable

### 2. **Data-TestId Locators (HIGH RESILIENCE)**

Use `data-testid` attributes when elements don't have semantic roles.

```typescript
// ✅ GOOD - Explicit test identifiers
get customDropdown() {
    return this.createTestIdLocator('dropdown-filter');
}

get saveButton() {
    return this.createTestIdLocator('btn-save');
}
```

**Usage in page objects:**
```typescript
protected createTestIdLocator(testId: string): Locator {
    return this.locatorHealing.createTestIdLocator(testId);
}
```

### 3. **Text-Based Locators (MODERATE RESILIENCE)**

When elements can be identified by their text content:

```typescript
// ✅ GOOD - Text is often more stable than structure
get deleteButton() {
    return this.createTextBasedLocator('button', 'Delete');
}

get cancelLink() {
    return this.createTextBasedLocator('a', /Cancel|Hủy/);
}
```

### 4. **Hybrid Locators (FLEXIBLE)**

Combine multiple strategies - the framework tries them intelligently:

```typescript
// ✅ GOOD - Falls back gracefully
get profileMenu() {
    return this.createResilientLocator(
        'role=button name="Profile"',  // role-based (preferred)
        undefined,
        undefined
    );
}
```

### 5. **Contextual Locators (SPECIFIC)**

When multiple similar elements exist, use parent context:

```typescript
// ✅ GOOD - Targets specific element in context
get firstTableRow() {
    return this.createContextualLocator('table', 'tr:first-child');
}

get bookingInCard() {
    return this.createContextualLocator('[data-testid="booking-card"]', '.booking-btn');
}
```

## Locator Resilience Priority (Best to Worst)

| Strategy | Resilience | Example |
|----------|-----------|---------|
| Role + Name | ⭐⭐⭐⭐⭐ | `getByRole('button', { name: 'Submit' })` |
| Data-TestId | ⭐⭐⭐⭐ | `[data-testid="btn-submit"]` |
| Text Content | ⭐⭐⭐ | `button:has-text("Submit")` |
| CSS Class | ⭐⭐ | `.primary-button` |
| Tag + Attribute | ⭐⭐ | `button[type="submit"]` |
| XPath | ⭐ | `//button[@type='submit']` |
| Index/NthChild | ⭐ | `button:nth-child(3)` |

## Best Practices

### ✅ DO:

```typescript
// 1. Use role-based locators
get btnSubmit() {
    return this.page.getByRole('button', { name: 'Submit' });
}

// 2. Add data-testid to components in your app
<button data-testid="submit-btn">Submit</button>

// 3. Use text matching with regex for i18n
get deleteBtn() {
    return this.page.getByRole('button', { name: /delete|xóa/i });
}

// 4. Combine strategies with context
get userEmailInModal() {
    return this.createContextualLocator('.modal', 'input[type="email"]');
}

// 5. Use protective methods for complex actions
async clickWithHealing(locator: Locator) {
    const isHealthy = await this.isLocatorHealthy(locator);
    if (!isHealthy) {
        // Reload or retry
        await this.page.reload();
    }
    await locator.click();
}
```

### ❌ DON'T:

```typescript
// ❌ FRAGILE - Breaks with any structure change
get submit() {
    return this.page.locator('body > div:nth-child(5) > form > button:nth-child(3)');
}

// ❌ FRAGILE - Relies on generated classes
get delete() {
    return this.page.locator('.jsx-12345-abc');
}

// ❌ FRAGILE - Index-based selection
get button() {
    return this.page.locator('button').nth(2);
}

// ❌ FRAGILE - Complex XPath
get element() {
    return this.page.locator('//div[@class="parent"]//button[contains(@class, "btn")]');
}
```

## Using Locator Healing Methods

### Creating Resilient Locators

```typescript
// In your page object class (extends BasePage)

export class MoviePage extends BasePage {
    
    // Method 1: Role-based (preferred)
    get movieTitle() {
        return this.page.getByRole('heading', { name: /movie|phim/i });
    }

    // Method 2: Using test ID
    get bookingButton() {
        return this.createTestIdLocator('btn-book-ticket');
    }

    // Method 3: Text-based
    get cancelButton() {
        return this.createTextBasedLocator('button', 'Cancel');
    }

    // Method 4: Contextual
    get showtimeSelector() {
        return this.createContextualLocator('.showtime-container', 'select');
    }

    // Method 5: Using createResilientLocator
    get priceTag() {
        return this.createResilientLocator(
            '.price',          // CSS selector fallback
            undefined,
            undefined
        );
    }
}
```

### Diagnosing Locator Issues

```typescript
// Check if a locator is healthy
async verifyAndDiagnose() {
    const locator = this.movieTitle;
    
    // Quick health check
    const isHealthy = await this.isLocatorHealthy(locator);
    console.log('Locator is healthy:', isHealthy);

    // Detailed diagnosis
    const diagnosis = await this.diagnoseLocator(locator, 'Movie Title');
    console.log('Diagnosis:', diagnosis);
    // Output: { name: 'Movie Title', count: 1, visible: true, enabled: true, healthy: true, text: 'Avatar' }
}
```

## Configuration Best Practices

### 1. Add Data-TestId to Your Application

Update components to include `data-testid`:

```html
<!-- React Example -->
<button data-testid="btn-submit" onClick={submit}>
    Submit
</button>

<!-- Vue Example -->
<button :data-testid="'btn-submit'" @click="submit">
    Submit
</button>

<!-- Angular Example -->
<button [attr.data-testid]="'btn-submit'" (click)="submit()">
    Submit
</button>
```

### 2. Update playwright.config.ts

Already configured with locator healing support:

```typescript
use: {
    actionTimeout: 10000,
    navigationTimeout: 15000,
},
```

### 3. Use Protected Methods in Page Objects

```typescript
export class AccountPage extends BasePage {

    // Protected healing methods inherited from BasePage
    private healingEnabled = true;

    async updateProfile(newName: string) {
        // Use protected method for resilient locator
        const nameField = this.createTestIdLocator('input-name');
        
        // Additional healing: verify element health
        if (this.healingEnabled) {
            const isHealthy = await this.isLocatorHealthy(nameField);
            if (!isHealthy) {
                await this.page.reload();
            }
        }

        await this.setValueAndBlur(nameField, newName);
    }
}
```

## Testing Locator Resilience

Create a test to verify locator healing works:

```typescript
test('Verify locators are resilient', async ({ page }) => {
    const basePage = new BasePage(page);
    
    // Test various locators
    const locators = [
        { name: 'Login Button', locator: page.getByRole('button', { name: 'Login' }) },
        { name: 'Email Input', locator: page.getByLabel('Email') },
    ];

    for (const { name, locator } of locators) {
        const isHealthy = await basePage.isLocatorHealthy(locator);
        const diagnosis = await basePage.diagnoseLocator(locator, name);
        
        expect(isHealthy, `${name} should be healthy`).toBe(true);
        expect(diagnosis.count).toBeGreaterThan(0);
    }
});
```

## Common Patterns

### Pattern 1: Modal/Dialog Elements

```typescript
// ✅ Resilient approach
get deleteConfirmationDialog() {
    return this.page.getByRole('alertdialog', { name: /delete|xóa/ });
}

get confirmDeleteButton() {
    return this.page.locator('[role="alertdialog"]').getByRole('button', { name: 'Confirm' });
}
```

### Pattern 2: Table Data

```typescript
// ✅ Resilient approach
getTableRow(userId: string) {
    return this.page.locator('tr', { has: this.page.locator(`td:has-text("${userId}")`) });
}

getTableCellValue(row: Locator, columnHeader: string) {
    return row.locator(`td >> text=${columnHeader}`);
}
```

### Pattern 3: Dynamic Lists

```typescript
// ✅ Resilient approach
getListItemByText(text: string) {
    return this.page.locator('li', { has: this.page.locator(`text=${text}`) });
}

getAllEnabledButtons() {
    return this.page.getByRole('button').filter({ disabled: false });
}
```

## Troubleshooting

### Issue: Locator still breaks after using healing

**Solution:** 
1. Check if the element has been removed from DOM
2. Use contextual locators to be more specific
3. Add `waitFor()` calls before interacting
4. Use healing diagnostic to understand the issue

```typescript
// Diagnostic approach
const diagnosis = await this.diagnoseLocator(problemLocator, 'Problem Element');
console.log(diagnosis);
```

### Issue: Locator is too specific/general

**Solution:**
1. Use role-based locators for accessibility
2. Combine role + name for specificity
3. Use contextual locators for uniqueness

## Summary

| Feature | Usage |
|---------|----- |
| Role-based | `this.page.getByRole('button', { name: '...' })` |
| Test ID | `this.createTestIdLocator('id')` |
| Text-based | `this.createTextBasedLocator('button', 'text')` |
| Contextual | `this.createContextualLocator('parent', 'child')` |
| Health Check | `await this.isLocatorHealthy(locator)` |
| Diagnosis | `await this.diagnoseLocator(locator)` |

---

**Reference:** [Playwright Locator Documentation](https://playwright.dev/docs/locators)
