let queue = require('../../../creditIndex')
const updateCreditTransaction = require("../../transactions/updateCredit");
const Message = require("../../models/message");

function rollBackCredit(job, done) {
  const MessageModel = Message();
  let message = new MessageModel(job.data.jobWithAproval);

  return updateCreditTransaction(
    {
      amount: { $gte: 1 },
      location: message.location.name
    },
    {
      $inc: { amount: +message.location.cost }
    },
    function(doc, error) {
      if (error) {
        done(error)
        return error;
      } else {
        done()
        console.log("ROLLBACK SUCCESFUL!");
      }
    }
  );
}

queue.process("roll back", function(job, done) {
  rollBackCredit(job, done);
});
