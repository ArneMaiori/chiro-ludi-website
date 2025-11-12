const mongoose = require('mongoose');

const GROUPS = ['Sloebers', 'Speelclub', 'Rakwi', 'Tito', 'Keti', 'Aspi', 'Volwassen Begeleiding'];

const leidingSchema = new mongoose.Schema({
    name: {type: String, required: true, trim: true},
    group: {type: String, required: true, enum: GROUPS, default: 'Aspi'},
    isHoofdleiding: {type: Boolean, require: true, default: false},
    phone: {type: String, required: true, trim: true},
    email: {type: String, required: true, trim: true, lowercase: true},
    bio: {type: String, required: true},
    imageUrl: {type: String, default: null},
    imagePublicId: {type: String, default: null}
});

const Leiding = mongoose.model('Leiding', leidingSchema);

module.exports = Leiding;
module.exports.GROUPS = GROUPS;