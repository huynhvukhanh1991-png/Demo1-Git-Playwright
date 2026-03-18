# Locator Healing Migration Guide

This guide helps you migrate existing page objects to use resilient locators with healing support.

## Migration Checklist

- [ ] Understand resilience tiers
- [ ] Review existing page objects
- [ ] Update fragile locators first (critical paths)
- [ ] Add data-testid to your app components
- [ ] Test the updated page objects
- [ ] Document any custom healing patterns

## Step-by-Step Migration

### Step 1: Audit Current Locators

Review your page objects and categorize locators by fragility:

```typescript
// ❌ FRAGILE (Priority 1 for migration)
get deleteButton() {
    return this.page.locator('body > div:nth-child(3) > button:nth-child(2)');
}

// ❌ FRAGILE (Priority 2)
get userMenu() {
    return this.page.locator('.jsx-abc123');
}

// ⚠️ MODERATE (Priority 3)
get submitBtn() {
    return this.page.locator('.primary-btn');
}

// ✅ GOOD (No change needed)
get loginButton() {
    return this.page.getByRole('button', { name: 'Login' });
}
```

### Step 2: Rewrite Fragile Locators

#### Pattern 1: Nth-Child Selectors

**BEFORE (Fragile):**
```typescript
get addButton() {
    return this.page.locator('div.button-group > button:nth-child(1)');
}

get deleteButton() {
    return this.page.locator('div.button-group > button:nth-child(2)');
}
```

**AFTER (Resilient):**
```typescript
get addButton() {
    return this.page.getByRole('button', { name: 'Add' });
}

get deleteButton() {
    return this.page.getByRole('button', { name: 'Delete' });
}
```

#### Pattern 2: Generated Class Names

**BEFORE (Fragile):**
```typescript
get userProfile() {
    return this.page.locator('.jsx-12345-abc');
}
```

**AFTER (Resilient):**
```typescript
get userProfile() {
    // Option 1: Use role if available
    return this.page.getByRole('button', { name: 'Profile' });

    // Option 2: Use data-testid if added to app
    // return this.createTestIdLocator('user-profile');
}
```

#### Pattern 3: Multiple Nested Divs

**BEFORE (Fragile):**
```typescript
get modal() {
    return this.page.locator('body > div:nth-child(5) > div > div > div');
}
```

**AFTER (Resilient):**
```typescript
get modal() {
    return this.page.getByRole('dialog');
}

get modalTitle() {
    return this.modal.getByRole('heading');
}
```

#### Pattern 4: Complex XPath

**BEFORE (Fragile):**
```typescript
get confirmButton() {
    return this.page.locator('//div[@class="modal"]//button[contains(@class, "btn-primary")]');
}
```

**AFTER (Resilient):**
```typescript
get confirmButton() {
    return this.page.locator('[role="dialog"]').getByRole('button', { name: 'Confirm' });
}
```

## Migration Modes

### Mode A: Replace with getBy* Methods (Fastest)

Most direct migration - use Playwright's built-in getBy methods:

```typescript
// All using getBy* methods
get emailField() {
    return this.page.getByLabel('Email');
}

get submitButton() {
    return this.page.getByRole('button', { name: 'Submit' });
}

get cancelLink() {
    return this.page.getByRole('link', { name: 'Cancel' });
}
```

### Mode B: Use Healing Utility Methods (Recommended)

More flexible with built-in health checking:

```typescript
get testIdElement() {
    return this.createTestIdLocator('element-id');
}

get contextualElement() {
    return this.createContextualLocator('.container', '.item');
}

get textElement() {
    return this.createTextBasedLocator('button', 'Click Me');
}
```

### Mode C: Hybrid Approach (Most Resilient)

Combine multiple strategies:

```typescript
get criticalButton() {
    try {
        // Primary: role-based
        return this.page.getByRole('button', { name: 'Critical' });
    } catch {
        // Fallback: test ID
        return this.createTestIdLocator('critical-button');
    }
}
```

## Migration by Component Type

### Form Inputs

**BEFORE:**
```typescript
get emailInput() {
    return this.page.locator('input[id="email-field"]');
}
```

**AFTER:**
```typescript
get emailInput() {
    return this.page.getByLabel('Email');
}
```

### Buttons

**BEFORE:**
```typescript
get submitButton() {
    return this.page.locator('button.btn-primary:nth-child(1)');
}
```

**AFTER:**
```typescript
get submitButton() {
    return this.page.getByRole('button', { name: 'Submit' });
}
```

### Tables

**BEFORE:**
```typescript
getTableRow(index: number) {
    return this.page.locator(`table tbody tr:nth-child(${index})`);
}
```

**AFTER:**
```typescript
getTableRow(id: string) {
    return this.page.locator('table tbody', {
        has: this.page.locator(`text=${id}`)
    });
}
```

### Modals/Dialogs

**BEFORE:**
```typescript
get modal() {
    return this.page.locator('.modal.fade.in');
}

get modalTitle() {
    return this.page.locator('.modal.fade.in .modal-header h4');
}
```

**AFTER:**
```typescript
get modal() {
    return this.page.getByRole('dialog');
}

get modalTitle() {
    return this.modal.getByRole('heading');
}
```

### Lists/Dropdowns

**BEFORE:**
```typescript
getListItem(text: string) {
    return this.page.locator(`.list-item:contains("${text}")`);
}
```

**AFTER:**
```typescript
getListItem(text: string) {
    return this.page.locator('li', {
        has: this.page.locator(`text=${text}`)
    });
}

// Or using role
getDropdownOption(text: string) {
    return this.page.getByRole('option', { name: text });
}
```

