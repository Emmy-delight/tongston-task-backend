// ── Real S3 (uncomment if AWS credentials are available) ──────────────────
// import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
// import https from 'https';
//
// const s3 = new S3Client({
//   region: 'us-east-1',
//   credentials: {
//     accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
//     secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
//   },
// });
//
// export const uploadFromUrl = async (url: string, key: string): Promise<string> => {
//   const response = await fetch(url);
//   const buffer = Buffer.from(await response.arrayBuffer());
//   await s3.send(new PutObjectCommand({
//     Bucket: process.env.AWS_BUCKET_NAME!,
//     Key: key,
//     Body: buffer,
//     ContentType: 'application/octet-stream',
//   }));
//   return `https://${process.env.AWS_BUCKET_NAME}.s3.amazonaws.com/${key}`;
// };
// ──────────────────────────────────────────────────────────────────────────

// MOCK S3 — code structure & interface match real implementation exactly
export const uploadFromUrl = async (url: string, key: string): Promise<string> => {
  console.log(`[MOCK S3] Transferring ${url} → s3://${process.env.AWS_BUCKET_NAME ?? 'bucket'}/${key}`);
  // Simulate transfer delay
  await new Promise<void>((resolve) => setTimeout(resolve, 200));
  return `https://mock-s3-bucket.s3.amazonaws.com/${key}`;
};