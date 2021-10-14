import { devices, PlaywrightTestConfig } from '@playwright/test';

const config: PlaywrightTestConfig = {
    globalSetup: require.resolve('./globalSetup'),
    use: {
        baseURL: process.env['BASE_URL'],
        bypassCSP: true
    },
    timeout: 5000,
    projects: [{
        name: 'Chrome Stable',
        use: {
            browserName: 'chromium',
            // Test against Chrome Stable channel.
            channel: 'chrome',
        },
    }, {
        name: 'Desktop Safari',
        use: {
            browserName: 'webkit',
            viewport: { width: 1200, height: 750 },
        }
    }, {
        name: 'Mobile Chrome',
        use: devices['Pixel 5'],
    }, {
        name: 'Mobile Safari',
        use: devices['iPhone 12'],
    }, {
        name: 'Desktop Firefox',
        use: {
            browserName: 'firefox',
            viewport: { width: 800, height: 600 },
        }
    }],
};

export default config;
