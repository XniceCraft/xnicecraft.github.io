import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { getCommentaryId } from "~/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { useCommentaryPlayerList } from "~/provider/commentary-player-list-provider";
import { useEffect } from "react";
import toast from "react-hot-toast";

import type { DialogProps } from "~/hooks/use-dialog";
import type { CommentaryRecord } from "pes-commentary-editor-js";

const formSchema = z.object({
  commentaryId: z
    .number()
    .min(0, {
      error: "Commentary id must be atleast 0.",
    })
    .max(999999, {
      error: "Commentary id must be less than or equal 999999.",
    }),
  playerName: z
    .string()
    .min(1, {
      message: "Player name must be atleast 2 characters.",
    })
    .max(48, {
      message: "Player name must be not exceeds 48 characters.",
    }),
});

export function EditCommentaryPlayerListDialog({
  dialog,
}: Readonly<{
  dialog: DialogProps<CommentaryRecord>;
}>) {
  const { createPlayer, deletePlayer, updatePlayer } =
    useCommentaryPlayerList();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      commentaryId: 0,
      playerName: "",
    },
  });

  useEffect(() => {
    form.setValue("commentaryId", dialog.data ? getCommentaryId(dialog.data.commentaryName) : 0);
    form.setValue("playerName", dialog.data?.playerName || "");
  }, [dialog.data]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (dialog.action === "update") {
      updatePlayer(values);
      toast.success("Player successfully updated");
    } else {
      createPlayer(values);
      toast.success("Player successfully created");
    }
    dialog.close();
  }

  function onDelete() {
    if (dialog.action === "update" && dialog.data) {
      deletePlayer(getCommentaryId(dialog.data.commentaryName));
      toast.success("Player successfully deleted");
      dialog.close();
    }
  }

  return (
    <Dialog open={dialog.isOpen} onOpenChange={dialog.setIsOpen}>
      <DialogContent className="sm:max-w-96 max-w-96">
        <DialogHeader className="mb-5">
          <DialogTitle>
            {dialog.action === "update" ? "Edit a" : "Create New"} Player
            Commentary
          </DialogTitle>
        </DialogHeader>
        <section>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
                name="commentaryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Commentary Id</FormLabel>
                    <FormControl>
                      <Input
                        required={true}
                        type="number"
                        min={0}
                        max={999999}
                        readOnly={dialog.action === "update"}
                        {...field}
                        onChange={(e) => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="playerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Player Name</FormLabel>
                    <FormControl>
                      <Input required={true} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex items-center justify-end gap-3">
                {dialog.action === "update" ? (
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={onDelete}
                  >
                    <Trash2 />
                    Delete
                  </Button>
                ) : null}
                <Button variant="outline" type="submit">
                  {dialog.action === "update" ? (
                    <>
                      <Pencil />
                      Edit
                    </>
                  ) : (
                    <>
                      <Plus />
                      Create
                    </>
                  )}
                </Button>
              </div>
            </form>
          </Form>
        </section>
      </DialogContent>
    </Dialog>
  );
}
