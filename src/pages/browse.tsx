import { CardList } from "@/components/card-list/card-list";
import { DeckCollection } from "@/components/deck-collection/deck-collection";
import { Filters } from "@/components/filters/filters";
import { ListLayout } from "@/components/layouts/list-layout";
import { useStore } from "@/store";
import { selectIsInitialized } from "@/store/selectors";
import { useDocumentTitle } from "@/utils/use-document-title";

export function Browse() {
  const isInitalized = useStore(selectIsInitialized);
  useDocumentTitle("Browse");

  if (!isInitalized) return null;

  return (
    <ListLayout
      filters={<Filters />}
      sidebar={<DeckCollection />}
      sidebarWidthMax="var(--sidebar-width-one-col)"
    >
      <CardList />
    </ListLayout>
  );
}
