import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3"
import sharp from "sharp"
import { nanoid } from "nanoid"

if (!process.env.R2_ACCOUNT_ID) {
  console.warn("Warning: R2_ACCOUNT_ID not set — image uploads will fail")
}

export const r2Client = new S3Client({
  region: "auto",
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID ?? "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY ?? "",
  },
})

const BUCKET = process.env.R2_BUCKET_NAME ?? "scoopcraft-media"
const PUBLIC_URL = process.env.NEXT_PUBLIC_R2_PUBLIC_URL ?? ""

export interface UploadedImage {
  key: string
  url400: string
  url800: string
  url1200: string
  baseUrl: string
}

/**
 * Upload an image to Cloudflare R2 with automatic WebP conversion
 * and multi-breakpoint resizing.
 *
 * @param file - File object or Buffer
 * @param folder - R2 folder prefix (e.g., "menu", "reviews")
 * @returns Uploaded image URLs for each breakpoint
 */
export async function uploadImage(
  file: File | Buffer,
  folder: "menu" | "reviews" | "quiz" | "flavors"
): Promise<UploadedImage> {
  const buffer = file instanceof File ? Buffer.from(await file.arrayBuffer()) : file

  // Validate file type and size
  if (file instanceof File) {
    const validTypes = ["image/jpeg", "image/png", "image/webp"]
    if (!validTypes.includes(file.type)) {
      throw new Error(`Invalid file type: ${file.type}. Supported: JPEG, PNG, WEBP`)
    }
    const maxSize = 5 * 1024 * 1024 // 5MB
    if (file.size > maxSize) {
      throw new Error("File too large. Maximum size is 5MB")
    }
  }

  // Generate unique key
  const key = `${folder}/${nanoid(12)}`

  // Resize to multiple breakpoints with WebP conversion
  const [sm, md, lg] = await Promise.all([
    sharp(buffer).resize(400, 400, { fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer(),
    sharp(buffer).resize(800, 800, { fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer(),
    sharp(buffer).resize(1200, 1200, { fit: "inside", withoutEnlargement: true }).webp({ quality: 85 }).toBuffer(),
  ])

  // Upload all sizes in parallel
  await Promise.all([
    r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: `${key}-400.webp`,
        Body: sm,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      })
    ),
    r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: `${key}-800.webp`,
        Body: md,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      })
    ),
    r2Client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: `${key}-1200.webp`,
        Body: lg,
        ContentType: "image/webp",
        CacheControl: "public, max-age=31536000, immutable",
      })
    ),
  ])

  return {
    key,
    url400: `${PUBLIC_URL}/${key}-400.webp`,
    url800: `${PUBLIC_URL}/${key}-800.webp`,
    url1200: `${PUBLIC_URL}/${key}-1200.webp`,
    baseUrl: `${PUBLIC_URL}/${key}`,
  }
}

/**
 * Delete all size variants of an image from R2.
 */
export async function deleteImage(key: string): Promise<void> {
  await Promise.all([
    r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: `${key}-400.webp` })),
    r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: `${key}-800.webp` })),
    r2Client.send(new DeleteObjectCommand({ Bucket: BUCKET, Key: `${key}-1200.webp` })),
  ])
}
