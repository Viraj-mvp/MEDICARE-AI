import { NextRequest, NextResponse } from 'next/server';
import { getDatabase } from '@/lib/db/mongodb';
import { hashPassword, generateToken } from '@/lib/auth/jwt';
import { signupSchema } from '@/lib/validation/schemas';
import { User } from '@/lib/db/schemas';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        // Validate input
        const validatedData = signupSchema.parse(body);

        const db = await getDatabase();
        const usersCollection = db.collection<User>('users');

        // Check if user already exists
        const existingUser = await usersCollection.findOne({ email: validatedData.email });

        if (existingUser) {
            return NextResponse.json(
                { error: 'User with this email already exists' },
                { status: 400 }
            );
        }

        // Hash password
        const hashedPassword = await hashPassword(validatedData.password);

        // Create user
        const newUser: User = {
            email: validatedData.email,
            password: hashedPassword,
            name: validatedData.name,
            phone: validatedData.phone,
            role: 'user',
            medicalHistory: validatedData.medicalHistory,
            loginAttempts: 0,
            lockUntil: undefined,
            createdAt: new Date(),
            updatedAt: new Date(),
        };

        const result = await usersCollection.insertOne(newUser);

        // Generate token
        const token = await generateToken({
            userId: result.insertedId.toString(),
            email: newUser.email,
            role: newUser.role,
        });

        // Log activity
        const { logActivity } = await import('@/lib/activity-logger');
        await logActivity('signup', result.insertedId, { email: newUser.email }, req);

        const response = NextResponse.json({
            message: 'User created successfully',
            user: {
                id: result.insertedId,
                email: newUser.email,
                name: newUser.name,
                role: newUser.role,
            },
        }, { status: 201 });

        // Set HttpOnly Cookie
        response.cookies.set({
            name: 'token',
            value: token,
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            path: '/',
            maxAge: 60 * 60 * 24 * 7, // 7 days
        });

        return response;

    } catch (error: any) {
        console.error('Signup error:', error);

        if (error.name === 'ZodError') {
            return NextResponse.json(
                { error: 'Invalid input', details: error.errors },
                { status: 400 }
            );
        }

        if (error.message?.includes('JWT_SECRET') || error.message?.includes('MONGODB_URI')) {
            return NextResponse.json(
                { error: 'Server configuration error. Please contact support.' },
                { status: 503 }
            );
        }

        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
