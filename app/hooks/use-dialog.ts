import { useState, type Dispatch, type SetStateAction } from "react";

type DialogAction = "create" | "update" | "import" | null;

export interface DialogProps<TData> {
    isOpen: boolean;
    setIsOpen: Dispatch<SetStateAction<boolean>>;
    openWithAction: (action: DialogAction, data?: TData) => void;
    close: () => void;
    data: TData | undefined;
    setData: Dispatch<SetStateAction<TData | undefined>>;
    action: DialogAction;
    setAction: Dispatch<SetStateAction<DialogAction>>;
}

export function useDialog<TData>(): DialogProps<TData> {
    const [isOpen, setIsOpen] = useState(false);
    const [data, setData] = useState<TData | undefined>();
    const [action, setAction] = useState<DialogAction>(null);

    const openWithAction = (action: DialogAction, data?: TData) => {
        setIsOpen(true);
        setAction(action);
        setData(data);
    };

    const close = () => {
        setIsOpen(false);
        setAction(null);
        setData(undefined);
    };

    return {
        isOpen,
        setIsOpen,
        openWithAction,
        close,
        data,
        setData,
        action,
        setAction,
    };
}
