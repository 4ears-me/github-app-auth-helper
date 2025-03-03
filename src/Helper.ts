import { createAppAuth } from '@octokit/auth-app';
import { ParsedArgs } from 'minimist';

export interface AppCredentials {
  appId: string;
  installationId: string;
  privateKey: string;
  [other: string]: unknown;
}

export interface SecretProvider {
  getCredentials(args: ParsedArgs): Promise<AppCredentials>;
  validateParameters(args: ParsedArgs): void;
}

export class Helper {
  constructor(private provider: SecretProvider) {}

  public async shouldRun(stream: NodeJS.ReadStream): Promise<boolean> {
    let buf = '';
    stream.setEncoding('utf8');
    for await (const chunk of stream) {
      buf += chunk;

      // When we see a blank line, git is done providing input.
      if (buf.includes('\n\n')) {
        // Trim off anything that comes after the blank line, but there shouldn't be anything.
        buf = buf.substring(0, buf.indexOf('\n\n'));
        break;
      }
    }

    const lines = buf.split('\n');
    const input: { [key: string]: string } = {};
    for (const line of lines) {
      const equals = line.indexOf('=');
      if (equals === -1) {
        console.error(`Invalid input: ${line}`);
        process.exit(1);
      }

      const key = line.substring(0, equals);
      input[key] = line.substring(equals + 1);
    }
    return input['protocol'] === 'https' && input['host'] === 'github.com';
  }

  public async getOutput(args: ParsedArgs): Promise<string> {
    const creds = await this.provider.getCredentials(args);

    const auth = createAppAuth(creds);

    const installAuth = await auth({
      type: 'installation',
    });

    return `capability=authtype
    authtype=bearer
    credential=${installAuth.token}
    `;
  }
}
