import clsx from "clsx";

import { DeckInvestigator } from "@/components/deck-investigator/deck-investigator";
import { FactionIcon } from "@/components/icons/faction-icon";
import type { DisplayDeck } from "@/store/lib/deck-grouping";
import { capitalize } from "@/utils/formatting";

import css from "./deck-sidebar.module.css";

import { DeckSidebarActions } from "./deck-sidebar-actions";

type Props = {
  className?: string;
  deck: DisplayDeck;
};

export function DeckSidebar({ className, deck }: Props) {
  return (
    <div className={clsx(css["deck-sidebar"], className)}>
      <DeckInvestigator deck={deck} size="tooltip" />
      <DeckSidebarActions deck={deck} />

      <div className={css["deck-sidebar-details"]}>
        <ul className={css["deck-details"]}>
          <li className={css["detail"]}>
            <div className={css["detail-label"]}>
              <i className="icon-card-outline-bold" /> Deck size
            </div>
            <p className={css["detail-value"]}>
              {deck.stats.deckSize} ({deck.stats.deckSizeTotal} total)
            </p>
          </li>

          <li className={css["detail"]}>
            <div className={css["detail-label"]}>
              <i className="icon-xp-bold" /> XP required
            </div>
            <p className={css["detail-value"]}>{deck.stats.xpRequired}</p>
          </li>

          <li className={css["detail"]}>
            <div className={css["detail-label"]}>
              <i className="icon-taboo" /> Taboo
            </div>
            <p className={css["detail-value"]}>
              {deck.tabooSet ? (
                <span>
                  {deck.tabooSet.name} - {deck.tabooSet.date.slice(0, 4)}
                </span>
              ) : (
                "None"
              )}
            </p>
          </li>

          {!!deck.selections &&
            Object.entries(deck.selections).map(([key, selection]) => (
              <li className={css["detail"]} key={key}>
                <div className={css["detail-label"]}>{capitalize(key)}</div>
                {selection.type === "deckSize" && (
                  <p className={css["detail-value"]}>{selection.value}</p>
                )}
                {selection.type === "faction" && (
                  <p className={css["detail-value"]}>
                    {selection.value ? (
                      <span>
                        <FactionIcon code={selection.value} />
                        {capitalize(selection.value)}
                      </span>
                    ) : (
                      "None"
                    )}
                  </p>
                )}
                {selection.type === "option" && (
                  <p className={css["detail-value"]}>
                    {selection.value?.name ?? "None"}
                  </p>
                )}
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
}
