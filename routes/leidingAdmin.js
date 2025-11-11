const express = require('express');
const router = express.Router();
const multer = require('multer');

const Leiding = require('../models/Leiding');

const { uploadBufferToCloudinary, deleteImageFromCloudinary } = require('../utils/cloudinary');
const isAdmin = require('../middleware/isAdmin');

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const allowed = ['image/jpeg', 'image/png', 'image/webp'];
        if (allowed.includes(file.mimetype)) cb(null, true);
        else cb(new Error('Alleen JPG/PNG/WEBP toegestaan'));
    }
});

router.get('/editor', isAdmin, async (req, res) => {
    try {
        const leidingList = await Leiding.find().sort({ name: 1 });
        res.render('pages/leiding_editor', {
            activePage: 'leiding',
            isAdmin: true,
            leidingList
        });
    } catch (err) {
        console.error('Fout bij het ophalen van leiding:', err);
        res.status(500).redirect('/leiding');
    }
});

// routes/leidingAdmin.js - POST / route aanpassen
router.post('/', isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, phone, email, bio, isHoofdleiding } = req.body;

        if (!name || !phone || !email || !bio) {
            return res.status(400).send('Vul alle verplichte velden in');
        }

        let imageUrl = null;
        let imagePublicId = null;
        if (req.file && req.file.buffer) {
            const result = await uploadBufferToCloudinary(req.file.buffer, 'chiro/leiding');
            imageUrl = result.secure_url;
            imagePublicId = result.public_id;
        }

        const leiding = new Leiding({
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            bio: bio.trim(),
            isHoofdleiding: isHoofdleiding === 'on',
            imageUrl,
            imagePublicId
        });
        await leiding.save();

        res.redirect('/leiding/admin/editor');
    } catch (err) {
        console.error(err);
        res.status(500).send('Leiding aanmaken mislukt.');
    }
});

router.post('/edit/:id', isAdmin, upload.single('image'), async (req, res) => {
    try {
        const { name, phone, email, bio, isHoofdleiding, existingImageUrl, existingImagePublicId, imageRemoved } = req.body;
        const id = req.params.id;

        let imageUrl = existingImageUrl;
        let imagePublicId = existingImagePublicId;

        if (req.file && req.file.buffer) {
            await deleteImageFromCloudinary(existingImagePublicId);
            
            const result = await uploadBufferToCloudinary(req.file.buffer, 'chiro/leiding');
            imageUrl = result.secure_url;
            imagePublicId = result.public_id;
        } else if (imageRemoved === 'true') {
            await deleteImageFromCloudinary(existingImagePublicId);
            imageUrl = null;
            imagePublicId = null;
        }

        const updatedLeiding = {
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            bio: bio.trim(),
            isHoofdleiding: isHoofdleiding === 'on',
            imageUrl,
            imagePublicId
        };
        await Leiding.findByIdAndUpdate(id, updatedLeiding, { new: true, runValidators: true });

        res.redirect('/leiding/admin/editor');
    } catch (err) {
        console.error(err);
        res.status(500).send('Leiding updaten mislukt.');
    }
});

router.post('/delete/:id', isAdmin, async (req, res) => {
    try {
        const leiding = await Leiding.findById(req.params.id);
        if (leiding && leiding.imagePublicId) {
            await deleteImageFromCloudinary(leiding.imagePublicId);
        }
        await Leiding.findByIdAndDelete(req.params.id);
        res.redirect('/leiding/admin/editor');
    } catch (err) {
        console.error(err);
        res.status(500).send('Leiding verwijderen mislukt.');
    }
});

module.exports = router;