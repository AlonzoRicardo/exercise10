const getMessageStatusById = require("../clients/getMessageStatusById");

module.exports = function(req, res) {
  let conditions = {"uuid": req.params.id}
  getMessageStatusById(conditions).then(mes => {
    res.json(mes);
  });
};
