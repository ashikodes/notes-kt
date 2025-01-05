import React, { createContext } from "react";
import { Prisma } from "@prisma/client";


export const initialState = {
  user_id: "",
  search: "",
  toast: "" as "saved" | "archived" | "deleted" | "updated" | "restored" | "tag_deleted" | "",
  modal: "" as "archive" | "delete" | "",
  note: {} as Prisma.NotesUncheckedCreateInput & {
    Tags: Prisma.TagCreateInput[];
  },
};

export type AppContextType = {
  appState: typeof initialState;
  setAppState: React.Dispatch<React.SetStateAction<typeof initialState>>;
};

export const AppStateContext = createContext({} as AppContextType);
