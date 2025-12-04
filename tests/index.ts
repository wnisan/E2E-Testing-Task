import RealworldE2ETest from './realworld';

const testSuite = new RealworldE2ETest;

async function runTests() {
    try {
        await testSuite.setup();
        await testSuite.testFullScenario();

    } catch(error) {
        console.error('Тесты завершились с ошибкой:', error);
        process.exit(1);
    } finally {
        await testSuite.teardown();
        console.log('Тесты завершены, браузер закрыт');
    }
}

runTests();