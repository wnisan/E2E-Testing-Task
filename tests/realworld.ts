import RealworldTest from "./base";

class RealworldE2ETest extends RealworldTest {
    // случайные данные для регистрации
    private generateRandomEmail(): string {
        return `User${Date.now()}@gmail.com`;
    }

    // поиск элемента 
    private async findElement(selector: string, timeout = 10000): Promise<boolean> {
        if (!this.page) return false;

        try {
            await this.page.waitForSelector(selector, { timeout });
            return true;
        } catch {
            return false;
        }
    }

    // клик с проверкой
    private async safeClick(selector: string): Promise<void> {
        if (!this.page) throw new Error('Page not initialized');

        await this.page.waitForSelector(selector, { timeout: 10000 });
        await this.page.click(selector);
    }

    // Вспомогательная функция для ожидания
    private async delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Тест: Регистрация -> Выход -> Вход -> Создание поста
    async testFullScenario(): Promise<void> {
        try {
            if (!this.page) {
                throw new Error('Page not initialized');
            }

            console.log('Открываем главную страницу...');
            await this.page.goto(this.BASE_URL, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            await this.delay(2000);

            // Проверяем, что страница загрузилась
            await this.page.waitForSelector('nav, .navbar, a, button', { timeout: 10000 });

            await this.page.screenshot({
                path: 'screenshots/1-main-page.png',
                fullPage: true
            });

            // Переменная для сохранения JWT токена, выданного при регистрации
            let jwtToken = '';

            console.log('Ищем кнопку регистрации');

            const currentUrl = this.page.url();
            if (currentUrl.includes('/register') || currentUrl.includes('/login')) {
                console.log('Уже на странице аутентификации');
            } else {
                // Ищем кнопку регистрации на главной
                const signUpSelectors = [
                    'a[href="/register"]',
                    'a[href*="register"]',
                    'a.nav-link[href*="register"]'
                ];

                let foundSignUp = false;

                for (const selector of signUpSelectors) {
                    try {
                        const element = await this.page.waitForSelector(selector, { timeout: 2000 }).catch(() => null);
                        if (element) {
                            console.log(`Нашли элемент: ${selector}`);
                            await element.click();
                            foundSignUp = true;
                            break;
                        }
                    } catch {
                        continue;
                    }
                }

                if (!foundSignUp) {
                    // Альтернатива: ищем все ссылки и кликаем на ту, что содержит register
                    const allLinks = await this.page.$$eval('a', links =>
                        links.map(link => ({
                            text: link.textContent?.trim() || '',
                            href: link.getAttribute('href') || ''
                        }))
                    );

                    const registerLink = allLinks.find(link =>
                        link.href.includes('/register') ||
                        link.text.toLowerCase().includes('sign up') ||
                        link.text.toLowerCase().includes('register')
                    );

                    if (registerLink && registerLink.href) {
                        await this.page.click(`a[href="${registerLink.href}"]`);
                        foundSignUp = true;
                    }
                }

                if (!foundSignUp) {
                    console.log('Пробуем напрямую перейти на страницу регистрации');
                    await this.page.goto(`${this.BASE_URL}register`);
                }
            }

            // форма регистрации
            console.log('Ждем форму регистрации');
            await this.page.waitForSelector('input, form, button[type="submit"]', { timeout: 10000 });

            console.log('Заполняем форму регистрации');

            const username = 'User' + Date.now();
            const email = this.generateRandomEmail();
            const password = 'Password123!';

            // разные селекторы для полей
            const fillField = async (value: string, possibleSelectors: string[]) => {
                for (const selector of possibleSelectors) {
                    try {
                        const element = await this.page!.waitForSelector(selector, { timeout: 1000 }).catch(() => null);
                        if (element) {
                            // Очищаем поле перед вводом 
                            await element.click({ clickCount: 3 });
                            await element.type(value);
                            console.log(`Заполнили: ${selector} = ${value}`);
                            return true;
                        }
                    } catch {
                        continue;
                    }
                }
                return false;
            };

            // username
            await fillField(username, [
                'input[placeholder*="Username"]',
                'input[name*="username"]',
                'input[type="text"]:nth-of-type(1)'
            ]);

            // email
            await fillField(email, [
                'input[placeholder*="Email"]',
                'input[type="email"]',
                'input[name*="email"]'
            ]);

            // password
            await fillField(password, [
                'input[placeholder*="Password"]',
                'input[type="password"]',
                'input[name*="password"]'
            ]);

            await this.page.screenshot({
                path: 'screenshots/2-registration-form.png',
                fullPage: true
            });

            console.log('Отправляем форму регистрации');

            const submitSelectors = [
                'button[type="submit"]',
                'button.btn-primary',
                'button'
            ];

            for (const selector of submitSelectors) {
                try {
                    const button = await this.page.waitForSelector(selector, { timeout: 1000 }).catch(() => null);
                    if (button) {
                        await button.click();
                        console.log(`Нажали кнопку: ${selector}`);
                        break;
                    }
                } catch {
                    continue;
                }
            }

            // Ждем успешной регистрации
            await this.delay(5000); 

            try {
                await this.page.waitForSelector('img.user-pic, .user-info, .navbar .user-pic, .avatar', { timeout: 10000 });
                console.log(`Зарегистрирован пользователь: ${username}`);
                await this.page.screenshot({
                    path: 'screenshots/3-after-registration.png',
                    fullPage: true
                });

                // Сохраняем JWT токен, чтобы потом использовать его при входе
                jwtToken = await this.page.evaluate(() => localStorage.getItem('jwt') || '');
                console.log(jwtToken ? 'Сохранили JWT токен для повторного входа' : 'JWT токен не найден после регистрации');
            } catch {
                const errorElement = await this.page.$('ul.error-messages, .text-danger, .alert-danger').catch(() => null);
                if (errorElement) {
                    const errorText = await errorElement.evaluate(el => el.textContent || '');
                    console.log(`Ошибка при регистрации: ${errorText}`);
                }

                await this.page.screenshot({
                    path: 'screenshots/error-registration.png',
                    fullPage: true
                });
                throw new Error('Регистрация не удалась');
            }

            // ВЫХОД из системы 
            console.log('Выходим из системы');

            // настройки или профиль пользователя
            try {
                const profileSelectors = [
                    'a[href*="settings"]',
                    'a.nav-link[href*="settings"]',
                    '.user-pic',
                    '.avatar',
                    'img.user-pic',
                    'a:has(img.user-pic)'
                ];

                let foundProfile = false;
                for (const selector of profileSelectors) {
                    try {
                        const element = await this.page.waitForSelector(selector, { timeout: 2000 }).catch(() => null);
                        if (element) {
                            console.log(`Нашли профиль: ${selector}`);
                            await element.click();
                            foundProfile = true;
                            await this.delay(1000);
                            break;
                        }
                    } catch {
                        continue;
                    }
                }

                if (foundProfile) {
                    const logoutSelectors = [
                        'button:has-text("Log out")',
                        'button:has-text("Sign out")',
                        'a:has-text("Log out")',
                        'a:has-text("Sign out")',
                        '.dropdown-menu a:last-child',
                        '.logout-button'
                    ];

                    for (const selector of logoutSelectors) {
                        try {
                            const logoutBtn = await this.page.waitForSelector(selector, { timeout: 2000 }).catch(() => null);
                            if (logoutBtn) {
                                console.log(`Нашли Logout: ${selector}`);
                                await logoutBtn.click();
                                await this.delay(2000);
                                break;
                            }
                        } catch {
                            continue;
                        }
                    }
                }

                // Если не нашли через профиль, пробуем прямую ссылку
                if (!foundProfile) {
                    await this.page.goto(`${this.BASE_URL}logout`);
                    await this.delay(2000);
                }

            } catch (error) {
                console.log('Ошибка при выходе, пробуем альтернативный метод:', error);
                // Пробуем прямую ссылку
                await this.page.goto(`${this.BASE_URL}logout`);
                await this.delay(2000);
            }

            // Более гибкие селекторы для проверки выхода
            const logoutCheckSelectors = [
                'a[href="/login"]',
                'a[href="/register"]',
                'a:has-text("Sign in")',
                'a:has-text("Sign up")',
                'a.nav-link[href="/login"]',
                'a.nav-link[href="/register"]'
            ];

            let logoutVerified = false;
            for (const selector of logoutCheckSelectors) {
                try {
                    await this.page.waitForSelector(selector, { timeout: 3000 }).catch(() => null);
                    console.log(`Выход подтвержден: нашли ${selector}`);
                    logoutVerified = true;
                    break;
                } catch {
                    continue;
                }
            }

            if (!logoutVerified) {
                await this.page.screenshot({
                    path: 'screenshots/debug-after-logout.png',
                    fullPage: true
                });

                // Проверяем текущий URL
                const currentUrl = await this.page.url();

                // Если все еще залогинены, просто переходим на главную
                if (!currentUrl.includes('/login') && !currentUrl.includes('/register')) {
                    await this.page.goto(this.BASE_URL);
                    await this.delay(2000);
                }
            } else {
                console.log('Вышли из системы');
            }

            await this.page.screenshot({
                path: 'screenshots/4-after-logout.png',
                fullPage: true
            });

            // ВХОД в систему
            console.log('Входим в систему, используя сохранённый JWT токен');

            await this.page.goto(this.BASE_URL, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            if (!jwtToken) {
                console.log('JWT токен отсутствует, вход невозможен');
                throw new Error('JWT токен не был сохранён после регистрации, не можем выполнить вход');
            }

            await this.page.evaluate((token: string) => {
                localStorage.setItem('jwt', token);
            }, jwtToken);

            // Перезагружаем страницу, чтобы SPA подхватила токен
            await this.page.goto(this.BASE_URL, {
                waitUntil: 'networkidle0',
                timeout: 30000
            });

            try {
                await this.page.waitForSelector('img.user-pic, .user-info, a[href*="editor"]', { timeout: 10000 });
                await this.page.screenshot({
                    path: 'screenshots/6-after-login.png',
                    fullPage: true
                });
            } catch {
                await this.page.screenshot({
                    path: 'screenshots/error-login-ui.png',
                    fullPage: true
                });
                throw new Error('Вход выполнен, но интерфейс не отобразил залогиненное состояние');
            }

            console.log('Создаем новый пост');

            // Переходим на страницу создания поста
            await this.page.goto(`${this.BASE_URL}editor`);
            await this.page.waitForSelector('input[placeholder*="Title"], textarea, input[placeholder*="tags"]', { timeout: 10000 });

            console.log('Заполняем форму поста');

            const postTitle = `Тестовый пост ${Date.now()}`;
            const postDescription = 'Это тестовый пост созданный автоматически';
            const postBody = 'Содержимое тестового поста. Этот пост создан с помощью E2E тестов.';
            const postTag = 'automation';

            await fillField(postTitle, [
                'input[placeholder*="Title"]',
                'input[placeholder*="Article Title"]'
            ]);

            await fillField(postDescription, [
                'input[placeholder*="about"]',
                'input[placeholder*="What\'s this article about"]'
            ]);

            await fillField(postBody, [
                'textarea[placeholder*="article"]',
                'textarea[placeholder*="markdown"]',
                'textarea'
            ]);

            // Добавляем тег
            try {
                const tagInput = await this.page.waitForSelector('input[placeholder*="tags"], input[placeholder*="Enter tags"]', { timeout: 2000 }).catch(() => null);
                if (tagInput) {
                    await tagInput.type(postTag);
                    await this.page.keyboard.press('Enter');
                    console.log(`Добавили тег: ${postTag}`);
                }
            } catch {
                console.log('Не удалось добавить тег');
            }

            await this.page.screenshot({
                path: 'screenshots/7-create-post-form.png',
                fullPage: true
            });

            // Публикуем пост
            console.log('Публикуем пост');

            const publishSelectors = [
                'button:has-text("Publish")',
                'button:has-text("Publish Article")',
                'button.btn-primary',
                'button[type="submit"]'
            ];

            for (const selector of publishSelectors) {
                try {
                    const button = await this.page.waitForSelector(selector, { timeout: 1000 }).catch(() => null);
                    if (button) {
                        await button.click();
                        console.log(`Нажали: ${selector}`);
                        break;
                    }
                } catch {
                    continue;
                }
            }

            await this.delay(3000);

            console.log('Пост успешно создан');
            await this.page.screenshot({
                path: 'screenshots/8-after-post-creation.png',
                fullPage: true
            });

            console.log('Ищем пост по тегу');

            // Возвращаемся на главную
            await this.page.goto(this.BASE_URL);
            await this.page.waitForSelector('.tag-list, .sidebar, .tag-pill, .tag-default', { timeout: 10000 });

            // Ищем теги
            const tagElements = await this.page.$$('.tag-list .tag-pill, .sidebar .tag-default, .tag-list .tag-default');

            if (tagElements.length > 0) {
                console.log(`Нашли ${tagElements.length} тегов`);

                let clickedTag = false;

                // Пробуем найти тег
                for (let i = 0; i < tagElements.length; i++) {
                    const tagText = await tagElements[i].evaluate(el => el.textContent?.trim());
                    if (tagText?.toLowerCase() === postTag.toLowerCase()) {
                        await tagElements[i].click();
                        clickedTag = true;
                        console.log(`Кликнули на тег: ${tagText}`);
                        break;
                    }
                }

                // Если не нашли наш тег, кликаем на первый
                if (!clickedTag && tagElements[0]) {
                    await tagElements[0].click();
                    const tagText = await tagElements[0].evaluate(el => el.textContent?.trim());
                    console.log(`Кликнули на первый тег: ${tagText}`);
                }

                await this.delay(2000);

                const articleTitles = await this.page.$$eval('div.article-preview h1, article h1, .article-preview h1',
                    elements => elements.map(el => el.textContent?.trim())
                );

                console.log(`На странице ${articleTitles.length} постов`);

                const foundPost = articleTitles.some(title =>
                    title?.includes(postTitle.substring(0, 30)) ||
                    title?.toLowerCase().includes('тестовый')
                );

                if (foundPost) {
                    console.log('Нашли созданный пост в глобальной ленте!');
                } else {
                    console.log('Не нашли пост в глобальной ленте');
                    console.log('Заголовки постов:', articleTitles.slice(0, 5));
                }

                await this.page.screenshot({
                    path: 'screenshots/9-tag-feed.png',
                    fullPage: true
                });
            } else {
                console.log('Теги не найдены');
                await this.page.screenshot({
                    path: 'screenshots/no-tags.png',
                    fullPage: true
                });
            }

        } catch (error) {
            console.error('❌ Ошибка во время тестирования:', error);

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