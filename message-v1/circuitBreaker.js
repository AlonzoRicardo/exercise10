const Brakes = require("brakes");

const options = {
  timeout: 1000,
  threshold: 1,
  waitThreshold: 2,
  circuitDuration: 20000,
  statInterval: 60000
};

const brake = new Brakes(options);

brake.on("failure", snapshot => {
  console.log(`Stats received -> ${snapshot}`);
});

brake.on("circuitClosed", () => {
  console.log('CIRCUIT IS CLOSED');
});
brake.on("circuitOpened", () => {
  console.log('CIRCUIT IS OPEN');
});

brake.on("snapshot", snapshot => {
  console.log(`snapshot: ${JSON.stringify(snapshot)}`);
});

module.exports = brake

