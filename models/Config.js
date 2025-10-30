const mongoose = require('mongoose');

const configSchema = new mongoose.Schema({
    PageKey: {type: String, required: true, unique: true},
    heroImageUrl: {type: String, default: null}
})

module.exports = mongoose.model('Config', configSchema);