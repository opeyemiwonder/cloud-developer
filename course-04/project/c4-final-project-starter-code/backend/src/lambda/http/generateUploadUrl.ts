import 'source-map-support/register'
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import * as middy from 'middy'
import { cors, httpErrorHandler } from 'middy/middlewares'
import { uploadId, uploadTodosId } from '../../dataLayer/todosAcess'
import { getUploadUrl } from '../../businessLogic/attachmentUtils'

const s3bucketName = process.env.ATTACHMENT_S3_BUCKET

export const handler = middy(
  async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
    const todoId = event.pathParameters.todoId
    
    // TODO: Return a presigned URL to upload a file for a TODO item with the provided id
    const todo = await uploadTodosId(todoId)

    todo.attachmentUrl = `https://${s3bucketName}.s3.amazonaws.com/${todoId}`

    await uploadId(todo)

    const url = getUploadUrl(todoId)
    
    return {
      statusCode: 201,
      headers: {
          "Access-Control-Allow-Origin": "*",
      },
      body: JSON.stringify({
          uploadUrl: url,
      }),
  }
  }
)

handler
  .use(httpErrorHandler())
  .use(
    cors({
      credentials: true
    })
  )
