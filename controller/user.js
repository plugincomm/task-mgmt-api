const User = require('../model/user');
const Role = require('../model/role')
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

module.exports = {
    getUser: async function (req, res) {
        try {
            const users = await User.find().sort({dateCreated: -1 });
            if (users) {
                res.status(200).json({ success: true, message: "Users retrieved successfully", users });
            } else {
                res.status(404).json({ success: false, message: "Users not found" });
            }
        } catch (err) {
            res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
        }
    },

    getUserByID: async function (req, res) {
        try {
            const user = await User.findById(req.params.id);
            if (user) {
                res.status(200).json({ success: true, message: "User retrieved successfully", user });
            } else {
                res.status(404).json({ success: false, message: "User not found" });
            }
        } catch (err) {
            res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
        }
    },

    addUser: async function (req, res) {
        try {
            const { username, date_of_birth, gender, email, password, phone, village_apartment, street, pincode, city, state, country, role } = req.body;
    
            // Check if email already exists
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "Email already in use." });
            }
    
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);
    
            // Find the role by its value (e.g., 'user' or 'admin')
            let userRole = await Role.findOne({ value: role });
            if (!userRole) {
                // If role is not found, use the default 'user' role
                userRole = await Role.findOne({ value: 'user' });
                if (!userRole) {
                    return res.status(500).json({ success: false, message: "Default role not found." });
                }
            }
    
            const newUser = new User({
                username,
                date_of_birth,
                gender,
                email,
                password: hashedPassword,
                phone,
                village_apartment,
                street,
                pincode,
                city,
                state,
                country,
                role: userRole._id
            });
    
            const savedUser = await newUser.save();
            res.status(201).json({ success: true, message: "User Registered successfully!", user: savedUser });
        } catch (err) {
            res.status(500).json({ success: false, message: "User cannot be created!", error: err.message });
        }
    },

    userLogin: async function (req, res) {
        try {
            const user = await User.findOne({ email: req.body.email }).populate('role');
            if (!user) {
                return res.status(404).json({ success: false, message: "Email not found" });
            }
    
            // Log the user object to check the role field
            console.log('User:', user);
    
            if (!user.role) {
                return res.status(500).json({ success: false, message: "User role is not defined" });
            }
    
            const isMatch = bcrypt.compareSync(req.body.password, user.password);
            if (isMatch) {
                const token = jwt.sign(  
                    {
                        userId: user._id,
                        role: user.role.value // assuming 'role' is the string identifier for the role
                    },
                    process.env.SECRET,
                    { expiresIn: '1d' }
                );
                return res.status(200).json({ success: true, email: user.email, token: token, role: user.role.value, userId:user._id });
            } else {
                return res.status(400).json({ success: false, message: "Password is incorrect!" });
            }
        } catch (err) {
            console.log('Internal Server Error:', err);
            return res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
        }
    },
    

    registerUser: async function (req, res) {
        try {
            const { username, email, password, date_of_birth, gender, role } = req.body;

            const existingUser = await User.findOne({ email });
            if (existingUser) {
                return res.status(400).json({ success: false, message: "Email already in use." });
            }

            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            let userRole = await Role.findOne({ value: role });
            if (!userRole) {
                // If role is not found, use the default 'user' role
                userRole = await Role.findOne({ value: 'user' });
                if (!userRole) {
                    return res.status(500).json({ success: false, message: "Default role not found." });
                }
            }

            const newUser = new User({
                username,
                email,
                password: hashedPassword,
                date_of_birth,
                gender,
                role: userRole._id
            });

            const savedUser = await newUser.save();
            res.status(201).json({ success: true, message: "User Registered successfully!", user: savedUser });
        } catch (err) {
            res.status(500).json({ success: false, message: "User cannot be created!", error: err.message });
        }
    },

    editUser: async function (req, res) {
        try {
            const { id } = req.params;
            const { username, date_of_birth, gender, email, password, phone, village_apartment, street, pincode, city, state, country, role } = req.body;
    
            let userRole = await Role.findOne({ value: role });
            if (!userRole) {
                // If role is not found, use the default 'user' role
                userRole = await Role.findOne({ value: 'user' });
                if (!userRole) {
                    return res.status(500).json({ success: false, message: "Default role not found." });
                }
            }
    
            const updateData = {
                username,
                date_of_birth,
                gender,
                email,
                phone,
                village_apartment,
                street,
                pincode,
                city,
                state,
                country,
                role: userRole._id
            };
    
            if (password) {
                const salt = await bcrypt.genSalt(10);
                const hashedPassword = await bcrypt.hash(password, salt);
                updateData.password = hashedPassword;
            }
    
            const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
    
            if (updatedUser) {
                res.status(200).json({ success: true, message: "User updated successfully", user: updatedUser });
            } else {
                res.status(404).json({ success: false, message: "User not found" });
            }
        } catch (err) {
            res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
        }
    },

    deleteUser: async function (req, res){ 
        try{
            const user = await User.findByIdAndDelete(req.params.id);
            if(user){
                return res.status(200).json({ success: true, message: "User deleted Successfully!" })
            } else {
                return res.status(404).json({ success:false, message: "User Can not deleted" })
            }
        } catch {
            return res.status(500).json({ success:false, message: "Internal Server Error" })
        }
    },



    getUserCount: async function (req, res){
        try {
            const userCount = await User.countDocuments();
            console.log("User Count:",userCount)
            if (userCount === 0) {
                return res.status(404).json({
                    success: false,
                    message: "No users found"
                });
            }
    
            res.status(200).json({
                success: true,
                userCount: userCount
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: "User count failed",
                error: error.message
            });
        }
    }
};
