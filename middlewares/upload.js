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

    await client.putObject(bucket, filename, file.buffer, file.size, {
        'Content-Type': file.mimetype,
    });

    return `http://${process.env.MINIO_ENDPOINT}:${process.env.MINIO_PORT}/${bucket}/${filename}`;
}

module.exports = { upload, uploadToMinio };
