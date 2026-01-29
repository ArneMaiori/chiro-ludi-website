const express = require('express');
const router = express.Router();
const multer = require('multer');

const Leiding = require('../models/Leiding');

const { uploadBufferToCloudinary, deleteImageFromCloudinary } = require('../utils/cloudinary');
const isAdmin = require('../middleware/isAdmin');

/// ---------- Configuraties ---------- ///
// Multer storage en upload
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

/// ---------- Routes ---------- ///
// GET - Open de leiding editor
router.get('/editor', async (req, res) => {
    try {
        const leidingList = await Leiding.find().sort({ name: 1 });
        leidingList.sort((a, b) => {
            return Leiding.GROUPS.indexOf(a.group) - Leiding.GROUPS.indexOf(b.group);
        })
        res.render('pages/leiding_editor', {
            activePage: 'leiding',
            isAdmin: true,
            leidingList,
            groups: Leiding.GROUPS || [],
            selectedId: req.query.selected ? String(req.query.selected) : null
        });
    } catch (err) {
        console.error('Fout bij het ophalen van leiding:', err);
        res.status(500).redirect('/leiding');
    }
});

// POST - Nieuwe leiding toevoegen
router.post('/', upload.single('image'), async (req, res) => {
    try {
        const { name, phone, email, bio, group, isHoofdleiding } = req.body;

        if (!name || !phone || !email || !bio || !group) {
            return res.status(400).send('Vul alle verplichte velden in');
        }

        if (Leiding.GROUPS && !Leiding.GROUPS.includes(group)) {
            return res.status(400).send('Ongeldige groep geselecteerd');
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
            group,
            isHoofdleiding: isHoofdleiding === 'on',
            imageUrl,
            imagePublicId
        });
        const savedLeiding = await leiding.save();

        res.redirect(`/leiding/admin/editor?selected=${savedLeiding._id.toString()}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Leiding aanmaken mislukt.');
    }
});

// POST - Leiding data aanpassen
router.post('/edit/:id', upload.single('image'), async (req, res) => {
    try {
        const {
            name,
            phone,
            email,
            bio,
            group,
            isHoofdleiding,
            existingImageUrl,
            existingImagePublicId,
            imageRemoved
        } = req.body;
        const id = req.params.id;

        if (!group || (Leiding.GROUPS && !Leiding.GROUPS.includes(group))) {
            return res.status(400).send('Ongeldige groep geselecteerd');
        }

        let imageUrl = existingImageUrl;
        let imagePublicId = existingImagePublicId;

        if (req.file && req.file.buffer) {
            if (existingImagePublicId) {
                await deleteImageFromCloudinary(existingImagePublicId);
            }

            const result = await uploadBufferToCloudinary(req.file.buffer, 'chiro/leiding');
            imageUrl = result.secure_url;
            imagePublicId = result.public_id;
        } else if (imageRemoved === 'true') {
            if (existingImagePublicId) {
                await deleteImageFromCloudinary(existingImagePublicId);
            }
            imageUrl = null;
            imagePublicId = null;
        }

        const updatedLeiding = {
            name: name.trim(),
            phone: phone.trim(),
            email: email.trim(),
            bio: bio.trim(),
            group,
            isHoofdleiding: isHoofdleiding === 'on',
            imageUrl,
            imagePublicId
        };
        await Leiding.findByIdAndUpdate(id, updatedLeiding, { new: true, runValidators: true });

        res.redirect(`/leiding/admin/editor?selected=${id}`);
    } catch (err) {
        console.error(err);
        res.status(500).send('Leiding updaten mislukt.');
    }
});

// POST - Leiding verwijderen
router.post('/delete/:id', async (req, res) => {
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