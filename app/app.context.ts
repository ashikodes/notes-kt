import React, { createContext } from "react";
import { Prisma } from "@prisma/client";


export const initialState = {
  user_id: "",
  search: "",
  userFont: "inter" as "inter" | "sans" | "monospace",
  userColor: "light" as "light" | "dark" | "system",
  toast: "" as "saved" | "archived" | "deleted" | "updated" | "restored" | "tag_deleted" | "settings" | "",
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
