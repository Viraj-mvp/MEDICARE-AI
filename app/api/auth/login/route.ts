import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { verifyPassword, generateToken } from '@/lib/auth/jwt';
import { loginSchema } from '@/lib/validation/schemas';
import { User } from '@/lib/db/schemas';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 15 * 60 * 1000; // 15 minutes

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate input
        const validatedData = loginSchema.parse(body);

        const db = await getDatabase();
        const usersCollection = db.collection<User>('users');

        // Find user
        const user = await usersCollection.findOne({ email: validatedData.email });

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Check if account is locked
        if (user.lockUntil && new Date(user.lockUntil) > new Date()) {
            const remainingTime = Math.ceil((new Date(user.lockUntil).getTime() - Date.now()) / 60000);
            return NextResponse.json(
                { error: `Account is locked. Please try again in ${remainingTime} minutes.` },
                { status: 423 }
            );
        }

        // Verify password
        const isValidPassword = await verifyPassword(validatedData.password, user.password);

        if (!isValidPassword) {
            // Increment login attempts
            const attempts = (user.loginAttempts || 0) + 1;
            const updateData: any = { $set: { loginAttempts: attempts } };

            if (attempts >= MAX_LOGIN_ATTEMPTS) {
                updateData.$set.lockUntil = new Date(Date.now() + LOCK_TIME);
                // We keep loginAttempts so we know it was locked, or reset it? 
                // Resetting it after lock is fine if we use lockUntil.
            }

            await usersCollection.updateOne({ _id: user._id }, updateData);

            return NextResponse.json(
                { error: 'Invalid email or password' },
                { status: 401 }
            );
        }

        // Generate token
        const token = await generateToken({
            userId: user._id!.toString(),
            email: user.email,
            role: user.role,
        });

        // Update last login timestamp and reset attempts
        await usersCollection.updateOne(
            { _id: user._id },
            { 
                $set: { 
                    lastLogin: new Date(),
                    loginAttempts: 0,
                    lockUntil: null
                } 
            }
        );

        // Log activity
        const { logActivity } = await import('@/lib/activity-logger');
        await logActivity('login', user._id, { email: user.email }, req);

        const response = NextResponse.json({
            message: 'Login successful',
            user: {
                id: user._id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });

        // Set HttpOnly Cookie
        // Use separate cookies for user and admin to support concurrent isolated sessions
        const cookieName = user.role === 'admin' ? 'admin_token' : 'token';
        
        response.cookies.set({
            name: cookieName,
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 7 * 24 * 60 * 60, // 7 days (Persistent)
        });

        return response;

    } catch (error: any) {
        console.error('Login error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input', details: error.errors },
                { status: 400 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
