const AWSXRay = require( 'aws-xray-sdk')
import * as AWS from 'aws-sdk'
const XAWS = AWSXRay.captureAWS(AWS)
import { TodoItem } from '../models/TodoItem'
import { DocumentClient } from 'aws-sdk/lib/dynamodb/document_client'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'


const todosTable = process.env.TODOS_TABLE
const docClient: DocumentClient = createDynamoDBClient()
const created_index = process.env.TODOS_CREATED_AT_INDEX


function createDynamoDBClient(): any {
  if (process.env.IS_OFFLINE) {
    console.log('Creating a local DynamoDB instance')
    return new XAWS.DynamoDB.DocumentClient({
      region: 'localhost',
      endpoint: 'http://localhost:8000'
    })
  }

  return new XAWS.DynamoDB.DocumentClient()
}  

// // TODO: Implement the dataLayer logic
// Create Function

export async function createTodo(todo: TodoItem): Promise<TodoItem> {
    await docClient.put({
      TableName: todosTable,
      Item: todo
    }).promise()

    return todo
  }


// Get function

export async function getTodos(userId: string): Promise<TodoItem[]>{
  const result = await docClient.query({
    TableName : todosTable,
    KeyConditionExpression: 'userId = :userId',
    ExpressionAttributeValues: {
        ':userId': userId
    }
}).promise()
return result.Items as TodoItem[];

}

//  UploadFunctionForURL

export async function uploadId(todo: TodoItem): Promise<TodoItem>{
  const result = await docClient.update({
    TableName : todosTable,
    Key: {
      userId: todo.userId,
      todoId: todo.todoId
    },
    UpdateExpression: 'set attachmentUrl = :attachmentUrl',
    ExpressionAttributeValues: {
        ':attachmentUrl': todo.attachmentUrl
    }
}).promise()

  return result.Attributes as TodoItem
}


export async function uploadTodosId(todoId: string): Promise<TodoItem>{
  const result = await docClient.query({
    TableName : todosTable,
    IndexName: created_index,
    KeyConditionExpression: 'todoId = :todoId',
    ExpressionAttributeValues: {
        ':todoId': todoId
    }
}).promise()
  const items = result.Items
  if (items.length !==0) {
    return result.Items[0] as TodoItem
  }

  return null
  
}

export async function UploadUrl(todoId: string): Promise<string> {
  console.log("Generating URL");

  const url = this.s3Client.getSignedUrl('putObject', {
      Bucket: this.s3BucketName,
      Key: todoId,
      Expires: 1000,
  });
  console.log(url);

  return url as string;
}

//  Delete Function

export async function deleteTodoItem(todoId: string, userId: string): Promise<string> {
  console.log("Delete Items");
  const params = {
      TableName: todosTable,
      Key: {
          "userId": userId,
          "todoId": todoId
      },
  };
  const deleteitems = await docClient
  .delete(params).promise();
  console.log(deleteitems);
  return "" as string;
}

//  Update Function

export async function updateTodo(
  todoId: string,
  userId: string,
  TodoiUpdate: UpdateTodoRequest
) {
  console.log("Update an item", { todoId });

  await docClient.update({
      TableName: todosTable,
      Key: { todoId: todoId, userId: userId },
      UpdateExpression:
        "set #name = :name, #dueDate = :dueDate, #done = :done",
      ExpressionAttributeNames: {
        "#name": "name",
        "#dueDate": "dueDate",
        "#done": "done",
      },
      ExpressionAttributeValues: {
        ":name": TodoiUpdate.name,
        ":dueDate": TodoiUpdate.dueDate,
        ":done": TodoiUpdate.done,
      },
    })
    .promise();}