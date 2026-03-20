import { describe, it, expect, vi } from 'vitest';
import path from 'path';
import os from 'os';
import { getConfigPath } from '../config.js';

describe('config', () => {
  it('should return the correct config path', () => {
    const expectedPath = path.join(os.homedir(), '.shsf_config');
    expect(getConfigPath()).toBe(expectedPath);
  });
});
