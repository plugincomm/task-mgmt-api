const Permission = require('../model/permission')

module.exports.validatePermissions = async function(req, res, next) {
    const { permissions } = req.body;

    if (!Array.isArray(permissions)) {
        return res.status(400).json({ success: false, message: "Permissions must be an array" });
    }

    try {
        const validPermissionIds = await Permission.find({ _id: { $in: permissions } }).distinct('_id');

        const invalidPermissions = permissions.filter(permission => !validPermissionIds.includes(permission));

        if (invalidPermissions.length > 0) {
            return res.status(400).json({ success: false, message: "Invalid permissions", invalidPermissions });
        }

        next();
    } catch (err) {
        res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
};