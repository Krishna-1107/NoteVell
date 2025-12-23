"use clinet";

import NoteProvider, { NoteProviderContext } from "@/providers/NoteProvider";
import { useContext } from "react";

const useNote = () => {

    const context = useContext(NoteProviderContext);

    if(!context) throw Error("use this only inside the provider");

    return context;

}

export default useNote;