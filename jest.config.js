module.exports = {
    preset: 'jest-puppeteer',
    testMatch: ['**/test/**/*.test.js'],
    testEnvironment: 'node',
    testTimeout: 30000,
    verbose: true
};