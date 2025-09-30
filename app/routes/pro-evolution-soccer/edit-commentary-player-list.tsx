import { lazy, Suspense } from "react";
import {
  CommentaryPlayerListProvider,
  useCommentaryPlayerList,
} from "~/provider/commentary-player-list-provider";
import { Main } from "~/components/main";
import { Navbar } from "~/components/navbar/navbar";
import { Skeleton } from "~/components/ui/skeleton";

const EditPage = lazy(() => import("./edit-commentary-player-list/edit-page"));
const UploadPage = lazy(
  () => import("./edit-commentary-player-list/upload-page"),
);

export function meta() {
  return [
    { title: "PES Commentary Editor" },
    {
      name: "description",
      content:
        "Edit, manage, and customize PES commentary files with ease. Our PES Commentary List Editor lets you view, update, and organize player names and commentary IDs quickly—perfect for modders and football game enthusiasts.",
    },
  ];
}

function Content() {
  const { isLoaded } = useCommentaryPlayerList();

  return (
    <Suspense fallback={<Skeleton className="h-[50vh]" />}>
      {isLoaded ? <EditPage /> : <UploadPage />}
    </Suspense>
  );
}

export default function EditCommentaryPlayerList() {
  return (
    <CommentaryPlayerListProvider>
      <Navbar />
      <Main className="mt-8">
        <Content />
      </Main>
    </CommentaryPlayerListProvider>
  );
}
