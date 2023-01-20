/* eslint-disable no-console */
const functions = require('firebase-functions');

const tcsOrderCreation = async (req, res) => {
  if (!req.body || !req.body.resource || !req.body.resource) {
    console.log('keep alive call');
    return res.status(200).json({ result: 'ok' });
  }

  const order = req.body.resource.obj;

  res.status(200).json({ result: 'ok' });
  
};

module.exports = {
  tcsOrderCreate: functions.https.onRequest(tcsOrderCreation),
  tcsOrderCreation
};
