const mongoose = require('mongoose');

const userReplySchema = new mongoose.Schema({
    user_id: {
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref:'User'
    },
    video:{
        type:mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'UploadVideo'
    },
    reply:{
        type:String,
        required:true
    }
})

userReplySchema.virtual('id').get(function () {
    return this._id.toHexString();
});

userReplySchema.set('toJSON', {
    virtuals: true,
});


const UserReply = mongoose.model('UserReply', userReplySchema);

module.exports = UserReply;