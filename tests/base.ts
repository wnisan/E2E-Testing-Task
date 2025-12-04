import puppeteer, { Browser, Page } from 'puppeteer';

class RealworldTest {
    protected browser: Browser | null = null;
    protected page: Page | null = null;
    
    // Локальный фронтенд Realworld (React)
    protected BASE_URL = 'http://localhost:4100/';

    async setup(): Promise<void> {
        this.browser = await puppeteer.launch({
            headless: false,
            slowMo: 50,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        
        this.page = await this.browser.newPage();
        await this.page.setViewport({ width: 1280, height: 800 });
    }

    async teardown(): Promise<void> {
        if (this.browser) {
            await this.browser.close();
        }
    }
}

export default RealworldTest;