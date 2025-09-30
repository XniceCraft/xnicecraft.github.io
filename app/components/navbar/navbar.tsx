import { NavMenu } from "./menu/nav-menu";
import { NavSheet } from "./menu/nav-sheet";

export function Navbar() {
    return (
        <nav className="h-16 bg-background border-b">
            <div className="h-full flex items-center justify-between md:container md:mx-auto px-4 sm:px-6 lg:px-8">
                <NavMenu className="hidden md:block" />
                <div className="flex items-center gap-3 md:hidden">
                    <NavSheet />
                </div>
            </div>
        </nav>
    );
}
