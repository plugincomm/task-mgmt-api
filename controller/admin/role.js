const Role = require('../../model/role');

module.exports.getRole = async function(req, res) {
    try {
        const roles = await Role.find().sort({ createdAt: -1 });
        if (roles.length > 0) {
            return res.status(200).json({ success: true, message: "Roles Found Successfully!", data: roles });
        } else {
            return res.status(404).json({ success: false, message: "Roles not found" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

module.exports.getRoleById = async function(req, res) {
    try {
        const role = await Role.findById(req.params.id);
        if (role) {
            return res.status(200).json({ success: true, message: "Role Found By ID Successfully!", data: role });
        } else {
            return res.status(404).json({ success: false, message: "Role not found" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

module.exports.addRole = async function(req, res) {
    const { role_name, value, permissions } = req.body;

    const validRoles = ["super_admin", "admin", "user"];
    if (!validRoles.includes(value)) {
        return res.status(400).json({ success: false, message: "Invalid role value" });
    }

    try {
        if (["super_admin", "admin"].includes(value)) {
            const existingRole = await Role.findOne({ value });
            if (existingRole) {
                return res.status(400).json({ success: false, message: `${value} role already exists` });
            }
        }

        const role = new Role({
            role_name,
            value,
            permissions
        });
        const saveRole = await role.save();
        return res.status(201).json({ success: true, message: "Role Submitted Successfully!", data: saveRole });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

module.exports.editRole = async function(req, res) {
    try {
        const { role_name, value, permissions } = req.body;

        const validRoles = ["super_admin", "admin", "user"];
        if (!validRoles.includes(value)) {
            return res.status(400).json({ success: false, message: "Invalid role value" });
        }

        const roleUpdate = await Role.findByIdAndUpdate(req.params.id, {
            role_name,
            value,
            permissions
        }, { new: true });

        if (!roleUpdate) {
            return res.status(404).json({ success: false, message: "Role not found" });
        }
        return res.status(200).json({ success: true, message: "Role Updated Successfully!", data: roleUpdate });
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};

module.exports.deleteRole = async function(req, res) {
    try {
        const roleDel = await Role.findByIdAndDelete(req.params.id);
        if (roleDel) {
            return res.status(200).json({ success: true, message: "Role Deleted Successfully!", data: roleDel });
        } else {
            return res.status(404).json({ success: false, message: "Role not found" });
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: "Internal Server Error", error: error.message });
    }
};
