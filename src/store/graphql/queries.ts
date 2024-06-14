import type { TypedDocumentNode } from "@graphql-typed-document-node/core";
import { parse } from "graphql";
import request, { gql } from "graphql-request";

import factions from "./data/factions.json";
import subTypes from "./data/subtypes.json";
import types from "./data/types.json";
import {
  Cycle,
  DataVersion,
  EncounterSet,
  Faction,
  Pack,
  QueryCard,
  SubType,
  TabooSet,
  Type,
} from "./types";

type DataVersionResponse = {
  all_card_updated: DataVersion[];
};

const dataVersionQuery: TypedDocumentNode<DataVersionResponse> = parse(gql`
  {
    all_card_updated(where: { locale: { _eq: "en" } }, limit: 1) {
      card_count
      cards_updated_at
      locale
      translation_updated_at
    }
  }
`);

export type MetadataResponse = {
  cycle: Cycle[];
  faction: Faction[];
  pack: Pack[];
  subtype: SubType[];
  type: Type[];
  card_encounter_set: EncounterSet[];
  taboo_set: TabooSet[];
};

const metadataQuery: TypedDocumentNode<MetadataResponse> = parse(gql`
  {
    pack(where: { official: { _eq: true } }) {
      code
      cycle_code
      position
      real_name
    }
    cycle(where: { official: { _eq: true } }) {
      code
      position
      real_name
    }
    card_encounter_set(
      where: { official: { _eq: true }, locale: { _eq: "en" } }
    ) {
      code
      name
    }
    taboo_set(where: { active: { _eq: true } }) {
      name
      card_count
      id
      date
    }
  }
`);

type AllCardResponse = {
  all_card: QueryCard[];
};

const allCardQuery: TypedDocumentNode<AllCardResponse> = parse(gql`
  {
    all_card(
      order_by: { real_name: asc }
      where: {
        official: { _eq: true }
        _and: [{ taboo_placeholder: { _is_null: true } }]
        pack_code: { _neq: "zbh_00008" }
      }
    ) {
      alt_art_investigator
      alternate_of_code
      alternate_required_code
      back_illustrator
      back_link_id
      backimageurl
      clues
      clues_fixed
      code
      cost
      customization_options
      deck_limit
      deck_options
      deck_requirements
      doom
      double_sided
      duplicate_of_code
      encounter_code
      encounter_position
      enemy_damage
      enemy_evade
      enemy_fight
      enemy_horror
      errata_date
      exceptional
      exile
      faction_code
      faction2_code
      faction3_code
      heals_damage
      heals_horror
      health
      health_per_investigator
      hidden
      id # used for taboos
      illustrator
      imageurl
      is_unique
      linked
      linked_card {
        code
      }
      myriad
      official
      pack_code
      pack_position
      permanent
      position
      preview
      quantity
      real_back_flavor
      real_back_name
      real_back_text
      real_customization_change
      real_customization_text
      real_encounter_set_name
      real_flavor
      real_name
      real_slot
      real_subname
      real_taboo_text_change
      real_text
      real_traits
      restrictions
      sanity
      shroud
      side_deck_options
      side_deck_requirements
      skill_agility
      skill_combat
      skill_intellect
      skill_willpower
      skill_wild
      stage
      subtype_code
      taboo_set_id
      taboo_xp
      tags
      type_code
      vengeance
      victory
      xp
    }
  }
`);

const graphqlUrl = import.meta.env.VITE_GRAPHQL_URL;

async function stub<T>(path: string): Promise<T> {
  return import(/* @vite-ignore */ path).then((p) => p.default as T);
}

export async function queryMetadata() {
  const data = import.meta.env.DEV
    ? await stub<MetadataResponse>("./data/stubs/metadata.json")
    : await request(graphqlUrl, metadataQuery);

  return {
    ...data,
    faction: factions,
    type: types,
    subtype: subTypes,
  };
}

export async function queryDataVersion() {
  const data = import.meta.env.DEV
    ? await stub<DataVersionResponse>("./data/stubs/data_version.json")
    : await request(graphqlUrl, dataVersionQuery);
  return data.all_card_updated[0];
}

export async function queryCards() {
  const data = import.meta.env.DEV
    ? await stub<AllCardResponse>("./data/stubs/all_card.json")
    : await request(graphqlUrl, allCardQuery);

  // navigator.clipboard.writeText(JSON.stringify(data));

  return data.all_card;
}
