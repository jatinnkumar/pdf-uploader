const express = require('express');
const app = express();
require('dotenv').config();
require('../src/config/db');
const userRoutes = require('../src/routes/userRoutes');

app.use(express.json());

const port = process.env.PORT || 3000;

app.use('/user', userRoutes);

app.listen(port, () => {
    console.log(`Server is running on port: ${port}`);
})