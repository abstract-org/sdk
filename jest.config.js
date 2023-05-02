/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'jsdom',
    rootDir: './',
    roots: ['<rootDir>/src', '<rootDir>/src/__tests__'],
    testMatch: ['<rootDir>/src/__tests__/**/*.+(ts|tsx|js)'],
    testPathIgnorePatterns: ['<rootDir>/src/__tests__/wip'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1'
    },
    transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', { tsconfig: 'tsconfig.test.json' }]
    }
}
