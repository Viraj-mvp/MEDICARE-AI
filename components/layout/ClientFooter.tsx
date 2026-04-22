"use client";

import { usePathname } from "next/navigation";
import { Footer } from "@/components/ui/footer-section";

export function ClientFooter() {
    const pathname = usePathname();
    const isAuthPage = pathname?.startsWith("/auth");
    const isDeveloperPage = pathname?.startsWith("/developer");

    if (isAuthPage || isDeveloperPage) return null;

    return <Footer />;
}
