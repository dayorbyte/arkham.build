import { promises as fs } from "node:fs";
import path from "node:path";
import { applyLocalData } from "../src/store/lib/local-data";
import type { Card } from "../src/store/services/queries.types";
import { cardUses } from "../src/utils/card-utils";
import { capitalize } from "../src/utils/formatting";

const [cards, locale] = await Promise.all([queryCards(), readLocale("en")]);

const uses = listUses(cards);
const traits = listTraits(cards);

const deckOptions = listDeckOptions(cards);

locale.translation.common.uses = uses.reduce((acc, curr) => {
  acc[curr] = capitalize(curr);
  return acc;
}, {});

locale.translation.common.traits = traits.reduce((acc, curr) => {
  acc[curr] = curr;
  return acc;
}, {});

locale.translation.common.deck_options = deckOptions.reduce((acc, curr) => {
  acc[curr] = curr;
  return acc;
}, {});

await writeLocale("en", locale);

async function queryCards() {
  const apiCards = await fetch("https://api.arkham.build/v1/cache/cards")
    .then((res) => res.json())
    .then((data) => data.data.all_card);

  return Object.values(
    applyLocalData({
      cards: apiCards,
      // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    } as any).cards,
  );
}
function listTraits(cards: Card[]) {
  return Array.from(
    cards.reduce<Set<string>>((acc, card) => {
      if (!card.real_traits) return acc;

      for (const trait of card.real_traits.split(".")) {
        const value = trait.trim().replace(".", "");
        if (value) acc.add(value);
      }

      return acc;
    }, new Set()),
  ).sort();
}

function listUses(cards: Card[]) {
  return Array.from(
    cards.reduce<Set<string>>((acc, card) => {
      const uses = cardUses(card);
      if (!uses) return acc;

      acc.add(uses);

      return acc;
    }, new Set()),
  ).sort();
}

function listDeckOptions(cards: Card[]) {
  const additionalDeckOptionErrors = [
    "You cannot have more than one Covenant in your deck.",
    "Deck must have at least 10 skill cards.",
    "Atleast constraint violated.",
    "Too many off-class cards.",
  ];

  return Array.from(
    cards.reduce<Set<string>>((acc, card) => {
      if (!card.deck_options) return acc;

      for (const option of card.deck_options) {
        if (option.name) {
          acc.add(option.name);
        }

        if (option.error) {
          acc.add(option.error);
        }

        if (option.option_select) {
          for (const select of option.option_select) {
            acc.add(select.name);
          }
        }
      }

      return acc;
    }, new Set(additionalDeckOptionErrors)),
  ).sort();
}

async function readLocale(language: string) {
  const filePath = path.join(process.cwd(), `./src/locales/${language}.json`);
  const contents = await fs.readFile(filePath, "utf-8");
  return JSON.parse(contents);
}

async function writeLocale(language: string, data: Record<string, unknown>) {
  const filePath = path.join(process.cwd(), `./src/locales/${language}.json`);
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}
