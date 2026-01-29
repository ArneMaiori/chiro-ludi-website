const express = require('express');
const router = express.Router();
const multer = require('multer');

const Config = require('../models/Config');
const CardConfig = require('../models/CardConfig');
const isAdmin = require('../middleware/isAdmin');

/// ---------- Hulpfuncties & Configuraties ---------- ///
// Normaliseren van links
function normalizeUrl(input) {
  if (!input) return null;
  const trimmed = String(input).trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}
router.use(isAdmin);

// Multer storage voor PDF van bivak-ludiekje
const pdfStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, filesDir),
  filename: (req, file, cb) => cb(null, 'bivak-ludiekje.pdf')
});

// Uploaden van nieuwe bivak-ludiekje pdf (vervangt oude versie)
const uploadPdf = multer({
  storage: pdfStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') return cb(null, true);
    cb(new Error('Alleen PDF-bestanden zijn toegestaan'));
  },
  limits: { fileSize: 20 * 1024 * 1024 }
});

/// ---------- Routes ---------- ///
// POST - Route voor het opslaan van info cards (ook voor lid_worden pagina)
router.post('/update-bivak-card', async (req, res) => {
    try {
        const { index, content, page } = req.body;
        const pageKey = page || 'bivak';
        
        // Bivak of lid_worden pagina
        let config = await CardConfig.findOne({ page: pageKey });
        if (!config) {
            return res.status(404).json({ message: 'Configuratie niet gevonden' });
        }

        config.cards[index].content = content;
        await config.save();

        res.status(200).json({ message: 'Kaart succesvol bijgewerkt' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server fout' });
    }
});

// POST - Inschrijvingslink bivak aanpassen
router.post('/update-inschrijvingslink', async (req, res) => {
  try {
    const link = normalizeUrl(req.body.linkUrl);
    await Config.findOneAndUpdate(
      { pageKey: 'bivak' },
      { bivakInschrijvingsLink: link },
      { upsert: true, new: true }
    );
    res.sendStatus(200);
  } catch (err) {
    console.error('Fout bij updaten inschrijvingslink:', err);
    res.status(500).send('Fout bij opslaan van inschrijvingslink');
  }
});

// POST - Inschrijvingslink BBQ aanpassen
router.post('/update-bbq-link', async (req, res) => {
  try {
    const link = normalizeUrl(req.body.linkUrl);
    await Config.findOneAndUpdate(
      { pageKey: 'bivak' },
      { bivakBBQLink: link },
      { upsert: true, new: true }
    );
    res.sendStatus(200);
  } catch (err) {
    console.error('Fout bij updaten BBQ link:', err);
    res.status(500).send('Fout bij opslaan van BBQ link');
  }
});

// POST - Nieuwe pdf van bivak-ludiekje uploaden
router.post('/update-bivak-ludiekje', uploadPdf.single('bivakPdf'), async (req, res) => {
  try {
    if (!req.file || !req.file.path) {
      return res.status(400).send('Geen bestand ontvangen');
    }
    const publicUrl = '/files/bivak-ludiekje.pdf';
    await Config.findOneAndUpdate(
      { pageKey: 'bivak' },
      { bivakPdfUrl: publicUrl },
      { upsert: true, new: true }
    );
    res.redirect('/bivak');
  } catch (err) {
    console.error('Fout bij uploaden bivak-ludiekje:', err);
    res.status(500).send('Interne serverfout');
  }
});

module.exports = router;
