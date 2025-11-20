const express = require('express');
const router = express.Router();
const multer = require('multer');
const Actie = require('../models/Actie');
const { uploadBufferToCloudinary, deleteImageFromCloudinary } = require('../utils/cloudinary');
const isAdmin = require('../middleware/isAdmin');

// Multer setup
const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (['image/jpeg', 'image/png', 'image/webp'].includes(file.mimetype)) cb(null, true);
        else cb(new Error('Alleen JPG/PNG/WEBP toegestaan'));
    }
});

router.use(isAdmin);

// GET / - Open editor pagina
router.get('/', async (req, res) => {
    try {
        // Sorteer op order
        const acties = await Actie.find().sort({ order: 1 });
        res.render('pages/acties_editor', {
            activePage: 'home', 
            isAdmin: true,
            acties
        });
    } catch (err) {
        console.error(err);
        res.redirect('/');
    }
});

// POST / - Upload nieuwe actie
router.post('/', upload.single('image'), async (req, res) => {
    try {
        if (!req.file) return res.status(400).send('Afbeelding is verplicht');
        
        const result = await uploadBufferToCloudinary(req.file.buffer, 'chiro/acties');
        
        const count = await Actie.countDocuments();
        
        const actie = new Actie({
            title: req.body.title,
            imageUrl: result.secure_url,
            imagePublicId: result.public_id,
            description: req.body.description || '',
            order: count
        });
        await actie.save();
        res.redirect('/acties/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Fout bij aanmaken actie');
    }
});

// POST /edit/:id - Bewerk actie
router.post('/edit/:id', upload.single('image'), async (req, res) => {
    try {
        const { title, description, existingImagePublicId } = req.body;
        let updateData = { title, description };
        console.log(description);

        // nieuwe afbeelding, verwijder oude
        if (req.file) {
            await deleteImageFromCloudinary(existingImagePublicId);
            const result = await uploadBufferToCloudinary(req.file.buffer, 'chiro/acties');
            updateData.imageUrl = result.secure_url;
            updateData.imagePublicId = result.public_id;
        }

        await Actie.findByIdAndUpdate(req.params.id, updateData);
        res.redirect('/acties/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Fout bij bewerken');
    }
});

// POST /delete/:id - Verwijder actie
router.post('/delete/:id', async (req, res) => {
    try {
        const actie = await Actie.findById(req.params.id);
        if (actie && actie.imagePublicId) {
            await deleteImageFromCloudinary(actie.imagePublicId);
        }
        await Actie.findByIdAndDelete(req.params.id);
        res.redirect('/acties/admin');
    } catch (err) {
        console.error(err);
        res.status(500).send('Fout bij verwijderen');
    }
});

// POST /reorder - Volgorde wijzigen
router.post('/reorder', express.json(), async (req, res) => {
    try {
        const { order } = req.body;
        
        const bulkOps = order.map((id, index) => ({
            updateOne: {
                filter: { _id: id },
                update: { order: index }
            }
        }));

        await Actie.bulkWrite(bulkOps);
        res.json({ success: true });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false });
    }
});

module.exports = router;