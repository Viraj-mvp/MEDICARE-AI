'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ModernAuthCard } from '@/components/ui/modern-auth-card';

function AuthContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const mode = searchParams.get('m');
    const [isLogin, setIsLogin] = useState(mode !== 'register');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        setIsLogin(searchParams.get('m') !== 'register');
    }, [searchParams]);

    const [formData, setFormData] = useState({
        email: '',
        password: '',
        name: '',
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            // Store user info in sessionStorage for client-side display (navbar)
            // Note: Actual authentication token is in HttpOnly cookie
            sessionStorage.setItem('user', JSON.stringify(data.user));

            // Handle redirect
            const returnUrl = searchParams.get('redirect');
            if (returnUrl) {
                router.push(returnUrl);
                return;
            }

            // Default routing based on role
            if (data.user.role === 'admin' || data.user.role === 'developer') {
                router.push('/developer');
            } else {
                router.push('/profile');
            }
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <ModernAuthCard
            isLogin={isLogin}
            setIsLogin={setIsLogin}
            formData={formData}
            setFormData={setFormData}
            onSubmit={handleSubmit}
            loading={loading}
            error={error}
        />
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <AuthContent />
        </Suspense>
    );
}