## Adding Health Checks

After migration, add health checks to critical paths:

```typescript
async loginUser(email: string, password: string) {
    // Check health before interaction
    if (!await this.isLocatorHealthy(this.emailInput)) {
        console.warn('Email input not found, reloading...');
        await this.reloadPage();
    }

    await this.setValueAndBlur(this.emailInput, email);
    await this.setValueAndBlur(this.passwordInput, password);
    await this.clickElement(this.submitButton);
}
```

## Adding data-testid to Your App

For components without good accessibility roles, add `data-testid`:

### React Example
```tsx
<div data-testid="movie-card">
    <h3 data-testid="movie-title">Avatar</h3>
    <button data-testid="btn-book-ticket">Book Ticket</button>
</div>
```

### Then use in tests
```typescript
get movieCard() {
    return this.createTestIdLocator('movie-card');
}

get bookButton() {
    return this.createTestIdLocator('btn-book-ticket');
}
```

## Validation After Migration

### 1. Create a Validation Test

```typescript
test('Verify locators are resilient', async ({ page }) => {
    const myPage = new MyPage(page);

    // List of locators to validate
    const locators = [
        { name: 'Email Input', locator: myPage.emailInput },
        { name: 'Submit Button', locator: myPage.submitButton },
        { name: 'Modal', locator: myPage.modal },
    ];

    for (const { name, locator } of locators) {
        const isHealthy = await myPage.isLocatorHealthy(locator);
        expect(isHealthy, `${name} should be healthy`).toBe(true);

        const diagnosis = await myPage.diagnoseLocator(locator, name);
        console.log(`✅ ${name}:`, diagnosis);
    }
});
```

### 2. Run Your Test Suite

Verify existing tests still pass with new locators:

```bash
npm test
```

### 3. Check for Warnings

Look for any console warnings about locator issues:

```
⚠️ Locator health check failed: modal
🔍 Diagnosis: { count: 0, visible: false, enabled: false, healthy: false }
```

## Common Migration Issues

### Issue 1: Locator Not Found

**Problem:**
```
Error: locator.click: Timeout 10000ms exceeded. Call log:
- waiting for locator to be visible
```

**Solution:**
```typescript
// Verify with diagnosis
const diagnosis = await this.diagnoseLocator(locator);
console.log(diagnosis); // Check count, visible, etc.

// Add explicit wait
await this.waitForElementVisible(locator);
```

### Issue 2: Multiple Elements Match

**Problem:**
```
Error: strict mode violation: locator resolved to 3 elements
```

**Solution:**
```typescript
// Use contextual locator to be more specific
get button() {
    return this.createContextualLocator('.modal', 'button'); // Only button in modal
}

// Or use accessible name
get button() {
    return this.page.getByRole('button', { name: 'Exact Name' });
}
```

### Issue 3: Element Changes on Page Update

**Problem:** Selectors work in dev but break after app update

**Solution:**
```typescript
// Use role-based (least affected by changes)
get button() {
    return this.page.getByRole('button', { name: 'Submit' });
}

// Use data-testid (stays stable if added to app)
get customComponent() {
    return this.createTestIdLocator('component-id');
}
```

## Migration Priority

Migrate in this order:

### 🔴 Priority 1 (Immediate)
- Nth-child selectors
- XPath expressions
- Index-based selection
- Generated class names

### 🟡 Priority 2 (Soon)
- CSS selectors with generic names
- Complex nested selectors
- Selectors that break frequently

### 🟢 Priority 3 (When Convenient)
- Already working getBy* methods
- Rarely changed selectors
- Simple CSS selectors

## Rollout Strategy

### Phase 1: Critical Paths (Week 1)
- Login/Authentication
- Core user flows
- High-value tests

### Phase 2: Core Features (Week 2-3)
- Feature-specific page objects
- Common components
- Shared utilities

### Phase 3: UI/Edge Cases (Week 4+)
- Less critical features
- Nice-to-have tests
- Edge case scenarios

## Template for New Page Objects

Use this template for new page objects to implement healing from the start:

```typescript
import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class NewPage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    // ✅ Role-based (Priority 1)
    get primaryButton(): Locator {
        return this.page.getByRole('button', { name: /primary|submit/i });
    }

    // ✅ Label-based
    get emailField(): Locator {
        return this.page.getByLabel('Email');
    }

    // ✅ Test ID-based
    get customElement(): Locator {
        return this.createTestIdLocator('custom-element');
    }

    // ✅ Text-based
    get cancelLink(): Locator {
        return this.createTextBasedLocator('a', 'Cancel');
    }

    // ✅ Contextual
    get dialogButton(): Locator {
        return this.createContextualLocator('[role="dialog"]', 'button');
    }

    // ✅ With health checking
    async performAction() {
        if (!await this.isLocatorHealthy(this.primaryButton)) {
            await this.page.reload();
        }
        await this.clickElement(this.primaryButton);
    }
}
```

## Next Steps

1. ✅ Review [LOCATOR_HEALING.md](LOCATOR_HEALING.md)
2. ✅ Check [LOCATOR_HEALING_QUICK_REF.md](LOCATOR_HEALING_QUICK_REF.md)
3. ✅ Read [pages/examples/LOCATOR_HEALING_EXAMPLES.ts](pages/examples/LOCATOR_HEALING_EXAMPLES.ts)
4. ✅ Start migrating your page objects
5. ✅ Validate with test runs
6. ✅ Share best practices with team

---

**Support:** If you have questions, check the documentation or review the examples!
