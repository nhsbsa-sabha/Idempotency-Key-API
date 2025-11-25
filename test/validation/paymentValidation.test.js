const { expect } = require("chai");

const {
  validateProcessPayment,
  validateUpdatePayment,
} = require("../../src/validation/paymentValidation");

describe("paymentValidation", () => {
  describe("validateProcessPayment", () => {
    it("returns error when amount is missing", () => {
      const err = validateProcessPayment({});
      expect(err).to.be.an("object");
      expect(err.status).to.equal(400);
      expect(err.error).to.match(/Amount is required/);
    });

    it("returns error when amount is not a positive number", () => {
      expect(validateProcessPayment({ amount: 0 })).to.be.an("object");
      expect(validateProcessPayment({ amount: -5 })).to.be.an("object");
      expect(validateProcessPayment({ amount: "abc" })).to.be.an("object");
    });

    it("returns null for a valid amount", () => {
      expect(validateProcessPayment({ amount: 10 })).to.equal(null);
      expect(validateProcessPayment({ amount: "12.5" })).to.equal(null);
    });
  });

  describe("validateUpdatePayment", () => {
    it("returns error when paymentId is missing", () => {
      const err = validateUpdatePayment({}, undefined);
      expect(err).to.be.an("object");
      expect(err.status).to.equal(400);
      expect(err.error).to.match(/Payment ID is required/);
    });

    it("returns 404 when payment not found", () => {
      const err = validateUpdatePayment({ paymentId: "p1" }, undefined);
      expect(err).to.be.an("object");
      expect(err.status).to.equal(404);
      expect(err.error).to.match(/not found/);
    });

    it("rejects refund when refund amount invalid or mismatched", () => {
      const existingPayment = { paymentId: "p1", amount: 100 };

      // invalid refund amount (zero/negative/non-number)
      expect(
        validateUpdatePayment(
          { paymentId: "p1", status: "refunded", amount: 0 },
          existingPayment
        )
      ).to.be.an("object");
      expect(
        validateUpdatePayment(
          { paymentId: "p1", status: "refunded", amount: -5 },
          existingPayment
        )
      ).to.be.an("object");
      expect(
        validateUpdatePayment(
          { paymentId: "p1", status: "refunded", amount: "abc" },
          existingPayment
        )
      ).to.be.an("object");

      // mismatched refund amount
      const mismatch = validateUpdatePayment(
        { paymentId: "p1", status: "refunded", amount: 50 },
        existingPayment
      );
      expect(mismatch).to.be.an("object");
      expect(mismatch.error).to.match(/Refund validation failed/);
    });

    it("allows refund when amount matches original", () => {
      const existingPayment = { paymentId: "p1", amount: 100 };
      const ok = validateUpdatePayment(
        { paymentId: "p1", status: "refunded", amount: 100 },
        existingPayment
      );
      expect(ok).to.equal(null);
    });

    it("validates requestAmount when updating amount (non-refund)", () => {
      const existingPayment = { paymentId: "p2", amount: 50 };
      expect(
        validateUpdatePayment({ paymentId: "p2", amount: -10 }, existingPayment)
      ).to.be.an("object");
      expect(
        validateUpdatePayment(
          { paymentId: "p2", amount: "abc" },
          existingPayment
        )
      ).to.be.an("object");
      expect(
        validateUpdatePayment({ paymentId: "p2", amount: 75 }, existingPayment)
      ).to.equal(null);
    });

    it("returns null when no changes provided but payment exists", () => {
      const existingPayment = { paymentId: "p3", amount: 20 };
      const result = validateUpdatePayment(
        { paymentId: "p3" },
        existingPayment
      );
      expect(result).to.equal(null);
    });
  });
});
