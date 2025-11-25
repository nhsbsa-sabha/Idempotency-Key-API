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

module.exports = {
    validateProcessPayment
};