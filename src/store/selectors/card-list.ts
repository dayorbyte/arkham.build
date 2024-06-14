import { createSelector } from "reselect";

import { PLAYER_TYPE_ORDER } from "@/utils/constants";
import { and, pass } from "@/utils/fp";

import { applyCardChanges } from "../lib/card-changes";
import { getAdditionalDeckOptions } from "../lib/deck-validation";
import {
  filterActions,
  filterAssets,
  filterBacksides,
  filterCost,
  filterDuplicates,
  filterEncounterCards,
  filterEncounterCode,
  filterFactions,
  filterInvestigatorAccess,
  filterInvestigatorWeaknessAccess,
  filterLevel,
  filterMythosCards,
  filterOwnership,
  filterProperties,
  filterSkillIcons,
  filterSubtypes,
  filterTabooSet,
  filterTraits,
  filterType,
  filterWeaknesses,
} from "../lib/filtering";
import type { Grouping } from "../lib/grouping";
import { getGroupCards } from "../lib/grouping";
import { applySearch } from "../lib/searching";
import {
  sortAlphabetically,
  sortByEncounterPosition,
  sortedBySlots,
  sortedEncounterSets,
} from "../lib/sorting";
import type { Card } from "../services/types";
import type { StoreState } from "../slices";
import type { CardTypeFilter } from "../slices/filters/types";
import { selectActiveDeck, selectResolvedDeck } from "./decks";
import { selectCanonicalTabooSetId } from "./filters";

export type ListState = {
  key: CardTypeFilter;
  groups: Grouping[];
  cards: Card[];
  groupCounts: number[];
};

/**
 * Grouping
 */

export const selectGroupedBySlot = createSelector(
  (state: StoreState) => state.lookupTables.slots,
  (slotsTable) =>
    sortedBySlots(slotsTable).map((slot) => ({
      name: `Asset: ${slot}`,
      code: slot,
      grouping_type: "slot",
    })),
);

export const selectPlayerCardGroups = createSelector(
  (state: StoreState) => state.metadata,
  selectGroupedBySlot,
  (metadata, slotGroups) => {
    return PLAYER_TYPE_ORDER.flatMap((type) =>
      type === "asset"
        ? slotGroups
        : { ...metadata.types[type], grouping_type: "type" },
    ) as Grouping[];
  },
);

const selectWeaknessGroups = createSelector(
  (state: StoreState) => state.metadata.subtypes,
  (subtypes) => {
    const groups = Object.keys(subtypes).map((code) => ({
      code: code,
      name: code === "weakness" ? "Weakness" : "Basic Weakness",
      grouping_type: "subtype",
    }));

    groups.sort((a) => (a.code === "weakness" ? -1 : 1));

    return groups;
  },
);

const selectEncounterSetGroups = createSelector(
  (state: StoreState) => state.metadata,
  (metadata) => {
    return sortedEncounterSets(metadata).map((e) => ({
      code: e.code,
      name: e.name,
      grouping_type: "encounter_set",
    }));
  },
);

const selectActiveCardType = (state: StoreState) => state.filters.cardType;

const selectActionsFilter = createSelector(
  (state: StoreState) => state.lookupTables.actions,
  (state: StoreState) => state.filters[state.filters.cardType].action,
  (actionTable, filterState) => filterActions(filterState.value, actionTable),
);

const selectAssetFilter = createSelector(
  (state: StoreState) => state.filters[state.filters.cardType].asset,
  (state: StoreState) => state.lookupTables,
  (filterState, lookupTables) => filterAssets(filterState, lookupTables),
);

const selectCostFilter = createSelector(
  (state: StoreState) => state.filters[state.filters.cardType].cost.value,
  (filterState) => (filterState.range ? filterCost(filterState) : undefined),
);

const selectEncounterSetFilter = createSelector(
  (state: StoreState) => state.filters.encounter.encounterSet,
  (filterState) => filterEncounterCode(filterState.value),
);

