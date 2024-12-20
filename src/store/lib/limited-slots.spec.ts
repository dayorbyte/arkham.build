import { beforeAll, describe, expect, it } from "vitest";

import limitCarolyn from "@/test/fixtures/decks/validation/limit_carolyn.json";
import limitCarolynInvalid from "@/test/fixtures/decks/validation/limit_carolyn_invalid.json";
import limitCarolynVersatile from "@/test/fixtures/decks/validation/limit_carolyn_versatile.json";
import limitCarolynVersatileInvalid from "@/test/fixtures/decks/validation/limit_carolyn_versatile_invalid.json";
import { getMockStore } from "@/test/get-mock-store";
import { StoreApi } from "zustand";
import { StoreState } from "../slices";
import { LimitedSlotOccupation, limitedSlotOccupation } from "./limited-slots";
import { resolveDeck } from "./resolve-deck";

function toSnapShot(value: LimitedSlotOccupation) {
  return {
    index: value.index,
    entries: value.entries.reduce((acc, curr) => acc + curr.quantity, 0),
  };
}

describe("limitedSlotOccupation()", () => {
  let store: StoreApi<StoreState>;

  beforeAll(async () => {
    store = await getMockStore();
  });

  it("handles investigators with limit deckbuilding", () => {
    const state = store.getState();

    expect(
      limitedSlotOccupation(
        resolveDeck(
          state.metadata,
          state.lookupTables,
          state.sharing,
          limitCarolyn,
        ),
      )?.map(toSnapShot),
    ).toMatchInlineSnapshot(`
      [
        {
          "entries": 15,
          "index": 4,
        },
      ]
    `);

    expect(
      limitedSlotOccupation(
        resolveDeck(
          state.metadata,
          state.lookupTables,
          state.sharing,
          limitCarolynInvalid,
        ),
      )?.map(toSnapShot),
    ).toMatchInlineSnapshot(`
      [
        {
          "entries": 16,
          "index": 4,
        },
      ]
    `);
  });

  it("handles presence of dynamic limit deck building (versatile)", () => {
    const state = store.getState();

    expect(
      limitedSlotOccupation(
        resolveDeck(
          state.metadata,
          state.lookupTables,
          state.sharing,
          limitCarolynVersatile,
        ),
      )?.map(toSnapShot),
    ).toMatchInlineSnapshot(`
      [
        {
          "entries": 15,
          "index": 4,
        },
        {
          "entries": 1,
          "index": 5,
        },
      ]
    `);

    expect(
      limitedSlotOccupation(
        resolveDeck(
          state.metadata,
          state.lookupTables,
          state.sharing,
          limitCarolynVersatileInvalid,
        ),
      )?.map(toSnapShot),
    ).toMatchInlineSnapshot(`
      [
        {
          "entries": 15,
          "index": 4,
        },
        {
          "entries": 2,
          "index": 5,
        },
      ]
    `);
  });
});
