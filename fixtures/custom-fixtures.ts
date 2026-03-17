import { HomePage } from '../pages/HomePage';
import { LoginPage } from '../pages/LoginPage';
import { test as base, expect } from '@playwright/test';
import { RegisterPage } from '../pages/RegisterPage';
import { testUser } from '../tests/test-data/testUsers';
import { AccountDataApi } from '../api/users/accounts.types';
import { ApiClient } from '../api/ApiClient';

/**
 * Custom fixtures extending Playwright's base test
 * Provides reusable page objects and pre-configured test states
 */
type MyFixtures = {
  // Page objects
  homePage: HomePage;
  loginPage: LoginPage;
  registerPage: RegisterPage;
  
  // Preset states
  loggedInHomepage: {
    homePage: HomePage;
    user: AccountDataApi;
  };
  
  loggedInUser: {
    user: AccountDataApi;
    loginPage: LoginPage;
  };
  
  // API client (when needed)
  apiClient: ApiClient;
};

export const test = base.extend<MyFixtures>({
  // ========== Page Objects ==========
  
  /**
   * HomePage fixture - automatically initialized
   */
  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await use(homePage);
  },

  /**
   * LoginPage fixture - automatically initialized
   */
  loginPage: async ({ page }, use) => {
    const loginPage = new LoginPage(page);
    await use(loginPage);
  },

  /**
   * RegisterPage fixture - automatically initialized
   */
  registerPage: async ({ page }, use) => {
    const registerPage = new RegisterPage(page);
    await use(registerPage);
  },

  // ========== Preset States ==========

  /**
   * Logged-in homepage fixture
   * Sets up: Logged-in user navigated to homepage
   * Provides: homePage object and authenticated user data
   */
  loggedInHomepage: async ({ page, loginPage }, use) => {
    const user = testUser;

    // Login flow
    await loginPage.navigateToLoginPage();
    await loginPage.fillLoginFormAndSubmit(user.taiKhoan, user.matKhau);
    await loginPage.topBarNavigation.verifyUserIsLoggedIn();

    // Navigate to homepage
    const homePage = new HomePage(page);
    await homePage.navigateToHomePageAndWait();

    await use({ homePage, user });
  },

  /**
   * Logged-in user fixture
   * Sets up: User logged in but doesn't navigate to a specific page
   * Provides: loginPage object and authenticated user data
   * Use when you need to control navigation manually
   */
  loggedInUser: async ({ page, loginPage }, use) => {
    const user = testUser;

    // Login flow
    await loginPage.navigateToLoginPage();
    await loginPage.fillLoginFormAndSubmit(user.taiKhoan, user.matKhau);
    await loginPage.topBarNavigation.verifyUserIsLoggedIn();

    await use({ user, loginPage });
  },

  /**
   * API Client fixture
   * Provides centralized API client for making HTTP requests
   * Use when testing APIs directly alongside UI tests
   */
  apiClient: async ({ request }, use) => {
    const baseURL = 'https://movie0706.cybersoft.edu.vn';
    const client = new ApiClient(request, baseURL);
    await use(client);
  },
});

export { expect } from '@playwright/test';