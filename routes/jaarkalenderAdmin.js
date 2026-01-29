const express = require('express');
const router = express.Router();
const multer = require('multer');
const KalenderPlanning = require('../models/KalenderPlanning');
const Maandkalender = require('../models/Maandkalender');
const isAdmin = require('../middleware/isAdmin');
const { uploadBufferToCloudinary, deleteImageFromCloudinary } = require('../utils/cloudinary');

/// ---------- Hulpfuncties & Configuraties ---------- ///
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
router.use(isAdmin);

// Datum aanmaken
function constructDate(day, month) {
    const year = new Date().getFullYear();
    return new Date(year, month, day, 12, 0, 0);
}

/// ---------- Maandkalender Routes ---------- ///
// Post - Upload nieuwe maandkalender
router.post('/upload-maandkalender', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.redirect('/jaarkalender?status=error');

        const huidigeMaandkalender = await Maandkalender.findOne();
        const result = await uploadBufferToCloudinary(req.file.buffer, 'chiro/acties');

        if (huidigeMaandkalender) {
            await deleteImageFromCloudinary(huidigeMaandkalender.publicId);
            huidigeMaandkalender.imageUrl = result.secure_url;
            huidigeMaandkalender.publicId = result.public_id;
            await huidigeMaandkalender.save();
        } else {
            await Maandkalender.create({
                imageUrl: result.secure_url,
                publicId: result.public_id
            });
        }
        res.redirect('/jaarkalender?status=success');
    } catch (err) {
        res.redirect('/jaarkalender?status=error');
    }
});

// POST - Verwijder de huidige maandkalender
router.post('/delete-maandkalender', async (req, res) => {
    try {
        const maandkalender = await Maandkalender.findOne();
        if (maandkalender) {
            await deleteImageFromCloudinary(maandkalender.publicId);
            await Maandkalender.deleteOne({ _id: maandkalender._id });
        }
        res.redirect('/jaarkalender');
    } catch (err) {
        res.redirect('/jaarkalender?status=error');
    }
});

/// ---------- Event Routes ---------- ///
// POST - Voeg een nieuw event toe aan de kalender
router.post('/add-event', async (req, res) => {
    try {
        const { day, month, title } = req.body;
        await KalenderPlanning.create({
            date: constructDate(day, month),
            title: title
        });
        res.sendStatus(200);
    } catch (err) { res.redirect('/jaarkalender?error'); }
});

// POST - Pas een event in de kalender aan
router.post('/edit-event/:id', async (req, res) => {
    try {
        const { day, month, title } = req.body;
        await KalenderPlanning.findByIdAndUpdate(req.params.id, {
            date: constructDate(day, month),
            title: title
        });
        res.sendStatus(200);
    } catch (err) { res.redirect('/jaarkalender?error'); }
});

// POST - Verwijder een event in de kalender
router.post('/delete-event/:id', async (req, res) => {
    try {
        await KalenderPlanning.findByIdAndDelete(req.params.id);
        res.sendStatus(200);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;