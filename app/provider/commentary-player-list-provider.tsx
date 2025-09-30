import {
  createContext,
  use,
  useState,
  useMemo,
  useCallback,
  useRef,
} from "react";
import type {
  SortingState,
  ColumnFiltersState,
  PaginationState,
} from "@tanstack/react-table";
import {
  PESCommentaryListParser,
  type CommentaryRecord,
  type CommentaryUpsert,
  type PESConfig,
} from "pes-commentary-editor-js";
import toast from "react-hot-toast";

interface CommentaryPlayerListType {
  clearData: () => void;
  isLoaded: boolean;
  parseBin: (file: File, pesConfig: PESConfig) => Promise<void>;
  paginatedPlayers: CommentaryRecord[];
  pagination: PaginationState;
  setPagination: React.Dispatch<React.SetStateAction<PaginationState>>;
  pageCount: number;
  sorting: SortingState;
  setSorting: React.Dispatch<React.SetStateAction<SortingState>>;
  columnFilters: ColumnFiltersState;
  setColumnFilters: React.Dispatch<React.SetStateAction<ColumnFiltersState>>;
  resetFilters: () => void;
  resetPagination: () => void;
  createPlayer: (data: CommentaryUpsert) => void;
  updatePlayer: (data: CommentaryUpsert) => void;
  deletePlayer: (commentaryId: CommentaryUpsert["commentaryId"]) => void;
  saveBin: () => void;
}

const CommentaryPlayerListContext = createContext<
  CommentaryPlayerListType | undefined
>(undefined);

export function CommentaryPlayerListProvider({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [dataVersion, setDataVersion] = useState(0);
  const parserRef = useRef<PESCommentaryListParser | undefined>(undefined);
  const fileNameRef = useRef<string | undefined>(undefined);
  const isChangedRef = useRef<boolean>(false);

  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 50,
  });

  const parseBin = useCallback(async (file: File, pesConfig: PESConfig) => {
    try {
      const parser = await PESCommentaryListParser.parse(file, pesConfig);
      parserRef.current = parser;
      fileNameRef.current = file.name;
      setIsLoaded(true);
      setDataVersion(1);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }, []);

  const saveBin = useCallback(() => {
    if (!isLoaded || !parserRef.current || !fileNameRef.current) return;

    const buffer = parserRef.current.save();
    const file = new File([buffer], fileNameRef.current, {
      type: "application/octet-stream",
    });
    const url = URL.createObjectURL(file);
    const a = document.createElement("a");
    a.href = url;
    a.download = fileNameRef.current;
    a.click();
    URL.revokeObjectURL(url);
  }, [isLoaded]);

  const createPlayer = useCallback((data: CommentaryUpsert) => {
    if (!parserRef.current) return;

    try {
      parserRef.current.createPlayer(data);
      setDataVersion((v) => v + 1);
      isChangedRef.current = true;
    } catch (err) {
      toast.error((err as Error).message);
    }
  }, []);

  const updatePlayer = useCallback((data: CommentaryUpsert) => {
    if (!parserRef.current) return;

    try {
      parserRef.current.updatePlayer(data);
      setDataVersion((v) => v + 1);
      isChangedRef.current = true;
    } catch (err) {
      toast.error((err as Error).message);
    }
  }, []);

  const deletePlayer = useCallback(
    (commentaryId: CommentaryUpsert["commentaryId"]) => {
      if (!parserRef.current) return;

      try {
        parserRef.current.deletePlayer(commentaryId);
        setDataVersion((v) => v + 1);
        isChangedRef.current = true;
      } catch (err) {
        toast.error((err as Error).message);
      }
    },
    [],
  );

  // Combined filtering and sorting to reduce iterations
  const processedPlayers = useMemo(() => {
    let result = [...(parserRef.current?.playerList || [])];

    if (!parserRef.current && !isLoaded) return result;

    if (columnFilters.length === 0 && sorting.length === 0) return result;

    // Apply filters
    if (columnFilters.length > 0) {
      setPagination((prev) => ({ ...prev, pageIndex: 0 }));
      result = result.filter((player) => {
        for (const filter of columnFilters) {
          const { id, value } = filter;
          if (value) {
            const searchTerm = String(value as string).toLowerCase();
            const fieldValue = player[id as keyof CommentaryRecord];
            if (!String(fieldValue).toLowerCase().includes(searchTerm)) {
              return false;
            }
          }
        }

        return true;
      });
    }

    if (sorting.length > 0) {
      result = [...result].sort((a, b) => {
        for (const sort of sorting) {
          const { id, desc } = sort;
          const aValue = a[id as keyof CommentaryRecord];
          const bValue = b[id as keyof CommentaryRecord];

          if (aValue === bValue) continue;

          const comparison = aValue > bValue ? 1 : -1;
          return desc ? -comparison : comparison;
        }
        return 0;
      });
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, dataVersion, columnFilters, sorting]);

  const paginatedPlayers = useMemo(() => {
    const start = pagination.pageIndex * pagination.pageSize;
    return processedPlayers.slice(start, start + pagination.pageSize);
  }, [processedPlayers, pagination.pageIndex, pagination.pageSize]);

  const pageCount = useMemo(
    () => Math.ceil(processedPlayers.length / pagination.pageSize),
    [processedPlayers.length, pagination.pageSize],
  );

  const clearData = useCallback(() => {
    setIsLoaded(false);
    setDataVersion(0);
    setSorting([]);
    setColumnFilters([]);
    setPagination({ pageIndex: 0, pageSize: 50 });
    fileNameRef.current = undefined;
    parserRef.current = undefined;
    isChangedRef.current = false;
  }, []);

  const resetFilters = useCallback(() => {
    setColumnFilters([]);
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const resetPagination = useCallback(() => {
    setPagination((prev) => ({ ...prev, pageIndex: 0 }));
  }, []);

  const contextValue = useMemo(
    () => ({
      clearData,
      isLoaded,
      parseBin,
      paginatedPlayers,
      pagination,
      setPagination,
      pageCount,
      sorting,
      setSorting,
      columnFilters,
      setColumnFilters,
      resetFilters,
      resetPagination,
      createPlayer,
      updatePlayer,
      deletePlayer,
      saveBin,
    }),
    [
      clearData,
      isLoaded,
      parseBin,
      paginatedPlayers,
      pagination,
      pageCount,
      sorting,
      columnFilters,
      resetFilters,
      resetPagination,
      createPlayer,
      updatePlayer,
      deletePlayer,
      saveBin,
    ],
  );

  return (
    <CommentaryPlayerListContext value={contextValue}>
      {children}
    </CommentaryPlayerListContext>
  );
}

export function useCommentaryPlayerList() {
  const context = use(CommentaryPlayerListContext);
  if (!context) {
    throw new Error(
      "useCommentaryPlayerList must be used within a CommentaryPlayerListProvider",
    );
  }
  return context;
}
