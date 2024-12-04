//import AWS from 'aws-sdk';
import { createLogger } from '../../utils/logger.mjs'
import {getUserId} from '../utils.mjs'
import {createAttachmentPresignedUrl} from '../../businessLogic/todo.mjs'
import { recordMetric } from '../../metrics/metricsUtils.mjs'

const logger = createLogger('generateUploadUrl')
//const s3 = new AWS.S3({ signatureVersion: 'v4' });
//const TODOS_S3_BUCKET = process.env.TODOS_S3_BUCKET;
//const URL_EXPIRATION = 300;

export async function handler(event) {
  try {
    const todoId = event.pathParameters.todoId;
    const userId = getUserId(event);
    if (!todoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'todoId is required in path parameters'
        })
      };
    }

    // const uploadUrl = s3.getSignedUrl('putObject', {
    //   Bucket: TODOS_S3_BUCKET,
    //   Key: todoId,
    //   Expires: URL_EXPIRATION
    // });
    const uploadUrl = await createAttachmentPresignedUrl(todoId,userId);
    await recordMetric('UploadTodo', 1)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        uploadUrl
      })
    };
  } catch (error) {
    logger.error('Upload eror', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to generate presigned URL'
      })
    };
  }
}