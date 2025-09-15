export function Main({ children }: { children: React.ReactNode }) {
    return (
        <main className="md:container md:mx-auto px-4 sm:px-6 lg:px-8">
            {children}
        </main>
    );
}
