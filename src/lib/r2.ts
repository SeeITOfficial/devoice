import { S3Client } from "@aws-sdk/client-s3";
import { getServerConfig } from "@/lib/config";

const config = getServerConfig();

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${config.cloudflareAccountId}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: config.r2AccessKeyId,
    secretAccessKey: config.r2SecretAccessKey,
  },
});

export const R2_BUCKET_NAME = config.r2BucketName;