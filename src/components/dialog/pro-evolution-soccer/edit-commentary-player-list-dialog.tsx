import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { type DialogProps } from "@/hooks/use-dialog";
import { useCommentaryPlayerList } from "@/provider/commentary-player-list-provider";
import toast from "react-hot-toast";
import { useEffect } from "react";
import type { CommentaryInfoType } from "@/types/pro-evolution-soccer/commentary-info";
import { Pencil, Plus, Trash2 } from "lucide-react";

const formSchema = z.object({
    commentaryName: z.string().length(15, {
        message: "Commentary name must be 15 characters.",
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
}: {
    dialog: DialogProps<CommentaryInfoType>;
}) {
    const { insertPlayer, updatePlayer } = useCommentaryPlayerList();
    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            commentaryName: "",
            playerName: "",
        },
    });

    useEffect(() => {
        if (dialog.action === "update" && dialog.data) {
            form.setValue("commentaryName", dialog.data!.commentaryName);
            form.setValue("playerName", dialog.data!.playerName);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [dialog.data, dialog.action]);

    function onSubmit(values: z.infer<typeof formSchema>) {
        if (dialog.action === "update") {
            updatePlayer(values);
            toast.success("Player successfully updated");
        } else {
            insertPlayer(values);
            toast.success("Player successfully created");
        }
        dialog.close();
    }

    return (
        <Dialog open={dialog.isOpen} onOpenChange={dialog.setIsOpen}>
            <DialogContent className="sm:max-w-96 max-w-96">
                <DialogHeader className="mb-5">
                    <DialogTitle>
                        {dialog.action === "update" ? "Edit a" : "Create New"}{" "}
                        Player Commentary
                    </DialogTitle>
                </DialogHeader>
                <section>
                    <Form {...form}>
                        <form
                            onSubmit={form.handleSubmit(onSubmit)}
                            className="space-y-8"
                        >
                            <FormField
                                control={form.control}
                                name="commentaryName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Commentary Name</FormLabel>
                                        <FormControl>
                                            <Input
                                                required={true}
                                                readOnly={
                                                    dialog.action === "update"
                                                }
                                                {...field}
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
                                    <Button variant='destructive' type="button">
                                        <Trash2 />
                                        Delete
                                    </Button>
                                ) : null}
                                <Button variant='outline' type="submit">
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
