const mongoose = require('mongoose');

const kalenderPlanningSchema = new mongoose.Schema({
    date: { type: Date, required: true },
    title: { type: String, required: true },
});

module.exports = mongoose.model('CalendarEvent', kalenderPlanningSchema);