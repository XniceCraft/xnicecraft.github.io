import { useCallback, useState } from "react";
import { Plus, Save, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    FileUpload,
    FileUploadDropzone,
    FileUploadItem,
    FileUploadItemDelete,
    FileUploadItemMetadata,
    FileUploadItemPreview,
    FileUploadItemProgress,
    FileUploadList,
    type FileUploadProps,
    FileUploadTrigger,
} from "@/components/ui/file-upload";
import {
    CommentaryPlayerListProvider,
    useCommentaryPlayerList,
} from "@/provider/commentary-player-list-provider";
import { DataTable } from "@/components/data-table/data-table";
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar";
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header";
import { Main } from "@/components/ui/main";
import { Navbar } from "@/components/navbar/navbar";
import { SearchBar } from "@/components/ui/others/search-bar";
import {
    type ColumnDef,
    getCoreRowModel,
    useReactTable,
} from "@tanstack/react-table";
import { useDialog, type DialogProps } from "@/hooks/use-dialog";
import { EditCommentaryPlayerListDialog } from "@/components/dialog/pro-evolution-soccer/edit-commentary-player-list-dialog";
import type { CommentaryInfoType } from "@/types/pro-evolution-soccer/commentary-info";
import toast from "react-hot-toast";
import MainLayout from "@/layout/main-layout";

const columns = (
    dialog: DialogProps<CommentaryInfoType>
): ColumnDef<CommentaryInfoType>[] => {
    return [
        {
            id: "commentaryName",
            accessorKey: "commentaryName",
            header: ({ column }) => (
                <DataTableColumnHeader
                    column={column}
                    title="Commentary Name"
                />
            ),
            cell: ({ getValue }) => (
                <div className="font-mono text-sm">{getValue<string>()}</div>
            ),
            meta: {
                label: "Commentary Name",
            },
            size: 30,
        },
        {
            id: "playerName",
            accessorKey: "playerName",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="Player Name" />
            ),
            meta: {
                label: "Player Name",
            },
            cell: ({ getValue }) => (
                <div className="font-medium">{getValue<string>()}</div>
            ),
        },
        {
            id: "action",
            header: ({ column }) => (
                <DataTableColumnHeader column={column} title="#" />
            ),
            cell: ({ row }) => {
                return (
                    <Button
                        onClick={() =>
                            dialog.openWithAction("update", row.original)
                        }
                        variant='outline'
                        className="font-medium"
                    >
                        Edit
                    </Button>
                );
            },
            maxSize: 20,
        },
    ];
};

function EditPage() {
    const dialog = useDialog<CommentaryInfoType>();

    const {
        clearData,
        paginatedPlayers,
        pagination,
        setPagination,
        pageCount,
        sorting,
        setSorting,
        columnFilters,
        setColumnFilters,
        globalFilter,
        saveBin,
    } = useCommentaryPlayerList();

    const table = useReactTable({
        data: paginatedPlayers,
        columns: columns(dialog),
        state: {
            sorting,
            columnFilters,
            globalFilter,
            pagination,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onPaginationChange: setPagination,
        getCoreRowModel: getCoreRowModel(),
        manualPagination: true,
        manualSorting: true,
        manualFiltering: true,
        pageCount,
    });

    const getColumnFilter = (columnId: string) => {
        return (
            columnFilters.find((filter) => filter.id === columnId)?.value || ""
        );
    };

    const setColumnFilter = (columnId: string, value: string) => {
        setColumnFilters((prev) => {
            const filtered = prev.filter((filter) => filter.id !== columnId);
            if (value) {
                return [...filtered, { id: columnId, value }];
            }
            return filtered;
        });
    };

    return (
        <>
            <div className="space-y-4 mt-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-semibold">
                            Commentary Player List Editor
                        </h1>
                        <p className="text-muted-foreground">
                            Edit and manage PES commentary player associations
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button variant="destructive" onClick={clearData}>
                            <X />
                            Close
                        </Button>

                        <Button variant="outline" onClick={saveBin}>
                            <Save />
                            Save changes
                        </Button>

                        <Button
                            variant="outline"
                            onClick={() => dialog.openWithAction("create")}
                        >
                            <Plus />
                            Create new player
                        </Button>
                    </div>
                </div>
                <DataTable table={table}>
                    <DataTableToolbar table={table}>
                        <div className="flex flex-1 items-center space-x-2">
                            <SearchBar
                                placeholder="Filter commentary name..."
                                value={
                                    getColumnFilter("commentaryName") as string
                                }
                                setValue={(value) =>
                                    setColumnFilter("commentaryName", value)
                                }
                            />
                            <SearchBar
                                placeholder="Filter player name..."
                                value={getColumnFilter("playerName") as string}
                                setValue={(value) =>
                                    setColumnFilter("playerName", value)
                                }
                            />
                        </div>
                    </DataTableToolbar>
                </DataTable>
            </div>
            <EditCommentaryPlayerListDialog dialog={dialog} />
        </>
    );
}

function UploadPage() {
    const { parseBin } = useCommentaryPlayerList();
    const [files, setFiles] = useState<File[]>([]);

    const onUpload: NonNullable<FileUploadProps["onUpload"]> = useCallback(
        async (files, { onSuccess, onError }) => {
            const uploadPromises = files.map(async (file: File) => {
                try {
                    await parseBin(file);
                    onSuccess(file);
                } catch (err: unknown) {
                    onError(file, err as Error);
                    console.error(err);
                    toast.error((err as Error).message);
                }
            });

            await Promise.all(uploadPromises);
        },
        [parseBin]
    );

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-semibold">
                    Upload Commentary File
                </h2>
                <p className="text-muted-foreground">
                    Select a PES commentary binary file to start editing
                </p>
            </div>

            <FileUpload
                value={files}
                onValueChange={setFiles}
                onUpload={onUpload}
                maxFiles={1}
                required={true}
                className="w-full max-w-md"
            >
                <FileUploadDropzone>
                    <div className="flex flex-col items-center gap-1 text-center">
                        <div className="flex items-center justify-center rounded-full border p-2.5">
                            <Upload className="size-6 text-muted-foreground" />
                        </div>
                        <p className="font-medium text-sm">
                            Drag & drop files here
                        </p>
                        <p className="text-muted-foreground text-xs">
                            Or click to browse (max 1 file)
                        </p>
                    </div>
                    <FileUploadTrigger asChild>
                        <Button
                            variant="outline"
                            size="sm"
                            className="mt-2 w-fit"
                        >
                            Browse files
                        </Button>
                    </FileUploadTrigger>
                </FileUploadDropzone>
                <FileUploadList>
                    {files.map((file, index) => (
                        <FileUploadItem
                            key={index}
                            value={file}
                            className="flex-col"
                        >
                            <div className="flex w-full items-center gap-2">
                                <FileUploadItemPreview />
                                <FileUploadItemMetadata />
                                <FileUploadItemDelete asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="size-7"
                                    >
                                        <X />
                                    </Button>
                                </FileUploadItemDelete>
                            </div>
                            <FileUploadItemProgress />
                        </FileUploadItem>
                    ))}
                </FileUploadList>
            </FileUpload>
        </div>
    );
}

function Content() {
    const { isLoaded } = useCommentaryPlayerList();

    return isLoaded ? <EditPage /> : <UploadPage />;
}

export default function EditCommentaryPlayerList() {
    return (
        <CommentaryPlayerListProvider>
            <MainLayout>
                <Navbar />
                <Main>
                    <Content />
                </Main>
            </MainLayout>
        </CommentaryPlayerListProvider>
    );
}
