import { CollectionSettings } from "@/components/collection/collection";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast.hooks";
import { AppLayout } from "@/layouts/app-layout";
import { useStore } from "@/store";
import { selectSettings } from "@/store/selectors/settings";
import { useGoBack } from "@/utils/use-go-back";
import {
  DatabaseBackupIcon,
  LibraryIcon,
  SlidersVerticalIcon,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useSearch } from "wouter";
import { BackupRestore } from "./backup-restore";
import { CardDataSync } from "./card-data-sync";
import { CardLevelDisplaySetting } from "./card-level-display";
import { Connections } from "./connections";
import { FontSizeSetting } from "./font-size";
import { HideWeaknessSetting } from "./hide-weakness";
import { ListSettings } from "./list-settings";
import { Section } from "./section";
import css from "./settings.module.css";
import { ShowAllCardsSetting } from "./show-all-cards";
import { ShowMoveToSideDeckSetting } from "./show-move-to-side-deck";
import { ShowPreviewsSetting } from "./show-previews";
import { TabooSetSetting } from "./taboo-set";
import { ThemeSetting } from "./theme";
import { WeaknessPoolSetting } from "./weakness-pool";

function Settings() {
  const { t } = useTranslation();

  const search = useSearch();
  const toast = useToast();
  const goBack = useGoBack(search.includes("login_state") ? "/" : undefined);

  const updateStoredSettings = useStore((state) => state.updateSettings);

  const storedSettings = useStore(selectSettings);
  const [settings, updateSettings] = useState(structuredClone(storedSettings));

  useEffect(() => {
    updateSettings(storedSettings);
  }, [storedSettings]);

  const onSubmit = useCallback(
    (evt: React.FormEvent) => {
      evt.preventDefault();
      updateStoredSettings(settings);
      toast.show({
        children: "Settings save successful.",
        duration: 3000,
        variant: "success",
      });
    },
    [updateStoredSettings, settings, toast.show],
  );

  return (
    <AppLayout title={t("settings.title")}>
      <form className={css["settings"]} onSubmit={onSubmit}>
        <header className={css["header"]}>
          <h1 className={css["title"]}>{t("settings.title")}</h1>
          <div className={css["header-actions"]}>
            <Button
              data-testid="settings-back"
              onClick={goBack}
              type="button"
              variant="bare"
            >
              {t("common.back")}
            </Button>
            <Button data-testid="settings-save" type="submit" variant="primary">
              {t("settings.save")}
            </Button>
          </div>
        </header>
        <div className={css["container"]}>
          <div className={css["row"]}>
            <Section title={t("settings.connections.title")}>
              <Connections />
            </Section>
            <Section title={t("settings.card_data.title")}>
              <CardDataSync showDetails />
            </Section>
          </div>
          <Tabs defaultValue="general">
            <TabsList>
              <TabsTrigger data-testid="tab-general" value="general">
                <SlidersVerticalIcon />
                <span>{t("settings.general.title")}</span>
              </TabsTrigger>
              <TabsTrigger data-testid="tab-collection" value="collection">
                <LibraryIcon />
                <span>{t("settings.collection.title")}</span>
              </TabsTrigger>
              <TabsTrigger data-testid="tab-backup" value="backup">
                <DatabaseBackupIcon />
                <span>{t("settings.backup.title")}</span>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="general" forceMount>
              <Section title={t("settings.general.title")}>
                <TabooSetSetting
                  settings={settings}
                  updateSettings={updateSettings}
                />
                <WeaknessPoolSetting
                  settings={settings}
                  updateSettings={updateSettings}
                />
              </Section>
              <Section title={t("settings.display.title")}>
                <ThemeSetting />
                <FontSizeSetting
                  settings={settings}
                  updateSettings={updateSettings}
                />
                <CardLevelDisplaySetting
                  settings={settings}
                  updateSettings={updateSettings}
                />
                <HideWeaknessSetting
                  settings={settings}
                  updateSettings={updateSettings}
                />
                <ShowMoveToSideDeckSetting
                  settings={settings}
                  updateSettings={updateSettings}
                />
              </Section>
              <Section title={t("settings.lists.title")}>
                <div className={css["lists"]}>
                  <ListSettings
                    listKey="player"
                    title={t("common.player_cards")}
                    settings={settings}
                    updateSettings={updateSettings}
                  />
                  <ListSettings
                    listKey="encounter"
                    title={t("common.encounter_cards")}
                    settings={settings}
                    updateSettings={updateSettings}
                  />
                  <ListSettings
                    listKey="investigator"
                    title={t("common.type.investigator", { count: 2 })}
                    settings={settings}
                    updateSettings={updateSettings}
                  />
                  <ListSettings
                    listKey="deck"
                    title={t("settings.lists.deck_view")}
                    settings={settings}
                    updateSettings={updateSettings}
                  />
                  <ListSettings
                    listKey="deckScans"
                    title={t("settings.lists.deck_view_scans")}
                    settings={settings}
                    updateSettings={updateSettings}
                  />
                </div>
              </Section>
            </TabsContent>
            <TabsContent value="collection" forceMount>
              <Section title={t("settings.collection.title")}>
                <ShowPreviewsSetting
                  settings={settings}
                  updateSettings={updateSettings}
                />
                <ShowAllCardsSetting
                  settings={settings}
                  updateSettings={updateSettings}
                />
                <CollectionSettings
                  settings={settings}
                  updateSettings={updateSettings}
                />
              </Section>
            </TabsContent>
            <TabsContent value="backup" forceMount>
              <Section title={t("settings.backup.title")}>
                <BackupRestore />
              </Section>
            </TabsContent>
          </Tabs>
        </div>
      </form>
    </AppLayout>
  );
}

export default Settings;
