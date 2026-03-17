import { sendDeleteUserRequest, sendRegisterRequest } from "../../api/users/accounts.api";
import { getAdminAuthToken } from "../../api/users/accounts.helpers";
import type { AccountDataApi } from "../../api/users/accounts.types";
import { generateNewUserAccountForAccountFormTest, generateRegisterRequestPayload, generateRegisterRequestPayloadWithCustomData } from "./accountDataGenerator";

export async function deleteTestUser(username: string) {
    try {
        const authToken = await getAdminAuthToken();
        const { status, error } = await sendDeleteUserRequest(username, authToken);
        if (status !== 200 && status !== 404) {
            console.warn(`[CLEANUP] Failed to delete user: ${username}, status: ${status}${error ? `, error: ${error}` : ''}. Skipping to continue test.`);
        }
    } catch (err) {
        console.warn(`[CLEANUP] Error during user deletion: ${err instanceof Error ? err.message : String(err)}. Skipping to continue test.`);
    }
}

export async function createNewTestUser(): Promise<AccountDataApi> {
    const registerPayload = generateRegisterRequestPayload();
    const newAccount = await sendRegisterRequest(registerPayload);
    return newAccount;
}

// Temporary function for specific test case with known issue
export async function createTestUserForAccountFormTest(): Promise<AccountDataApi> {
    const userAccount = generateNewUserAccountForAccountFormTest();
    const registerPayload = generateRegisterRequestPayloadWithCustomData(userAccount);
    const newAccount = await sendRegisterRequest(registerPayload);
    return newAccount;
}