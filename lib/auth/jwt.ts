import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';
import { NextRequest } from 'next/server';

let _secretText: string | null = null;

const getSecretText = (): string => {
    if (_secretText === null) {
        _secretText = process.env.JWT_SECRET || '';
        if (_secretText.length < 64) {
            throw new Error(
                `FATAL: JWT_SECRET must be at least 64 characters long (current: ${_secretText.length}). ` +
                'Generate a secure secret with: node -e "console.log(require(\'crypto\').randomBytes(64).toString(\'hex\'))"'
            );
        }
    }
    return _secretText;
};

const getSecret = (): Uint8Array => {
    return new TextEncoder().encode(getSecretText());
};

export interface JWTPayload {
    userId: string;
    email: string;
    role: string;
}

export async function hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
}

export async function verifyPassword(
    password: string,
    hashedPassword: string
): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
}

export async function generateToken(payload: JWTPayload): Promise<string> {
    return new SignJWT({ ...payload })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(getSecret());
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
    try {
        const { payload } = await jwtVerify(token, getSecret());
        return {
            userId: payload.userId as string,
            email: payload.email as string,
            role: payload.role as string,
        };
    } catch {
        return null;
    }
}

export async function getAuthUser(req: NextRequest): Promise<JWTPayload | null> {
    const token = req.cookies.get('token')?.value;
    const adminToken = req.cookies.get('admin_token')?.value;

    // Try admin token first if it exists, as it has more privileges
    if (adminToken) {
        const payload = await verifyToken(adminToken);
        if (payload && payload.role === 'admin') return payload;
    }

    if (token) {
        return verifyToken(token);
    }

    return null;
}
