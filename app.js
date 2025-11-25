const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;
const paymentRoutes = require('./src/routes/paymentRoutes');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/payment', paymentRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Access the payment endpoint at http://localhost:${PORT}/api/payment`);
});
module.exports = app;