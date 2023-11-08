import { v4 as uuidv4 } from 'uuid';
import AWS from 'aws-sdk';
import { promisify } from 'util';
import { PresignedPost } from 'aws-sdk/clients/s3';

const s3: AWS.S3 = new AWS.S3({
  region: process.env.AWS_BUCKET_REGION,
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

const createPresignedPostPromise = promisify(s3.createPresignedPost.bind(s3));

// Define the structure of the label in the request body
interface Label {
  name: string;
}

export async function POST(request: Request) {
  try {
    const res = await request.json();
    const labels: Label[] = res.labels;

    let imageType: string = res.originalImageType;

    // Validate the image type format. Can start with a dot, but can't contain a dot
    if (imageType.startsWith('image/')) imageType = imageType.slice(6);
    if (imageType.includes('.')) return new Response('Invalid image type. Image extension should not contain a dot (.) after the first character.', { status: 400 });

    // Convert the image type to lowercase for consistency
    imageType = imageType.toLowerCase();

    // Matcher to check if the image is a png, jpg, or jpeg.
    const imageTypeMatcher = /(png|jpg|jpeg)/;
    if (!imageTypeMatcher.test(imageType)) return new Response('Invalid image type. Image extension should be png, jpg, or jpeg.', { status: 400 });

    // Create the uuid for the image matcher
    const uuid = uuidv4();

    // Create the signed post for the original image
    const originalImageKey = `${uuid}.jpg`;

    // Define the functions to presign the URLs for labels and the original image
    const signedUrlsPromise = labels.map((label) => MapAndPresignLabel(uuid, label));
    const originalImageSignedUrlPromise = UploadImageToS3(originalImageKey, `image/${imageType}`);

    const labelPresignedPosts: PresignedPost[] = await Promise.all(signedUrlsPromise);
    const rawImagePresignedPost: PresignedPost = await originalImageSignedUrlPromise;

    return Response.json({ originalImage: { presignedPost: rawImagePresignedPost, contentType: imageType }, labels: { presignedPosts: labelPresignedPosts } });
  } catch (error: any) {
    console.error(error);
    return new Response(error.message, { status: 500 });
  }
}

async function MapAndPresignLabel(uuid: string, label: Label): Promise<PresignedPost> {
  const filename = `${uuid}_${label.name}`;
  // Labels are always png
  return UploadImageToS3(filename, 'image/png');
}

async function UploadImageToS3(key: string, contentType: string): Promise<PresignedPost> {
  return createPresignedPostPromise({
    Bucket: process.env.AWS_BUCKET_NAME,
    Fields: {
      key,
      'Content-Type': contentType,
    },
    Expires: 60,
  }) as Promise<PresignedPost>;
}
