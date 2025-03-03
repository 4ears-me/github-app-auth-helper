import { AppCredentials, SecretProvider } from './Helper.js';
import * as fs from 'fs-extra';
import { ParsedArgs } from "minimist";

export class FileSource implements SecretProvider {
  validateParameters(args: ParsedArgs): void {
    if (!args.secretFile) {
      process.stderr.write('--secretFile required for using the file source');
      process.exit(1);
    }
  }
  async getCredentials(args: ParsedArgs): Promise<AppCredentials> {
    return await fs.readJson(args.secretFile);
  }
}
