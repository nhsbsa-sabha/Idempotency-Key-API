const paymentStore = new Map();
const { validateProcessPayment , validateUpdatePayment } = require('../validation/paymentValidation');
const processPayment = (req, res) => {
  const { amount } = req.body || {};
    const validationError = validateProcessPayment(req.body);
    if (validationError) {
        return res.status(validationError.status).json({
            success: false,
            error: validationError.error,
            timestamp: new Date().toISOString(),
        });
    }
  const paymentId = `pay_${Date.now()}_${Math.random()
    .toString(36)
    .substr(2, 9)}`;

  const paymentAmount = parseFloat(amount);
   const newPayment = {
    paymentId,
    amount: paymentAmount,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  paymentStore.set(paymentId, newPayment);
  setTimeout(() => {
    const payment = paymentStore.get(paymentId);
    if (payment) {
      payment.status = "completed"; 
    }
     res.status(201).json({
      success: true,
      ...payment,
      message: "Payment processed successfully",
      timestamp: new Date().toISOString(),
    });
  }, 100);
};
const updatePayment = (req, res) => {
  const { paymentId, status, amount: requestAmount } = req.body || {};

  const existingPayment = paymentStore.get(paymentId);
   const validationError = validateUpdatePayment(req.body, existingPayment);
  if (validationError) {
    return res.status(validationError.status).json({
      success: false,
      error: validationError.error,
    });
  }

  let updatedFields = [];

  const isRefundAttempt = status && status.toLowerCase() === "refunded";
  if (isRefundAttempt) {
    const refundAmount =
      requestAmount !== undefined
        ? parseFloat(requestAmount)
        : existingPayment.amount;

    existingPayment.status = "refunded";
    updatedFields.push("status");

    if (requestAmount !== undefined) {
      existingPayment.amount = refundAmount;
      updatedFields.push("amount");
    }
  } else if (status && existingPayment.status !== status) {
    existingPayment.status = status;
    updatedFields.push("status");
  }

  if (
    !isRefundAttempt &&
    requestAmount !== undefined &&
    existingPayment.amount !== requestAmount
  ) {
    existingPayment.amount = parseFloat(requestAmount);
    updatedFields.push("amount");
  }

  const message =
    updatedFields.length > 0
      ? `Payment updated successfully. Changes: ${updatedFields.join(" and ")}.`
      : `Payment ID ${paymentId} exists but no valid updates were provided.`;

  
  setTimeout(() => {
     res.status(200).json({
      success: true,
      ...existingPayment,
      message: message,
      timestamp: new Date().toISOString(),
    });
  }, 100);
};

module.exports = {
  processPayment,
  updatePayment
};