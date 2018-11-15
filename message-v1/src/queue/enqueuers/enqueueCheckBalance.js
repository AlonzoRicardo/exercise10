const kue = require("kue");
let queue = require("../../../messagesIndex");
const uuidv4 = require("uuid/v4");
const debug = require("debug")("message:queue");
const brake = require("../../../circuitBreaker");
let isQueueBusy = false;

module.exports = function(req, res) {
  if (isQueueBusy === false) {
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
          res.send(`MessageId: ${job.data.messObj.uuid}`);
        } else if (brake.isOpen()) {
          res.send(
            `The service is currently experiencing some issues, your request may be delayed! \n MessageId: ${
              job.data.messObj.uuid
            }`
          );
        }
      });
  } else {
    res.send(`The service is down, try again later.`);
  }
};

queue.on("job enqueue", function(id, type) {
  queue.inactiveCount(function(err, total) {
    if (total > 10) {
      debug("We need some back pressure here, from enqueue", total);
      isQueueBusy = true;
    } else {
      debug("Job %s got queued of type %s", id, type);
    }
  });
});

queue.on("job complete", function(id, result) {
  queue.inactiveCount(function(err, total) {
    if (total <= 5) {
      debug("Renabling service..., from job complete", total);
      isQueueBusy = false;
    } else {
      debug("We need some back pressure here, from job complete", total);
    }
  });
});
