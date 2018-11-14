const http = require("http");
const saveMessage = require("../clients/saveMessage");
const debugError = require("debug")("message:error");
const debugTimeout = require("debug")("message:timeout");
const random = n => Math.floor(Math.random() * Math.floor(n));
const braker = require('../../circuitBreaker')
module.exports = function(msgData, done) {
  const entireMsg = msgData;
  const body = JSON.stringify(msgData.job);

  if (msgData.isThereBalance) {
    const postOptions = {
      // host: "exercise6_messageapp_1",
      // host: "messageapp",
      host: "localhost",
      port: 3000,
      path: "/message",
      method: "post",
      json: true,
      headers: {
        "Content-Type": "application/json",
        "Content-Length": Buffer.byteLength(body)
      }
    };

    if (msgData.isThereBalance) {
      function asyncFunction(postOptions) {
        return new Promise(function(resolve, reject) {
          let postReq = http.request(postOptions);

          postReq.on("response", postRes => {
            if (postRes.statusCode === 200) {
              saveMessage(
                {
                  destination: entireMsg.job.destination,
                  body: entireMsg.job.body,
                  uuid: entireMsg.job.uuid,
                  status: "OK"
                },
                function(_result, error) {
                  if (error) {
                    debugError(error);
                  } else {
                    console.log(postRes.body);
                  }
                }
              );
              return resolve('resolved succesfully');
            } else {
              debugError("Error while sending message");
              saveMessage(
                {
                  destination: entireMsg.job.destination,
                  body: entireMsg.job.body,
                  uuid: entireMsg.job.uuid,
                  status: "ERROR"
                },
                () => {
                  debugError("Internal server error: SERVICE ERROR");
                }
              );
              return reject("Error while sending message");
            }
          });

          postReq.setTimeout(random(6000));

          postReq.on("timeout", () => {
            debugTimeout("Timeout Exceeded!");
            postReq.abort();

            saveMessage(
              {
                destination: entireMsg.job.destination,
                body: entireMsg.job.body,
                uuid: entireMsg.job.uuid,
                status: "TIMEOUT"
              },
              () => {
                debugTimeout("Internal server error: TIMEOUT");
              }
            );
            return reject(new Error("Timeout error"));
          });

          postReq.on("error", err => {
            console.log(err, "<== error detected here");
          });
          postReq.write(body);
          postReq.end();
          done();
        });
      }
    }
    const circuit = braker.slaveCircuit(asyncFunction);
    circuit
      .exec(postOptions)
      .then(result => {
        console.log(`result: ${result}`);
      })
      .catch(err => {
        console.error(`${err}`);
      });
  } else {
    debugError("No credit error");
  }
};
