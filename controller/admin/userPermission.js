const UserPermission = require('../../model/userPermission');
const User = require('../../model/user');

module.exports.getUserPermissions = async function(req, res) {
    try {
        const userPermissions = await UserPermission.find();
        if (userPermissions.length > 0) {
            return res.status(200).json({ success: true, message: "User permissions retrieved successfully", data: userPermissions });
        } else {
            return res.status(404).json({ success: false, message: "No user permissions found" });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
};

module.exports.getUserPermissionById = async function(req, res) {
    try {
        const userPermission = await UserPermission.findById(req.params.id);
        if (userPermission) {
            return res.status(200).json({ success: true, message: "User permission retrieved by Id successfully", data: userPermission });
        } else {
            return res.status(404).json({ success: false, message: "User permission not found" });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
};

module.exports.assignPermission = async function(req, res) {
    const { user_email, permissions } = req.body;

            // Validate user email
            if (!user_email || typeof user_email !== 'string') {
                return res.status(400).json({ success: false, message: "Invalid or missing user email" });
            }
    
            // Check if user exists
            const user = await User.findOne({ email: user_email });
            if (!user) {
                return res.status(404).json({ success: false, message: "User not found" });
            }
    
            // Check if user permissions already exist
            const existingUserPermission = await UserPermission.findOne({ user_email });
            if (existingUserPermission) {
                return res.status(400).json({ success: false, message: "User permissions already exist" });
            }
    
            // Validate and format permissions
            const formattedPermissions = permissions.map(p => {
                if (!mongoose.Types.ObjectId.isValid(p.permission)) {
                    throw new Error(`Invalid permission ID: ${p.permission}`);
                }
                return {
                    permission: mongoose.Types.ObjectId(p.permission), // Ensure this is an ObjectId
                    permission_value: p.permission_value // Ensure this is a valid number within the enum values
                };
            });
    
            // Create and save user permissions
            const userPermissions = new UserPermission({ user_email, permissions: formattedPermissions });
            const savedUserPermissions = await userPermissions.save();
    
            return res.status(201).json({ success: true, message: "Permissions assigned successfully", data: savedUserPermissions });
};

module.exports.editUserPermission = async function(req, res) {
    const { id } = req.params;
    const { user_email, permissions } = req.body;

    try {
        const isExistID = await UserPermission.findById(id);

        if (!isExistID) {
            return res.status(404).json({ success: false, message: "User permission ID not found!" });
        }

        const updateData = {
            user_email,
            permissions
        };

        const userPermission = await UserPermission.findByIdAndUpdate(id, updateData, { new: true });

        if (!userPermission) {
            return res.status(404).json({ success: false, message: "User permission not found" });
        }

        return res.status(200).json({ success: true, message: "User permission updated successfully", data: userPermission });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error updating user permission", error: error.message });
    }
};

module.exports.deleteUserPermission = async function(req, res) {
    try {
        const userPermission = await UserPermission.findByIdAndDelete(req.params.id);
        if (userPermission) {
            return res.status(200).json({ success: true, message: "User permission deleted successfully", data: userPermission });
        } else {
            return res.status(404).json({ success: false, message: "User permission not found" });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
};
