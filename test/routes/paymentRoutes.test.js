const { expect } = require("chai");

const router = require("../../src/routes/paymentRoutes");

function findRoute(path) {
  if (!router || !router.stack) return null;
  return router.stack.filter(
    (layer) => layer.route && layer.route.path === path
  );
}

function findRouteMethod(path, method) {
  const layers = findRoute(path);
  if (!layers || layers.length === 0) return null;
  return layers.find(
    (layer) => layer.route && layer.route.methods && layer.route.methods[method]
  );
}

describe("paymentRoutes", () => {
  it("exports an express router", () => {
    expect(router).to.be.an("function");
    expect(router.stack).to.be.an("array");
  });

  it("registers POST / with processPayment handler", () => {
    const layer = findRouteMethod("/", "post");
    expect(layer, "POST / not found").to.exist;
    const handlers = layer.route.stack.map((s) => s.handle && s.handle.name);
    expect(handlers).to.include("processPayment");
  });

  it("registers PATCH / with updatePayment handler", () => {
    const layer = findRouteMethod("/", "patch");
    expect(layer, "PATCH / not found").to.exist;
    const handlers = layer.route.stack.map((s) => s.handle && s.handle.name);
    expect(handlers).to.include("updatePayment");
  });

  it("registers POST /short-ttl with processPayment handler", () => {
    const layer = findRouteMethod("/short-ttl", "post");
    expect(layer, "/short-ttl POST not found").to.exist;
    const handlers = layer.route.stack.map((s) => s.handle && s.handle.name);
    expect(handlers).to.include("processPayment");
  });

  it("registers idempotency-disabled endpoints", () => {
    const postLayer = findRouteMethod("/idempotency-disabled", "post");
    const patchLayer = findRouteMethod("/idempotency-disabled", "patch");
    expect(postLayer, "/idempotency-disabled POST not found").to.exist;
    expect(patchLayer, "/idempotency-disabled PATCH not found").to.exist;
    const postHandlers = postLayer.route.stack.map(
      (s) => s.handle && s.handle.name
    );
    const patchHandlers = patchLayer.route.stack.map(
      (s) => s.handle && s.handle.name
    );
    expect(postHandlers).to.include("processPayment");
    expect(patchHandlers).to.include("updatePayment");
  });
});
