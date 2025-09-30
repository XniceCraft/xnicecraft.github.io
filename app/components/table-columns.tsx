import { type DialogProps } from "~/hooks/use-dialog";
import { type CommentaryRecord} from 'pes-commentary-editor-js'
import { type ColumnDef } from "@tanstack/react-table";
import { DataTableColumnHeader } from "~/components/data-table/data-table-column-header";
import { Button } from "~/components/ui/button";

export const editCommentaryPlayerListColumns = (
  dialog: DialogProps<CommentaryRecord>,
): ColumnDef<CommentaryRecord>[] => {
  return [
    {
      id: "commentaryName",
      accessorKey: "commentaryName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Commentary Name" />
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
            onClick={() => dialog.openWithAction("update", row.original)}
            variant="outline"
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