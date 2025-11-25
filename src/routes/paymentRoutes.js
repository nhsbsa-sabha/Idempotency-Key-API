const express = require("express");
const router = express.Router();
const idempotencyMiddleware = require("../middleware/idempotencyMiddleware");
const paymentController = require("../controllers/paymentController");

router.post(
  "/",
  idempotencyMiddleware({ enabled: true }),
  paymentController.processPayment
);
router.patch(
  "/",
  idempotencyMiddleware({ enabled: false }),
  paymentController.updatePayment
);

module.exports = router;
