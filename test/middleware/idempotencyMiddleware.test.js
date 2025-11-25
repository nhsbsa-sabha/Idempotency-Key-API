const { expect } = require("chai");
const sinon = require("sinon");
const { createRequest, createResponse } = require("node-mocks-http");

const idempotencyMiddleware = require("../../src/middleware/idempotencyMiddleware");

describe("idempotencyMiddleware", function () {
  afterEach(function () {
    sinon.restore();
  });

  it("calls next for non-POST requests", function () {
    const mw = idempotencyMiddleware();
    const req = createRequest({ method: "GET" });
    const res = createResponse();
    const next = sinon.spy();

    mw(req, res, next);

    expect(next.calledOnce).to.be.true;
  });

  it("calls next when middleware disabled", function () {
    const mw = idempotencyMiddleware({ enabled: false });
    const req = createRequest({
      method: "POST",
      headers: { "idempotency-key": "k1" },
    });
    const res = createResponse();
    const next = sinon.spy();

    mw(req, res, next);

    expect(next.calledOnce).to.be.true;
  });

  it("calls next when idempotency key is missing", function () {
    const mw = idempotencyMiddleware();
    const req = createRequest({ method: "POST" });
    const res = createResponse();
    const next = sinon.spy();

    mw(req, res, next);

    expect(next.calledOnce).to.be.true;
  });

  it("caches response and returns cached response for same key", function () {
    const mw = idempotencyMiddleware({ ttl: 1000 });
    const req1 = createRequest({
      method: "POST",
      headers: { "idempotency-key": "abc" },
    });
    const res1 = createResponse();
    function handler1() {
      res1.status(201);
      res1.set("x-test-header", "v1");
      res1.json({ paymentId: "p1", amount: 10 });
    }

    mw(req1, res1, handler1);

    const body1 = res1._getJSONData();
    expect(res1.statusCode).to.equal(201);
    expect(body1.paymentId).to.equal("p1");
    expect(res1._getHeaders()).to.have.property("x-test-header", "v1");
    const req2 = createRequest({
      method: "POST",
      headers: { "idempotency-key": "abc" },
    });
    const res2 = createResponse();
    const next2 = sinon.spy();

    mw(req2, res2, next2);

    expect(next2.notCalled).to.be.true;
    const body2 = res2._getJSONData();
    expect(res2.statusCode).to.equal(201);
    expect(body2.paymentId).to.equal("p1");
    expect(res2._getHeaders()).to.have.property("x-test-header", "v1");
  });

  it("expires cache after ttl and allows handler to run again", function () {
    const clock = sinon.useFakeTimers({ now: Date.now() });

    const mw = idempotencyMiddleware({ ttl: 50 });

    const req1 = createRequest({
      method: "POST",
      headers: { "idempotency-key": "k-exp" },
    });
    const res1 = createResponse();
    function handler1() {
      res1.status(200);
      res1.json({ paymentId: "p-exp", amount: 5 });
    }
    mw(req1, res1, handler1);

    clock.tick(100);

    const req2 = createRequest({
      method: "POST",
      headers: { "idempotency-key": "k-exp" },
    });
    const res2 = createResponse();
    const next2 = sinon.spy(function () {
      res2.status(201);
      res2.json({ paymentId: "p-new", amount: 6 });
    });

    mw(req2, res2, next2);
    expect(next2.calledOnce).to.be.true;
    const body2 = res2._getJSONData();
    expect(body2.paymentId).to.equal("p-new");

    clock.restore();
  });
});
