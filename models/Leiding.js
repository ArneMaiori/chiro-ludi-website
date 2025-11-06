const mongoose = require('mongoose');

const leidingSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true},
    phone: {type: String, required: true, trim: true},
    email: {type: String, required: true, trim: true, lowercase: true},
    bio: {type: String, required: true},
    imageUrl: {type: String,default: null},
});

module.exports = mongoose.model('Leiding', leidingSchema);