const selectFactionFilter = createSelector(
  (state: StoreState) => state.filters[state.filters.cardType].faction,
  (filterState) =>
    filterState.value ? filterFactions(filterState.value) : undefined,
);

const selectLevelFilter = createSelector(
  (state: StoreState) => state.filters.player.level.value,
  (filterState) => (filterState.range ? filterLevel(filterState) : undefined),
);

const selectOwnershipFilter = createSelector(
  (state: StoreState) => state.settings.collection,
  (state: StoreState) => state.metadata,
  (state: StoreState) => state.lookupTables,
  (state: StoreState) => state.filters[state.filters.cardType].ownership.value,
  (setting, metadata, lookupTables, filterState) => {
    if (filterState === "all") return pass;
    return (card: Card) => {
      const ownsCard = filterOwnership(card, metadata, lookupTables, setting);
      return filterState === "owned" ? ownsCard : !ownsCard;
    };
  },
);

/**
 * Pack
 */

const selectPackCodeFilter = createSelector(
  (state: StoreState) => state.metadata,
  (state: StoreState) => state.lookupTables,
  (state: StoreState) => state.filters[state.filters.cardType].packCode,
  (metadata, lookupTables, filterState) => {
    if (!Object.keys(filterState.value).length) return pass;

    const active = Object.values(filterState.value).some((x) => x);
    if (!active) return pass;

    // re-use the ownership filter, the logic is identical.
    return (card: Card) =>
      filterOwnership(card, metadata, lookupTables, filterState.value);
  },
);

const selectPropertiesFilter = createSelector(
  (state: StoreState) => state.lookupTables,
  (state: StoreState) => state.filters[state.filters.cardType].properties,
  (lookupTables, filterState) =>
    filterProperties(filterState.value, lookupTables),
);

const selectSkillIconsFilter = createSelector(
  (state: StoreState) => state.filters[state.filters.cardType].skillIcons,
  (filterState) => filterSkillIcons(filterState.value),
);

const selectSubtypeFilter = createSelector(
  (state: StoreState) => state.filters[state.filters.cardType].subtype,
  (state) => filterSubtypes(state.value),
);

const selectTabooSetFilter = createSelector(
  (state: StoreState) => state.filters.player.tabooSet,
  (filterState) =>
    filterState.value ? filterTabooSet(filterState.value) : undefined,
);

const selectTraitsFilter = createSelector(
  (state: StoreState) => state.lookupTables.traits,
  (state: StoreState) => state.filters[state.filters.cardType].trait,
  (traitsTable, filterState) => filterTraits(filterState.value, traitsTable),
);

const selectTypeFilter = createSelector(
  (state: StoreState) => state.filters[state.filters.cardType].type,
  (filterState) => filterType(filterState.value),
);

/**
 * Investigator Access
 */

const selectInvestigatorWeaknessFilter = createSelector(
  (state: StoreState) => state.metadata.cards,
  (state: StoreState) => state.lookupTables,
  (state: StoreState) => state.filters.player.investigator.value,
  (metadata, lookupTables, cardCode) => {
    if (!cardCode) return undefined;

    const card = metadata[cardCode];
    if (!card) return undefined;

    return filterInvestigatorWeaknessAccess(card, lookupTables);
  },
);

export const selectInvestigatorFilter = createSelector(
  (state: StoreState) => state.metadata.cards,
  (state: StoreState) => state.lookupTables,
  (state: StoreState) => state.filters.player.investigator.value,
  (metadata, lookupTables, cardCode) => {
    if (!cardCode) return undefined;

    const card = metadata[cardCode];
    if (!card) return undefined;

    return filterInvestigatorAccess(card, lookupTables);
  },
);

export const selectDeckInvestigatorFilter = createSelector(
  (state: StoreState) => state.lookupTables,
  selectResolvedDeck,
  (lookupTables, resolvedDeck) => {
    if (!resolvedDeck) return undefined;

    const card = resolvedDeck.investigatorBack.card;
    if (!card) return undefined;

    return filterInvestigatorAccess(card, lookupTables, {
      additionalDeckOptions: getAdditionalDeckOptions(resolvedDeck),
      selections: resolvedDeck.selections,
    });
  },
);

