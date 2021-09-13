import { Page } from "@playwright/test";
import { PlaywrightFixtures } from "./sharedTypes";

export default async function prepareContext(
    { page }: PlaywrightFixtures,
    use: (r: (html: string, intermediateStep?: (page: Page) => Promise<void>) => Promise<Page>) => Promise<void>
) {
    await use(async (html: string, intermediateStep?: (page: Page) => Promise<void>): Promise<Page> => {
        await page.goto(`/`);
        await page.setContent(html);

        if (!!intermediateStep)
            await intermediateStep(page);

        await page.addScriptTag({ type: 'module', url: `/build/hyperlinksPlusPlus.js` });
        return page;
    });
}
