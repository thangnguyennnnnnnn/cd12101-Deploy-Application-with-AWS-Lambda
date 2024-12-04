//import { DynamoDB } from '@aws-sdk/client-dynamodb'
//import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import {getUserId} from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import {getTodosForUser} from '../../businessLogic/todo.mjs'
import { recordMetric } from '../../metrics/metricsUtils.mjs'

const logger = createLogger('getTodos')
//const dynamoDbClient = DynamoDBDocument.from(new DynamoDB())
//const TODOS_TABLE = process.env.TODOS_TABLE;
//const TODOS_CREATED_AT_INDEX = process.env.TODOS_CREATED_AT_INDEX;
//const TODOS_BUCKET = process.env.TODOS_S3_BUCKET;

export async function handler(event) {
  try {
    
    const userId = getUserId(event);
    if (!userId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'User ID not found in the token'
        })
      };
    }

    // const result = await dynamoDbClient
    //   .query({
    //     TableName: TODOS_TABLE,
    //     IndexName: TODOS_CREATED_AT_INDEX,
    //     KeyConditionExpression: 'userId = :userId',
    //     ExpressionAttributeValues: {
    //       ':userId': userId
    //     },
    //     ScanIndexForward: false
    //   })

    // const items = result.Items.map((item) => ({
    //   ...item,
    //   attachmentUrl: `https://${TODOS_BUCKET}.s3.amazonaws.com/${item.todoId}`,
    // }));
    const items = await getTodosForUser(userId);
    await recordMetric('GetTodos', 1)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        items
      })
    };
  } catch (error) {
    logger.error('Get eror', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to retrieve TODO items',
        error: error.message
      })
    };
  }
}
