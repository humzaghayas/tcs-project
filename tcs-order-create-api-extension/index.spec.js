const { b2bOrderCreation } = require('.');

jest.mock('./services/commercetools', () => ({
  getEmployeeById: id =>
    id === 'customerId1'
      ? Promise.resolve({
          id: 'customerId1',
          email: 'customer@email.com',
          custom: {
            fields: {
              roles: ['b2b-company-employee'],
              amountExpent: {
                centAmount: 100000,
                fractionDigits: 2,
                currencyCode: 'USD'
              }
            }
          }
        })
      : Promise.resolve({
          id,
          email: 'customer@email.com',
          custom: {
            fields: {
              roles: ['b2b-company-employee'],
              amountExpent: {
                centAmount: 0,
                fractionDigits: 2,
                currencyCode: 'USD'
              }
            }
          }
        })
}));
jest.mock('./services/companies', () => ({
  getCompany: id => {
    if (id === 'companyId1') {
      return Promise.resolve({
        id: 'companyId1',
        budget: [
          {
            rol: 'b2b-company-employee',
            amount: {
              centAmount: 200001,
              fractionDigits: 2,
              currencyCode: 'USD'
            }
          }
        ],
        requiredApprovalRoles: [
          {
            rol: 'b2b-company-employee',
            amount: {
              centAmount: 10,
              fractionDigits: 0
            }
          }
        ],
        approverRoles: []
      });
    } else if (id === 'withoutRequiredApprovalAmount') {
      return {
        id: 'companyId1',
        requiredApprovalRoles: [
          {
            rol: 'b2b-company-employee',
            amount: {
              centAmount: 10,
              fractionDigits: 0
            }
          }
        ],
        approverRoles: []
      };
    } else if (id === 'withRules') {
      return Promise.resolve({
        id: 'companyId1',
        budget: [
          {
            rol: 'b2b-company-employee',
            amount: {
              centAmount: 200001,
              fractionDigits: 2,
              currencyCode: 'USD'
            }
          }
        ],
        requiredApprovalRoles: [
          {
            rol: 'b2b-company-employee',
            amount: {
              centAmount: 10,
              fractionDigits: 0
            }
          }
        ],
        approverRoles: [],
        rules: [
          {
            value: '',
            parsedValue: `{"any":[{"operator":"greaterThanInclusive","value":10000,"fact":"totalPrice","path":"$.centAmount"},{"operator":"contains","value":"b2b-company-other","fact":"roles"}]}`
          }
        ]
      });
    }
    return Promise.resolve({
      id: 'other-company',
      approverRoles: [],
      requiredApprovalRoles: [
        {
          rol: 'other',
          amount: {
            centAmount: 10,
            fractionDigits: 0
          }
        }
      ]
    });
  }
}));

