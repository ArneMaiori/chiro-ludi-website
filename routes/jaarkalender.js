const express = require('express');
const router = express.Router();
const KalenderPlanning = require('../models/KalenderPlanning');
const Maandkalender = require('../models/Maandkalender');

// Open de jaarkalender pagina
router.get('/', async (req, res) => {
    try {
        const planning = await KalenderPlanning.find().sort({ date: 1 });
        const maandkalender = await Maandkalender.findOne();
        const maanden = ["september", "oktober", "november", "december", "januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus"];
        
        res.render('pages/jaarkalender', {
            isAdmin: req.session.isAdmin || false,
            activePage: 'jaarkalender',
            planning,
            maandkalender,
            maanden
        });
    } catch (err) {
        res.redirect('/');
    }
});

module.exports = router;