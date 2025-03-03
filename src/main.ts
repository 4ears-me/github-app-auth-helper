#!/usr/bin/env node

import parseArgs from 'minimist';
import { SecretsManagerSource } from './SecretsManagerSource.js';
import { FileSource } from './FileSource.js';
import { CliSource } from './CliSource.js';
import { Helper, SecretProvider } from './Helper.js';

const args = parseArgs(process.argv.slice(2));

if (args._[0] === 'get') {
  let credSource: SecretProvider;
  switch (args.source) {
    case 'sm': {
      const secretsManager = await SecretsManagerSource.build(args);
      credSource = new SecretsManagerSource(secretsManager);
      break;
    }
    case 'file': {
      credSource = new FileSource();
      break;
    }
    case 'cli': {
      credSource = new CliSource();
      break;
    }
    default: {
      console.error(
        '--source must be specified as sm (AWS Secrets Manager), file, or cli',
      );
      process.exit(1);
    }
  }

  const helper = new Helper(credSource);
  if (await helper.shouldRun(process.stdin)) {
    const output = await helper.getOutput(args);
    process.stdout.write(output);
  }
}
