import { assert } from "@/utils/assert";
import { SPECIAL_CARD_CODES } from "@/utils/constants";
import { formatRelationTitle } from "@/utils/formatting";
import { createSelector } from "reselect";
import { resolveCardWithRelations } from "../lib/resolve-card";
import type { CardSet, CardWithRelations, ResolvedCard } from "../lib/types";
import type { StoreState } from "../slices";

export function selectDeckCreateChecked(state: StoreState) {
  const { deckCreate } = state;
  assert(deckCreate, "DeckCreate slice must be initialized.");
  return deckCreate;
}

export const selectDeckCreateInvestigators = createSelector(
  selectDeckCreateChecked,
  (state: StoreState) => state.metadata,
  (state: StoreState) => state.lookupTables,
  (deckCreate, metadata, lookupTables) => {
    return Object.entries({
      investigator: deckCreate.investigatorCode,
      back: deckCreate.investigatorBackCode,
      front: deckCreate.investigatorFrontCode,
    }).reduce(
      (acc, [key, code]) => {
        const card = resolveCardWithRelations(
          metadata,
          lookupTables,
          code,
          deckCreate.tabooSetId,
          undefined,
          true,
        );

        assert(card, `${key} card must be resolved.`);

        acc[key] = card;
        return acc;
      },
      {} as Record<string, CardWithRelations>,
    );
  },
);

export const selectDeckCreateCardSets = createSelector(
  (state: StoreState) => state.metadata,
  (state: StoreState) => state.lookupTables,
  selectDeckCreateChecked,
  selectDeckCreateInvestigators,
  (metadata, lookupTables, deckCreate, investigators) => {
    const groupings: CardSet[] = [];

    const { back, investigator } = investigators;
    const { relations } = investigator;

    const deckSizeRequirement = investigator.card.deck_requirements?.size ?? 30;

    const hasDeckSizeOption = investigator.card.deck_options?.find((o) =>
      Array.isArray(o.deck_size_select),
    );

    if (relations?.advanced?.length) {
      groupings.push({
        id: "advanced",
        title: formatRelationTitle("advanced"),
        canSelect: true,
        cards: relations.advanced,
        selected: deckCreate.sets.includes("advanced"),
        quantities: relations.advanced.reduce(
          (acc, { card }) => {
            acc[card.code] = card.quantity;
            return acc;
          },
          {} as Record<string, number>,
        ),
        help: `Signature cards with "Advanced" are stronger versions of an investigator's signature cards that are listed under "Deck Requirements".<br>At any point during a campaign (including at deck creation) you may optionally choose to include these advanced signature cards <strong>instead of</strong> the original signature cards.`,
      });
    }

    if (relations?.replacement?.length) {
      groupings.push({
        id: "replacement",
        title: formatRelationTitle("replacement"),
        canSelect: true,
        cards: relations.replacement,
        selected: deckCreate.sets.includes("replacement"),
        quantities: relations.replacement.reduce(
          (acc, { card }) => {
            acc[card.code] = card.quantity;
            return acc;
          },
          {} as Record<string, number>,
        ),
        help: `Signature cards with "Replacement" can replace the signature cards that are listed under "Deckbuilding Requirements". Doing so still satisfies the requirement and the deck is valid to play.<br>If doing so, <strong>both</strong> signature cards must be replaced and if doing so for a campaign, you cannot later change to using the original signature cards.<br>Alternatively, the "Replacement" cards can be included in addition to the signature cards.`,
      });
    }

    if (
      relations?.parallelCards?.length &&
      (deckCreate.investigatorBackCode === SPECIAL_CARD_CODES.PARALLEL_JIM ||
        deckCreate.investigatorFrontCode ===
          SPECIAL_CARD_CODES.PARALLEL_WENDY ||
        deckCreate.investigatorFrontCode === SPECIAL_CARD_CODES.PARALLEL_ROLAND)
    ) {
      groupings.push({
        id: "extra",
        title: "Special cards",
        cards: relations.parallelCards,
        canSetQuantity:
          deckCreate.investigatorFrontCode ===
          SPECIAL_CARD_CODES.PARALLEL_ROLAND,
        canSelect: false,
        selected: true,
        quantities: relations.parallelCards.reduce(
          (acc, { card }) => {
            acc[card.code] =
              deckCreate.extraCardQuantities[card.code] ?? card.quantity;
            return acc;
          },
          {} as Record<string, number>,
        ),
      });
    }

    if (relations?.bound?.length) {
      groupings.push({
        id: "bound",
        title: formatRelationTitle("bound"),
        canSelect: false,
        selected: false,
        cards: relations.bound,
        quantities: relations.bound.reduce(
          (acc, { card }) => {
            acc[card.code] = card.quantity;
            return acc;
          },
          {} as Record<string, number>,
        ),
      });
    }

    if (relations?.requiredCards) {
      groupings.unshift({
        id: "requiredCards",
        canSelect: groupings.length > 0,
        cards: relations.requiredCards,
        title: formatRelationTitle("requiredCards"),
        selected: deckCreate.sets.includes("requiredCards"),
        quantities: relations.requiredCards.reduce(
          (acc, { card }) => {
            let quantity = card.quantity;

            if (card.code === SPECIAL_CARD_CODES.OCCULT_EVIDENCE) {
              const deckSizeSelection =
                deckCreate.selections.deck_size_selected;

              const deckSize = hasDeckSizeOption
                ? deckSizeSelection
                  ? +deckSizeSelection
                  : deckSizeRequirement
                : deckSizeRequirement;

              quantity = (deckSize - 20) / 10;
            }

            acc[card.code] = quantity;
            return acc;
          },
          {} as Record<string, number>,
        ),
      });
    }

    groupings.unshift({
      id: "random_basic_weakness",
      title: "Random basic weakness",
      canSelect: false,
      selected: true,
      cards: [
        resolveCardWithRelations(
          metadata,
          lookupTables,
          SPECIAL_CARD_CODES.RANDOM_BASIC_WEAKNESS,
          undefined,
        ) as ResolvedCard,
      ],
      quantities: {
        [SPECIAL_CARD_CODES.RANDOM_BASIC_WEAKNESS]:
          back.card.deck_requirements?.random.length ?? 1,
      },
    });

    return groupings;
  },
);
