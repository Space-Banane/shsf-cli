import { describe, it, expect, afterEach } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { readIgnoreFile, matchesAnyPattern, readMappingFile, defaultUnpushableFiles } from '../utils/push_helpers.js';

const tmpDirs: string[] = [];

afterEach(() => {
  for (const d of tmpDirs) {
    try {
      fs.rmSync(d, { recursive: true, force: true });
    } catch (_e) {
      // ignore cleanup errors
    }
  }
  tmpDirs.length = 0;
});

describe('push_helpers', () => {
  it('readIgnoreFile should read patterns from provided dir', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'shsf-test-'));
    tmpDirs.push(tmp);
    const ignorePath = path.join(tmp, '.shsfignore');
    fs.writeFileSync(ignorePath, '# comment\nsecret.txt\n*.log\n');

    const patterns = readIgnoreFile(tmp);
    expect(patterns).toContain('secret.txt');
    expect(patterns).toContain('*.log');
  });

  it('matchesAnyPattern should match suffix and glob patterns', () => {
    const patterns = ['.secret', '*.log', 'dockerfile'];
    expect(matchesAnyPattern('foo.secret', patterns)).toBe(true);
    expect(matchesAnyPattern('bar.log', patterns)).toBe(true);
    expect(matchesAnyPattern('Dockerfile', patterns)).toBe(true);
    expect(matchesAnyPattern('notmatched.txt', patterns)).toBe(false);
  });

  it('defaultUnpushableFiles contains common suffix', () => {
    expect(defaultUnpushableFiles).toContain('.png');
  });

  it('readMappingFile should read mapping from cwd when present', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'shsf-map-'));
    tmpDirs.push(tmp);
    const mapPath = path.join(tmp, '.shsf.json');
    fs.writeFileSync(mapPath, JSON.stringify({ default: { id: 'abc', from: 'src' } }));

    const mapping = readMappingFile(tmp);
    expect(mapping).toBeTruthy();
    expect(mapping?.id).toBe('abc');
    expect(mapping?.from).toBe('src');
  });

  it('readMappingFile should return null when file is missing', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'shsf-map-missing-'));
    tmpDirs.push(tmp);

    const mapping = readMappingFile(tmp);
    expect(mapping).toBeNull();
  });

  it('readMappingFile should return null for malformed json', () => {
    const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'shsf-map-bad-'));
    tmpDirs.push(tmp);
    const mapPath = path.join(tmp, '.shsf.json');
    fs.writeFileSync(mapPath, '{ this is : not valid json }');

    const mapping = readMappingFile(tmp);
    expect(mapping).toBeNull();
  });
});
