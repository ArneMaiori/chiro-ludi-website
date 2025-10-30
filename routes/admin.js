const express = require('express');
const router = express.Router();
const multer = require('multer');

const Config = require('../models/Config');

const { uploadBufferToCloudinary } = require('../utils/uploadToCloudinary');
const isAdmin = require('../middleware/isAdmin');

/// ---------- Configurations ---------- ///
// Multer
const storage = multer.memoryStorage();
const upload = multer({ storage }); 


/// ---------- Admin Routes ---------- ///
// POST /admin - Admin login
router.post('/', (req, res) => {
  const { password } = req.body;

  if (password === process.env.ADMIN_PASS) {
    req.session.isAdmin = true;
    return res.json({ success: true });
  }

  // Verkeerd wachtwoord
  return res.json({ success: false, message: 'Verkeerd wachtwoord' });
});


// POST /admin/logout - Admin logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) console.error('Session destroy error:', err);
    res.json({ success: true });
  });
});


// POST /admin/hero-config - Nieuwe hero-afbeelding upload
router.post('/hero-config', isAdmin, upload.single('image'), async (req, res) => {
    const { pageKey, existingImageUrl, imageRemoved } = req.body;
    
    try {
        let newImageUrl = existingImageUrl;
        
        // Verwijder image, pak default image
        if (imageRemoved === 'true') {
            newImageUrl = null;
        } 
        
        // Nieuwe afbeelding uploaden
        else if (req.file && req.file.buffer) {
            const result = await uploadBufferToCloudinary(req.file.buffer, 'chiro/hero-images');
            newImageUrl = result.secure_url;
        }

        // Updaten in de database
        await Config.findOneAndUpdate(
            { pageKey: pageKey },
            { heroImageUrl: newImageUrl },
            { upsert: true, new: true }
        );

        res.redirect(`/${pageKey === 'home' ? '' : pageKey}`);
    } catch (error) {
        console.error('Fout bij hero-afbeelding bewerking:', error);
        res.status(500).send('Fout bij het opslaan van de hero-afbeelding.');
    }
});

module.exports = router;
