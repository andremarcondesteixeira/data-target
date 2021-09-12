import { Page } from "@playwright/test";
import { EventLogger } from "./createEventLoggerFixture";
import { PlaywrightFixtures } from "./sharedTypes";

export default async function prepareContext(
    { createEventLogger, page }: PlaywrightFixtures,
    use: (r: (html: string) => Promise<PrepareContextFixture>) => Promise<void>
) {
    await use(async (html: string): Promise<PrepareContextFixture> => {
        await page.goto(`/`);
        await page.setContent(html);
        const eventLogger = await createEventLogger(page);
        await page.addScriptTag({ type: 'module', url: `/build/hyperlinksPlusPlus.js` });
        return {
            eventLogger,
            page
        };
    });
}

export type PrepareContextFixture = {
    page: Page
    eventLogger: EventLogger
}
