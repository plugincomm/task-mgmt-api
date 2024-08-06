const mongoose = require('mongoose');

const catvideoSchema = mongoose.Schema({
    cat_name:{
        type:String,
        required:true,
    },
    dateCreated:{
        type:Date,
        default:Date.now
    }
})

catvideoSchema.virtual('id').get(function(){
    return this._id.toHexString();
})

catvideoSchema.set('toJSON',{
    virtual:true
})

CatVideo = mongoose.model('CatVideo',catvideoSchema);

module.exports = CatVideo;