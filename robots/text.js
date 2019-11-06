const algorithmia = require("algorithmia");
const algorithmiaKey = require("../credentials/algorithmia.json").apikey;
const sentenceBoundaryDetection = require("sbd");

async function robot(content) {
  await fecthContenctFromWikipedia(content);
  sanitizeContent(content);
  breakContentIntoSentences(content);

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
}
module.exports = robot;
