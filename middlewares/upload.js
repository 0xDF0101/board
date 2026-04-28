const multer = require('multer');
const Minio = require('minio');
const path = require('path');

const upload = multer({ storage: multer.memoryStorage() });

function getMinioClient() {
    return new Minio.Client({
        endPoint: process.env.MINIO_ENDPOINT,
        port: parseInt(process.env.MINIO_PORT),
        useSSL: false,
        accessKey: process.env.MINIO_ACCESS_KEY,
        secretKey: process.env.MINIO_SECRET_KEY,
    });
}

async function uploadToMinio(file) {
    const client = getMinioClient();
    const ext = path.extname(file.originalname);
    const filename = Date.now() + ext;
    const bucket = process.env.MINIO_BUCKET;

    const exists = await client.bucketExists(bucket);
    if (!exists) {
        await client.makeBucket(bucket);
        await client.setBucketPolicy(bucket, JSON.stringify({
            Version: '2012-10-17',
            Statement: [{
                Effect: 'Allow',
                Principal: { AWS: ['*'] },
                Action: ['s3:GetObject'],
                Resource: [`arn:aws:s3:::${bucket}/*`],
            }],
        }));
    }

    await client.putObject(bucket, filename, file.buffer, file.size, {
        'Content-Type': file.mimetype,
    });

    return `${process.env.MINIO_PUBLIC_URL}/${bucket}/${filename}`;
}

module.exports = { upload, uploadToMinio };
