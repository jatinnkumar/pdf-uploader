const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/pdfUploads')
    .then(() => {
        console.log('Mongodb connnected successfully!');
    }).catch((error) => {
        console.log("Database connection unsuccessfull!");
    });