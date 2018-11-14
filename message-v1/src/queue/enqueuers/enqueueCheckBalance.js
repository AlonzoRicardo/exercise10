const kue = require("kue");
let queue = require('../../../messagesIndex');
const uuidv4 = require("uuid/v4");
const debug = require("debug")("message:queue");
const brake = require('../../../circuitBreaker');
module.exports = function(req, res) {
  let uniqueId = uuidv4();
  let messObj = req.body;
  messObj.uuid = uniqueId;
  let job = queue
    .create("check balance", {
      messObj
    })
    .ttl(6000)
    .save(function(err) {
      if (!err && !brake.isOpen()) {
        res.send(`MessageId: ${job.data.messObj.uuid}`)
      } else if(brake.isOpen()) {
        res.send(`The service is currently experiencing some issues, your request may be delayed! \n MessageId: ${job.data.messObj.uuid}`)
      };
    });
};

queue.on("job enqueue", function(id, type) {
  debug("Job %s got queued of type %s", id, type);
});
