const Permission = require('../../model/permission');

module.exports.getPermission = async function(req, res) {
    try {
        const permissions = await Permission.find().sort({ dateCreated: -1 });
        if (permissions.length > 0) {
            return res.status(200).json({ success: true, message: "Permissions retrieved successfully", data: permissions });
        } else {
            return res.status(404).json({ success: false, message: "Permissions not found" });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
};

module.exports.getPermissionById = async function(req, res) {
    try {
        const permission = await Permission.findById(req.params.id);
        if (permission) {
            return res.status(200).json({ success: true, message: "Permission retrieved by Id successfully", data: permission });
        } else {
            return res.status(404).json({ success: false, message: "Permission not found" });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
};

module.exports.addPermission = async function(req, res) {
    const { permission_name, is_default } = req.body;

    try {
        const isExists = await Permission.findOne({ permission_name });

        if (isExists) {
            return res.status(400).json({ success: false, message: "Permission name already exists!" });
        }

        const obj = {
            permission_name,
            is_default: is_default ? parseInt(is_default) : 0 // Set is_default based on req.body, default to 0 if not provided
        };

        const permission = new Permission(obj);
        const newPermission = await permission.save();
        return res.status(201).json({ success: true, message: "Permission added successfully", data: newPermission });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error adding permission", error: error.message });
    }
};

module.exports.editPermission = async function(req, res) {
    const { id } = req.params; // Extract id from params
    const { permission_name, is_default } = req.body;

    try {
        const isExistID = await Permission.findById(id);

        if (!isExistID) {
            return res.status(404).json({ success: false, message: "Permission ID not found!" });
        }

        const isNameAssigned = await Permission.findOne({
            _id: { $ne: id },
            permission_name
        });

        if (isNameAssigned) {
            return res.status(400).json({ success: false, message: "Permission name already assigned to another permission!" });
        }

        const updateData = {
            permission_name,
            is_default: is_default ? parseInt(is_default) : 0
        };

        const permission = await Permission.findByIdAndUpdate(id, updateData, { new: true });

        if (!permission) {
            return res.status(404).json({ success: false, message: "Permission not found" });
        }

        return res.status(200).json({ success: true, message: "Permission updated successfully", data: permission });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Error updating permission", error: error.message });
    }
};

module.exports.deletePermission = async function(req, res) {
    try {
        const permission = await Permission.findByIdAndDelete(req.params.id);
        if (permission) {
            return res.status(200).json({ success: true, message: "Permission deleted successfully", data: permission });
        } else {
            return res.status(404).json({ success: false, message: "Permission not found" });
        }
    } catch (err) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
};
