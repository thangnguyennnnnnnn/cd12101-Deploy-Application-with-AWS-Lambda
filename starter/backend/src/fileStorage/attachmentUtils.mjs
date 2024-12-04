import AWS from 'aws-sdk';
import { createLogger } from '../utils/logger.mjs'

const logger = createLogger('generateUploadUrl')
const s3 = new AWS.S3({ signatureVersion: 'v4' });
const TODOS_S3_BUCKET = process.env.TODOS_S3_BUCKET;
const URL_EXPIRATION = 300;

export class AttachmentUtils {
  async uploadToS3(todoId) {
    logger.info(`Attachment URL for TODO with ID: ${todoId}`)
    const uploadUrl = s3.getSignedUrl('putObject', {
      Bucket: TODOS_S3_BUCKET,
      Key: todoId,
      Expires: URL_EXPIRATION
    });
    console.log('uploadUrl: ' + uploadUrl)
    return uploadUrl;
  }
}
