// Утилитарные функции

// Задержка выполнения
export const delay = (ms: number): Promise<void> => {
    return new Promise(resolve => setTimeout(resolve, ms));
};

// Генерация случайных данных
export const generateRandomEmail = (): string => {
    return `user${Date.now()}${Math.floor(Math.random() * 1000)}@testmail.com`;
};

export const generateRandomUsername = (): string => {
    const adjectives = ['happy', 'clever', 'brave', 'quick', 'wise'];
    const nouns = ['fox', 'bear', 'wolf', 'eagle', 'lion'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const num = Math.floor(Math.random() * 1000);
    return `${adj}_${noun}_${num}`;
};

// Проверка элемента
export const findElement = async (
    page: any, 
    selector: string | string[], 
    timeout = 2000
): Promise<boolean> => {
    if (!page) return false;
    
    const selectors = Array.isArray(selector) ? selector : [selector];
    
    for (const sel of selectors) {
        try {
            await page.waitForSelector(sel, { timeout });
            return true;
        } catch {
            continue;
        }
    }
    return false;
};

// Поиск элемента по тексту
export const findElementByText = async (
    page: any,
    text: string,
    elementType = 'a'
): Promise<boolean> => {
    if (!page) return false;
    
    try {
        const elements = await page.$$(elementType);
        for (const element of elements) {
            const elementText = await element.evaluate((el: any) => 
                el.textContent?.trim().toLowerCase()
            );
            if (elementText?.includes(text.toLowerCase())) {
                await element.click();
                return true;
            }
        }
        return false;
    } catch {
        return false;
    }
};