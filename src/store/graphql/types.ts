export type Coded = {
  code: string;
};

export type DeckRequirements = {
  card: Record<string, string>;
  random: { value: string; target: string }[];
  size: number;
};

export type DeckOption = {
  // Lola Hayes
  atleast?: { min: number; factions: number };
  // Mandy
  deck_size_select?: number[];
  // Tony
  faction_select?: string[];
  // most
  faction: string[];
  // most
  level: {
    min: number;
    max: number;
  };
  // Dunwich
  limit?: string;
  // most selects
  name?: string;
  not?: boolean;
  // Suzie
  permanent?: boolean;
  // Wendy (Parallel)
  option_select?: {
    name: string;
    id: string;
    level: { min: number; max: number };
    trait: string[];
  }[];
  // Carolyn, Vincent
  tag?: string[];
  // Carolyn, Allesandra
  text?: string[];
  // Silas
  trait?: string[];
  // Tony (select), Amanda (static)
  type?: string[];
  // Akachi
  uses?: string[];
};

export type QueryCard = {
  alt_art_investigator?: boolean;
  alternate_of_code?: string;
  alternate_required_code?: string;
  back_illustrator?: string;
  back_link_id?: string;
  backimageurl?: string;
  clues?: number;
  clues_fixed?: boolean;
  code: string;
  cost?: number;
  customization_options?: {
    xp: number;
    tags: string[];
    real_text: string;
    text_change: string;
  };
  deck_limit?: number;
  deck_options?: DeckOption[];
  deck_requirements?: DeckRequirements;
  doom?: number;
  double_sided?: boolean;
  duplicate_of_code?: string;
  encounter_code?: string;
  encounter_position?: number;
  enemy_damage?: number;
  enemy_evade?: number;
  enemy_fight?: number;
  enemy_horror?: number;
  errata_date?: string;
  exceptional?: boolean;
  exile?: boolean;
  faction_code: string;
  faction2_code?: string;
  faction3_code?: string;
  health?: number;
  health_per_investigator?: boolean;
  hidden?: boolean;
  id: string; // {code} or {code}-{taboo_set_id}
  illustrator?: string;
  imageurl?: string;
  is_unique?: boolean;
  linked?: boolean;
  linked_card?: { code: string };
  myriad?: boolean;
  official: boolean;
  pack_code: string;
  pack_position: number;
  permanent?: string;
  position: number;
  preview?: boolean;
  quantity: number;
  real_back_flavor?: string;
  real_back_name?: string;
  real_back_text?: string;
  real_customization_change?: string;
  real_customization_text?: string;
  real_flavor?: string;
  real_name: string;
  real_slot?: string;
  real_subname?: string;
  real_taboo_text_change?: string;
  real_text?: string;
  real_traits?: string;
  restrictions?: {
    investigator: Record<string, string>;
  };
  sanity?: number;
  shroud?: number;
  side_deck_options?: string;
  side_deck_requirements?: string;
  skill_agility?: number;
  skill_combat?: number;
  skill_intellect?: number;
  skill_willpower?: number;
  skill_wild?: number;
  stage?: number;
  subtype_code?: string;
  taboo_xp?: number;
  taboo_set_id?: number;
  tags?: string[]; // used for some deckbuilding restrictions like `heals_horror`.
  type_code: string;
  vengeance?: number;
  victory?: number;
  xp?: number;
};

export type Card = Omit<
  QueryCard,
  "real_taboo_text_change" | "taboo_xp" | "id"
> & {
  parallel?: boolean;
};

export type Cycle = {
  code: string;
  real_name: string;
  position: number;
};

export type Faction = {
  code: string;
  name: string;
  is_primary: boolean;
};

export type Pack = {
  code: string;
  real_name: string;
  position: number;
  size: number;
  cycle_code: string;
};

export type SubType = {
  code: string;
  name: string;
};

export type Type = {
  code: string;
  name: string;
};

export type DataVersion = {
  card_count: number;
  cards_updated_at: string;
  locale: string;
  translation_updated_at: string;
};

export type QueryEncounterSet = {
  code: string;
  name: string;
};

export type EncounterSet = QueryEncounterSet & {
  pack_code: string;
};

export type Taboo = {
  code: string;
  real_text?: string;
  real_back_text?: string;
  real_taboo_text_change?: string;
  taboo_xp?: number;
  taboo_set_id: number;
};

export type TabooSet = {
  id: number;
  name: string;
  card_count: number;
  date: string;
};
