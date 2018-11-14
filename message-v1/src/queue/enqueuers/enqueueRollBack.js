const kue = require("kue");
let queue = require('../../../messagesIndex');
const debug = require("debug")("message:queue");

module.exports = function(messageParams) {
  let job3 = queue
    .create("roll back", {
      jobWithAproval: messageParams
    })
    .ttl(6000)
    .save(function(err) {
      if (!err) debug("saved in queue job: ", job3.id, job3.type);
    });
};
