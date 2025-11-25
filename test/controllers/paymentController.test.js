const { expect } = require('chai');
const sinon = require('sinon');
const { createRequest, createResponse } = require('node-mocks-http');

function reloadController() {
  delete require.cache[require.resolve('../../src/controllers/paymentController')];
  return require('../../src/controllers/paymentController');
}

describe('paymentController', function () {
  afterEach(function () {
    if (sinon.restore) sinon.restore();
  });

  describe('processPayment', function () {
    it('should return 201 and completed payment for valid amount', function () {
      const controller = reloadController();
      const req = createRequest({ method: 'POST', body: { amount: 50 } });
      const res = createResponse();

      const clock = sinon.useFakeTimers();
      controller.processPayment(req, res);
      clock.tick(200);
      clock.restore();

      const data = res._getJSONData();
      expect(res.statusCode).to.equal(201);
      expect(data).to.be.an('object');
      expect(data.success).to.equal(true);
      expect(data.paymentId).to.be.a('string');
      expect(data.status).to.equal('completed');
      expect(data.amount).to.equal(50);
    });

    it('should return validation error when amount missing', function () {
      const controller = reloadController();
      const req = createRequest({ method: 'POST', body: {} });
      const res = createResponse();

      controller.processPayment(req, res);

      const data = res._getJSONData();
      expect(res.statusCode).to.equal(400);
      expect(data).to.be.an('object');
      expect(data.success).to.equal(false);
      expect(data.error).to.be.a('string');
    });
  });

  describe('updatePayment', function () {
    it('should refund an existing payment when refund requested with matching amount', function () {
      const controller = reloadController();
      const createReq = createRequest({ method: 'POST', body: { amount: 75 } });
      const createRes = createResponse();

      const clock = sinon.useFakeTimers();
      controller.processPayment(createReq, createRes);
      clock.tick(200);

      const created = createRes._getJSONData();
      expect(createRes.statusCode).to.equal(201);
      const paymentId = created.paymentId;
      const amount = created.amount;
      const updateReq = createRequest({ method: 'POST', body: { paymentId, status: 'refunded', amount } });
      const updateRes = createResponse();
      controller.updatePayment(updateReq, updateRes);
      clock.tick(200);
      clock.restore();

      const updated = updateRes._getJSONData();
      expect(updateRes.statusCode).to.equal(200);
      expect(updated).to.be.an('object');
      expect(updated.success).to.equal(true);
      expect(updated.paymentId).to.equal(paymentId);
      expect(updated.status).to.equal('refunded');
      expect(updated.amount).to.equal(amount);
    });

    it('should return 400 when paymentId is missing', function () {
      const controller = reloadController();
      const req = createRequest({ method: 'POST', body: {} });
      const res = createResponse();

      controller.updatePayment(req, res);

      const data = res._getJSONData();
      expect(res.statusCode).to.equal(400);
      expect(data).to.be.an('object');
      expect(data.success).to.equal(false);
      expect(data.error).to.be.a('string');
    });
  });
});
