import { useCallback } from "react";
import { Upload, X } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  FileUpload,
  FileUploadDropzone,
  FileUploadItem,
  FileUploadItemDelete,
  FileUploadItemMetadata,
  FileUploadItemPreview,
  FileUploadList,
  FileUploadTrigger,
} from "~/components/ui/file-upload";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCommentaryPlayerList } from "~/provider/commentary-player-list-provider";
import { PES2017Config, PES2021Config } from "pes-commentary-editor-js";

const formSchema = z.object({
  files: z
    .array(z.custom<File>())
    .min(1, "Please select at least one file")
    .max(1, "Please select only one file"),
  pesVersion: z.enum(["2017", "2021"]),
});

const pesConfigMaps = {
  2017: PES2017Config,
  2021: PES2021Config,
};

export default function UploadPage() {
  const { parseBin } = useCommentaryPlayerList();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      files: [],
      pesVersion: "2017",
    },
  });

  const onSubmit = useCallback(async (data: z.infer<typeof formSchema>) => {
    await parseBin(data.files[0], pesConfigMaps[data.pesVersion]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col items-center justify-center max-w-96 mx-auto space-y-4">
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-semibold">Upload Commentary File</h2>
        <p className="text-muted-foreground">
          Select a PES commentary binary file to start editing
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={() => form.handleSubmit(onSubmit)} className="w-full">
          <FormField
            control={form.control}
            name="files"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <FileUpload
                    value={field.value}
                    onValueChange={field.onChange}
                    maxFiles={1}
                    onFileReject={(_, message) => {
                      form.setError("files", {
                        message,
                      });
                    }}
                    multiple
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
                      {field.value.map((file) => (
                        <FileUploadItem key={file.name} value={file}>
                          <FileUploadItemPreview />
                          <FileUploadItemMetadata />
                          <FileUploadItemDelete asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="size-7"
                            >
                              <X />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </FileUploadItemDelete>
                        </FileUploadItem>
                      ))}
                    </FileUploadList>
                  </FileUpload>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex items-center gap-3 mt-5">
            <FormField
              control={form.control}
              name="pesVersion"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="PES Version" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="2017">PES 2017</SelectItem>
                      <SelectItem value="2021">PES 2021</SelectItem>
                    </SelectContent>
                  </Select>

                  <FormMessage />
                </FormItem>
              )}
            />
            <Button className="flex-1">Edit Commentary</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
