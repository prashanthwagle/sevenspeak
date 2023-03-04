const Alexa = require("ask-sdk-core");

const LaunchRequestHandler = {
  canHandle(handlerInput) {
    return handlerInput.requestEnvelope.request.type === "LaunchRequest";
  },
  handle(handlerInput) {
    const speechText = "Welcome";

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
    const roll = Math.floor(Math.random() * 6) + 1;
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();
    if (roll === 1) {
      sessionAttributes.score = 0;
    } else {
      sessionAttributes.score += roll;
    }

    const speechText = `You rolled a ${roll}. Your current score is ${sessionAttributes.score}. Do you want to continue or end the game?`;

    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt("Do you want to continue or end the game?")
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
    const attributesManager = handlerInput.attributesManager;
    const sessionAttributes = attributesManager.getSessionAttributes();

    const response =
      handlerInput.requestEnvelope.request.intent.slots.continue.value;
    if (response === "continue") {
      const speechText = "Great! Let's roll the dice again.";

      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt("Roll the dice by saying roll.")
        .getResponse();
    } else if (response === "end" || response === "stop") {
      const speechText =
        "Cool, lets end the game. Do you want to add yourself to the high score list?";

      sessionAttributes.gameInProgress = false;

      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt(speechText)
        .getResponse();
    } else {
      const speechText =
        "Sorry, I didn't understand your response. Do you want to continue or end the game?";

      return handlerInput.responseBuilder
        .speak(speechText)
        .reprompt("Do you want to continue or end the game?")
        .getResponse();
    }
  },
};

const EndGameIntentHandler = {
  canHandle(handlerInput) {
    return (
      Alexa.getRequestType(handlerInput.requestEnvelope) === "IntentRequest" &&
      Alexa.getIntentName(handlerInput.requestEnvelope) === "EndGameIntent"
    );
  },
  handle(handlerInput) {
    const speechOutput = "Thanks for playing Dice Roll! Goodbye!";
    return handlerInput.responseBuilder.speak(speechOutput).getResponse();
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
