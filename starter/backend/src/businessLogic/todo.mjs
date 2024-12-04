import { TodosAccess } from '../dataLayer/todosAccess.mjs' // Truy cập dataLayer
import { AttachmentUtils } from '../fileStorage/attachmentUtils.mjs' // Xử lý lưu trữ tệp
import { createLogger } from '../utils/logger.mjs' // Tiện ích ghi log
import * as uuid from 'uuid'

const todosAccess = new TodosAccess()
const attachmentUtils = new AttachmentUtils()
const logger = createLogger('businessLogic.todos')

export async function getTodosForUser(userId) {
  logger.info(`Fetching TODOs for user: ${userId}`)

  return await todosAccess.getTodos(userId)
}

export async function createTodo(newTodo, userId) {
  const todoId = uuid.v4()
  const createdAt = new Date().toISOString()

  logger.info(`Creating a TODO with ID: ${todoId} for user: ${userId}`)

  const todoItem = {
    ...newTodo,
    userId,
    todoId,
    createdAt,
    done: false
  }

  await todosAccess.createTodo(todoItem)
  return todoItem
}

export async function updateTodo(todoId, userId, updateData) {
  logger.info(`Updating TODO with ID: ${todoId} for user: ${userId}`)

  const validTodo = await todosAccess.getTodoById(todoId, userId)
  if (!validTodo) {
    throw new Error('TODO not found')
  }

  await todosAccess.updateTodo(todoId, userId, updateData)
}

export async function deleteTodo(todoId, userId) {
  logger.info(`Deleting TODO with ID: ${todoId} for user: ${userId}`)

  const validTodo = await todosAccess.getTodoById(todoId, userId)
  if (!validTodo) {
    throw new Error('TODO not found')
  }

  await todosAccess.deleteTodo(todoId, userId)
}

export async function createAttachmentPresignedUrl(todoId, userId) {
  logger.info(`Creating attachment URL for TODO with ID: ${todoId} for user: ${userId}`)

  const validTodo = await todosAccess.getTodoById(todoId, userId)
  if (!validTodo) {
    throw new Error('TODO not found')
  }

  const uploadUrl = await attachmentUtils.uploadToS3(todoId)
  return uploadUrl
}
