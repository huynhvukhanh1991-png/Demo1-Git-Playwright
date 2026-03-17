import { expect, Locator, Page } from "@playwright/test";
import { TIMEOUTS, WAIT_STATES } from "../tests/config/constants";
import { pageURLs } from "../tests/utils/pageRoutes";

export abstract class BasePage {

    // ========== Constructor ==========
    readonly page: Page;

    constructor(page: Page) {
        this.page = page;
    }

    // ========== Navigation ==========
    async navigateToPage(url: string, timeout: number = TIMEOUTS.PAGE_LOAD) {
        await this.page.goto(url, { waitUntil: 'domcontentloaded', timeout });
        await expect(this.page).toHaveURL(url, { timeout: TIMEOUTS.EXPECT });
    }

    async navigateBack() {
        await this.page.goBack();
        await this.page.waitForLoadState('domcontentloaded');
    }

    async reloadPage() {
        await this.page.reload();
        await this.page.waitForLoadState('domcontentloaded');
    }

    // ========== Verify Navigation (Generic & Page-Specific) ==========
    
    /**
     * Generic URL verification method
     * @param expectedUrl - The expected URL or URL pattern
     * @param pageName - Human-readable name of the page
     * @param timeout - Optional timeout override
     */
    async verifyNavigationToUrl(expectedUrl: string | RegExp, pageName: string = 'page', timeout: number = TIMEOUTS.EXPECT) {
        await expect(this.page,
            `Expected to be on ${pageName}: ${expectedUrl}. Actual: ${this.page.url()}`
        ).toHaveURL(expectedUrl, { timeout });
    }

    async verifyNavigationToHomePage() {
        await this.verifyNavigationToUrl(pageURLs.home, 'Home page');
    }

    async verifyNavigationToLoginPage() {
        await this.verifyNavigationToUrl(pageURLs.login, 'Login page');
    }

    async verifyNavigationToRegisterPage() {
        await this.verifyNavigationToUrl(pageURLs.register, 'Register page');
    }

    async verifyNavigationToAccountPage() {
        await this.verifyNavigationToUrl(pageURLs.account, 'Account/User Profile page');
    }

    async verifyNavigationToShowtimePage(showtimeId: string) {
        const expectedUrl = pageURLs.showtime(showtimeId);
        await this.verifyNavigationToUrl(expectedUrl, `Showtime page (${showtimeId})`);
    }

    async verifyNavigationToMovieDetailPage(movieId: string) {
        const expectedUrl = pageURLs.movie(movieId);
        await this.verifyNavigationToUrl(expectedUrl, `Movie detail page (${movieId})`);
    }

    async verifyNoNavigation(currentUrl: string) {
        await expect(this.page,
            `Expected to stay on the same page: ${currentUrl}. Actual: ${this.page.url()}`
        ).toHaveURL(currentUrl, { timeout: TIMEOUTS.EXPECT });
    }

    // ========== Get Info ==========
    async getElementText(locator: Locator): Promise<string> {
        await this.waitForElementVisible(locator);
        return await locator.textContent() ?? '';
    }

    async getElementAttribute(locator: Locator, attribute: string): Promise<string> {
        await this.waitForElementVisible(locator);
        return await locator.getAttribute(attribute) ?? '';
    }

    async getElementCount(locator: Locator): Promise<number> {
        return locator.count();
    }

    async getFieldValue(locator: Locator): Promise<string> {
        await this.waitForElementVisible(locator);
        return await locator.inputValue();
    }

    async getBackgroundColor(locator: Locator): Promise<string> {
        return locator.evaluate(el => getComputedStyle(el).backgroundColor);
    }

    // ========== Actions ==========
    async clickElement(locator: Locator, timeout: number = TIMEOUTS.DEFAULT) {
        await this.waitForElementVisible(locator, timeout);
        await locator.click();
    }

    async setValueAndBlur(locator: Locator, value: string) {
        // Clear fields first to ensure clean state
        await locator.clear();
        await locator.fill(value);
        await locator.blur();
    }

    async selectDropdownOption(dropdownLocator: Locator, optionValue: string, timeout: number = TIMEOUTS.DEFAULT) {
        await this.waitForElementVisible(dropdownLocator, timeout);
        await dropdownLocator.selectOption(optionValue);
    }

    // ========== Wait Methods ==========
    async waitForElementVisible(locator: Locator, timeoutMs: number = TIMEOUTS.DEFAULT) {
        await locator.waitFor({ state: WAIT_STATES.VISIBLE, timeout: timeoutMs });
    }

    async waitForElementAttached(locator: Locator, timeoutMs: number = TIMEOUTS.DEFAULT) {
        await locator.waitFor({ state: WAIT_STATES.ATTACHED, timeout: timeoutMs });
    }

    async waitForElementHidden(locator: Locator, timeoutMs: number = TIMEOUTS.DEFAULT) {
        await locator.waitFor({ state: WAIT_STATES.HIDDEN, timeout: timeoutMs });
    }
}