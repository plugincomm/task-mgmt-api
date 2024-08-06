const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    role_name: {
        type: String,
        required: true,
        unique: true,
    },
    value: {
        type: String,
        required: true,
        enum: ['super_admin', 'admin', 'user'] 
    },
    permissions: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Permission'
    }]
}, { timestamps: true });

roleSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

roleSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model('Role', roleSchema);
