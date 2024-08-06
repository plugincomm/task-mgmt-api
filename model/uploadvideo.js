const mongoose = require('mongoose');

const uploadvideoSchema = new mongoose.Schema({
    video_title: {
        type: String,
        required: true,
    },
    video_desc: {
        type: String,
        required: false,
    },
    video_img: {
        type: String,
        required: false,
    },
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'CatVideo', 
        required: true,
    },
    video_upload: [{
        type: String,
        required: true,
    }],
    approved: {
        type: Boolean,
        default: false,
    },
    approved_by: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        default: null,
    },
    user: { 
       type: mongoose.Schema.Types.ObjectId,
        ref: 'User', 
        required: true,
    },
    work_status: {
        type: String,
        enum: ['pending', 'done'],
        default: 'pending'
    },
    dateCreated: {
        type: Date,
        default: Date.now,
    },
    dateUpdated: {
        type: Date,
        default: Date.now,
    }
});

uploadvideoSchema.virtual('id').get(function () {
    return this._id.toHexString();
});

uploadvideoSchema.set('toJSON', {
    virtuals: true,
});

uploadvideoSchema.pre('save', function(next) {
    this.dateUpdated = Date.now();
    next();
});

const UploadVideo = mongoose.model('UploadVideo', uploadvideoSchema);

module.exports = UploadVideo;
