
import { adminCredentials } from "../config/credentials";
import { userEndpoints } from "../config/apiRoutes";
import { searchAccounts } from "./accounts.api";
import { AccountDataApi } from "./accounts.types";

export async function getSingleAccountByUsername(
    username: string
): Promise<AccountDataApi> {
    const accounts = await searchAccounts(username);

    if (accounts.length === 0) {
        throw new Error(`No account found for username: ${username}`);
    }

    if (accounts.length > 1) {
        throw new Error(
            `Multiple accounts found for username: ${username}`
        );
    }
    return accounts[0];
}

export async function getAdminAuthToken() {
    // Validate credentials are loaded
    if (!adminCredentials.taiKhoan || !adminCredentials.matKhau) {
        throw new Error(
            `Admin credentials not configured. ADMIN_USERNAME=${adminCredentials.taiKhoan}, ADMIN_PASSWORD=${adminCredentials.matKhau ? '***' : 'undefined'}. ` +
            `Make sure environment variables are set in .env file.`
        );
    }

    console.log(`[AUTH] Attempting login with username: ${adminCredentials.taiKhoan}`);

    const res = await fetch(userEndpoints.login(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            taiKhoan: adminCredentials.taiKhoan,
            matKhau: adminCredentials.matKhau,
        }),
    });

    if (!res.ok) {
        const errorText = await res.text();
        console.error(`[AUTH ERROR] Status: ${res.status}, Response: ${errorText}`);
        throw new Error(
            `Failed to get admin auth token: ${res.status} ${res.statusText}. Response: ${errorText}`
        );
    }

    const data = await res.json();
    console.log(`[AUTH SUCCESS] Token received, length: ${data.accessToken?.length}`);
    return data.accessToken;
}
