const mongoose = require('mongoose');

const actieSchema = new mongoose.Schema({
    title: { type: String, required: true },
    imageUrl: { type: String, required: true },
    imagePublicId: { type: String, required: true },
    description: { type: String, default: '' },
    order: { type: Number, default: 0 },
});

module.exports = mongoose.model('Actie', actieSchema);