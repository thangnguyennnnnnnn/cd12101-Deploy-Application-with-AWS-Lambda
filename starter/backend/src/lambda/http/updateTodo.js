//import { DynamoDB } from '@aws-sdk/client-dynamodb'
//import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import {getUserId} from '../utils.mjs'
import { createLogger } from '../../utils/logger.mjs'
import {updateTodo} from '../../businessLogic/todo.mjs'
import { recordMetric } from '../../metrics/metricsUtils.mjs'

const logger = createLogger('updateTodo')
//const docClient = DynamoDBDocument.from(new DynamoDB())
//const TODOS_TABLE = process.env.TODOS_TABLE;

export async function handler(event) {
  try {
    const userId = getUserId(event);
    const todoId = event.pathParameters.todoId;
    const updatedTodo = JSON.parse(event.body);
    await updateTodo(todoId,userId,updatedTodo);
    // if (!updatedTodo.name && updatedTodo.done === undefined) {
    //   return {
    //     statusCode: 400,
    //     body: JSON.stringify({
    //       message: 'Validation failed: At least one of "name" or "done" must be provided'
    //     })
    //   };
    // }

    // const updateExpressionParts = [];
    // const expressionAttributeValues = {};
    // const expressionAttributeNames = {};

    // // Tạo update expression
    // if (updatedTodo.name) {
    //   updateExpressionParts.push('#name = :name');
    //   expressionAttributeValues[':name'] = updatedTodo.name;
    //   expressionAttributeNames['#name'] = 'name';
    // }

    // if (updatedTodo.done !== undefined) {
    //   updateExpressionParts.push('done = :done');
    //   expressionAttributeValues[':done'] = updatedTodo.done;
    // }

    // const updateExpression = `SET ${updateExpressionParts.join(', ')}`;

    // await docClient
    //   .update({
    //     TableName: TODOS_TABLE,
    //     Key: {
    //       userId,
    //       todoId
    //     },
    //     UpdateExpression: updateExpression,
    //     ExpressionAttributeValues: expressionAttributeValues,
    //     ExpressionAttributeNames: expressionAttributeNames,
    //     ConditionExpression: 'attribute_exists(todoId)',
    //     ReturnValues: 'ALL_NEW'
    //   })
    await recordMetric('UpdateTodo', 1)
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Todo item updated successfully'
      })
    };
  } catch (error) {
    logger.error('Update erorr', error)
    if (error.code === 'ConditionalCheckFailedException') {
      return {
        statusCode: 404,
        body: JSON.stringify({
          message: 'Todo item not found'
        })
      };
    }

    return {
      statusCode: 500,
      body: JSON.stringify({
        message: 'Failed to update TODO item'
      })
    };
  }
}
