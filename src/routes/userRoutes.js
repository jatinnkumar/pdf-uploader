const exppress = require('express');
const router = exppress.Router();
const userController = require('../controllers/userController');
const { jwtAuth } = require('../middlewares/jwtAuth');
const upload = require('../middlewares/multer');

router.post('/register', userController.registerUser);
router.post('/login', userController.loginUser);
router.use(jwtAuth);
router.post('/upload', upload.single('pdf'), userController.uploadPdf);
router.delete('/deletePdf/:pdfId', userController.deletePdf);

module.exports = router;