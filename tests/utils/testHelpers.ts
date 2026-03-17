import { Page, Locator } from '@playwright/test';
import { TIMEOUTS, SELECTOR_PATTERNS } from '../config/constants';

/**
 * Helper utilities for common test operations
 */

/**
 * Wait for multiple locators to be visible
 */
export async function waitForMultipleElements(
    locators: Locator[],
    timeout: number = TIMEOUTS.DEFAULT
): Promise<void> {
    await Promise.all(
        locators.map(locator => locator.waitFor({ state: 'visible', timeout }))
    );
}

/**
 * Get text content from multiple elements
 */
export async function getMultipleElementsText(
    locators: Locator[]
): Promise<string[]> {
    return Promise.all(
        locators.map(locator => locator.textContent().then(text => text ?? ''))
    );
}

/**
 * Fill multiple form fields with provided data
 */
export async function fillFormFields(
    page: Page,
    fieldData: Record<string, string>,
    selectorFn?: (fieldName: string) => string
): Promise<void> {
    for (const [fieldName, fieldValue] of Object.entries(fieldData)) {
        const selector = selectorFn
            ? selectorFn(fieldName)
            : SELECTOR_PATTERNS.byId(fieldName);
        
        const field = page.locator(selector);
        await field.waitFor({ state: 'visible', timeout: TIMEOUTS.DEFAULT });
        await field.clear();
        await field.fill(fieldValue);
    }
}

/**
 * Click multiple elements sequentially
 */
export async function clickMultiple(locators: Locator[]): Promise<void> {
    for (const locator of locators) {
        await locator.click();
    }
}

/**
 * Verify that all provided locators are visible
 */
export async function verifyAllVisible(
    locators: Locator[],
    timeout: number = TIMEOUTS.DEFAULT
): Promise<void> {
    for (const locator of locators) {
        await locator.waitFor({ state: 'visible', timeout });
    }
}

/**
 * Verify that all provided locators are hidden
 */
export async function verifyAllHidden(
    locators: Locator[],
    timeout: number = TIMEOUTS.DEFAULT
): Promise<void> {
    for (const locator of locators) {
        await locator.waitFor({ state: 'hidden', timeout });
    }
}

/**
 * Get all text values from a list of locators with optional filtering
 */
export async function getElementsTextFiltered(
    locators: Locator[],
    filterFn?: (text: string) => boolean
): Promise<string[]> {
    const texts = await Promise.all(
        locators.map(l => l.textContent().then(t => t?.trim() ?? ''))
    );
    return filterFn ? texts.filter(filterFn) : texts;
}

/**
 * Check if element is in viewport
 */
export async function isElementInViewport(
    locator: Locator
): Promise<boolean> {
    return await locator.evaluate(el => {
        const rect = el.getBoundingClientRect();
        return (
            rect.top >= 0 &&
            rect.left >= 0 &&
            rect.bottom <= window.innerHeight &&
            rect.right <= window.innerWidth
        );
    });
}

/**
 * Scroll element into view
 */
export async function scrollIntoView(locator: Locator): Promise<void> {
    await locator.evaluate(el => el.scrollIntoView({ behavior: 'smooth' }));
}

/**
 * Wait for navigation to complete
 */
export async function waitForNavigation(page: Page): Promise<void> {
    await page.waitForLoadState('domcontentloaded');
}

/**
 * Get element's computed CSS value
 */
export async function getCSSValue(
    locator: Locator,
    property: string
): Promise<string> {
    return await locator.evaluate(
        (el, prop) => getComputedStyle(el).getPropertyValue(prop),
        property
    );
}

/**
 * Check if element has specific CSS class
 */
export async function hasClass(
    locator: Locator,
    className: string
): Promise<boolean> {
    return await locator.evaluate(
        (el, cls) => el.classList.contains(cls),
        className
    );
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retryOperation<T>(
    operation: () => Promise<T>,
    maxAttempts: number = 3,
    delayMs: number = 500,
    backoffMultiplier: number = 2
): Promise<T> {
    let lastError: Error | null = null;
    let currentDelay = delayMs;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        try {
            return await operation();
        } catch (error) {
            lastError = error instanceof Error ? error : new Error(String(error));
            if (attempt < maxAttempts) {
                await new Promise(resolve => setTimeout(resolve, currentDelay));
                currentDelay *= backoffMultiplier;
            }
        }
    }

    throw lastError || new Error('Operation failed after max attempts');
}
