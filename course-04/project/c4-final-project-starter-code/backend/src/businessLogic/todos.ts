import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import * as uuid from 'uuid'
import { APIGatewayProxyEvent } from 'aws-lambda/trigger/api-gateway-proxy'
import { getUserId } from '../lambda/utils'

export function todoResolver(todoRequest: CreateTodoRequest, event: APIGatewayProxyEvent):TodoItem
{
    const todoId = uuid.v4()
    const todo = {
      todoId: todoId,
      userId: getUserId(event),
      createdAt: new Date().getTime().toString(),
      done: false,
      attachmentUrl: '',
      ...todoRequest
     }
    return todo as TodoItem
}


