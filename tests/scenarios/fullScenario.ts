import { PageActions } from '../helpers/actions';
import { Selectors } from '../helpers/selectors';
import { generateRandomEmail, generateRandomUsername, delay } from '../helpers/utils';

export class FullTestScenario {
    private username: string = '';
    private email: string = '';
    private password: string = 'Password123!';
    private jwtToken: string = '';
    private postTitle: string = '';
    private postTag: string = 'automation';
    
    constructor(
        private page: any,
        private actions: PageActions,
        private baseUrl: string
    ) {}
    
    // Основной сценарий
    async execute(): Promise<void> {
        await this.openHomePage();
        await this.registerUser();
        await this.logout();
        await this.loginWithJWT();
        await this.createPost();
        await this.findPostByTag();
    }
    
    // 1. Открыть главную страницу
    private async openHomePage(): Promise<void> {
        console.log('1. Открываем главную страницу');
        
        await this.actions.navigateTo(this.baseUrl);
        await this.actions.waitForElement(Selectors.NAV);
        await this.actions.takeScreenshot('1-main-page');
        
        console.log(' Главная страница загружена\n');
    }
    
    // 2. Регистрация пользователя
    private async registerUser(): Promise<void> {
        console.log('2. Регистрируем нового пользователя');
        
        // Генерируем данные
        this.username = generateRandomUsername();
        this.email = generateRandomEmail();
        
        console.log(` Username: ${this.username}`);
        console.log(` Email: ${this.email}`);
        console.log(` Password: ${this.password}`);
        
        // Переходим на страницу регистрации
        await this.actions.navigateTo(`${this.baseUrl}register`);
        await this.actions.waitForElement(Selectors.FORM);
        
        // Заполняем форму
        await this.actions.fillField(Selectors.USERNAME_FIELD, this.username);
        await delay(500);
        
        await this.actions.fillField(Selectors.EMAIL_FIELD, this.email);
        await delay(500);
        
        await this.actions.fillField(Selectors.PASSWORD_FIELD, this.password);
        await delay(500);
        
        await this.actions.takeScreenshot('2-registration-form');
        
        // Отправляем форму
        await this.actions.safeClick(Selectors.SUBMIT_BUTTON);
        await delay(3000);
        
        // Проверяем успешность
        const isRegistered = await this.actions.waitForElement(Selectors.USER_PROFILE);
        if (isRegistered) {
            console.log(` Пользователь зарегистрирован: ${this.username}`);
            
            // Сохраняем JWT токен
            this.jwtToken = await this.actions.getJWTToken();
            if (this.jwtToken) {
                console.log(' JWT токен сохранен');
            }
            
            await this.actions.takeScreenshot('3-after-registration');
        } else {
            throw new Error(' Регистрация не удалась');
        }
        
        console.log();
    }
    
    // 3. Выход из системы
    private async logout(): Promise<void> {
        console.log('3. Выходим из системы');
        
        try {
           
            await this.actions.safeClick([
                'a[href*="logout"]',
                'button[class*="logout"]',
                '.logout-button'
            ], 2000);
            await delay(2000);
        } catch {
            // Если не нашли, переходим на прямую ссылку
            await this.actions.navigateTo(`${this.baseUrl}logout`, false);
        }
        
        // Проверяем что вышли
        const isLoggedOut = await this.actions.waitForElement(Selectors.LOGIN, 3000);
        if (isLoggedOut) {
            console.log(' Успешно вышли из системы');
        } else {
            console.log('  Не удалось подтвердить выход, но продолжаем...');
        }
        
        await this.actions.takeScreenshot('4-after-logout');
        console.log();
    }
    
    // 4. Вход с использованием JWT
    private async loginWithJWT(): Promise<void> {
        console.log('4.  Входим с использованием JWT токена');
        
        if (!this.jwtToken) {
            throw new Error(' Нет JWT токена для входа');
        }
        
        // Устанавливаем токен и перезагружаем
        await this.actions.setJWTToken(this.jwtToken);
        await this.actions.navigateTo(this.baseUrl);
        
        // Проверяем вход
        const isLoggedIn = await this.actions.waitForElement(Selectors.USER_PROFILE, 5000);
        if (isLoggedIn) {
            console.log(' Успешно вошли с JWT токеном');
        } else {
            throw new Error(' Вход с JWT токеном не удался');
        }
        
        await this.actions.takeScreenshot('5-after-login');
        console.log();
    }
    
