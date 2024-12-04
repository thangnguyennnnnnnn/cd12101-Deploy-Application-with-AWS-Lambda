//import { DynamoDB } from '@aws-sdk/client-dynamodb'
//import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
//import { v4 as uuidv4 } from 'uuid';
import {getUserId} from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import {createTodo} from '../../businessLogic/todo.mjs'
import { recordMetric } from '../../metrics/metricsUtils.mjs'

const logger = createLogger('createTodo')
//const docClient = DynamoDBDocument.from(new DynamoDB())
//const TODOS_TABLE = process.env.TODOS_TABLE;

export async function handler(event) {
  try {
    const userId = getUserId(event);
    const newTodo = JSON.parse(event.body);
    if (!newTodo.name) {
      return {
        statusCode: 400,
        headers: {
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          message: '"Name" is required'
        })
      };
    }

    // const todoId = uuidv4();
    // const createdAt = new Date().toISOString();

    // const todoItem = {
    //   userId,
    //   todoId,
    //   ...newTodo,
    //   createdAt,
    //   done: false
    // };

    // await docClient
    //   .put({
    //     TableName: TODOS_TABLE,
    //     Item: todoItem
    //   })
    const todoItem = await createTodo(newTodo, userId);
    await recordMetric('CreatedTodo', 1)
    return {
      statusCode: 201,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        item: todoItem,
        message: 'TODO item created'
      })
    };
  } catch (error) {
    logger.error('Create eror', error)
    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to create TODO item'
      })
    };
  }
}
