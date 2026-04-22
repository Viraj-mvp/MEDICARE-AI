'use client'; // Error components must be Client Components

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error);
    }, [error]);

    return (
        <div className="flex min-h-[50vh] flex-col items-center justify-center p-8 text-center">
            <h2 className="text-2xl font-bold mb-4 text-red-400">Application Error</h2>
            <p className="text-muted-foreground mb-6 max-w-md">
                We encountered an unexpected issue while rendering this page.
            </p>
            <div className="flex gap-4">
                <Button
                    onClick={
                        // Attempt to recover by trying to re-render the segment
                        () => reset()
                    }
                >
                    Try again
                </Button>
                <Button variant="outline" onClick={() => window.location.href = '/'}>
                    Go Home
                </Button>
            </div>
        </div>
    );
}
