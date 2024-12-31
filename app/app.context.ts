import { createContext } from "react";


export const initialState = {
  user_id: "",
  search: "",
};

export const AppStateContext = createContext({ appState: initialState, setAppState: (state: typeof initialState) => {} });