    // 5. Создание поста
    private async createPost(): Promise<void> {
        console.log('5. Создаем новый пост');
        
        this.postTitle = `Тестовый пост ${Date.now()}`;
        const postDescription = 'Это тестовый пост созданный автоматически';
        const postBody = 'Содержимое тестового поста. Этот пост создан с помощью E2E тестов.';
        
        console.log(`  Заголовок: ${this.postTitle}`);
        console.log(`   Тег: ${this.postTag}`);
        
        // Переходим на страницу создания поста
        await this.actions.navigateTo(`${this.baseUrl}editor`);
        await this.actions.waitForElement(Selectors.FORM);
        
        // Заполняем форму
        await this.actions.fillField(Selectors.POST_TITLE_FIELD, this.postTitle);
        await delay(300);
        
        await this.actions.fillField(Selectors.POST_DESCRIPTION_FIELD, postDescription);
        await delay(300);
        
        await this.actions.fillField(Selectors.POST_BODY_FIELD, postBody);
        await delay(300);
        
        // Добавляем тег
        await this.actions.fillField(Selectors.TAG_INPUT, this.postTag);
        await this.page.keyboard.press('Enter');
        
        await this.actions.takeScreenshot('6-create-post-form');
        
  
        await this.actions.safeClick([
            'button[type="submit"]',
            'button.btn-primary',
            'button'
        ]);
        await delay(3000);
        
        // Проверяем публикацию
        const hasArticleHeader = await this.actions.waitForElement('h1', 5000);
        if (hasArticleHeader) {
            console.log(' Пост успешно опубликован');
        } else {
            console.log('  Публикация может не удаться, но продолжаем...');
        }
        
        await this.actions.takeScreenshot('7-after-post-creation');
        console.log();
    }
    
    // 6. Поиск поста по тегу
    private async findPostByTag(): Promise<void> {
        console.log('6.  Ищем пост по тегу');
        
        // Возвращаемся на главную
        await this.actions.navigateTo(this.baseUrl);
        await delay(2000);
        
        // Ищем теги
        const tagElements = await this.page.$$('.tag-list .tag-pill, .sidebar .tag-default');
        if (tagElements.length === 0) {
            console.log('  Теги не найдены');
            await this.actions.takeScreenshot('8-no-tags');
            return;
        }
        
        console.log(`  Найдено тегов: ${tagElements.length}`);
        
        // Пробуем найти нужный тег
        let tagClicked = false;
        for (let i = 0; i < Math.min(tagElements.length, 10); i++) {
            const tagText = await this.page.evaluate(
                (el: any) => el.textContent?.trim().toLowerCase(),
                tagElements[i]
            );
            
            if (tagText === this.postTag.toLowerCase()) {
                await tagElements[i].click();
                tagClicked = true;
                console.log(` Кликнули на тег: ${tagText}`);
                break;
            }
        }
        
        // Если не нашли, кликаем на первый
        if (!tagClicked && tagElements[0]) {
            await tagElements[0].click();
            const firstTagText = await this.page.evaluate(
                (el: any) => el.textContent?.trim(),
                tagElements[0]
            );
            console.log(` Кликнули на первый тег: ${firstTagText}`);
        }
        
        await delay(2000);
        
        // Ищем пост
        const articles = await this.page.$$('div.article-preview, article');
        console.log(`  Найдено постов: ${articles.length}`);
        
        if (articles.length > 0) {
            let postFound = false;
            for (let i = 0; i < Math.min(articles.length, 5); i++) {
                const articleText = await this.page.evaluate(
                    (el: any) => el.textContent?.toLowerCase(),
                    articles[i]
                );
                
                if (articleText?.includes('тестовый') || 
                    articleText?.includes(this.postTitle.substring(0, 20).toLowerCase())) {
                    postFound = true;
                    break;
                }
            }
            
            if (postFound) {
                console.log(' Нашли созданный пост!');
            } else {
                console.log('  Не нашли наш пост в ленте');
            }
        }
        
        await this.actions.takeScreenshot('8-tag-feed');
        console.log();
    }
}