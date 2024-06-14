import {
  FloatingPortal,
  autoPlacement,
  autoUpdate,
  offset,
  shift,
  useFloating,
} from "@floating-ui/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { imageUrl } from "@/utils/card-utils";
import { preloadImage } from "@/utils/preload-image";

import { CardModal } from "../card-modal/card-modal";
import { CardTooltip } from "../card-tooltip/card-tooltip";
import { Dialog, DialogContent } from "../ui/dialog";
import type { Props as ListCardInnerProps } from "./list-card-inner";
import { ListCardInner } from "./list-card-inner";

type Props = {
  tooltip?: React.ReactNode;
} & Omit<ListCardInnerProps, "onToggleModal" | "figureRef" | "referenceProps">;

export function ListCard({ card, tooltip, ...rest }: Props) {
  const [tooltipOpen, setTooltipOpen] = useState(false);

  const restTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);

  useEffect(
    () => () => {
      if (restTimeoutRef.current) clearTimeout(restTimeoutRef.current);
    },
    [],
  );

  useEffect(() => {
    if (tooltipOpen) preloadImage(imageUrl(card.code));
  }, [card.code, tooltipOpen]);

  const { refs, floatingStyles } = useFloating({
    open: tooltipOpen,
    onOpenChange: setTooltipOpen,
    middleware: [shift(), autoPlacement(), offset(2)],
    whileElementsMounted: autoUpdate,
    strategy: "fixed",
    placement: "bottom-start",
  });

  const onPointerLeave = useCallback(() => {
    clearTimeout(restTimeoutRef.current);
    setTooltipOpen(false);
  }, []);

  const onPointerMove = useCallback(() => {
    if (tooltipOpen) return;

    clearTimeout(restTimeoutRef.current);

    restTimeoutRef.current = setTimeout(() => {
      setTooltipOpen(true);
    }, 25);
  }, [tooltipOpen]);

  const referenceProps = useMemo(
    () => ({
      onPointerLeave,
      onPointerMove,
      onMouseLeave: onPointerLeave,
    }),
    [onPointerLeave, onPointerMove],
  );

  if (!card) return null;

  return (
    <>
      <Dialog>
        <ListCardInner
          {...rest}
          canOpenModal
          card={card}
          referenceProps={referenceProps}
          figureRef={refs.setReference}
        />
        <DialogContent>
          <CardModal code={card.code} />,
        </DialogContent>
      </Dialog>
      {tooltipOpen && (
        <FloatingPortal id="floating">
          <div ref={refs.setFloating} style={floatingStyles}>
            {tooltip ?? <CardTooltip code={card.code} />}
          </div>
        </FloatingPortal>
      )}
    </>
  );
}
