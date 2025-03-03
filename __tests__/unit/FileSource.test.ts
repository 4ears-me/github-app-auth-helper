import { assert, beforeAll, test } from 'vitest';
import * as fs from 'fs-extra';
import { FileSource } from '../../src/FileSource.js';
import parseArgs from 'minimist';
import tmp from 'tmp';

beforeAll(async () => {
  tmp.setGracefulCleanup();
});

test('fake file', async () => {
  const file = tmp.fileSync();
  await fs.writeJson(file.name, {
    appId: 'foo',
    installationId: 'bar',
    privateKey: 'baz',
  });

  const source = new FileSource();
  const argList = ['--source', 'file', '--secretFile', file.name];
  const args = parseArgs(argList);
  source.validateParameters(args);
  const creds = await source.getCredentials(args);

  assert(creds.appId === 'foo');
  assert(creds.installationId === 'bar');
  assert(creds.privateKey === 'baz');
});
