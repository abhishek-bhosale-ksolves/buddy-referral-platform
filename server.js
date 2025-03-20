const express = require('express');
const connectDB = require('./config/db');
const cors = require('cors');
const swaggerUi = require("swagger-ui-express");
const swaggerDocs = require("./config/swaggerConfig");

connectDB();

app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use((err, req, res, next) => {
    res.status(500).json({ message: "Server Error"});
});

// Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/referrals', require('./routes/referrals'));

// Swagger
app.use("/", swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(process.env.PORT, function() {
  console.log('Server is running on port 3000');
});