# Welcome!

This is my implementation of the dice roll game!

# My Details

Name: Prashanth P Wagle

Email: frk5pa@virginia.edu

Position: Software Engineering Intern (Summer 2023)

# Tech Stack:

Language: Node.js 14.x
AWS Resources: AWS Lambda, Amazon DynamoDB, AWS CloudFormation

# Key Product Highlights

1. Variability in responses: The utterances of Alexa isn't fixed, instead it rotates between utterances. For eg. While greeting, it may say "hello" or "bonjour" or "yello" and so on. The same goes for most of the utterances.

   Goal Achieved: More human-like responses by Alexa which improves interactivity.

   What could we do better: More Human-like responses could be achieved through Alexa Emotions (https://developer.amazon.com/en-US/blogs/alexa/alexa-skills-kit/2019/11/new-alexa-emotions-and-speaking-styles).

2. Humanlike interaction: The theme of Alexa is of a playful person who asks for the user's name upfront.

   Goal Achieved: A real-life interaction is simulated with a small change

   What could we do better: We can add some additional context to enhance the humanlike emotions. For example: if the weather is sunny today, Alexa can refer to the sunny weather and refer it in the context

3. Remembers User's name between interactions

   Goal Achieved: This feature adds to the human-ness of Alexa. This could be make the user feel that the app is more personalized.

   What could we do better: We can leverage Alexa Voice profiles to remember user's voices and this would make the game more personalized.

# Key Implementation Highlights

1. API Testing

   There are a few API tests for testing out the lambda function where the Alexa's backend would be hosted. However, we could make it more robust by adding an API Gateway trigger to the Lambda function and using an API testing platform like Postman to test the application in a better way with added benefits.

2. Single Deployment Configuration

   The code can be potentially deployed as an AWS CloudFormation stack using AWS Serverless Application Model (SAM). One click deployment and update, and version control are the key highlights of using AWS SAM.

   Single Deployment Configuration also applies to the file Assets/interactionModelSchema.json where all the interactions are written down in a single json file which can be plugged in and used.

3. RESTful API exposure

   The SAM template is centered around a lambda function which responds to RESTful API request to expose the highscore data which is a component of the SAM template.

4. HelpIntent and Fallback Intents

   The additional intents like Help and Fallback intents aid the user in navigating the game and also in the graceful response of the Alexa skill. Furthermore, session variables can be used to enhance the responses.

# Project Overview

My project has two parts: roll-dice-core and roll-dice-restapi.

## Setup overview

roll-dice-core has to be setup in order to test the functionality of the alexa skill . After this, optionally we can set up roll-dice-restapi which exposes RESTful APIs for the users to access a subset of the functionality - retrieving high score data

## Part-1: roll-dice core

Firstly, roll-dice-core has to be setup

### Files:

index.js, Assets/interactionModelSchema.json

### Setup

I have explained the setup in brief. More details can be found at: https://developer.amazon.com/en-US/docs/alexa/alexa-skills-kit-sdk-for-nodejs/develop-your-first-skill.html.

1. Create a lambda function and add an Alexa Trigger. Attach a relevant IAM role [1] allowing it to access AWS CloudWatch and DynamoDB (scan, query and putItem).

2. Clone this repository to your computer.

3. Open the terminal, navigate to the directory where the repository has been cloned.
4. Type `npm install`.

5. Compress the files in the directory as a zip archive, which should include the files: index.js, package.json and the folder: node_modules. This is to upload the code and dependencies to the lambda function that we created.

   Note: Make sure that the compression happens without any root directory, i.e., the final compressed zip should not have any root directory.

   I have already compressed the files and the name of this archive is rest-api-core.zip. If you are using the archive that I have created, then the name of the DynamoDB should be `HSTable`. Else if you prefer to compress the files yourself, feel free to change the name of the DynamoDB table by changing the variable `TABLE_NAME` in index.js.

   For more details, refer: https://developer.amazon.com/en-US/docs/alexa/alexa-skills-kit-sdk-for-nodejs/develop-your-first-skill.html.

6. Deploy this package to the Lambda function.

7. Create a DynamoDB table with `Name` as the parition key and `Score` as the sort key. Make sure the name of this table is referenced in the index.js.

8. Go to the AWS Skills Dashboard and create the skill counterpart by following the instructions given in https://developer.amazon.com/en-US/docs/alexa/alexa-skills-kit-sdk-for-nodejs/develop-your-first-skill.html.

9. You can add the interaction schema to the skill as shown in the penultimate screenshot in the screenshots section. Copy and paste the contents of Assets/interactionSchemaModel.json.

10. Test the skill and Enjoy! Refer to the screenshots for sample interactions.

## (Optional) Part-2: roll-dice-restapi

This component is optional. This is to deploy the RESTful API services which can be used to access the high scores posted by users.

## Files

The files required to deploy this component is present in the RESTful API directory.

The output of the code is a cloudformation stack which consist of an API Gateway which is passes the incoming requests to a Lambda function which interacts with the DynamoDB database to fetch the scores.

### Setup

First of all, navigate to the directory RESTful\ API/ roll-dice-restapi
In here, open api-handler/app.js and change the TABLE_NAME to the name of the DynamoDB table that you created earlier (or leave it as it is if you haven't changed the name).

Secondly, open template.yaml in this directory and search for the entry `Role`. Changed the value of the entry to the ARN of the IAM role that you created previously (refer [1]). (This IAM role should have permission to write to CloudWatch and access DynamoDB for scan, query and putItem).

1. Install SAM CLI, and set up the AWS Access Key and Secrets.

2. In the directory RESTful\ API/ roll-dice-restapi, you can either simulate the API locally using `sam local start-api` (requires docker) or can deploy it to AWS as a cloudformation template using the command `sam deploy --guided` or simply `sam deploy`, if you want to proceed with the existing configuration.

3. Go to the API gateway console and test out the APIs. The paths are:

   GET /scores -- Fetch the scores of a particular player by their name (name should be the query parameter here)
   GET /scores/top10 -- Fetch the top 10 scores from the database

   The API paths have been posted in the final screenshot.

# Screenshots

![Alt text](/Screenshots/1.png?raw=true "Starting the game")
![Alt text](/Screenshots/2.png?raw=true "Playing the game")
![Alt text](/Screenshots/3.png?raw=true "Playing the game")
![Alt text](/Screenshots/4.png?raw=true "Playing the game")
![Alt text](/Screenshots/5.png?raw=true "Getting")
![Alt text](/Screenshots/6.png?raw=true "interactionModelSchema.json")
![Alt text](/Screenshots/7.png?raw=true "API Routes")
