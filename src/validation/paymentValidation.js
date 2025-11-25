const validateProcessPayment = (body) => {
    let { amount } = body || {};

    
    if (amount === undefined || amount === null) {
        return { 
            status: 400, 
            error: 'Amount is required for processing a new payment.' 
        };
    }
    amount = parseFloat(amount);
    if (isNaN(amount) || amount <= 0) {
        return { 
            status: 400, 
            error: 'Amount must be a positive number.' 
        };
    }
    
    
    return null;
};
const validateUpdatePayment = (body, existingPayment) => {
    const { paymentId, status, amount: requestAmount } = body || {};

    if (!paymentId) {
        return { 
            status: 400, 
            error: 'Payment ID is required.' 
        };
    }

    if (!existingPayment) {
        return { 
            status: 404, 
            error: `Payment ID ${paymentId} not found.` 
        };
    }

    const isRefundAttempt = status && status.toLowerCase() === 'refunded';

    if (isRefundAttempt) {
        const originalAmount = existingPayment.amount;
        const refundAmount = requestAmount !== undefined ? parseFloat(requestAmount) : originalAmount;
        if (isNaN(refundAmount) || refundAmount <= 0) {
            return { 
                status: 400, 
                error: 'Refund amount must be a positive number.' 
            };
        }
        if (refundAmount !== originalAmount) {
            return { 
                status: 400, 
                error: `Refund validation failed: Requested refund amount (${refundAmount}) does not match the original processed amount (${originalAmount}).` 
            };
        }
    }
     if (requestAmount !== undefined) {
         const newAmount = parseFloat(requestAmount);
         if (isNaN(newAmount) || newAmount <= 0) {
              return { 
                  status: 400, 
                  error: 'Amount must be a positive number.' 
              };
         }
    }
      return null;
};

module.exports = {
    validateProcessPayment,
    validateUpdatePayment
};