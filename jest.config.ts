import type { Config } from 'jest';
import dotenv from 'dotenv'

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['./src/tests'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    testMatch: ['**/*.test.ts'],
    moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
        '^@config(.*)$': '<rootDir>/src/config$1',
        '^@database(.*)$': '<rootDir>/src/database$1',
        '^@utils/(.*)$': '<rootDir>/src/utils/$1',
        '^@exceptions/(.*)$': '<rootDir>/src/utils/exceptions/$1',
        '^@helpers/(.*)$': '<rootDir>/src/utils/helpers/$1',
        '^@middlewares/(.*)$': '<rootDir>/src/middlewares/$1',
        '^@Auth/(.*)$': '<rootDir>/src/Modules/Auth/$1',
        '^@userManagement/(.*)$': '<rootDir>/src/Modules/userManagement/$1'
    },

    setupFiles: ['<rootDir>/src/tests/jest.setup.ts'],
};

export default config;