//import { DynamoDB } from '@aws-sdk/client-dynamodb'
//import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import {getUserId} from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import {deleteTodo} from '../../businessLogic/todo.mjs'
import { recordMetric } from '../../metrics/metricsUtils.mjs'

const logger = createLogger('deleteTodo')
//const dynamoDb = DynamoDBDocument.from(new DynamoDB())
//const TODOS_TABLE = process.env.TODOS_TABLE;

export async function handler(event) {
  try {
    const todoId = event.pathParameters.todoId;

    if (!todoId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: 'todoId is required in path parameters'
        })
      };
    }

    const userId = getUserId(event); // Hàm này lấy userId từ JWT token trong sự kiện (giả sử bạn đã triển khai xác thực).

    // const params = {
    //   TableName: TODOS_TABLE,
    //   Key: {
    //     userId,
    //     todoId
    //   },
    //   ConditionExpression: 'attribute_exists(todoId)'
    // };

    //await dynamoDb.delete(params)
    await deleteTodo(todoId, userId)
    await recordMetric('DeleteTodo', 1)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: `TODO item with ID: ${todoId} deleted successfully`
      })
    };
  } catch (error) {
    logger.error('Delete eror', error)
    if (error.code === 'ConditionalCheckFailedException') {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'TODO item not found'
        })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to delete TODO item'
      })
    };
  }
}
