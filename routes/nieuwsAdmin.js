const express = require('express');
const router = express.Router();
const multer = require('multer');

const Nieuws = require('../models/Nieuws');

const { uploadBufferToCloudinary, deleteImageFromCloudinary } = require('../utils/cloudinary');
const isAdmin = require('../middleware/isAdmin');


/// ---------- Configurations ---------- ///
// Multer
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


/// ---------- Nieuws Admin Routes ---------- ///
// GET /nieuws/admin/create - Open aanmaak formulier
router.get('/create', (req, res) => {
    const returnPage = req.query.page || 1;

    res.render('pages/nieuws_editor', {
        activePage: 'nieuws',
        isAdmin: req.session.isAdmin,
        post: null,
        returnPage
    });
});

// POST /nieuws/admin - Upload nieuwe post
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { title, description } = req.body;
        const returnPage = req.body.returnPage || 1;

        if (!title || !description) return res.status(400).send('Vul titel en inhoud in');

        let imageUrl;
        let imagePublicId;
        if (req.file && req.file.buffer) {
            const result = await uploadBufferToCloudinary(req.file.buffer, 'chiro/nieuws');
            imageUrl = result.secure_url;
            imagePublicId = result.public_id;
        }

        const nieuws = new Nieuws({
            title: title.trim(),
            date: new Date(),
            description,
            imageUrl,
            imagePublicId
        });
        await nieuws.save();

        res.redirect(`/nieuws?page=${returnPage}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Post aanmaken mislukt.');
    }
});

// GET /nieuws/admin/edit/:id - Open edit formulier
router.get('/edit/:id', async (req, res) => {
    try {
        let post = await Nieuws.findById(req.params.id);
        if (!post) return res.status(404).redirect('/nieuws');
        post = post.toObject();

        const returnPage = req.query.page || 1;

        res.render('pages/nieuws_editor', {
            activePage: 'nieuws',
            isAdmin: true,
            post,
            returnPage
        });
    } catch (err) {
        console.error('Fout bij het ophalen van nieuwsbericht voor bewerken:', err);
        res.status(500).redirect('/nieuws');
    }
});

// POST /nieuws/admin/edit/:id - Update bestaande post
router.post('/edit/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, description, existingImageUrl, existingImagePublicId, imageRemoved } = req.body;
        const id = req.params.id;
        const returnPage = req.body.returnPage || 1;

        let imageUrl = existingImageUrl;
        let imagePublicId = existingImagePublicId;
        // Oude afbeelding verwijderen en nieuwe uploaden
        if (req.file && req.file.buffer) {
            await deleteImageFromCloudinary(existingImagePublicId);

            const result = await uploadBufferToCloudinary(req.file.buffer, 'chiro/nieuws');
            imageUrl = result.secure_url;
            imagePublicId = result.public_id;
        }
        // Verwijder image
        else if (imageRemoved === 'true') {
            await deleteImageFromCloudinary(existingImagePublicId);
            imageUrl = null;
            imagePublicId = null;
        }

        // Update database
        const updatedNieuws = {
            title: title.trim(),
            description,
            imageUrl,
            imagePublicId
        };
        await Nieuws.findByIdAndUpdate(id, updatedNieuws, { new: true, runValidators: true });

        res.redirect(`/nieuws?page=${returnPage}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Post updaten mislukt.');
    }
});

// POST /nieuws/admin/delete/:id - Verwijder post
router.post('/delete/:id', async (req, res) => {
    try {
        const { existingImagePublicId } = req.body;
        const returnPage = req.body.page || 1;

        // Verwijder image van Cloudinary en daarna de post
        await deleteImageFromCloudinary(existingImagePublicId);
        await Nieuws.findByIdAndDelete(req.params.id);

        res.redirect(`/nieuws?page=${returnPage}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Post verwijderen mislukt.');
    }
});

module.exports = router;