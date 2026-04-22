export default function DeveloperLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // This layout overrides the root layout for /developer routes
    // But since it's a nested layout in Next.js app directory structure unless it's a root layout itself (which it isn't),
    // it should not render html/body tags if the root layout already does.
    // However, the user wants to REMOVE the navbar.
    // In Next.js App Router, to completely replace the root layout for a specific route group,
    // we usually use Route Groups (e.g. (admin)/developer/layout.tsx) or we have to accept that
    // nested layouts wrap children.

    // If we want to avoid the root layout's Navbar, we might need a different approach.
    // But first, let's fix the invalid nesting error.
    return (
        <div className="min-h-screen bg-background">
            {children}
        </div>
    );
}
