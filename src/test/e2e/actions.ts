import path from "node:path";
import { type Locator, type Page, expect } from "@playwright/test";

export async function importDeck(page: Page) {
  await page.goto("/");

  await page.getByTestId("import-trigger").click();
  await page.getByTestId("import-input").click();

  await page
    .getByTestId("import-input")
    .fill(
      "https://arkhamdb.com/decklist/view/47001/khaku-fifty-shades-of-blurse-fhv-intro-deck-guide-1.0",
    );

  await page.getByTestId("import-submit").click();
}

export function locateCardInSlots(locator: Page | Locator, code: string) {
  return locator
    .getByTestId("editor-tabs-slots")
    .getByTestId(`listcard-${code}`);
}

export async function waitForImagesLoaded(locator: Page | Locator) {
  for (const image of await locator.locator("img").all()) {
    const src = await image.getAttribute("src");
    if (src && !src.includes("svg")) {
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveJSProperty("complete", true);
      await expect(image).not.toHaveJSProperty("naturalWidth", 0);
    }
  }
}

export async function importDeckFromFile(
  page: Page,
  deckPath: string,
  { navigate }: { navigate?: "view" | "edit" } = {},
) {
  await page.goto("/");

  const fileChooserPromise = page.waitForEvent("filechooser");

  await page.getByTestId("collection-more-actions").click();
  await page.getByTestId("collection-import-button").click();

  const fileChooser = await fileChooserPromise;
  await fileChooser.setFiles([
    path.join(process.cwd(), "src/test/fixtures/decks", deckPath),
  ]);

  if (navigate) {
    await page.getByTestId("collection-deck").click();
  }

  if (navigate === "edit") {
    await page.getByTestId("view-edit").click();
  }
}

export async function shareDeck(page: Page) {
  await importDeck(page);

  const deckNode = page.getByTestId("collection-deck");
  await deckNode.click();

  await expect(page).toHaveURL(/\/deck\/view/);

  await page.getByTestId("share-create").click();

  await expect(page.getByTestId("share-link")).toBeVisible();

  await page.waitForTimeout(1000);

  await page.$eval("a[target=_blank]", (el) => {
    el.removeAttribute("target");
  });

  await page.getByTestId("share-link").click();
  await expect(page).toHaveURL(/\/share/);
}

export function adjustDeckCardQuantity(
  page: Page,
  code: string,
  mode: "increment" | "decrement",
) {
  const locator = locateCardInSlots(page, code);
  return locator.getByTestId(`quantity-${mode}`).click();
}

export function adjustListCardQuantity(
  page: Page,
  code: string,
  mode: "increment" | "decrement",
) {
  return page
    .getByTestId("card-list-scroller")
    .getByTestId(`listcard-${code}`)
    .getByTestId(`quantity-${mode}`)
    .click();
}

export async function fillSearch(page: Page, text: string) {
  await page.getByTestId("search-input").click();
  await page.getByTestId("search-input").fill(text);
  await page.waitForTimeout(150);
}

export function assertEditorDeckQuantity(
  page: Page,
  code: string,
  quantity: number,
) {
  if (quantity === 0) {
    return expect(
      page.getByTestId("editor").getByTestId(`listcard-${code}`),
    ).not.toBeVisible();
  }

  return expect(
    page
      .getByTestId("editor")
      .getByTestId(`listcard-${code}`)
      .getByTestId("quantity-value"),
  ).toContainText(`${quantity}`);
}
