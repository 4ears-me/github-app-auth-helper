import { AppCredentials, SecretProvider } from './Helper.js';
import { SecretsManager } from '@aws-sdk/client-secrets-manager';
import {
  fromTemporaryCredentials,
  fromWebToken,
} from '@aws-sdk/credential-providers';
import { AwsCredentialIdentityProvider } from '@aws-sdk/types';
import { ParsedArgs } from "minimist";

export class SecretsManagerSource implements SecretProvider {
  constructor(private readonly secretsManager: SecretsManager) {}

  validateParameters(args: ParsedArgs): void {
    if (!args.secretArn) {
      process.stderr.write('--secretArn required for using the SecretsManager source');
      process.exit(1);
    }

    if (args.oidcToken && !args.assumeRole) {
      process.stderr.write('--assumeRole required when using an OIDC token');
      process.exit(1);
    }
  }

  public static async build(args: ParsedArgs): Promise<SecretsManager> {
    let iamProvider: AwsCredentialIdentityProvider;
    if (args.assumeRole !== undefined) {
      if (args.oidcToken !== undefined) {
        iamProvider = fromWebToken({
          roleArn: args.assumeRole!,
          webIdentityToken: args.oidcToken!,
          roleSessionName: 'git-credentials',
          durationSeconds: 60,
        });
      } else {
        iamProvider = fromTemporaryCredentials({
          params: {
            RoleArn: args.assumeRole!,
            RoleSessionName: 'git-credentials',
          },
        });
      }
    }

    return iamProvider === undefined
      ? new SecretsManager()
      : new SecretsManager({
          credentials: iamProvider,
        });
  }

  public async getCredentials(args: ParsedArgs): Promise<AppCredentials> {
    const secret = await this.secretsManager.getSecretValue({
      SecretId: args.secretArn!,
    });

    return JSON.parse(secret.SecretString);
  }
}
