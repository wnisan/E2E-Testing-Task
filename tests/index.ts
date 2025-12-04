import RealworldE2ETest from './realworld';

async function runTests() {
    console.log(' Запуск E2E тестов для Realworld\n');

    const testSuite = new RealworldE2ETest();

    try {
        // Настраиваем окружение
        await testSuite.setup();
        console.log(' Браузер запущен\n');

        // Создаем папку для скриншотов
        const fs = require('fs');
        if (!fs.existsSync('screenshots')) {
            fs.mkdirSync('screenshots');
        }


        await testSuite.testFullScenario();

        console.log('\n Все тесты успешно завершены!');

    } catch (error: any) {
        console.error('\n Тесты завершились с ошибкой:', error.message);
        process.exit(1);

    } finally {

        await testSuite.teardown();
    }
}


runTests();