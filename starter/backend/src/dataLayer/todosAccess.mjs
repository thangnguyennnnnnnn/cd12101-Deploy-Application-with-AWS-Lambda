
import { DynamoDB } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb'
import { createLogger } from '../utils/logger.mjs'
import AWSXRay from 'aws-xray-sdk-core'
import AWS from 'aws-sdk'
import Axios from 'axios'

const s3 = new AWS.S3();
const logger = createLogger('dataLayer.todosAccess')

const dynamoDb = new DynamoDB()
const dynamoDbXRay = AWSXRay.captureAWSv3Client(dynamoDb)
const dynamoDbClient = DynamoDBDocument.from(dynamoDbXRay)

const TODOS_TABLE = process.env.TODOS_TABLE;
const TODOS_CREATED_AT_INDEX = process.env.TODOS_CREATED_AT_INDEX;
const TODOS_BUCKET = process.env.TODOS_S3_BUCKET;

export class TodosAccess {
  async getTodos(userId) {
    logger.info(`Fetching TODOs for user ${userId} from ${TODOS_TABLE}`)

    const result = await dynamoDbClient
      .query({
        TableName: TODOS_TABLE,
        IndexName: TODOS_CREATED_AT_INDEX,
        KeyConditionExpression: 'userId = :userId',
        ExpressionAttributeValues: {
          ':userId': userId
        },
        ScanIndexForward: false
      })

    //const items = result.Items.map((item) => ({
    //  ...item,
    //  attachmentUrl: `https://${TODOS_BUCKET}.s3.amazonaws.com/${item.todoId}`,
    //}));

    const items = await Promise.all(
      result.Items.map(async (item) => {
        const attachmentUrl = `https://${TODOS_BUCKET}.s3.amazonaws.com/${item.todoId}`;
        const exists = await checkImageExists(attachmentUrl);
        console.log(exists)
        return {
          ...item,
          attachmentUrl: exists ? attachmentUrl : null, // Gán null nếu không tồn tại
        };
      })
    );
    
    logger.info(`Fetched ${items.length} TODOs for user ${userId}`)
    return items;
  }

  async createTodo(todo) {
    logger.info(`Creating a new TODO in ${TODOS_TABLE}`, todo)

    await dynamoDbClient
      .put({
        TableName: TODOS_TABLE,
        Item: todo
      })

    logger.info(`TODO created successfully`, todo)
  }

  async updateTodo(todoId, userId, updateData) {
    logger.info(`Updating TODO ${todoId} for user ${userId}`)
    if (!updateData.name && updateData.done === undefined) {
        return {
        statusCode: 400,
        body: JSON.stringify({
            message: 'Validation failed: At least one of "name" or "done" must be provided'
        })
        };
    }
    const updateExpressionParts = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    if (updateData.name) {
      updateExpressionParts.push('#name = :name');
      expressionAttributeValues[':name'] = updateData.name;
      expressionAttributeNames['#name'] = 'name';
    }

    if (updateData.done !== undefined) {
      updateExpressionParts.push('done = :done');
      expressionAttributeValues[':done'] = updateData.done;
    }

    const updateExpression = `SET ${updateExpressionParts.join(', ')}`;

    await dynamoDbClient
      .update({
        TableName: TODOS_TABLE,
        Key: {
          userId,
          todoId
        },
        UpdateExpression: updateExpression,
        ExpressionAttributeValues: expressionAttributeValues,
        ExpressionAttributeNames: expressionAttributeNames,
        ConditionExpression: 'attribute_exists(todoId)',
        ReturnValues: 'ALL_NEW'
      })

    logger.info(`TODO ${todoId} updated successfully`)
  }

  async deleteTodo(todoId, userId) {
    logger.info(`Deleting TODO ${todoId} for user ${userId}`)

    const params = {
        TableName: TODOS_TABLE,
        Key: {
          userId,
          todoId
        },
        ConditionExpression: 'attribute_exists(todoId)'
      };
  
    await dynamoDbClient.delete(params)

    logger.info(`TODO ${todoId} deleted successfully`)
  }

  async getTodoById(todoId, userId) {
    logger.info(`Fetching TODO ${todoId} for user ${userId}`)

    const result = await dynamoDbClient
      .get({
        TableName: TODOS_TABLE,
        Key: {
          userId,
          todoId
        }
      })

    return result.Item
  }

}

export async function checkImageExists(url) {
  try {
    console.log(url);
    const response = await Axios.head(url);
    return response.status === 200;
  } catch (e) {
    console.log(e);
    return false;
  }
}