/**
 * Combined list filters
 */

export const selectPlayerCardFilters = createSelector(
  selectFactionFilter,
  selectLevelFilter,
  selectCostFilter,
  selectSkillIconsFilter,
  selectTypeFilter,
  selectSubtypeFilter,
  selectTraitsFilter,
  selectActionsFilter,
  selectPropertiesFilter,
  selectInvestigatorFilter,
  selectTabooSetFilter,
  selectOwnershipFilter,
  selectPackCodeFilter,
  selectAssetFilter,
  selectDeckInvestigatorFilter,
  (
    factionFilter,
    levelFilter,
    costFilter,
    skillIconsFilter,
    typeFilter,
    subtypeFilter,
    traitsFilter,
    actionsFilter,
    propertiesFilter,
    investigatorFilter,
    tabooSetFilter,
    ownershipFilter,
    packCodeFilter,
    assetFilter,
    deckInvestigatorFilter,
  ) => {
    const filters = [
      actionsFilter,
      filterDuplicates,
      filterEncounterCards,
      filterMythosCards,
      filterWeaknesses,
      ownershipFilter,
      packCodeFilter,
      propertiesFilter,
      skillIconsFilter,
      subtypeFilter,
      traitsFilter,
      typeFilter,
      assetFilter,
    ];

    if (factionFilter) {
      filters.push(factionFilter);
    }

    if (levelFilter) {
      filters.push(levelFilter);
    }

    if (costFilter) {
      filters.push(costFilter);
    }

    if (investigatorFilter) {
      filters.push(investigatorFilter);
    }

    if (tabooSetFilter) {
      filters.push(tabooSetFilter);
    }

    if (deckInvestigatorFilter) {
      filters.push(deckInvestigatorFilter);
    }

    return and(filters);
  },
);

export const selectWeaknessFilters = createSelector(
  selectLevelFilter,
  selectCostFilter,
  selectFactionFilter,
  selectSkillIconsFilter,
  selectTypeFilter,
  selectSubtypeFilter,
  selectTraitsFilter,
  selectActionsFilter,
  selectPropertiesFilter,
  selectInvestigatorWeaknessFilter,
  selectTabooSetFilter,
  selectOwnershipFilter,
  selectPackCodeFilter,
  selectAssetFilter,
  selectDeckInvestigatorFilter,
  (
    levelFilter,
    costFilter,
    factionFilter,
    skillIconsFilter,
    typeFilter,
    subtypeFilter,
    traitsFilter,
    actionsFilter,
    propertiesFilter,
    investigatorFilter,
    tabooSetFilter,
    ownershipFilter,
    packCodeFilter,
    assetFilter,
    deckInvestigatorFilter,
  ) => {
    const filters = [
      filterEncounterCards,
      filterDuplicates,
      skillIconsFilter,
      typeFilter,
      subtypeFilter,
      traitsFilter,
      actionsFilter,
      propertiesFilter,
      ownershipFilter,
      packCodeFilter,
      assetFilter,
    ];

    if (factionFilter) {
      filters.push(factionFilter);
    }

    if (levelFilter) {
      filters.push(levelFilter);
    }

    if (costFilter) {
      filters.push(costFilter);
    }

    if (investigatorFilter) {
      filters.push(investigatorFilter);
    }

    if (tabooSetFilter) {
      filters.push(tabooSetFilter);
    }

    if (deckInvestigatorFilter) {
      filters.push(deckInvestigatorFilter);
    }

    return and(filters);
  },
);

