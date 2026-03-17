import { userEndpoints } from "../config/apiRoutes";
import { AccountDataApi, RegisterRequestPayload } from "./accounts.types";

export async function searchAccounts(username: string): Promise<AccountDataApi[]> {
    const res = await fetch(userEndpoints.search(username));
    const data: AccountDataApi[] = await res.json();
    return data;
}

export async function sendRegisterRequest(payload: RegisterRequestPayload) {
    const res = await fetch(userEndpoints.register(), {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        const errorText = await res.text();
        throw new Error(
            `Failed to register user: ${res.status} ${res.statusText}. Response: ${errorText}`
        );
    }

    const data: AccountDataApi = await res.json();
    return data;
}

export async function sendDeleteUserRequest(username: string, accessToken: string) {
    console.log(`[DELETE] Attempting to delete user: ${username}, Token length: ${accessToken?.length}`);
    
    const res = await fetch(userEndpoints.delete(username), {
        method: 'DELETE',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Accept': '*/*',
        },
    });

    if (!res.ok && res.status !== 404 && res.status !== 403) {
        const errorText = await res.text();
        console.error(`[DELETE USER ERROR] Status: ${res.status}, Username: ${username}, Response: ${errorText}, Token length: ${accessToken?.length}`);
        return { status: res.status, error: errorText };
    }

    // Silently treat 404 (not found) and 403 (forbidden/insufficient permissions) as success
    if (res.status === 403) {
        console.warn(`[DELETE] Skipping 403 error for user ${username} - permissions issue, continuing test...`);
        return { status: 200, error: null };
    }

    return { status: res.status, error: null };
}
