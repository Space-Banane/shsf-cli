import { describe, it, expect, vi } from 'vitest';
import { action } from '../commands/remote.js';
import axios from 'axios';

vi.mock('axios');

describe('remote command', () => {
    it('should validate inputs', async () => {
        // Simple test for now
        await expect(action({})).resolves.not.toThrow();
    });
});
