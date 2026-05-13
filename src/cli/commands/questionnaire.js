const questionnaireService = require("../services/questionnaire");

function questionnaire(action, value, flags = {}, deps = {}) {
  return questionnaireService.questionnaire(action, value, flags, {
    ...questionnaireService,
    ...deps
  });
}

module.exports = { questionnaire };
