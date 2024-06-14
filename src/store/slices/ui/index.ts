import { StateCreator } from "zustand";

import { StoreState } from "..";
import { UISlice, UIState } from "./types";

export function getInitialUIState(): UIState {
  return {
    ui: {
      hydrated: false,
      initialized: false,
      listScrollRestore: undefined,
    },
  };
}

export const createUISlice: StateCreator<StoreState, [], [], UISlice> = (
  set,
  get,
) => ({
  ...getInitialUIState(),
  setHydrated() {
    set({ ui: { ...get().ui, hydrated: true } });
  },
  setListScrollRestore(snapshot) {
    set({ ui: { ...get().ui, listScrollRestore: snapshot } });
  },
});
