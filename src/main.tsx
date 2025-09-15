import "./assets/css/app.css";
import { createBrowserRouter, RouterProvider } from "react-router";
import ReactDOM from "react-dom/client";

import Home from "./pages/home";
import EditCommentaryPlayerList from "./pages/pro-evolution-soccer/edit-commentary-player-list";

const router = createBrowserRouter([
    {
        index: true,
        Component: Home,
    },
    {
        path: "pro-evolution-soccer",
        children: [
            {
                path: "edit-commentary-player-list",
                Component: EditCommentaryPlayerList,
            },
        ],
    },
]);

const root = document.getElementById("root");

ReactDOM.createRoot(root!).render(<RouterProvider router={router} />);
