'use server';
import prisma from '@/db';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import sharp from 'sharp';

const uploadFile = async (formData: FormData, configId?: string) => {
  const BUCKET = process.env.NEXT_AWS_S3_BUCKET_NAME;
  const S3_ENDPOINT = process.env.NEXT_AWS_S3_ENDPOINT;
  const s3 = new S3Client({
    region: process.env.NEXT_AWS_S3_REGION,
    credentials: {
      accessKeyId: process.env.NEXT_AWS_S3_ACCESS_KEY_ID as string,
      secretAccessKey: process.env.NEXT_AWS_S3_SECRET_ACCESS_KEY as string,
    },
  });

  try {
    const files = formData.getAll('file') as File[];
    const file = files[0];

    const fileName = file.name.replace(/\s+/g, '');
    const KEY = configId
      ? `configured-image/${Date.now()}-${fileName}`
      : `raw-image/${Date.now()}-${fileName}`;

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileUploadParams = {
      Bucket: BUCKET,
      Key: KEY,
      Body: buffer,
      ContentType: file.type,
    };

    const imageParam = new PutObjectCommand(fileUploadParams);

    await s3.send(imageParam);

    const imgMetadata = await sharp(buffer).metadata();
    const { width, height } = imgMetadata;

    // //create case configuration; insert db
    if (!configId) {
      const configuration = await prisma.configuration.create({
        data: {
          imageUrl: `${S3_ENDPOINT}/${KEY}`,
          height: height || 500,
          width: width || 500,
        },
      });

      return {
        status: 'success',
        message: 'Raw File has been uploaded',
        configId: configuration.id,
      };
    } else {
      const updatedConfiguration = await prisma.configuration.update({
        where: {
          id: configId,
        },
        data: {
          croppedImageUrl: `${S3_ENDPOINT}/${KEY}`,
        },
      });
      return {
        status: 'success',
        message: 'Design File has been uploaded',
        configId: updatedConfiguration.id,
      };
    }
  } catch (error) {
    let message = 'Unknown Error';
    if (error instanceof Error) message = error.message;
    console.log('upload failed', message);

    return { status: 'error', message };
  }
};

export { uploadFile };