describe('b2b-order-create-api-extension', () => {
  describe('b2bOrderCreation', () => {
    let req;
    let res;
    let json;

    describe('when there is not custom rules', () => {
      describe('when the over the budget with the new order', () => {
        beforeEach(async () => {
          json = jest.fn();
          res = {
            status: jest.fn(() => ({ json }))
          };
          req = {
            body: {
              resource: {
                obj: {
                  id: 'orderId',
                  customerId: 'customerId1',
                  customerEmail: 'customer@email.com',
                  shippingInfo: {
                    price: {}
                  },
                  createdAt: '',
                  store: {
                    key: 'companyId1'
                  },
                  totalPrice: {
                    centAmount: 100002,
                    fractionDigits: 0
                  }
                }
              }
            }
          };

          await b2bOrderCreation(req, res);
        });
        it('should return the actions array with the transitionState to pending approval', () => {
          expect(json).toHaveBeenCalledWith({
            actions: [
              { action: 'changePaymentState', paymentState: 'Pending' },
              { action: 'changeShipmentState', shipmentState: 'Pending' },
              {
                action: 'transitionState',
                state: { key: 'pendingApproval', typeId: 'state' }
              }
            ]
          });
        });
      });
      describe('when amount is bigger that requiredApprovalAmount', () => {
        describe('when employee requires approval', () => {
          beforeEach(async () => {
            json = jest.fn();
            res = {
              status: jest.fn(() => ({ json }))
            };
            req = {
              body: {
                resource: {
                  obj: {
                    id: 'orderId',
                    customerId: 'employeeId1',
                    customerEmail: 'customer@email.com',
                    shippingInfo: {
                      price: {}
                    },
                    createdAt: '',
                    store: {
                      key: 'companyId1'
                    },
                    totalPrice: {
                      centAmount: 100000,
                      fractionDigits: 0
                    }
                  }
                }
              }
            };

            await b2bOrderCreation(req, res);
          });

          it('should return the actions array with the transitionState to pending approval', () => {
            expect(json).toHaveBeenCalledWith({
              actions: [
                { action: 'changePaymentState', paymentState: 'Pending' },
                { action: 'changeShipmentState', shipmentState: 'Pending' },
                {
                  action: 'transitionState',
                  state: { key: 'pendingApproval', typeId: 'state' }
                }
              ]
            });
          });
        });

        describe('when employee does not require approval', () => {
          beforeEach(async () => {
            json = jest.fn();
            res = {
              status: jest.fn(() => ({ json }))
            };
            req = {
              body: {
                resource: {
                  obj: {
                    id: 'orderId',
                    customerId: 'employeeId1',
                    customerEmail: 'customer@email.com',
                    shippingInfo: {
                      price: {}
                    },
                    createdAt: '',
                    store: {
                      key: 'other-company'
                    },
                    totalPrice: {
                      centAmount: 100000,
                      fractionDigits: 0
                    }
                  }
                }
              }
            };

            await b2bOrderCreation(req, res);
          });

          it('should return the actions array with the transitionState to confirmed', () => {
            expect(json).toHaveBeenCalledWith({
              actions: [
                { action: 'changePaymentState', paymentState: 'Pending' },
                { action: 'changeShipmentState', shipmentState: 'Pending' },
                { action: 'changeOrderState', orderState: 'Confirmed' },
                {
                  action: 'transitionState',
                  state: { key: 'confirmed', typeId: 'state' }
                }
              ]
            });
          });
        });
      });
      describe('when amount is not bigger that requiredApprovalAmount', () => {
        describe('when employee requires approval', () => {
          beforeEach(async () => {
            json = jest.fn();
            res = {
              status: jest.fn(() => ({ json }))
            };
            req = {
              body: {
                resource: {
                  obj: {
                    id: 'orderId',
                    customerId: 'employeeId1',
                    customerEmail: 'customer@email.com',
                    shippingInfo: {
                      price: {}
                    },
                    createdAt: '',
                    store: {
                      key: 'companyId1'
                    },
                    totalPrice: {
                      centAmount: 1,
                      fractionDigits: 0
                    }
                  }
                }
              }
            };

            await b2bOrderCreation(req, res);
          });

          it('should return the actions array with the transitionState to confirmed', () => {
            expect(json).toHaveBeenCalledWith({
              actions: [
                { action: 'changePaymentState', paymentState: 'Pending' },
                { action: 'changeShipmentState', shipmentState: 'Pending' },
                { action: 'changeOrderState', orderState: 'Confirmed' },
                {
                  action: 'transitionState',
                  state: { key: 'confirmed', typeId: 'state' }
                }
              ]
            });
          });
        });
      });

      describe('when the company has not defined the required approval amount', () => {
        beforeEach(async () => {
          json = jest.fn();
          res = {
            status: jest.fn(() => ({ json }))
          };
          req = {
            body: {
              resource: {
                obj: {
                  id: 'orderId',
                  customerId: 'employeeId1',
                  customerEmail: 'customer@email.com',
                  shippingInfo: {
                    price: {}
                  },
                  createdAt: '',
                  store: {
                    key: 'withoutRequiredApprovalAmount'
                  },
                  totalPrice: {
                    centAmount: 1,
                    fractionDigits: 0
                  }
                }
              }
            }
          };

          await b2bOrderCreation(req, res);
        });

        it('should return the actions array with the transitionState to confirmed', () => {
          expect(json).toHaveBeenCalledWith({
            actions: [
              { action: 'changePaymentState', paymentState: 'Pending' },
              { action: 'changeShipmentState', shipmentState: 'Pending' },
              { action: 'changeOrderState', orderState: 'Confirmed' },
              {
                action: 'transitionState',
                state: { key: 'confirmed', typeId: 'state' }
              }
            ]
          });
        });
      });
    });
    describe('when there is custom rules', () => {
      describe('when it satisfies the conditions', () => {
        beforeEach(async () => {
          json = jest.fn();
          res = {
            status: jest.fn(() => ({ json }))
          };
          req = {
            body: {
              resource: {
                obj: {
                  id: 'orderId',
                  customerId: 'employeeId1',
                  customerEmail: 'customer@email.com',
                  shippingInfo: {
                    price: {}
                  },
                  createdAt: '',
                  store: {
                    key: 'withRules'
                  },
                  totalPrice: {
                    centAmount: 100002,
                    fractionDigits: 0
                  }
                }
              }
            }
          };

          await b2bOrderCreation(req, res);
        });

        it('should return the actions array with the transitionState to pending approval', () => {
          expect(json).toHaveBeenCalledWith({
            actions: [
              { action: 'changePaymentState', paymentState: 'Pending' },
              { action: 'changeShipmentState', shipmentState: 'Pending' },
              {
                action: 'transitionState',
                state: { key: 'pendingApproval', typeId: 'state' }
              }
            ]
          });
        });
      });

      describe('when it does not satisfy the conditions', () => {
        beforeEach(async () => {
          json = jest.fn();
          res = {
            status: jest.fn(() => ({ json }))
          };
          req = {
            body: {
              resource: {
                obj: {
                  id: 'orderId',
                  customerId: 'employeeId1',
                  customerEmail: 'customer@email.com',
                  shippingInfo: {
                    price: {}
                  },
                  createdAt: '',
                  store: {
                    key: 'companyId1'
                  },
                  totalPrice: {
                    centAmount: 1,
                    fractionDigits: 0
                  }
                }
              }
            }
          };

          await b2bOrderCreation(req, res);
        });

        it('should return the actions array with the transitionState to confirmed', () => {
          expect(json).toHaveBeenCalledWith({
            actions: [
              { action: 'changePaymentState', paymentState: 'Pending' },
              { action: 'changeShipmentState', shipmentState: 'Pending' },
              { action: 'changeOrderState', orderState: 'Confirmed' },
              {
                action: 'transitionState',
                state: { key: 'confirmed', typeId: 'state' }
              }
            ]
          });
        });
      });
    });
  });
});
