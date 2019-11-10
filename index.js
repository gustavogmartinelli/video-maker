const robots = {
  text: require("./robots//text.js"),
  state: require("./robots/state.js"),
  input: require("./robots/input.js")
};

async function start() {

  robots.input();
  await robots.text();
}

start();
