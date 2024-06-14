import { ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
import { type ReactNode, useState } from "react";

import type { CardWithRelations, ResolvedCard } from "@/store/lib/types";
import { reversed } from "@/utils/card-utils";

import css from "./card.module.css";

import { Button } from "../ui/button";
import { CardBack } from "./card-back";
import { CardContainer } from "./card-container";
import { CardFront } from "./card-front";

export type Props = {
  children?: ReactNode;
  className?: string;
  resolvedCard: ResolvedCard | CardWithRelations;
  canEditCustomizations?: boolean;
  canToggleBackside?: boolean;
  linked?: boolean;
  size?: "compact" | "tooltip" | "full";
};

/**
 * Renders a card with a "simple" back-side that is tracked on the same card object.
 * Cards are available in three sizes:
 *  - `full`: Renders a full card with all metadata.
 *  - `compact`: Renders a card without its backside and with a smaller card image.
 *  - `tooltip`: Renders the card as a tooltip that is shown in card lists.
 * TODO: a lot of the aspects about this (CSS, selectors) should be cleaned up a bit.
 */
export function Card({
  canToggleBackside,
  children,
  className,
  resolvedCard,
  linked,
  size = "full",
}: Props) {
  const { back, card } = resolvedCard;

  const [backToggled, toggleBack] = useState(false);

  const front = (
    <CardFront
      resolvedCard={resolvedCard}
      size={size}
      linked={linked}
      className={className}
    />
  );

  const backNode = back ? (
    <Card resolvedCard={back} size={size} linked={false} />
  ) : card.double_sided && !card.back_link_id ? (
    <CardBack card={card} size={size} />
  ) : undefined;

  const hasToggle = !!backNode && canToggleBackside;

  const backToggle = hasToggle ? (
    <Button
      className={css["card-backtoggle"]}
      onClick={() => toggleBack((p) => !p)}
    >
      {backToggled ? <ChevronUpIcon /> : <ChevronDownIcon />}
      Backside
    </Button>
  ) : undefined;

  const backsideVisible = !canToggleBackside || (hasToggle && backToggled);

  return reversed(card) ? (
    <CardContainer size={size}>
      {backNode}
      {children}
      {backToggle}
      {backsideVisible && front}
    </CardContainer>
  ) : (
    <CardContainer size={size}>
      {front}
      {children}
      {backToggle}
      {backsideVisible && backNode}
    </CardContainer>
  );
}
