const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  date: { type: Date, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String, default: null },
  imagePublicId: {type: String, default: null}
});

module.exports = mongoose.model('Nieuws', eventSchema);
