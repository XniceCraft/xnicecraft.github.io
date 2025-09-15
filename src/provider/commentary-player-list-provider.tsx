import {
    createContext,
    useContext,
    useState,
    useMemo,
    useCallback,
} from "react";
import type { CommentaryInfoType } from "@/types/pro-evolution-soccer/commentary-info";
import type {
    SortingState,
    ColumnFiltersState,
    PaginationState,
} from "@tanstack/react-table";

// File structure constants
const COMMENTARY_START_OFFSET = 144;
const COMMENTARY_NAME_LENGTH = 16;
const PLAYER_NAME_LENGTH = 64;
const RECORD_SIZE = COMMENTARY_NAME_LENGTH + PLAYER_NAME_LENGTH;

const textDecoder = new TextDecoder("utf-8");
const textEncoder = new TextEncoder();

const cleanString = (buffer: Uint8Array): string => {
    return textDecoder.decode(buffer).replace(/\0.*$/, "").trim();
};

const isBinaryValid = (buffer: Uint8Array<ArrayBuffer>): boolean => {
    return (
        buffer[0] === 83 &&
        buffer[1] === 69 &&
        buffer[2] === 80 &&
        buffer[3] === 68 &&
        buffer.slice(24, 36).every((byte) => byte === 0)
    );
};

function decimalToBytes(num: number) {
    const buffer = new ArrayBuffer(4);
    const view = new DataView(buffer);
    view.setUint32(0, num, true);
    return new Uint8Array(buffer);
}

function sortAndCountPlayers(players: CommentaryInfoType[]) {
    const sorted = [...players].sort((a, b) =>
        a.playerName.localeCompare(b.playerName, "en", { sensitivity: "base" })
    );

    const counts: { [key: string]: number } = {};
    for (let i = 0; i < 26; i++) {
        const letter = String.fromCharCode(65 + i);
        counts[letter] = 0;
    }

    sorted.forEach((player) => {
        const firstChar = player.playerName.charAt(0).toUpperCase();
        if (counts[firstChar] !== undefined) {
            counts[firstChar]++;
        }
    });

    return { sorted, counts };
}

interface CommentaryMetadataType {
    first: Uint8Array<ArrayBuffer>;
    second: Uint8Array<ArrayBuffer>;
}

interface CommentaryPlayerListType {
    // Data state
    clearData: () => void;
    isLoaded: boolean;
    parseBin: (file: File) => Promise<void>;

    // Raw data (all players)
    allPlayers: CommentaryInfoType[];

    // Pagination
    paginatedPlayers: CommentaryInfoType[];
    pagination: PaginationState;
    setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
    pageCount: number;

    // Sorting
    sorting: SortingState;
    setSorting: React.Dispatch<React.SetStateAction<SortingState>>;

    // Filtering
    columnFilters: ColumnFiltersState;
    setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
    globalFilter: string;
    setGlobalFilter: React.Dispatch<React.SetStateAction<string>>;

    // Utilities
    resetFilters: () => void;
    resetPagination: () => void;

    insertPlayer: (data: CommentaryInfoType) => void;
    updatePlayer: (data: CommentaryInfoType) => void;

    saveBin: () => void;
}

const CommentaryPlayerListContext = createContext<
    CommentaryPlayerListType | undefined
>(undefined);

