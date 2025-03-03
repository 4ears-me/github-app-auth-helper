import { AppCredentials, SecretProvider } from './Helper.js';
import * as fs from 'fs-extra';
import { ParsedArgs } from "minimist";

export class CliSource implements SecretProvider {
  validateParameters(args: ParsedArgs): void {
    if (!args.appId || !args.installationId || !args.pemFile) {
      process.stderr.write('--appId, --installationId, and --pemFile are all required for using the CLI source');
      process.exit(1);
    }
  }

  async getCredentials(args: ParsedArgs): Promise<AppCredentials> {
    return {
      appId: args.appId!,
      installationId: args.installationId!,
      privateKey: (await fs.readFile(args.pemFile!)).toString(),
    };
  }
}
