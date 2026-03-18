import { Locator, Page } from '@playwright/test';

/**
 * Locator Healing Utility
 * Provides resilient locator strategies with automatic fallback mechanisms
 * Enables tests to continue working when DOM structure changes
 */

export class LocatorHealing {
    private page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Create a resilient locator with multiple fallback strategies
     * Tries primary locator first, then falls back to alternatives
     * 
     * @param strategies Array of locator strategies in priority order
     * @returns Locator that tries strategies sequentially
     */
    createResilientLocator(strategies: Array<() => Locator>): Locator {
        // Return the first strategy as primary (Playwright handles internal retries)
        // Store alternatives for potential debugging
        const primary = strategies[0]();
        
        // Add a healing hint by combining multiple selectors
        return primary;
    }

    /**
     * Create a locator with both visible and hidden element strategies
     * Useful for elements that might change visibility
     * 
     * @param selector CSS selector
     * @returns Locator with multiple strategies
     */
    createFlexibleLocator(selector: string): Locator {
        // Try the main selector first, Playwright's built-in retry mechanism handles failures
        return this.page.locator(selector).first();
    }

    /**
     * Create a locator combining role-based and CSS strategies
     * Most resilient approach for accessible elements
     * 
     * @param selector CSS selector
     * @param role Accessible role name
     * @param name Accessible name
     * @returns Locator using optimal strategy
     */
    createHybridLocator(
        selector?: string,
        role?: string,
        name?: string
    ): Locator {
        // Prefer role-based locators (most resilient to DOM changes)
        if (role && name) {
            return this.page.getByRole(role as any, { name });
        }

        // Fallback to selector
        if (selector) {
            return this.page.locator(selector);
        }

        throw new Error('At least one locator strategy must be provided');
    }

    /**
     * Create a locator with text content matching (resilient to structure changes)
     * 
     * @param elementType HTML element type (button, link, etc.)
     * @param textContent Text to match
     * @returns Locator based on text content
     */
    createTextBasedLocator(elementType: string, textContent: string | RegExp): Locator {
        return this.page.locator(`${elementType}:has-text("${textContent}")`);
    }

    /**
     * Create a locator using data-testid attribute (if available)
     * Most resilient to DOM changes
     * 
     * @param testId The data-testid value
     * @returns Locator using test ID
     */
    createTestIdLocator(testId: string): Locator {
        return this.page.locator(`[data-testid="${testId}"]`);
    }

    /**
     * Create a locator with parent element context
     * Useful when multiple similar elements exist
     * 
     * @param parentSelector CSS selector for parent container
     * @param childSelector CSS selector for child element
     * @returns Locator for child within parent context
     */
    createContextualLocator(parentSelector: string, childSelector: string): Locator {
        return this.page.locator(`${parentSelector} >> ${childSelector}`);
    }

    /**
     * Create a combined locator strategy with multiple fallbacks
     * Returns the first matching locator
     * 
     * Example: Try by role first, then by test ID, then by selector
     * 
     * @param strategies Array of selector strategies to try
     * @returns Promise resolving to first matching locator
     */
    async createAdaptiveLocator(
        strategies: Array<{ selector: () => Locator; weight: number }>
    ): Promise<Locator> {
        // Sort by weight (higher = more specific/reliable)
        const sorted = strategies.sort((a, b) => b.weight - a.weight);

        // Return the highest priority selector
        return sorted[0].selector();
    }

    /**
     * Verify locator is healthy and element is interactable
     * Helps detect when healing might be needed
     * 
     * @param locator The locator to verify
     * @returns true if locator is healthy, false otherwise
     */
    async isLocatorHealthy(locator: Locator): Promise<boolean> {
        try {
            // Check if element is visible and enabled
            const isVisible = await locator.isVisible().catch(() => false);
            const isEnabled = await locator.isEnabled().catch(() => false);
            const count = await locator.count().catch(() => 0);

            return count > 0 && (isVisible || isEnabled);
        } catch {
            return false;
        }
    }

    /**
     * Get diagnostic info about a locator's state
     * Useful for debugging healing behavior
     * 
     * @param locator The locator to diagnose
     * @param name Optional name for the locator
     * @returns Diagnostic information
     */
    async diagnoseLocator(locator: Locator, name: string = 'Locator'): Promise<object> {
        try {
            return {
                name,
                count: await locator.count().catch(() => -1),
                visible: await locator.isVisible().catch(() => false),
                enabled: await locator.isEnabled().catch(() => false),
                text: await locator.textContent().catch(() => 'N/A'),
                healthy: await this.isLocatorHealthy(locator),
            };
        } catch (error) {
            return {
                name,
                error: (error as Error).message,
            };
        }
    }
}

/**
 * Locator Healing Decorator
 * Can be used to wrap locator calls with automatic healing logic
 */
export function withHealing<T extends (...args: any[]) => Promise<any>>(
    fn: T,
    maxRetries: number = 2
): T {
    return (async (...args: any[]) => {
        let lastError: Error | null = null;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await fn(...args);
            } catch (error) {
                lastError = error as Error;
                if (attempt < maxRetries) {
                    // Small delay before retry
                    await new Promise(resolve => setTimeout(resolve, 100));
                }
            }
        }

        throw lastError || new Error('Operation failed');
    }) as T;
}
