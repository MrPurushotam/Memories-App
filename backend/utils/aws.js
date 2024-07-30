const { S3Client } = require("@aws-sdk/client-s3");
const { DynamoDBClient,CreateTableCommand  } = require("@aws-sdk/client-dynamodb");
const { DynamoDBDocumentClient } = require("@aws-sdk/lib-dynamodb");

require("dotenv").config();

const config = {
  credentials: {
    accessKeyId: process.env.AWS_ACCESSKEY,
    secretAccessKey: process.env.AWS_SECRET,
  },
  region:process.env.AWS_REGION 
};

const s3Client = new S3Client(config);
const dynamoDbClient = new DynamoDBClient(config);
const docClient = DynamoDBDocumentClient.from(dynamoDbClient);

  const createAuthTable = async () => {
    const params = {
      TableName: 'auth',
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'email', AttributeType: 'S' }
      ],
      GlobalSecondaryIndexes: [
        {
          IndexName: 'EmailIndex',
          KeySchema: [
            { AttributeName: 'email', KeyType: 'HASH' }
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      }
    };
  
    try {
      await dynamoDbClient.send(new CreateTableCommand(params));
      console.log(`Table "auth" created successfully.`);
    } catch (error) {
      if (error.name === 'ResourceInUseException') {
        console.log(`Table "auth" already exists.`);
      } else {
        console.error('Error creating table:', error);
      }
    }
  };
  
  const createMemoriesTable = async () => {
    const params = {
      TableName: 'memories',
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'userId', AttributeType: 'S' },

      ],
      ProvisionedThroughput: {
        ReadCapacityUnits: 5,
        WriteCapacityUnits: 5
      },
      GlobalSecondaryIndexes: [
        {
          IndexName: 'UserIdIndex',
          KeySchema: [
            { AttributeName: 'userId', KeyType: 'HASH' } 
          ],
          Projection: {
            ProjectionType: 'ALL'
          },
          ProvisionedThroughput: {
            ReadCapacityUnits: 5,
            WriteCapacityUnits: 5
          }
        }
      ]
    };
  
    try {
      await dynamoDbClient.send(new CreateTableCommand(params));
      console.log(`Table "memories" created successfully.`);
    } catch (error) {
      if (error.name === 'ResourceInUseException') {
        console.log(`Table "memories" already exists.`);
      } else {
        console.error('Error creating table:', error);
      }
    }
  };
  
  const init = async () => {
    await createAuthTable();
    await createMemoriesTable();
  };
  
  module.exports = {
    init,
    docClient,
    s3Client
};