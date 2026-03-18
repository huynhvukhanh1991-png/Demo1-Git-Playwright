# Locator Healing - Quick Reference

## 📋 Available Methods

All methods are inherited from `BasePage` (or `CommonPage`/`BaseForm`).

### Creating Resilient Locators

```typescript
// Role-based locator (MOST RESILIENT)
this.page.getByRole('button', { name: 'Submit' })

// Test ID locator (HIGH RESILIENCE)
this.createTestIdLocator('btn-submit')

// Text-based locator (MODERATE RESILIENCE)
this.createTextBasedLocator('button', 'Delete')

// Contextual locator (SPECIFIC)
this.createContextualLocator('.modal', 'button')

// Resilient hybrid locator (FLEXIBLE)
this.createResilientLocator('selector', 'role', 'name')
```

## 🔍 Health Checking

```typescript
// Check if locator is healthy
const isHealthy = await this.isLocatorHealthy(locator);
if (!isHealthy) {
    await this.page.reload();
}

// Get detailed diagnosis
const diagnosis = await this.diagnoseLocator(locator, 'Element Name');
console.log(diagnosis);
// Output: { count, visible, enabled, text, healthy, ... }
```

## 💡 Common Use Cases

### Login Form
```typescript
get usernameField() {
    return this.page.getByLabel('Username');
}

get passwordField() {
    return this.page.getByLabel('Password');
}

get loginButton() {
    return this.page.getByRole('button', { name: 'Login' });
}
```

### Modal/Dialog
```typescript
get modal() {
    return this.page.getByRole('dialog');
}

get confirmBtn() {
    return this.modal.getByRole('button', { name: 'Confirm' });
}

get closeBtn() {
    return this.modal.getByRole('button', { name: 'Close' });
}
```

### Table Row
```typescript
getRow(dataValue: string) {
    return this.page.locator('tr', {
        has: this.page.locator(`td:has-text("${dataValue}")`)
    });
}

getCellInRow(row: Locator, columnIndex: number) {
    return row.locator(`td >> nth=${columnIndex - 1}`);
}
```

### Dynamic Lists
```typescript
getListItem(text: string) {
    return this.page.locator('li', {
        has: this.page.locator(`text=${text}`)
    });
}
```

## ⭐ Top Resilience Strategies

| Rank | Strategy | Example | Resilience |
|------|----------|---------|-----------|
| 1 | Role + Name | `getByRole('button', { name: 'Submit' })` | ⭐⭐⭐⭐⭐ |
| 2 | Test ID | `[data-testid="btn-submit"]` | ⭐⭐⭐⭐ |
| 3 | Text Match | `button:has-text("Submit")` | ⭐⭐⭐ |
| 4 | Contextual | `parent >> child` | ⭐⭐⭐ |
| 5 | CSS Selector | `.primary-btn` | ⭐⭐ |
| 6 | XPath | `//button[@type='submit']` | ⭐ |

## 🚀 Best Practices Checklist

- [ ] Use `getByRole()` whenever possible
- [ ] Use `getByLabel()` for form inputs
- [ ] Use `getByText()` for buttons/links
- [ ] Add `data-testid` to custom components
- [ ] Use contextual locators for specific elements
- [ ] Avoid XPath and nth-child selectors
- [ ] Check locator health before critical actions
- [ ] Log diagnostics for debugging

## 🛠️ Pattern Templates

### Safe Form Fill
```typescript
async fillForm(data: FormData) {
    for (const [field, value] of Object.entries(data)) {
        const locator = this.page.getByLabel(field);
        if (await this.isLocatorHealthy(locator)) {
            await this.setValueAndBlur(locator, value);
        }
    }
}
```

### Wait and Verify
```typescript
async verifyElement(locator: Locator) {
    const isHealthy = await this.isLocatorHealthy(locator);
    expect(isHealthy).toBe(true);
    
    const diagnosis = await this.diagnoseLocator(locator);
    console.log(diagnosis);
}
```

### Retry Pattern
```typescript
async clickWithRetry(locator: Locator, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
        try {
            await locator.click();
            return;
        } catch {
            if (i === maxRetries - 1) throw;
            await new Promise(r => setTimeout(r, 500));
        }
    }
}
```

## 📚 Full Documentation

See [LOCATOR_HEALING.md](LOCATOR_HEALING.md) for comprehensive guide.

Some examples: [LOCATOR_HEALING_EXAMPLES.ts](examples/LOCATOR_HEALING_EXAMPLES.ts)

---

**Remember:** Resilient locators = Maintainable tests
