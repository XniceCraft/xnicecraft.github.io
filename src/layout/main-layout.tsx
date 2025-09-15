import { Toaster } from "react-hot-toast";
import { NuqsAdapter } from "nuqs/adapters/react-router/v7";
import { type ReactNode } from "react";

export default function MainLayout({ children }: { children: ReactNode }) {
    return (
        <NuqsAdapter>
            {children}
            <Toaster position="top-right" />
        </NuqsAdapter>
    );
}
