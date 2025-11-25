const paymentStore = new Map();
const { validateProcessPayment } = require('../validation/paymentValidation');
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
module.exports = {
  processPayment
};