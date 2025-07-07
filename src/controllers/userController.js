const User = require('../models/User');
const PDFFile = require('../models/PDFFile');
const bcrypt = require('bcrypt');
const { generateToken } = require('../middlewares/jwtAuth');
const fs = require('fs');
const pdfParse = require('pdf-parse');
const { log } = require('console');

const registerUser = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Basic validation
        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({ message: 'User already exists' });
        }

        // Create and save new user
        const newUser = new User({ name, email, password });
        await newUser.save();

        // Do not return password in response
        const { password: _, ...userData } = newUser.toObject();

        res.status(201).json({
            message: 'User registered successfully',
            user: userData,
        });
    } catch (err) {
        console.error('Error in registration:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validate input
        if (!email || !password) {
            return res.status(400).json({ message: 'Email and password are required' });
        }

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const payload = {
            userId: user._id, email: user.email
        }

        const token = generateToken(payload);

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            }
        });
    } catch (err) {
        console.error('Login error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}

const uploadPdf = async (req, res) => {
    try {
        const userId = req.user.userId;
        // Check if file is attached
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded.' });
        }

        // Check user's active PDF count (excluding soft-deleted)
        const activeCount = await PDFFile.countDocuments({
            uploadedBy: userId,
            isDeleted: false,
        });


        if (activeCount >= 5) {
            return res.status(400).json({ error: 'You can only upload up to 5 PDFs.' });
        }

        // Read the file
        const fileBuffer = fs.readFileSync(req.file.path);

        // Extract text from PDF
        const parsed = await pdfParse(fileBuffer);

        // Create and save PDF metadata
        const newPDF = new PDFFile({
            originalName: req.file.originalname,
            fileSize: req.file.size,
            extractedText: parsed.text,
            uploadedBy: userId,
        });

        await newPDF.save();

        // Add PDF to user's uploadedPDFs array
        await User.findByIdAndUpdate(userId, {
            $push: { uploadedPDFs: newPDF._id },
        });

        res.status(201).json({
            message: 'PDF uploaded successfully.',
            fileId: newPDF._id,
        });
    } catch (error) {
        console.error('Upload Error:', error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}

const deletePdf = async (req, res) => {
    try {
        const userId = req.user.userId;
        const fileId = req.params.pdfId;

        // Find the file and make sure it belongs to the user
        const file = await PDFFile.findOne({
            _id: fileId,
            uploadedBy: userId,
            isDeleted: false,
        });

        if (!file) {
            return res.status(404).json({ message: 'File not found or already deleted.' });
        }

        file.isDeleted = true;
        await file.save();

        res.status(200).json({ message: 'File deleted (soft delete) successfully.' });
    } catch (err) {
        console.error('Soft Delete Error:', err);
        res.status(500).json({ message: 'Something went wrong.' });
    }
}

module.exports = {
    registerUser,
    loginUser,
    uploadPdf,
    deletePdf
}