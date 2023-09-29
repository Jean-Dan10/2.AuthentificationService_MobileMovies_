const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const authRoutes = require('./routes/auth-routes');
const cors = require('cors'); 

const corsOptions = {
  origin: 'http://localhost:3000', 
  credentials: true,

};

app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());


// Routes
app.use('/', authRoutes);

// Start the server
const PORT = process.env.PORT || 3010;
app.listen(PORT, () => {
  console.log(`Authentication service is running on port ${PORT}`);
});