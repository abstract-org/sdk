/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    rootDir: './',
    roots: ['<rootDir>/src', '<rootDir>/__tests__'],
    testMatch: ['<rootDir>/__tests__/**.test.ts'],
    testPathIgnorePatterns: ['<rootDir>/__tests__/wip']
}
