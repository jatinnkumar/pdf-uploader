// models/PDFFile.js
const mongoose = require('mongoose');

const pdfFileSchema = new mongoose.Schema({
    originalName: {
        type: String,
        required: true,
    },

    uploadTimestamp: {
        type: Date,
        default: Date.now,
    },

    fileSize: {
        type: Number, // in bytes
        required: true,
    },

    extractedText: {
        type: String,
        required: true,
    },

    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },

    isDeleted: {
        type: Boolean,
        default: false,
    },
});

module.exports = mongoose.model('PDFFile', pdfFileSchema);
