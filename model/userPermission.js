const mongoose = require('mongoose');

const userPermissionSchema = new mongoose.Schema({
    user_email: {
        type: String,
        required: true,
        unique: true
    },
    permissions: [{
        permission: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Permission',
            required: true
        },
        permission_value: {
            type: Number,
            required: true,
            enum: [0, 1, 2, 3] // Define valid action values
        }
    }]
}, { timestamps: true });

userPermissionSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userPermissionSchema.set('toJSON', {
    virtuals: true,
});

module.exports = mongoose.model('UserPermission', userPermissionSchema);
