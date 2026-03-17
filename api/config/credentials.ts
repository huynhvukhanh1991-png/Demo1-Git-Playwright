import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const adminCredentials = {
    taiKhoan: process.env.ADMIN_USERNAME,
    matKhau: process.env.ADMIN_PASSWORD,
};