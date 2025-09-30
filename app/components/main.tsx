import { type ReactNode } from "react";
import { cn } from "~/lib/utils";

export function Main({
  className,
  children,
}: Readonly<{ className?: string, children: ReactNode }>) {
  return (
    <main
      className={cn("md:container md:mx-auto px-4 sm:px-6 lg:px-8", className)}
    >
      {children}
    </main>
  );
}