export const selectEncounterFilters = createSelector(
  selectCostFilter,
  selectFactionFilter,
  selectSkillIconsFilter,
  selectTypeFilter,
  selectSubtypeFilter,
  selectTraitsFilter,
  selectActionsFilter,
  selectPropertiesFilter,
  selectOwnershipFilter,
  selectEncounterSetFilter,
  selectPackCodeFilter,
  selectAssetFilter,
  selectDeckInvestigatorFilter,
  (
    costFilter,
    factionFilter,
    skillIconsFilter,
    typeFilter,
    subtypeFilter,
    traitsFilter,
    actionsFilter,
    propertiesFilter,
    ownershipFilter,
    encounterSetFilter,
    packCodeFilter,
    assetFilter,
    deckInvestigatorFilter,
  ) => {
    const filters = [
      filterBacksides,
      skillIconsFilter,
      typeFilter,
      subtypeFilter,
      traitsFilter,
      actionsFilter,
      propertiesFilter,
      ownershipFilter,
      encounterSetFilter,
      packCodeFilter,
      assetFilter,
    ];

    if (factionFilter) {
      filters.push(factionFilter);
    }

    if (costFilter) {
      filters.push(costFilter);
    }

    if (deckInvestigatorFilter) {
      filters.push(deckInvestigatorFilter);
    }

    return and(filters);
  },
);

const selectCustomizations = createSelector(
  selectActiveDeck,
  (deck) => deck?.customizations,
);

export const selectFilteredCards = createSelector(
  selectActiveCardType,
  selectPlayerCardFilters,
  selectWeaknessFilters,
  selectEncounterFilters,
  (state: StoreState) => state.metadata,
  (state: StoreState) => state.lookupTables,
  (state: StoreState) => state.search,
  selectCanonicalTabooSetId,
  selectPlayerCardGroups,
  selectWeaknessGroups,
  selectEncounterSetGroups,
  selectCustomizations,
  (
    activeCardType,
    playerCardFilter,
    weaknessFilter,
    encounterFilters,
    metadata,
    lookupTables,
    search,
    tabooSetId,
    playerCardGroups,
    weaknessGroups,
    encounterSetGroups,
    customizations,
  ) => {
    if (!Object.keys(metadata.cards).length) {
      console.warn("player cards selected before store is initialized.");
      return undefined;
    }

    const groups: Grouping[] = [];
    const cards: Card[] = [];
    const groupCounts = [];

    if (activeCardType === "player") {
      console.time("[perf] select_player_cards");

      // FIXME: consider customizable slot changes.
      for (const grouping of playerCardGroups) {
        const groupCards = getGroupCards(
          grouping,
          metadata,
          lookupTables,
          playerCardFilter,
          tabooSetId
            ? (c) => applyCardChanges(c, metadata, tabooSetId, customizations)
            : undefined,
        );

        const filteredCards = applySearch(search, groupCards, metadata);

        if (filteredCards.length) {
          filteredCards.sort(sortAlphabetically(lookupTables));
          groups.push(grouping);
          cards.push(...filteredCards);
          groupCounts.push(filteredCards.length);
        }
      }

      for (const grouping of weaknessGroups) {
        const groupCards = applySearch(
          search,
          getGroupCards(grouping, metadata, lookupTables, weaknessFilter),
          metadata,
        );

        const filteredCards = applySearch(search, groupCards, metadata);

        if (filteredCards.length) {
          groupCards.sort(sortAlphabetically(lookupTables));
          groups.push(grouping);
          cards.push(...filteredCards);
          groupCounts.push(filteredCards.length);
        }
      }

      console.timeEnd("[perf] select_player_cards");
    } else {
      console.time("[perf] select_encounter_cards");

      for (const grouping of encounterSetGroups) {
        const groupCards = getGroupCards(
          grouping,
          metadata,
          lookupTables,
          encounterFilters,
        );

        const filteredCards = applySearch(search, groupCards, metadata);

        if (filteredCards.length) {
          filteredCards.sort(sortByEncounterPosition);
          groups.push(grouping);
          cards.push(...filteredCards);
          groupCounts.push(filteredCards.length);
        }
      }

      console.timeEnd("[perf] select_encounter_cards");
    }

    return {
      key: activeCardType,
      groups,
      cards,
      groupCounts,
    } as ListState;
  },
);
