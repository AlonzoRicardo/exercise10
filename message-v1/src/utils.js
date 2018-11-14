const debug = require("debug")("util");
//const sendMessage = require("./controllers/sendMessage");
const os = require("os");
const hostname = os.hostname();

function cleanClone(document) {
  const copy = Object.assign({}, document._doc);
  delete copy._id;
  delete copy.__v;
  return copy;
}

function getHostName(req, res) {
  debug("Health Check 200");
  res.send(hostname);
}
 
/* function reEnqueueSend(job) {
  sendMessage(job);
}  */

function getApiVersion(req, res) {
  res.send(`service-v1 / ${hostname}`);
}
console.log(cleanClone);
module.exports = {
  cleanClone,
  getHostName,
  //reEnqueueSend,
  getApiVersion
};
