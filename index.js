const Alexa = require("ask-sdk-core");

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
    const sessionAttributes =
      handlerInput.attributesManager.getSessionAttributes();

    const name = handlerInput.requestEnvelope.request.intent.slots.name.value;

    if (!name) {
      speechText =
        "In my tradition, we announce our name by saying Woo-hoo and then our name. Like this, 'Woo-hoo, I am Alexa'. Now it is your turn to tell your name according to my tradition!";
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

    let speechText = `You rolled a ${roll}. Your score is now ${score}. Do you want to continue?`;

    if (roll === 1) {
      speechText = `You rolled a ${roll}. Your score is reset to 0. If you want to continue, say yes, else say no`;
      score = 0;
    }

    if (chainedIntent && !sessionAttributes.gameInProgress) {
      speechText =
        `Welcome ${sessionAttributes.name}. Thank you for telling me your name. Yay!. ` +
        speechText;
      sessionAttributes.gameInProgress = true;
    }

    if (chainedIntent && sessionAttributes.gameInProgress) {
      speechText =
        `Oh, okay, is ${sessionAttributes.name} your name? Ugh, sorry, to err is to human. Let's reset your score ` +
        speechText;
    }

    sessionAttributes.score = score;
    handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
    return handlerInput.responseBuilder
      .speak(speechText)
      .reprompt(
        "Do you want to continue playing? If you do, say continue, else say end game"
      )
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
      "Do you want to add your name to the high score list? If yes, please say 'add to high score'. Else say 'do not add to high score'";
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
    const sessionAttributes =
      handlerInput.attributesManager.getSessionAttributes();
    let speechOutput;
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
      speechOutput = `Thanks for playing, ${name}. Your score of ${highScore} has been added to the high scores list.`;
      // code to add name and score to high scores list in database goes here
    } else {
      speechOutput = "Thanks for playing. Hope I see you again!";
    }
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
