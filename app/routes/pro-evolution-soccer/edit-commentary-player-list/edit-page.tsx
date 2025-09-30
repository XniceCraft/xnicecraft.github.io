import { SearchBar } from "~/components/search-bar";
import { getCoreRowModel, useReactTable } from "@tanstack/react-table";
import { useDialog } from "~/hooks/use-dialog";
import { useCommentaryPlayerList } from "~/provider/commentary-player-list-provider";
import { DataTable } from "~/components/data-table/data-table";
import { DataTableToolbar } from "~/components/data-table/data-table-toolbar";
import { EditCommentaryPlayerListDialog } from "~/components/dialog/pro-evolution-soccer/edit-commentary-player-list-dialog";
import { editCommentaryPlayerListColumns } from "~/components/table-columns";
import { Plus, Save, X } from "lucide-react";
import { Button } from "~/components/ui/button";

import type { CommentaryRecord } from "pes-commentary-editor-js";

export default function EditPage() {
  const dialog = useDialog<CommentaryRecord>();

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
    saveBin,
  } = useCommentaryPlayerList();

  const table = useReactTable({
    data: paginatedPlayers,
    columns: editCommentaryPlayerListColumns(dialog),
    state: {
      sorting,
      columnFilters,
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
    return columnFilters.find((filter) => filter.id === columnId)?.value || "";
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
                value={getColumnFilter("commentaryName") as string}
                setValue={(value) => setColumnFilter("commentaryName", value)}
              />
              <SearchBar
                placeholder="Filter player name..."
                value={getColumnFilter("playerName") as string}
                setValue={(value) => setColumnFilter("playerName", value)}
              />
            </div>
          </DataTableToolbar>
        </DataTable>
      </div>
      <EditCommentaryPlayerListDialog dialog={dialog} />
    </>
  );
}