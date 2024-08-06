const CatVideo = require('../model/catvideo');

module.exports.getCatVideo = async function(req, res) {
    try{
        const catVideo = await CatVideo.find().sort({ dateCreated: -1 });
        if(catVideo){
            return res.status(200).json({success:true, message:"Category Video Found Successfully!", catVideo})
        }else{
            return res.status(404).json({success:false, message:"Category Video can not found"})
        }
    }catch{
        return res.status(500).json({success:true,message:"Internal Server Error"})
    }
}

module.exports.getCatVideoById = async function(req, res){
    try{
        const catVideo = await CatVideo.findById(req.params.id);  
        if(catVideo){
            return res.status(200).json({success:true, message:"Category Video Found By ID Successfully!", catVideo})
        }else{
            return res.status(404).json({success:false, message:"Video Category can not found"})
        }
    }catch{
        return res.status(500).json({success:true,message:"Internal Server Error"})
    }
}

module.exports.addCatVideo = async function(req, res){
    try{
        const video = new CatVideo({
            cat_name:req.body.cat_name
        })
        saveVideo = await video.save();
        return res.status(200).json({success:true, message:"Category Video Submit Successfully!", saveVideo})
    }catch{
        return res.status(500).json({success:true,message:"Internal Server Error"})
    }
}

module.exports.editCatVideo = async function(req, res){
    try{
        const catVideo = await CatVideo.findByIdAndUpdate(req.params.id,{
            cat_name:req.body.cat_name,},
            { new: true },
        );
        if(catVideo){
            return res.status(200).json({success:true, message:"Category Video Found Successfully!",catVideo})
        }else{
            return res.status(404).json({success:false, message:"Video Category can not found"})
        }
    }catch{
        return res.status(500).json({success:true,message:"Internal Server Error"})
    }
}

module.exports.deleteCatVideo = async function(req, res){
    try{
        const catVideo = await CatVideo.findByIdAndDelete(req.params.id);
        if(catVideo){
            return res.status(200).json({success:true, message:"Category Video Found Successfully!"})
        }else{
            return res.status(404).json({success:false, message:"Video Category can not found"})
        }
    }catch{
        return res.status(500).json({success:true,message:"Internal Server Error"})
    }
}

module.exports.getCatVideoCount = async function (req, res){
    try {
        const uploadCatVideoCount = await CatVideo.countDocuments();
        console.log("User Count:",uploadCatVideoCount)
        if (uploadCatVideoCount === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found"
            });
        }

        res.status(200).json({
            success: true,
            uploadCatVideoCount: uploadCatVideoCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "User count failed",
            error: error.message
        });
    }
}