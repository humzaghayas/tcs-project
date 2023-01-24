/* eslint-disable no-console */
const functions = require('firebase-functions');

const tcsOrderCreation = async (req, res) => {
  if (!req.body || !req.body.resource || !req.body.resource) {
    console.log('keep alive call');
    return res.status(200).end();
  }

  console.log('req.body', req.body);
  const order = req.body.resource.obj;

  if (order.type === 'Order') {
    const sumOfallProdQty = order.customLineItems
      .map(cli => cli.quantity)
      .reduce((partialSum, q) => partialSum + q, 0);

    if (sumOfallProdQty < 4) {
      return res.status(400).json({
        errors: [
          {
            code: `FailedValidation`,
            message: `Cart should contain atleast 4 products to be able to checkout!`
          }
        ]
      });
    }
  }

  console.log('Success!');
  return res.status(200).end();
};

module.exports = {
  tcsOrderCreate: functions.https.onRequest(tcsOrderCreation),
  tcsOrderCreation
};
