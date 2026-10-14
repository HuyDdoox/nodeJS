const mongoose = require('mongoose');
const Users = require('../models/user');

// Lấy toàn bộ danh sách người dùng
const getAllUsers = async (req, res, next) => {
    try {
        let data = await Users.find();
        let users = data.map(u => ({
            id: u._id,
            username: u.username,
            email: u.email,
            fullname: u.fullname,
            phone: u.phone,
            role: u.role,
            status: u.status !== undefined ? u.status : true,
            createdAt: u.createdAt
        }));
        // 200: Xử lý thành công
        res.status(200).json(users);
    } catch (err) {
        // 500: Lỗi phía Server
        res.status(500).json({ message: err.message });
    }
}

// Lấy thông tin chi tiết một người dùng dựa trên ID
const getUserById = async (req, res, next) => {
    try {
        let id = req.params.id;
        // 400: Sai định dạng ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }
        let user = await Users.findById(id);
        // 404: Không tìm thấy người dùng
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        // 200: Thành công
        res.status(200).json({
            id: user._id,
            username: user.username,
            email: user.email,
            fullname: user.fullname,
            phone: user.phone,
            role: user.role,
            status: user.status !== undefined ? user.status : true,
            createdAt: user.createdAt
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Thêm mới một người dùng (Đăng ký)
const createUser = async (req, res, next) => {
    try {
        let { username, password, email, fullname, phone, role, status } = req.body;
        
        // 400: Thiếu trường bắt buộc
        if (!username || !password || !email) {
            return res.status(400).json({ message: "Username, password, and email are required" });
        }

        username = username.trim();
        email = email.trim();

        if (!username || !email) {
            return res.status(400).json({ message: "Username and email cannot be empty" });
        }

        // 409: Xung đột dữ liệu đã tồn tại (trùng username hoặc email)
        const existingUser = await Users.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(409).json({ message: "Username or email already exists" });
        }

        let userStatus = true;
        if (status !== undefined) {
            userStatus = !(status === false || status === 'false' || status === 0 || status === '0' || status === 'hidden' || status === 'hide' || status === 'blocked');
        }

        const newUser = new Users({
            username: username,
            password,
            email: email,
            fullname,
            phone,
            role: role || 'user',
            status: userStatus
        });

        const savedUser = await newUser.save();
        // 201: Tạo mới thành công
        res.status(201).json({
            id: savedUser._id,
            username: savedUser.username,
            email: savedUser.email,
            fullname: savedUser.fullname,
            phone: savedUser.phone,
            role: savedUser.role,
            status: savedUser.status,
            createdAt: savedUser.createdAt
        });
    } catch (err) {
        // 500: Lỗi Server
        res.status(500).json({ message: err.message });
    }
}

// Cập nhật thông tin người dùng theo ID
const updateUser = async (req, res, next) => {
    try {
        let id = req.params.id || req.body.id;

        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        const user = await Users.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let { username, password, email, fullname, phone, role, status, isHidden } = req.body;

        // Validate username
        if (username !== undefined) {
            username = username.trim();
            if (!username) {
                return res.status(400).json({ message: "Username cannot be empty" });
            }
            const existingUser = await Users.findOne({ username, _id: { $ne: id } });
            if (existingUser) {
                return res.status(409).json({ message: "Username already exists" });
            }
        }

        // Validate email
        if (email !== undefined) {
            email = email.trim();
            if (!email) {
                return res.status(400).json({ message: "Email cannot be empty" });
            }
            const existingUser = await Users.findOne({ email, _id: { $ne: id } });
            if (existingUser) {
                return res.status(409).json({ message: "Email already exists" });
            }
        }

        // Validate role
        if (role !== undefined && !['user', 'admin'].includes(role)) {
            return res.status(400).json({ message: "Role must be 'user' or 'admin'" });
        }

        // Xử lý trạng thái ẩn / hiện / khóa tài khoản
        let userStatus;
        if (status !== undefined) {
            if (status === false || status === 'false' || status === 0 || status === '0' || status === 'hidden' || status === 'hide' || status === 'blocked' || status === 'locked') {
                userStatus = false;
            } else {
                userStatus = true;
            }
        } else if (isHidden !== undefined) {
            if (isHidden === true || isHidden === 'true' || isHidden === 1 || isHidden === '1') {
                userStatus = false;
            } else {
                userStatus = true;
            }
        }

        const updateData = {};
        if (username !== undefined) updateData.username = username;
        if (password !== undefined) updateData.password = password;
        if (email !== undefined) updateData.email = email;
        if (fullname !== undefined) updateData.fullname = fullname;
        if (phone !== undefined) updateData.phone = phone;
        if (role !== undefined) updateData.role = role;
        if (userStatus !== undefined) updateData.status = userStatus;

        const updatedUser = await Users.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).select('-password');

        res.status(200).json(updatedUser);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Thay đổi trạng thái ẩn / hiện (khóa / mở khóa) người dùng
const changeUserStatus = async (req, res, next) => {
    try {
        let id = req.params.id || req.body.id;

        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        const user = await Users.findById(id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        let { status, isHidden } = req.body;
        let newStatus;

        if (status !== undefined) {
            newStatus = !(status === false || status === 'false' || status === 0 || status === '0' || status === 'hidden' || status === 'hide' || status === 'blocked' || status === 'locked');
        } else if (isHidden !== undefined) {
            newStatus = !(isHidden === true || isHidden === 'true' || isHidden === 1 || isHidden === '1');
        } else {
            newStatus = user.status !== undefined ? !user.status : false;
        }

        user.status = newStatus;
        const updatedUser = await user.save();

        res.status(200).json({
            message: newStatus ? "Tài khoản hiện đang hoạt động" : "Tài khoản đã bị khóa (ẩn)",
            user: {
                id: updatedUser._id,
                username: updatedUser.username,
                email: updatedUser.email,
                fullname: updatedUser.fullname,
                phone: updatedUser.phone,
                role: updatedUser.role,
                status: updatedUser.status,
                createdAt: updatedUser.createdAt
            }
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Xóa người dùng dựa trên ID
const deleteUser = async (req, res, next) => {
    try {
        let id = req.params.id || req.body.id;

        if (!id) {
            return res.status(400).json({ message: "User ID is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid user ID format" });
        }

        const deletedUser = await Users.findByIdAndDelete(id).select('-password');
        if (!deletedUser) {
            return res.status(404).json({ message: "User not found" });
        }

        res.status(200).json({
            message: "User deleted successfully",
            deletedUser
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { 
    getAllUsers, 
    getUserById, 
    createUser,
    updateUser,
    updateUsers: updateUser,
    changeUser: updateUser,
    changeUsers: updateUser,
    changeUserStatus,
    deleteUser,
    deleteUsers: deleteUser
};
