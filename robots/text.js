const algorithmia = require("algorithmia");
const sentenceBoundaryDetection = require("sbd");

const algorithmiaKey = require('../credentials/algorithmia.json').apikey;
const watsonApiKey = require('../credentials/watson_nlu.json').apikey;
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js');
const state = require('./state.js');


const nlu = new NaturalLanguageUnderstandingV1({
  iam_apikey: watsonApiKey,
  version: '2018-04-05',
  url: 'https://gateway.watsonplatform.net/natural-language-understanding/api/'
})


async function robot() {
  const content = state.load();
  await fecthContenctFromWikipedia(content);
  sanitizeContent(content);
  breakContentIntoSentences(content);
  limitMaximumSentences(content);
  await fecthKeywordsOfAllSentences(content);
  state.save(content);
  

  async function fecthContenctFromWikipedia(content) {
    const algorithmiaAuthenticaded = algorithmia(algorithmiaKey);
    const wikipediaAlgorithm = algorithmiaAuthenticaded.algo(
      "web/WikipediaParser/0.1.2?timeout=300"
    );
    const wikipediaResponse = await wikipediaAlgorithm.pipe(content.searchTerm);
    const wikipediaContent = wikipediaResponse.get();

    content.sourceContentOriginal = wikipediaContent.content;
  }

  function sanitizeContent(content) {
    const withoutBlankLinesAndMarkDown = removeBlankLinesAndMarkDown(
      content.sourceContentOriginal
    );
    const withoutDatesParentheses = removeDatesInParentheses(
      withoutBlankLinesAndMarkDown
    );

    content.sourceContentSanitized = withoutDatesParentheses;

    function removeBlankLinesAndMarkDown(text) {
      const allLines = text.split("\n");

      const withoutBlankLinesAndMarkDown = allLines.filter(line => {
        if (line.trim().length === 0 || line.trim().startsWith("=")) {
          return false;
        }

        return true;
      });
      return withoutBlankLinesAndMarkDown.join(" ");
    }

    function removeDatesInParentheses(text) {
      return text
        .replace(/\((?:\([^()]*\)|[^()])*\)/gm, "")
        .replace(/  /g, " ");
    }
  }

  function breakContentIntoSentences(content) {
    content.sentences = [];

    const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized);
    sentences.forEach((sentences) => {
        content.sentences.push({
          text: sentences,
          keywords: [],
          images: []
        });      
    });
  }

  function limitMaximumSentences(content) {
    content.sentences = content.sentences.slice(0, content.maximumSetences);
  }

  async function fecthKeywordsOfAllSentences(content) {
    for (const sentence of content.sentences){
      sentence.keywords = await fecthWatsonAndReturnKeywords(sentence.text);
    }
  }

  async function fecthWatsonAndReturnKeywords(sentence) {
    return new Promise((resolve, reject) => {
      nlu.analyze({
        text: sentence,
        features: {
          keywords: {}
        }
      }, (error, response) => {
       if(error) {
         throw error;
       }
  
       const keywords = response.keywords.map((keyword) => {
            return keyword.text;     
        });
          
        resolve(keywords)
      });
    });
  }
  

}
module.exports = robot;
