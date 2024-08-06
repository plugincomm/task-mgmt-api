const mongoose = require('mongoose');

const permissionSchema = new mongoose.Schema({
    permission_name: {
        type: String,
        required: true,
    },
    is_default: {
        type: Number,
        default: 0, // 0 -> not default, 1 -> default
        enum: [0, 1] // Restrict values to 0 or 1
    }
}, { timestamps: true });

permissionSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

permissionSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model('Permission', permissionSchema);
