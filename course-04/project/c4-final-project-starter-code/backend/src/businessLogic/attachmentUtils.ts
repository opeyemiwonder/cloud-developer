import * as AWS from 'aws-sdk'
const AWSXRay = require ('aws-xray-sdk')
const XAWS = AWSXRay.captureAWS(AWS)

const s3 = new XAWS.S3({
    signatureVersion: 'v4'
  })
  const s3bucketName = process.env.ATTACHMENT_S3_BUCKET

// // TODO: Implement the fileStogare logic
export function getUploadUrl(todoId: string) {
    return s3.getSignedUrl('putObject', {
      Bucket: s3bucketName,
      Key: todoId,
      Expires: 300
    })
  }