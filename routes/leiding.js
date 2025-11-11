const express = require('express');
const router = express.Router();

const Leiding = require('../models/Leiding');


// GET / - Ga naar leidings pagina
router.get('/', async (req, res) => {
  let leiding = [];

  try {
    leiding = await Leiding.find().sort({ name: 1 });
  } catch (err) {
    console.error("Error fetching leiding:", err);
  }

  res.render('pages/leiding', {
      leiding,
      isAdmin: req.session?.isAdmin,
      activePage: 'leiding',
    });
});

module.exports = router;