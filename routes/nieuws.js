const express = require('express');
const router = express.Router();

const Nieuws = require('../models/Nieuws');

/// ---------- Nieuws Routes ---------- ///
// GET /nieuws - nieuws pagina
router.get('/', async (req, res) => {
  let nieuws = [];
  let page = 1;
  let pages = 1;

  // Get 5 nieuws posts voor deze pagina index
  try {
    const perPage = 5;
    const count = await Nieuws.countDocuments(); // # posts
    pages = Math.ceil(count/perPage); // # nieuws pagina's
    page = parseInt(req.query.page); // nieuws pagina index

    // Zorg ervoor dat de pagina index in range blijft
    if (page < 1) {
      page = 1;
    } else if (page > pages && pages > 0) {
      page = pages;
    }

    // Get nieuws posts
    nieuws = await Nieuws.find().sort({ date: -1 }).skip((page - 1) * perPage).limit(perPage);
  } catch (err) {
    console.error("Error fetching news posts:", err);
  }

  res.render('pages/nieuws', {
      nieuws,
      current: page,
      pages,
      isAdmin: req.session?.isAdmin,
      activePage: 'nieuws',
    });
});

// GET /nieuws/:id - nieuws in detail pagina
router.get('/:id', async (req, res) => {
  try {
    const nieuwsItem = await Nieuws.findById(req.params.id);
    if (!nieuwsItem) return res.status(404).send('Nieuwsbericht niet gevonden');

    const currentPage = req.query.page || 1;

    res.render('pages/nieuws_detail', {
      nieuws: nieuwsItem,
      isAdmin: req.session?.isAdmin,
      activePage: 'nieuws',
      returnPage: currentPage
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Fout bij het ophalen van nieuwsbericht.');
  }
});

module.exports = router;