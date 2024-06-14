import type {
  Card,
  Cycle,
  EncounterSet,
  OptionSelect,
  Pack,
  SubType,
  TabooSet,
  Type,
} from "../services/types";
import type { Deck } from "../slices/data/types";

export type ResolvedCard = {
  card: Card;
  back?: ResolvedCard;
  encounterSet?: EncounterSet;
  cycle: Cycle;
  pack: Pack;
  subtype?: SubType;
  type: Type;
};

export type CardWithRelations = ResolvedCard & {
  relations?: {
    bound?: ResolvedCard[];
    bonded?: ResolvedCard[];

    restrictedTo?: ResolvedCard;
    parallel?: ResolvedCard;

    advanced?: ResolvedCard[];
    replacement?: ResolvedCard[];
    requiredCards?: ResolvedCard[];
    parallelCards?: ResolvedCard[];
    duplicates?: ResolvedCard[];

    level?: ResolvedCard[];
  };
};

export function isCardWithRelations(
  x: ResolvedCard | CardWithRelations,
): x is CardWithRelations {
  return "relations" in x;
}

export type Customization = {
  index: number;
  xpSpent: number;
  choices?: string;
  unlocked: boolean;
};

export type Customizations = Record<string, Record<number, Customization>>;

export type DeckMeta = {
  [key in `cus_${string}`]?: string;
} & {
  alternate_front?: string;
  alternate_back?: string;
  option_selected?: string;
  faction_selected?: string;
  faction_1?: string;
  faction_2?: string;
  deck_size_selected?: string;
  extra_deck?: string;
};

export type DeckSizeSelection = {
  type: "deckSize";
  value: number;
  options: number[];
};

export type FactionSelection = {
  type: "faction";
  value?: string;
  options: string[];
};

export type OptionSelection = {
  type: "option";
  value?: OptionSelect;
  options: OptionSelect[];
};

export type Selection = OptionSelection | FactionSelection | DeckSizeSelection;

// selections, keyed by their `id`, or if not present their `name`.
export type Selections = Record<string, Selection>;

export type ResolvedDeck<T extends ResolvedCard | CardWithRelations> = Omit<
  Deck,
  "sideSlots"
> & {
  metaParsed: DeckMeta;
  sideSlots: Record<string, number> | null; // arkhamdb stores `[]` when empty, normalize to `null`.
  extraSlots: Record<string, number> | null;
  customizations?: Customizations;
  cards: {
    investigator: CardWithRelations; // tracks relations.
    slots: Record<string, T>;
    sideSlots: Record<string, T>;
    ignoreDeckLimitSlots: Record<string, T>;
    extraSlots: Record<string, T>; // used by parallel jim.
  };
  investigatorFront: ResolvedCard; // does not track relations.
  investigatorBack: ResolvedCard; // does not track relations.
  stats: {
    xpRequired: number;
    deckSize: number;
    deckSizeTotal: number;
  };
  selections?: Selections;
  tabooSet?: TabooSet;
};
