import { jest } from '@jest/globals';
import fetchMock from 'jest-fetch-mock';

// Mock Chrome API
global.chrome = {
    storage: {
        sync: {
            get: jest.fn(),
            set: jest.fn()
        }
    }
};

// Setup fetch mock
fetchMock.enableMocks();
