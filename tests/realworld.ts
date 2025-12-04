import RealworldTest from "./base";
import { PageActions } from "./helpers/actions";
import { FullTestScenario } from "./scenarios/fullScenario";

class RealworldE2ETest extends RealworldTest {
    async testFullScenario(): Promise<void> {
        try {
            if (!this.page) {
                throw new Error('Page not initialized');
            }
            
            // Инициализируем помощников
            const actions = new PageActions(this.page);
            const scenario = new FullTestScenario(this.page, actions, this.BASE_URL);
            
            // Выполняем сценарий
            await scenario.execute();
            
        } catch (error: any) {
            console.error(' Ошибка во время тестирования:', error.message);
            
            // Сохраняем скриншот ошибки
            if (this.page) {
                await this.page.screenshot({ 
                    path: 'screenshots/error-final.png',
                    fullPage: true 
                });
            }
            
            throw error;
        }
    }
}

export default RealworldE2ETest;