const mongoose = require('mongoose');

const CardConfigSchema = new mongoose.Schema({
    page: { type: String, default: 'bivak' },
    cards: [{
        content: String,
        imageUrl: String
    }]
});

module.exports = mongoose.model('CardConfig', CardConfigSchema);