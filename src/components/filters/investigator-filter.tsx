import { useStore } from "@/store";
import {
  selectActiveListFilter,
  selectInvestigatorChanges,
  selectInvestigatorOptions,
} from "@/store/selectors/lists";
import type { Card } from "@/store/services/queries.types";
import { isInvestigatorFilterObject } from "@/store/slices/lists.type-guards";
import { assert } from "@/utils/assert";
import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import type { FilterProps } from "./filters.types";
import { SelectFilter } from "./primitives/select-filter";

export function InvestigatorFilter({ id }: FilterProps) {
  const { t } = useTranslation();

  const filter = useStore((state) => selectActiveListFilter(state, id));
  assert(
    isInvestigatorFilterObject(filter),
    `InvestigatorFilter instantiated with '${filter?.type}'`,
  );

  const options = useStore(selectInvestigatorOptions);
  const changes = useStore((state) =>
    selectInvestigatorChanges(state, filter.value),
  );

  const otherVersionsTable = useStore(
    (state) => state.lookupTables.relations.otherVersions,
  );

  const renderOption = useCallback(
    (card: Card) => (
      <option key={card.code} value={card.code}>
        {card.real_name}
        {card.parallel && ` (${t("common.parallel")})`}
        {otherVersionsTable[card.code] &&
          ` (${t(`common.factions.${card.faction_code}`)})`}
      </option>
    ),
    [otherVersionsTable, t],
  );

  return (
    <SelectFilter
      changes={changes}
      id={id}
      open={filter.open}
      options={options}
      renderOption={renderOption}
      title={t("filters.investigator.title")}
      value={filter.value}
    />
  );
}
