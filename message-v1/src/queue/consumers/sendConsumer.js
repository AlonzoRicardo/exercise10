const kue = require("kue");
let queue = require("../../../messagesIndex");
const sendMessage = require("../../controllers/sendMessage");
const braker = require("../../../circuitBreaker");

function reviveWorker(ctx) {
  setTimeout(() => {
    ctx.resume();
  }, 20000);
}

function checkIfOpened (ctx) {
  if(braker.isOpen()) {
    reviveWorker(ctx);
    ctx.pause();
  } 
}

queue.process("save&send", function(job, ctx, done) {
  checkIfOpened(ctx);
  sendMessage(job.data, done);
});