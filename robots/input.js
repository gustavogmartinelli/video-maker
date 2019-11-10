const readline = require("readline-sync");

const state = require("./state");

function robot() {
  const content = {
    maximumSetences: 7
  };

  content.searchTerm = askAndReturnSearchTerm();
  content.language = askReturnLanguageChoice();
  content.prefix = askAndReturnPrefix();
  state.save(content);

  function askAndReturnSearchTerm() {
    return readline.question("Type a Wikipedia search term: ");
  }

  function askReturnLanguageChoice(){
    const languages = ["Português", "English"];
    const selectedLanguageIndex = readline.keyInSelect(languages);
    const selectedLanguageText = languages[selectedLanguageIndex];

    return selectedLanguageText;
  }

  function askAndReturnPrefix() {
    const prefixes = ["Whos is", "What is", "The history of"];
    const selectedPrefixIndex = readline.keyInSelect(prefixes);
    const selectedPrefixText = prefixes[selectedPrefixIndex];

    return selectedPrefixText;
  }
}

module.exports = robot;
