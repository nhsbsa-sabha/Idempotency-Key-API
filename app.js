const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const paymentRoutes = require('./src/routes/paymentRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/payment', paymentRoutes);

app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found'
  });
});

app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({ error: 'Internal server error' });
});


app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the post payment endpoint with idempotency key at http://localhost:${PORT}/api/payment`);
  console.log(`Access the patch endpoint with idempotency key at http://localhost:${PORT}/api/payment`);
  console.log(`Access the short TTL endpoint with idempotency key at http://localhost:${PORT}/api/payment/short-ttl`);
  console.log(`Access the post endpoint without idempotency key at http://localhost:${PORT}/api/payment/idempotency-disabled`);
  console.log(`Access the patch endpoint without idempotency key at http://localhost:${PORT}/api/payment/idempotency-disabled`);
});
module.exports = app;