export function CommentaryPlayerListProvider({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [metadata, setMetadata] = useState<
        CommentaryMetadataType | undefined
    >();
    const [allPlayers, setAllPlayers] = useState<CommentaryInfoType[]>([]);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [globalFilter, setGlobalFilter] = useState<string>("");
    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 50, // Default page size
    });
    const insertPlayer = (data: CommentaryInfoType) => {
        setAllPlayers((oldValue) => [...oldValue, data]);
    };
    const updatePlayer = (data: CommentaryInfoType) => {
        setAllPlayers((oldValue) =>
            oldValue.map((player) =>
                player.commentaryName === data.commentaryName ? data : player
            )
        );
    };

    const saveBin = useCallback(() => {
        if (!isLoaded) return new Error("Binary is not loaded");

        const buffer = new ArrayBuffer(
            COMMENTARY_START_OFFSET + allPlayers.length * RECORD_SIZE
        );
        const intBuffer = new Uint8Array(buffer);

        intBuffer.set(metadata!.first);
        intBuffer.set(decimalToBytes(allPlayers.length), 16);
        intBuffer.set(metadata!.second, 20);

        let sum = 0;
        let alphabetPointer = 36;
        const { sorted, counts } = sortAndCountPlayers(allPlayers);

        Object.values(counts).forEach((count) => {
            sum += count;

            intBuffer.set(decimalToBytes(sum), alphabetPointer);

            alphabetPointer += 4;
        });

        intBuffer.set(decimalToBytes(allPlayers.length), 136);
        intBuffer.set(decimalToBytes(allPlayers.length), 140);

        let pointer = COMMENTARY_START_OFFSET;
        sorted.forEach((value) => {
            const commentaryName = textEncoder.encode(value.commentaryName);
            intBuffer.set(
                commentaryName.slice(0, COMMENTARY_NAME_LENGTH),
                pointer
            );

            const playerName = textEncoder.encode(value.playerName);
            intBuffer.set(
                playerName.slice(0, PLAYER_NAME_LENGTH),
                pointer + COMMENTARY_NAME_LENGTH
            );

            pointer += RECORD_SIZE;
        });

        const file = new File([buffer], "example.bin", {
            type: "application/octet-stream",
        });
        const url = URL.createObjectURL(file);
        const a = document.createElement("a");
        a.href = url;
        a.download = "example.bin";
        a.click();
        URL.revokeObjectURL(url);
    }, [isLoaded, metadata, allPlayers]);

    const parseBin = useCallback(async (file: File) => {
        const arrayBuffer = await file.arrayBuffer();
        const fileBuffer = new Uint8Array(arrayBuffer);
        const players: Array<CommentaryInfoType> = [];

        if (fileBuffer.length < COMMENTARY_START_OFFSET) {
            throw new Error(`File too small: ${fileBuffer.length} bytes`);
        }

        if (!isBinaryValid(fileBuffer)) {
            throw new Error("Invalid file. Make sure your file is correct");
        }

        setMetadata({
            first: fileBuffer.slice(0, 16),
            second: fileBuffer.slice(20, 36),
        });

        let pointer = COMMENTARY_START_OFFSET;

        while (pointer + RECORD_SIZE <= fileBuffer.length) {
            const commentaryNameBuffer = fileBuffer.slice(
                pointer,
                pointer + COMMENTARY_NAME_LENGTH
            );
            const playerNameBuffer = fileBuffer.slice(
                pointer + COMMENTARY_NAME_LENGTH,
                pointer + COMMENTARY_NAME_LENGTH + PLAYER_NAME_LENGTH
            );

            const commentaryName = cleanString(commentaryNameBuffer);
            const playerName = cleanString(playerNameBuffer);

            players.push({
                commentaryName,
                playerName,
            });

            pointer += RECORD_SIZE;
        }

        setAllPlayers(players);
        setIsLoaded(true);

        // Reset pagination when new data is loaded
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, []);

    const filteredPlayers = useMemo(() => {
        let filtered = [...allPlayers];

        if (globalFilter) {
            const searchTerm = globalFilter.toLowerCase();
            filtered = filtered.filter(
                (player) =>
                    player.commentaryName.toLowerCase().includes(searchTerm) ||
                    player.playerName.toLowerCase().includes(searchTerm)
            );
        }

        columnFilters.forEach((filter) => {
            const { id, value } = filter;
            if (value) {
                const searchTerm = String(value).toLowerCase();
                filtered = filtered.filter((player) => {
                    const fieldValue = player[id as keyof CommentaryInfoType];
                    return String(fieldValue)
                        .toLowerCase()
                        .includes(searchTerm);
                });
            }
        });

        return filtered;
    }, [allPlayers, globalFilter, columnFilters]);

    const sortedPlayers = useMemo(() => {
        if (sorting.length === 0) return filteredPlayers;

        return [...filteredPlayers].sort((a, b) => {
            for (const sort of sorting) {
                const { id, desc } = sort;
                const aValue = a[id as keyof CommentaryInfoType];
                const bValue = b[id as keyof CommentaryInfoType];

                let comparison = 0;
                if (aValue > bValue) comparison = 1;
                if (aValue < bValue) comparison = -1;

                if (comparison !== 0) {
                    return desc ? -comparison : comparison;
                }
            }
            return 0;
        });
    }, [filteredPlayers, sorting]);

    const paginatedPlayers = useMemo(() => {
        const start = pagination.pageIndex * pagination.pageSize;
        const end = start + pagination.pageSize;
        return sortedPlayers.slice(start, end);
    }, [sortedPlayers, pagination]);

    const pageCount = useMemo(() => {
        return Math.ceil(sortedPlayers.length / pagination.pageSize);
    }, [sortedPlayers.length, pagination.pageSize]);

    const clearData = useCallback(() => {
        setIsLoaded(false);
        setMetadata(undefined);
        setAllPlayers([]);
        setSorting([]);
        setColumnFilters([]);
        setGlobalFilter("");
        setPagination({ pageIndex: 0, pageSize: 50 });
    }, []);

    const resetFilters = useCallback(() => {
        setColumnFilters([]);
        setGlobalFilter("");
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, []);

    const resetPagination = useCallback(() => {
        setPagination((prev) => ({ ...prev, pageIndex: 0 }));
    }, []);

    const contextValue = useMemo(
        () => ({
            // Data state
            clearData,
            isLoaded,
            parseBin,

            // Raw data
            allPlayers,

            // Processed data
            paginatedPlayers,

            // Pagination
            pagination,
            setPagination,
            pageCount,

            // Sorting
            sorting,
            setSorting,

            // Filtering
            columnFilters,
            setColumnFilters,
            globalFilter,
            setGlobalFilter,

            // Utilities
            resetFilters,
            resetPagination,

            insertPlayer,
            updatePlayer,

            saveBin,
        }),
        [
            clearData,
            isLoaded,
            parseBin,
            allPlayers,
            paginatedPlayers,
            pagination,
            pageCount,
            sorting,
            columnFilters,
            globalFilter,
            resetFilters,
            resetPagination,
            saveBin,
        ]
    );

    return (
        <CommentaryPlayerListContext.Provider value={contextValue}>
            {children}
        </CommentaryPlayerListContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCommentaryPlayerList() {
    const context = useContext(CommentaryPlayerListContext);
    if (!context) {
        throw new Error(
            "useCommentaryPlayerList must be used within a CommentaryPlayerListProvider"
        );
    }
    return context;
}
