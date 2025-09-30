import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { cn } from "~/lib/utils";
import { Search, X } from "lucide-react";

interface SearchProps {
    placeholder?: string;
    setValue: (newValue: string) => void;
    value: string;
}

export function SearchBar({
    className,
    placeholder,
    setValue,
    value,
}: SearchProps & React.ComponentProps<"div">) {
    return (
        <div className={cn("relative", className)}>
            <Search className="text-muted-foreground size-4 absolute top-1/2 -translate-y-1/2 left-3" />
            <Input
                className="ps-8"
                placeholder={placeholder || "Search here..."}
                value={value}
                onChange={(e) => setValue(e.target.value)}
            />
            {value ? (
                <Button
                    variant="ghost"
                    className="text-muted-foreground absolute top-1/2 hover:bg-transparent -translate-y-1/2 right-1"
                    onClick={() => setValue("")}
                >
                    <X />
                </Button>
            ) : null}
        </div>
    );
}
