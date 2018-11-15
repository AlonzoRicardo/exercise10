let queue = require('../../../creditIndex')
const addToQ = require("../enqueuers/enqueueSendMessage");
const Message = require("../../models/message");
const getCredit = require("../../clients/getCredit");
const updateCreditTransaction = require("../../transactions/updateCredit");
const debugError = require("debug")("credit:error");

function cb(_result, error) {
  if (error) {
    debugError(error);
  }
}


function checkBalance(job, done) {
  return getCredit().then(result => {
    current_credit = result[0].amount;
    if (current_credit > 0) {
      return true;
    } else {
      done('err')
      return false;
    }
  });
}


function decreaseBalance(job, enoughBalance, done) {
  const MessageModel = Message();
  let message = new MessageModel(job.data.messObj);
  return updateCreditTransaction(
    {
      amount: { $gte: 1 },
      location: message.location.name
    },
    {
      $inc: { amount: -message.location.cost }
    },
    function(doc, error) {
      if (error) {
        return cb(undefined, error);
      } else if (doc == undefined) {
        let error = "Not enough credit";
        debugError(error);
        cb(undefined, error);
      } else {
        done();
        addToQ(job, enoughBalance);
      }
    }
  );
}


queue.process("check balance", function(job, done) {
  let promise = Promise.resolve(checkBalance(job, done));
  promise
    .then(response => {
      if (response) decreaseBalance(job, response, done);
    })
    .catch(err => {
      debugError(err);
    });
});
