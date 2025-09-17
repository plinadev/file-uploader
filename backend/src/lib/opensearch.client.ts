/* eslint-disable @typescript-eslint/require-await */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Client } from '@opensearch-project/opensearch';
import { AwsSigv4Signer } from '@opensearch-project/opensearch/aws';
import * as dotenv from 'dotenv';
dotenv.config();

export const OpenSearchClient = new Client({
  node: process.env.OPENSEARCH_ENDPOINT!,
  ...AwsSigv4Signer({
    region: process.env.AWS_REGION!,
    getCredentials: async () => ({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    }),
  }),
});
