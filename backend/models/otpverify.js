const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: 'User'
        },

        otp: {
            type: Number,
            required: true
        }
});

module.exports = mongoose.model('Otp', OtpSchema);
