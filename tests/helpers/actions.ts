import { delay } from './utils';

// Базовые действия с элементами
export class PageActions {
    constructor(private page: any) {}
    
    // Безопасный клик 
    async safeClick(
        selector: string | readonly string[],  
        timeout = 10000
    ): Promise<void> {
        if (!this.page) throw new Error('Page not initialized');
        
        const selectors = Array.isArray(selector) ? selector : [selector];
        
        for (const sel of selectors) {
            try {
                await this.page.waitForSelector(sel, { timeout });
                await this.page.click(sel);
                console.log(` Кликнули: ${sel}`);
                return;
            } catch {
                continue;
            }
        }
        throw new Error(`Не удалось найти элемент для клика: ${selectors.join(', ')}`);
    }
    
    // Заполнение поля 
    async fillField(
        selector: string | readonly string[], 
        value: string, 
        clearField = true
    ): Promise<boolean> {
        const selectors = Array.isArray(selector) ? selector : [selector];
        
        for (const sel of selectors) {
            try {
                const element = await this.page.waitForSelector(sel, { timeout: 1000 })
                    .catch(() => null);
                
                if (element) {
                    if (clearField) {
                        await element.click({ clickCount: 3 });
                        await element.press('Backspace');
                    }
                    
                    await element.type(value);
                    console.log(` Заполнили ${sel}: ${value}`);
                    return true;
                }
            } catch {
                continue;
            }
        }
        return false;
    }
    
    // Сделать скриншот
    async takeScreenshot(name: string, fullPage = true): Promise<void> {
        if (!this.page) return;
        
        const path = `screenshots/${name}.png`;
        await this.page.screenshot({ path, fullPage });
        console.log(` Скриншот сохранен: ${path}`);
    }
    
    // Перейти на страницу
    async navigateTo(url: string, waitForNavigation = true): Promise<void> {
        if (!this.page) return;
        
        console.log(` Переходим: ${url}`);
        
        if (waitForNavigation) {
            await this.page.goto(url, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });
        } else {
            await this.page.goto(url);
        }
        
        await delay(1000);
    }
    
    // Получить JWT токен из localStorage
    async getJWTToken(): Promise<string> {
        if (!this.page) return '';
        
        return await this.page.evaluate(() => 
            localStorage.getItem('jwt') || ''
        );
    }
    
    // Установить JWT токен
    async setJWTToken(token: string): Promise<void> {
        if (!this.page) return;
        
        await this.page.evaluate((jwtToken: string) => {
            localStorage.setItem('jwt', jwtToken);
        }, token);
        
        console.log(' JWT токен установлен');
    }
    
    // Ждать элемент 
    async waitForElement(
        selector: string | readonly string[],  
        timeout = 10000
    ): Promise<boolean> {
        const selectors = Array.isArray(selector) ? selector : [selector];
        
        for (const sel of selectors) {
            try {
                await this.page.waitForSelector(sel, { timeout });
                console.log(` Элемент найден: ${sel}`);
                return true;
            } catch {
                continue;
            }
        }
        return false;
    }
}