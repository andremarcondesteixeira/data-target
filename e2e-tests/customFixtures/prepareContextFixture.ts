import { Page } from "@playwright/test";
import { PlaywrightFixtures } from "./sharedTypes";

export type PrepareContextFixtureArgs = {
    pageContent: string;
    beforeLoadingLib?: (page: Page) => Promise<void>;
}

export default async function prepareContext(
    { page }: PlaywrightFixtures,
    use: (r: (args: PrepareContextFixtureArgs) => Promise<Page>) => Promise<void>
) {
    await use(async (args: PrepareContextFixtureArgs): Promise<Page> => {
        await page.goto(`/`);
        await page.setContent(args.pageContent);

        if (!!args?.beforeLoadingLib)
            await args.beforeLoadingLib(page);

        await page.addScriptTag({ type: 'module', url: `/build/hyperlinksPlusPlus.js` });
        return page;
    });
}
