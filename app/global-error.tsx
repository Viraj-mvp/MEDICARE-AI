'use client';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    return (
        <html>
            <body>
                <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white">
                    <h2 className="text-2xl font-bold text-red-500 mb-4">Something went wrong!</h2>
                    <p className="mb-6 text-gray-400">A critical error occurred in the application.</p>
                    <button
                        onClick={() => reset()}
                        className="px-4 py-2 bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                    >
                        Try again
                    </button>
                </div>
            </body>
        </html>
    );
}
