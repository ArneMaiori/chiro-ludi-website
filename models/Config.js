const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    pageKey: {type: String, required: true, unique: true},
    heroImageUrl: {type: String, default: null},
    heroImagePublicId: {type: String, default: null},
    // Bivak specifieke instellingen
    bivakPdfUrl: { type: String, default: null },
    bivakInschrijvingsLink: { type: String, default: null },
    bivakBBQLink: { type: String, default: null }
})

module.exports = mongoose.model('Config', configSchema);