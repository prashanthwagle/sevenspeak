const AWS = require("aws-sdk");

const dyClient = new AWS.DynamoDB.DocumentClient();
const TABLE_NAME = "HSTable";

exports.lambdaHandler = async (event, context) => {
  try {
    if (event.httpMethod === "GET" && event.resource === "/scores/top10") {
      //Retrieve the top 10 scores
      try {
        const params = {
          TableName: TABLE_NAME,
          ExpressionAttributeNames: {
            "#PN": "Name",
          },
          ProjectionExpression: "#PN, Score",
          ScanIndexForward: true,
        };
        const result = await dyClient.scan(params).promise();
        return {
          statusCode: 200,
          body: JSON.stringify(result.Items),
        };
      } catch (err) {
        console.log(err);
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Something went wrong" }),
        };
      }
    } else if (event.httpMethod === "GET" && event.resource === "/scores") {
      // Retrieve top 10 scores for a given player's name
      try {
        const { name } = event.queryStringParameters;

        if (!name) {
          return {
            statusCode: 400,
            body: JSON.stringify({
              message: "Kindly provide a name as a query parameter",
            }),
          };
        }

        const params = {
          TableName: TABLE_NAME,
          KeyConditionExpression: "#PN = :player_name",
          ExpressionAttributeNames: {
            "#PN": "Name",
          },
          ExpressionAttributeValues: {
            ":player_name": name,
          },
        };
        const result = await dyClient.query(params).promise();
        return {
          statusCode: 200,
          body: result.Items.length
            ? JSON.stringify(result.Items)
            : JSON.stringify({ message: "Player not found" }),
        };
      } catch (err) {
        console.log(err);
        return {
          statusCode: 400,
          body: JSON.stringify({ message: "Something went wrong" }),
        };
      }
    } else {
      return {
        statusCode: 404,
        body: JSON.stringify({ message: "Path/Method not found" }),
      };
    }
  } catch (err) {
    console.error(err);
    return {
      statusCode: 500,
      body: JSON.stringify({ message: "Internal Server Error" }),
    };
  }
};
