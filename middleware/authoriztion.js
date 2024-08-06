const UserPermission = require('../model/userPermission');
const UploadVideo = require('../model/uploadvideo');
const Role = require('../model/role');

module.exports.onlyAdminAccess = (req, res, next) => {
    try {
        // Ensure user information is available
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized: No user information found" });
        }
        console.log("User Data:", req);
        // Check if the user's role is 'admin'
        if (req.user.role !== 'admin') {
            return res.status(403).json({ success: false, message: "Forbidden: You don't have permission to access this route" });
        }
        
        // Proceed to the next middleware or route handler
        next();
    } catch (err) {
        return res.status(500).json({ success: false, message: "Something went wrong", error: err.message });
    }
};

module.exports.onlyUserAccess = (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ success: false, message: "Unauthorized: No user information found" });
        }

        if (req.user.role !== 'user') {
            return res.status(403).json({ success: false, message: "Forbidden: You don't have permission to access this route" });
        }
        
        next();
    } catch (err) {
        return res.status(500).json({ success: false, message: "Something went wrong", error: err.message });
    }
};


module.exports.checkPermission = (permissionValue) =>{
    return async (req, res, next) => {
        const userId = req.user.id; // Assuming you have user id in req.user
        try {
            const userPermissions = await UserPermission.findOne({ user_id: userId });

            if (!userPermissions) {
                return res.status(403).json({ success: false, message: "Access denied. No permissions assigned." });
            }

            const hasPermission = userPermissions.permissions.some(permission => permission.permission_value.includes(permissionValue));

            if (!hasPermission) {
                return res.status(403).json({ success: false, message: "Access denied. Insufficient permissions." });
            }

            next();
        } catch (error) {
            return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
        }
    };
}

