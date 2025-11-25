const express = require("express");
const router = express.Router();
const idempotencyMiddleware = require("../middleware/idempotencyMiddleware");
const paymentController = require("../controllers/paymentController");

router.post(
  "/",
  idempotencyMiddleware({ enabled: true }),
  paymentController.processPayment
);

module.exports = router;
