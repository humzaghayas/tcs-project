const chai = require('chai');
const assert = chai.assert;
const sinon = require('sinon');
const admin = require('firebase-admin');
const test = require('firebase-functions-test')();

const resource = {
  obj: {
    type: 'Order',
    id: '8068a82b-7cd0-45eb-97f8-32a4e6dfa698',
    version: 1,
    lastMessageSequenceNumber: 1,
    createdAt: '2023-01-23T16:23:17.070Z',
    lastModifiedAt: '2023-01-23T16:23:17.070Z',
    lastModifiedBy: {
      clientId: 'YKOf4i-uVrPzW_rJumZgPXyF',
      isPlatformClient: false
    },
    createdBy: {
      clientId: 'YKOf4i-uVrPzW_rJumZgPXyF',
      isPlatformClient: false
    },
    totalPrice: {
      type: 'centPrecision',
      currencyCode: 'USD',
      centAmount: 11000,
      fractionDigits: 2
    },
    taxedPrice: {
      totalNet: {
        type: 'centPrecision',
        currencyCode: 'USD',
        centAmount: 11000,
        fractionDigits: 2
      },
      totalGross: {
        type: 'centPrecision',
        currencyCode: 'USD',
        centAmount: 11000,
        fractionDigits: 2
      },
      taxPortions: [
        {
          rate: 0,
          amount: {
            type: 'centPrecision',
            currencyCode: 'USD',
            centAmount: 0,
            fractionDigits: 2
          },
          name: 'Zero_Tax'
        }
      ],
      totalTax: {
        type: 'centPrecision',
        currencyCode: 'USD',
        centAmount: 0,
        fractionDigits: 2
      }
    },
    orderState: 'Open',
    paymentState: 'Pending',
    syncInfo: [],
    returnInfo: [],
    taxMode: 'Platform',
    inventoryMode: 'None',
    taxRoundingMode: 'HalfEven',
    taxCalculationMode: 'LineItemLevel',
    origin: 'Customer',
    shippingMode: 'Single',
    shippingAddress: {
      firstName: 'Tom',
      lastName: 'Cruise',
      streetName: 'asasd',
      streetNumber: '32323',
      city: 'new york',
      country: 'US'
    },
    shipping: [],
    lineItems: [],
    customLineItems: [
      {
        totalPrice: {
          type: 'centPrecision',
          currencyCode: 'USD',
          centAmount: 11000,
          fractionDigits: 2
        },
        id: '74efc84f-1620-4130-bb0f-4fee62c3676d',
        name: {
          de: 'productA',
          en: 'productA'
        },
        money: {
          type: 'centPrecision',
          currencyCode: 'USD',
          centAmount: 5500,
          fractionDigits: 2
        },
        slug: 'productA',
        quantity: 2,
        discountedPricePerQuantity: [],
        taxCategory: {
          typeId: 'tax-category',
          id: 'bf339e16-9c38-4b80-8202-5bb0063443de'
        },
        taxRate: {
          name: 'Zero_Tax',
          amount: 0,
          includedInPrice: false,
          country: 'US',
          id: 'IMaAGMh6',
          subRates: []
        },
        state: [
          {
            quantity: 2,
            state: {
              typeId: 'state',
              id: '686cefb0-e1ad-4b26-b283-a39051a43f82'
            }
          }
        ],
        taxedPrice: {
          totalNet: {
            type: 'centPrecision',
            currencyCode: 'USD',
            centAmount: 11000,
            fractionDigits: 2
          },
          totalGross: {
            type: 'centPrecision',
            currencyCode: 'USD',
            centAmount: 11000,
            fractionDigits: 2
          },
          totalTax: {
            type: 'centPrecision',
            currencyCode: 'USD',
            centAmount: 0,
            fractionDigits: 2
          }
        },
        perMethodTaxRate: [],
        priceMode: 'Standard'
      }
    ],
    transactionFee: true,
    discountCodes: [],
    directDiscounts: [],
    cart: {
      typeId: 'cart',
      id: 'bb44c90f-7bc7-4ae3-ba76-b6a43746fc47'
    },
    itemShippingAddresses: [],
    refusedGifts: []
  }
};

describe('Cloud Functions', () => {
  let tcsFunctions, adminInitStub;

  before(() => {
    adminInitStub = sinon.stub(admin, 'initializeApp');
    tcsFunctions = require('../index');
    // [END stubAdminInit]
  });

  after(() => {
    adminInitStub.restore();
    test.cleanup();
  });

  describe('tcsOrderCreate', () => {
    it('should return a 400 Ok!', done => {
      const refParam = '/tcsOrderCreate';
      const pushParam = { original: 'input' };
      const refStub = sinon.stub();
      const pushStub = sinon.stub();
      refStub.withArgs(refParam).returns({ push: pushStub });
      pushStub.withArgs(pushParam).returns(Promise.resolve({ ref: 'new_ref' }));

      const req = { body: { resource } };
      const res = {
        redirect: (code, url) => {
          assert.equal(code, 200);
          assert.equal(url, 'new_ref');
          done();
        },
        status: code => {
          return {
            json: errors => {
              assert.equal(code, 400);
              console.log('e', errors);
              done();
            }
          };
        }
      };
      tcsFunctions.tcsOrderCreate(req, res);
      // [END assertHTTP]
    });
  });
});
