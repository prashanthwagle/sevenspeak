const Alexa = require("ask-sdk-core");

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    const speechText =
      "Welcome to Dice Roll game. You can say roll dice to start the game or ask for the top 10 high scores. What would you like to do?";
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
    const score =
      handlerInput.attributesManager.getSessionAttributes().score || 0;
    const roll = Math.floor(Math.random() * 6) + 1;
    let speechText = `You rolled a ${roll}. `;
    if (roll === 1) {
      speechText += `Your score is reset to 0. `;
      handlerInput.attributesManager.setSessionAttributes({ score: 0 });
    } else {
      const newScore = score + roll;
      speechText += `Your current score is ${newScore}. `;
      handlerInput.attributesManager.setSessionAttributes({ score: newScore });
    }
    speechText += `Do you want to continue?`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(speechText)
      .getResponse();
  },
};

const ContinueGameIntentHandler = {
  canHandle(handlerInput) {
    return (
      handlerInput.requestEnvelope.request.type === "IntentRequest" &&
      handlerInput.requestEnvelope.request.intent.name === "ContinueGameIntent"
    );
  },
  handle(handlerInput) {
    const sessionAttributes =
      handlerInput.attributesManager.getSessionAttributes();

    let roll = Math.floor(Math.random() * 6) + 1;
    let score = sessionAttributes.score + roll;

    let speechText = `You rolled a ${roll}. Your score is now ${score}.`;

    if (roll === 1) {
      speechText = `You rolled a ${roll}. Your score is reset to 0. `;
      score = 0;
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
    const request = handlerInput.requestEnvelope.request;
    return (
      request.type === "IntentRequest" &&
      request.intent.name === "EndGameIntent"
    );
  },
  handle(handlerInput) {
    const speechText = "Do you want to add your name to the high score list?";

    // set session attributes
    const sessionAttributes =
      handlerInput.attributesManager.getSessionAttributes();
    sessionAttributes.score = 0;
    sessionAttributes.addingScore = true;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

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
  handle(handlerInput) {
    const name = handlerInput.requestEnvelope.request.intent.slots.name.value;
    const score = handlerInput.attributesManager.getSessionAttributes().score;
    const speechOutput = `Thanks for playing, ${name}. Your score of ${score} has been added to the high scores list.`;

    return handlerInput.responseBuilder.speak(speechOutput).getResponse();
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
    const speechOutput =
      "Here are the list of the top 10 folks who kicked butt!";
    return handlerInput.responseBuilder.speak(speechOutput).getResponse();
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
    const speechOutput = "Welcome to the Roll Dice game! ---- ";
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
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
    const speechOutput =
      "Thanks for playing! Do you want to add your score to the high score list?";
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
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
    const speechOutput =
      "Oh shoot! I didn't quite get what you were trying to say. Would you be a peach and repeat that please? ";
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
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
    const speechOutput =
      "Thanks for playing! Do you want to add your score to the high score list?";
    return handlerInput.responseBuilder
      .speak(speechOutput)
      .reprompt(speechOutput)
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

    const speechOutput =
      "Sorry, I encountered an error. Please try again later.";
    return handlerInput.responseBuilder.speak(speechOutput).getResponse();
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
        AddScoreIntentHandler,
        HighScoresIntentHandler,
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
