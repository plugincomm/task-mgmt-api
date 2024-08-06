const UploadVideo = require('../model/uploadvideo');
const Category = require('../model/catvideo'); 
const User = require('../model/user')
const path = require('path');
const Role = require('../model/role');
const fs = require('fs').promises;
const { compressImage, compressVideo, generateUniquePath, deleteFileIfExists } = require('../utils/compress');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;  
ffmpeg.setFfmpegPath(ffmpegPath);


module.exports.getUploadVideo = async function (req, res) {
    try {
        const uploadVideo = await UploadVideo.find().populate('category').sort({ dateCreated: -1 }).populate('user');
        if (uploadVideo) {
            return res.status(200).json({ success: true, message: "Upload Video Found Successfully", uploadVideo });
        } else {
            return res.status(404).json({ success: false, message: "Upload Video cannot be found" });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.getUploadVideoById = async function (req, res) {
    try {
        const uploadVideo = await UploadVideo.findById(req.params.id).populate('category').populate('user');
        if (uploadVideo) {
            return res.status(200).json({ success: true, message: "Upload Video Found Successfully", uploadVideo });
        } else {
            return res.status(404).json({ success: false, message: "Upload Video cannot be found" });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.addUploadVideo = async function (req, res) {
    const { video_title, video_desc, category, user } = req.body;
    const videoUrl = `${req.protocol}://${req.get('host')}/public/uploads/video/`;
    const imageUrl = `${req.protocol}://${req.get('host')}/public/uploads/videoimg/`;
    const videoPaths = req.files['video_upload'] ? req.files['video_upload'].map(file => file.path) : [];
    const imagePath = req.files['video_img'] ? req.files['video_img'][0].path : null;

    try {
        let compressVideoPaths = [];
        let compressImagePath;

        for (let videoPath of videoPaths) {
            let compressVideoPath = generateUniquePath(videoPath);
            await compressVideo(videoPath, compressVideoPath);
            compressVideoPaths.push(`${videoUrl}${path.basename(compressVideoPath)}`);
        }

        if (imagePath) {
            compressImagePath = generateUniquePath(imagePath);
            await compressImage(imagePath, compressImagePath);
            compressImagePath = `${imageUrl}${path.basename(compressImagePath)}`;
        
            await deleteFileIfExists(imagePath);
        }

        const categoryCheck = await Category.findById(category);
        if (!categoryCheck) {
            return res.status(404).json({ success: false, message: "Category Not found" });
        }

        const userCheck = await User.findById(user);
        if(!userCheck){
            return res.status(404).json({success:false, message:"User Not found"})
        }

        const uploadVideo = new UploadVideo({
            video_title,
            video_desc,
            video_img: compressImagePath,
            category: categoryCheck._id,
            video_upload: compressVideoPaths,
            user: userCheck.id
        });

        const savedVideo = await uploadVideo.save();
        if (savedVideo) {
            return res.status(200).json({ success: true, message: "Upload Video Created Successfully", video: savedVideo });
        } else {
            return res.status(404).json({ success: false, message: "Upload Video cannot be created" });
        }
    } catch (err) {
        console.error('Server error:', err);
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
};

module.exports.editUploadVideo = async function (req, res) {
    const { video_title, video_desc, category, user } = req.body;
    const videoUrl = `${req.protocol}://${req.get('host')}/public/uploads/video/`;
    const imageUrl = `${req.protocol}://${req.get('host')}/public/uploads/videoimg/`;
    const videoPaths = req.files['video_upload'] ? req.files['video_upload'].map(file => file.path) : [];
    const imagePath = req.files['video_img'] ? req.files['video_img'][0].path : null;

    try {
        let compressVideoPaths = [];
        let compressImagePath;

        for (let videoPath of videoPaths) {
            let compressVideoPath = generateUniquePath(videoPath);
            await compressVideo(videoPath, compressVideoPath);
            compressVideoPaths.push(`${videoUrl}${path.basename(compressVideoPath)}`);
        }

        if (imagePath) {
            compressImagePath = generateUniquePath(imagePath);
            await compressImage(imagePath, compressImagePath);
            compressImagePath = `${imageUrl}${path.basename(compressImagePath)}`;
        
            await deleteFileIfExists(imagePath);
        }

        const categoryCheck = await Category.findById(category);
        if (!categoryCheck) {
            return res.status(404).json({ success: false, message: "Category Not found" });
        }

        const userCheck = await User.findById(user);
        if(!userCheck){
            return res.status(404).json({success:false, message:"User Not found"})
        }

        const uploadVideo = await UploadVideo.findByIdAndUpdate(req.params.id,{
            video_title,
            video_desc,
            video_img: compressImagePath,
            category: categoryCheck._id,
            video_upload: compressVideoPaths,
            user:userCheck._id
        },
        {new:true},
        );
        if(uploadVideo){
            return res.status(200).json({success:true, message:"Video Updated Successfully", updateVideo:uploadVideo})
        }else{
            return res.status(404).json({success:false, message:"Video Not Found"})
        }
    }catch {
        return res.status(500).json({success:true, message:"Internal Server Error"})
    } 
}


module.exports.deleteUploadVideo = async function (req, res) {
    try {
        const uploadVideo = await UploadVideo.findByIdAndDelete(req.params.id);
        if (uploadVideo) {
            return res.status(200).json({ success: true, message: "Upload Video Deleted Successfully", uploadVideo });
        } else {
            return res.status(404).json({ success: false, message: "Upload Video cannot be found" });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}

module.exports.getUploadVideoCount = async function (req, res){
    try {
        const uploadVideoCount = await UploadVideo.countDocuments();
        console.log("User Count:",uploadVideoCount)
        if (uploadVideoCount === 0) {
            return res.status(404).json({
                success: false,
                message: "No users found"
            });
        }

        res.status(200).json({
            success: true,
            uploadVideoCount: uploadVideoCount
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "User count failed",
            error: error.message
        });
    }
}



async function checkUserPermission(userId, action) {
    try {
        const user = await User.findById(userId).populate('role');
        if (!user || !user.role) {
            throw new Error('User or role not found');
        }

        const role = await Role.findById(user.role._id).populate('permissions');
        if (!role || !role.permissions) {
            throw new Error('Role or permissions not found');
        }

        const permission = role.permissions.find(p => p.permission_name === 'video_update');
        return permission && permission.is_default === 1;
    } catch (error) {
        console.error(error);
        return false;
    }
}

module.exports.userStatusUpdateTask = async function (req, res){
    const userId = req.user._id; 
    const videoId = req.params.id;
    const newStatus = req.body.work_status;

    if (!['pending', 'done'].includes(newStatus)) {
        return res.status(400).json({ message: 'Invalid status' });
    }

    const hasPermission = await checkUserPermission(userId, 'video_update');

    if (!hasPermission) {
        return res.status(403).json({ message: 'You do not have permission to update video status' });
    }

    try {
        const video = await UploadVideo.findById(videoId);
        if (!video) {
            return res.status(404).json({ message: 'Video not found' });
        }

        video.work_status = newStatus;
        await video.save();

        res.status(200).json({ message: 'Video status updated successfully' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating video status' });
    }
};