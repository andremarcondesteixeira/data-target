import { Page } from "@playwright/test";
import { PlaywrightFixtures, PreparePageFixture, PreparePageFixtureArgs } from "./types";

export async function preparePage(
    { page }: PlaywrightFixtures,
    use: (r: PreparePageFixture) => Promise<void>
) {
    await use(async (args: PreparePageFixtureArgs): Promise<Page> => {
        await page.goto(`/`);
        await page.setContent(args.pageContent);

        page.on('console', message => {
            console.log(message.text());
        });

        if (!!args?.beforeLoadingLib)
            await args.beforeLoadingLib(page);

        await page.addScriptTag({ url: `/build/anchor-data-target.js` });
        return page;
    });
}
