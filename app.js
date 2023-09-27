const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth-routes');

// Middleware
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);

// Start the server
const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log(`Authentication service is running on port ${PORT}`);
});