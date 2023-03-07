const Alexa = require("ask-sdk-core");
const AWS = require("aws-sdk");

AWS.config.update({ region: "us-east-1" });
const dyClient = new AWS.DynamoDB.DocumentClient();

//TODO
/**
 * 1. Group the roll dice functionality to one function
 * 2. Do some extra credit task like exposing the API
 * 3. Remember the name between sessions, instead ask name at the beginning
 * 4. Need to Add DyDB code
 * 5. Need to rewrite the prompts
 *6
 *
 */

const TABLE_NAME = "HSTable";
/*
Partitionkey: Name
Sortkey: Score 
*/

/*
In certain cases where the composite key (name, highscore) exists in the dynamoDB database, I just do not update it

*/

const getRandomElement = (arr) => {
  return arr[Math.floor(Math.random() * arr.length)];
};

const getGreetingNugget = () => {
  const greetings = [
    "hello",
    "howdy",
    "yello",
    "hey",
    "bonjour",
    "buenas dias",
    "greetings",
  ];
  return getRandomElement(greetings);
};

const getPositiveNugget = () => {
  const pNuggets = ["Hurray!", "Yay!", "Superb!", "Nice!", "Yippee!", "Great!"];
  return getRandomElement(pNuggets);
};

const getNegativeNugget = () => {
  const nNuggets = ["Oh no!", "Oops!", "Oh, Bummer!", "Ahh!", "Oopsie!"];
  return getRandomElement(nNuggets);
};

const getExitNugget = () => {
  const exits = [
    "Bye!",
    "See ya!",
    "It was nice knowing you!",
    "So long!",
    "Take care!",
  ];

  return getRandomElement(exits);
};

const addToHighScoreList = async (name, score) => {
  try {
    const params = {
      TableName: TABLE_NAME,
      Item: {
        Name: name,
        Score: score,
      },
    };
    const result = await dyClient.put(params).promise();
    console.log(result);
    return (
      getPositiveNugget() + ". I have added your score to the high scores list!"
    );
  } catch (err) {
    console.log(err);
    return (
      getNegativeNugget() +
      ". Unfortunately, there was some error in adding the score."
    );
  }
};

const getTopScores = async () => {
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

    console.log(result);

    result.Items.sort((a, b) => b.Score - a.Score);

    let message = "";

    //console.log(result);

    const limit = result.Items.length < 10 ? result.Items.length : 10;

    for (let i = 0; i < limit; i++) {
      message += `${result.Items[i].Name}: ${result.Items[i].Score}, `;
    }

    return message;
  } catch (err) {
    console.log(err);
    return ", something went wrong";
  }
};

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    const speechText =
      getGreetingNugget() +
      ". Welcome to Dice Roll game. You can say 'roll dice' to start the game or say 'top scores' to listen to the top 10 scores. What would you like to do?";
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    //INIT
    if (!sessionAttributes.score) {
      sessionAttributes.score = 0;
    }
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const RollDiceIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "RollDiceIntent"
    );
  },
  handle(handlerInput) {
    const sessionAttributes =
      handlerInput.attributesManager.getSessionAttributes();

    const name = handlerInput.requestEnvelope.request.intent.slots.name.value;

    if (!name) {
      speechText =
        "Sweet. In my tradition, we announce our name by saying Woo-hoo and then our name. Like this, 'Woo-hoo, I am Alexa'. Now it is your turn to tell your name according to my tradition!";
      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    }

    if (sessionAttributes.name) sessionAttributes.score = 0;

    if (name) sessionAttributes.name = name;
    else sessionAttributes.name = "guest";

    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    return ContinueGameIntentHandler.handle(handlerInput, true);
  },
};

const ContinueGameIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "ContinueGameIntent"
    );
  },
  handle(handlerInput, chainedIntent = false) {
    const sessionAttributes =
      handlerInput.attributesManager.getSessionAttributes();

    let roll = Math.floor(Math.random() * 6) + 1;
    let score = sessionAttributes.score + roll;

    let speechText =
      getPositiveNugget() +
      `. You rolled a ${roll}. Your score is now ${score}. Say 'continue' if you want to roll again. Else say 'stop playing' to quit`;

    if (roll === 1) {
      speechText =
        getNegativeNugget() +
        `. You rolled a ${roll}. Your score is reset to 0. Say 'continue' if you want to roll again. Else say 'stop playing' to quit`;
      score = 0;
    }

    if (chainedIntent && sessionAttributes.gameInProgress) {
      speechText =
        getNegativeNugget() +
        `. Okay, is ${sessionAttributes.name} your name? Ugh, sorry, to err is to human. Let's reset your score ` +
        speechText;
    }

    if (chainedIntent && !sessionAttributes.gameInProgress) {
      speechText =
        getGreetingNugget() +
        `. Welcome ${sessionAttributes.name}. Thank you for telling me your name. Yay!. ` +
        speechText;
      sessionAttributes.gameInProgress = true;
    }

    sessionAttributes.score = score;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const EndGameIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "EndGameIntent"
    );
  },
  handle(handlerInput, chainedIntent = false) {
    const sessionAttributes =
      handlerInput.attributesManager.getSessionAttributes();
    let speechText;
    sessionAttributes.highScore = sessionAttributes.score;
    sessionAttributes.score = 0;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    speechText =
      "Do you want to add your name to the high score list? If yes, please say 'do add my score'. Else say 'do not add me to the high score list'";
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const AddScoreIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "AddScoreIntent"
    );
  },
  async handle(handlerInput) {
    const sessionAttributes =
      handlerInput.attributesManager.getSessionAttributes();
    let speechText;
    // console.log(handlerInput.requestEnvelope.request.intent.slots);
    // console.log(
    //   handlerInput.requestEnvelope.request.intent.slots["AddToHighScore"].value
    // );
    const addToHighScore =
      handlerInput.requestEnvelope.request.intent.slots["AddToHighScore"].value;

    if (addToHighScore == "do") {
      const name = sessionAttributes.name;
      const highScore =
        handlerInput.attributesManager.getSessionAttributes().highScore;

      const dbMessage = await addToHighScoreList(name, highScore);

      speechText =
        getExitNugget() +
        `. Thanks for playing, ${name}. Your score is ${highScore}. ${dbMessage}.`;
      // code to add name and score to high scores list in database goes here
    } else {
      speechText =
        getExitNugget() + ". Thanks for playing. Hope I see you again!";
    }
    return handlerInput.responseBuilder.speak(speechText).getResponse();
  },
};

const HighScoresIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "HighScoresIntent"
    );
  },
  async handle(handlerInput) {
    const topScorers = await getTopScores();
    const speechText =
      "Here are the list of the folks who kicked butt! " +
      topScorers +
      `. ${getExitNugget()}, hope we meet again!`;
    return handlerInput.responseBuilder.speak(speechText).getResponse();
  },
};

const AMAZON_HelpIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.HelpIntent"
    );
  },
  handle(handlerInput) {
    const speechText = "Glad that you asked me for help";
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const AMAZON_StopIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      (handlerInput.requestEnvelope.request.intent.name ===
        "AMAZON.StopIntent" ||
        handlerInput.requestEnvelope.request.intent.name ===
          "AMAZON.CancelIntent")
    );
  },
  handle(handlerInput) {
    const speechText =
      "Thanks for playing! Do you want to add your score to the high score list?";
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const AMAZON_FallbackIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name ===
        "AMAZON.FallbackIntent"
    );
  },
  handle(handlerInput) {
    const speechText =
      "Oh shoot! I didn't quite get what you were trying to say. Would you be a peach and repeat that please? ";
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const AMAZON_CancelIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "AMAZON.CancelIntent"
    );
  },
  handle(handlerInput) {
    const speechText =
      "Thanks for playing! Do you want to add your score to the high score list?";
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const SessionEndedRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "SessionEndedRequest";
  },
  handle(handlerInput) {
    // TODO: Cleanup Tasks
    return handlerInput.responseBuilder.getResponse();
  },
};

const ErrorHandler = {
  canHandle() {
    return true;
  },
  handle(handlerInput, error) {
    console.log(`Error handled: ${error.message}`);

    const speechText =
      "Sorry, I encountered an error. To err is to robot, ain't it? Please try again later.";
    return handlerInput.responseBuilder.speak(speechText).getResponse();
  },
};

let skill;

exports.handler = async function (event, context) {
  console.log(`REQUEST++++${JSON.stringify(event)}`);
  if (!skill) {
    skill = Alexa.SkillBuilders.custom()
      .addRequestHandlers(
        LaunchRequestHandler,
        RollDiceIntentHandler,
        ContinueGameIntentHandler,
        EndGameIntentHandler,
        HighScoresIntentHandler,
        AddScoreIntentHandler,
        AMAZON_HelpIntentHandler,
        AMAZON_StopIntentHandler,
        AMAZON_CancelIntentHandler,
        AMAZON_FallbackIntentHandler,
        SessionEndedRequestHandler
      )
      .addErrorHandlers(ErrorHandler)
      .create();
  }

  const response = await skill.invoke(event, context);
  console.log(`RESPONSE++++${JSON.stringify(response)}`);

  return response;
};
