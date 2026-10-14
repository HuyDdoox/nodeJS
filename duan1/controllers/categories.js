// định nghĩa hàm: lấy dữ liệu, validate. thực hiện hàm chính (service) và res,json
const mongoose = require('mongoose');
const Category = require('../models/categories');
//viết xử lí ngay tại chỗ
//kết nối hệ thống quản trị cơ sở dữ liệu =>mongo => viết trong app.js
//kết nối colection =>model=>import model vào đây


// Lấy toàn bộ danh sách danh mục
const getAllCategories = async (req, res, next) => {
    try {
        // trả về nguyên collection trong mongo(_id, _v)
        let data = await Category.find();
        // gán biến categories dữ liệu đã được map lại và tuỳ chỉnh
        // bỏ các trường không cần thiết (_id, _v)
        let categories = data.map(c => ({
            id: c._id,
            name: c.name,
            description: c.description,
            status: c.status !== undefined ? c.status : true
        }));
        res.status(200).json(categories);
    } catch (err) {
        // 5xx: Lỗi xử lý từ phía server
        res.status(500).json({ message: err.message });
    }
}

// Lấy thông tin chi tiết một danh mục theo ID
const getCategoryById = async (req, res, next) => {
    try {
        let id = req.params.id;
        // 400: Client gửi ID sai định dạng
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid category ID format" });
        }
        let cate = await Category.findById(id);
        
        // 404: Không tìm thấy tài nguyên theo yêu cầu của Client
        if (!cate) {
            return res.status(404).json({ message: "Category not found" });
        }

        // 200: Xử lý thành công
        res.status(200).json({
            id: cate._id,
            name: cate.name,
            description: cate.description,
            status: cate.status !== undefined ? cate.status : true
        });
        
    } catch (err) {
        // 500: Lỗi phía Server
        res.status(500).json({ message: err.message });
    }
}

// Lấy thông tin chi tiết một danh mục theo tên
const getCategoryByName = async (req, res, next) => {
    try {
        let name = req.params.name;
        let data = await Category.findOne({ name: name });
        if (!data) {
            return res.status(404).json({ message: "Category not found" });
        }
        res.status(200).json(data);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Thêm mới một danh mục vào cơ sở dữ liệu
const createCategory = async (req, res, next) => {
    try {
        let { name, description, status } = req.body;

        // 400: Lỗi Client - thiếu trường bắt buộc
        if (!name || !description) {
            return res.status(400).json({ message: "Name and description are required" });
        }

        name = name.trim();
        description = description.trim();

        if (!name || !description) {
            return res.status(400).json({ message: "Name and description cannot be empty" });
        }

        // 409: Lỗi Client - Xung đột dữ liệu đã tồn tại (Duplicate)
        let category = await Category.findOne({ name: name });
        if (category) {
            return res.status(409).json({ message: "Category already exists" });
        }

        let categoryStatus = true;
        if (status !== undefined) {
            categoryStatus = !(status === false || status === 'false' || status === 0 || status === '0' || status === 'hidden' || status === 'hide');
        }

        let newCategories = new Category({
            name: name,
            description: description,
            status: categoryStatus
        });

        await newCategories.save();
        // 201: Tạo mới thành công
        res.status(201).json(newCategories);
        
    } catch (err) {
        // 500: Lỗi phát sinh trong quá trình server thực thi
        res.status(500).json({ message: err.message });
    }
}

// Cập nhật thông tin danh mục theo ID (hỗ trợ sửa thông tin và ẩn/hiện)
const updateCategory = async (req, res, next) => {
    try {
        let id = req.params.id || req.body.id;

        // 400: Client không truyền ID hoặc ID sai định dạng
        if (!id) {
            return res.status(400).json({ message: "Category ID is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid category ID format" });
        }

        const cate = await Category.findById(id);
        // 404: Không tìm thấy danh mục để cập nhật
        if (!cate) {
            return res.status(404).json({ message: "Category not found" });
        }

        let { name, description, status, isHidden } = req.body;

        // Validate tên danh mục nếu có cập nhật
        if (name !== undefined) {
            name = name.trim();
            if (!name) {
                return res.status(400).json({ message: "Category name cannot be empty" });
            }
            // 409: Trùng tên với danh mục khác đã tồn tại
            const existingCate = await Category.findOne({ name, _id: { $ne: id } });
            if (existingCate) {
                return res.status(409).json({ message: "Category name already exists" });
            }
        }

        if (description !== undefined) {
            description = description.trim();
        }

        // Xử lý trạng thái ẩn / hiện (status: true = hiện, false = ẩn)
        let categoryStatus;
        if (status !== undefined) {
            if (status === false || status === 'false' || status === 0 || status === '0' || status === 'hidden' || status === 'hide') {
                categoryStatus = false; // Ẩn
            } else {
                categoryStatus = true; // Hiện
            }
        } else if (isHidden !== undefined) {
            if (isHidden === true || isHidden === 'true' || isHidden === 1 || isHidden === '1') {
                categoryStatus = false; // Ẩn
            } else {
                categoryStatus = true; // Hiện
            }
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (description !== undefined) updateData.description = description;
        if (categoryStatus !== undefined) updateData.status = categoryStatus;

        const updatedCategory = await Category.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );

        // 200: Cập nhật thành công
        res.status(200).json(updatedCategory);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Thay đổi trạng thái ẩn / hiện của danh mục
const changeCategoryStatus = async (req, res, next) => {
    try {
        let id = req.params.id || req.body.id;

        if (!id) {
            return res.status(400).json({ message: "Category ID is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid category ID format" });
        }

        const cate = await Category.findById(id);
        if (!cate) {
            return res.status(404).json({ message: "Category not found" });
        }

        let { status, isHidden } = req.body;
        let newStatus;

        if (status !== undefined) {
            newStatus = !(status === false || status === 'false' || status === 0 || status === '0' || status === 'hidden' || status === 'hide');
        } else if (isHidden !== undefined) {
            newStatus = !(isHidden === true || isHidden === 'true' || isHidden === 1 || isHidden === '1');
        } else {
            // Tự động toggle (hiện <-> ẩn)
            newStatus = cate.status !== undefined ? !cate.status : false;
        }

        cate.status = newStatus;
        const updatedCategory = await cate.save();

        res.status(200).json({
            message: newStatus ? "Danh mục hiện đang hiển thị" : "Danh mục đã được ẩn",
            category: updatedCategory
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Xóa danh mục dựa trên ID
const deleteCategory = async (req, res, next) => {
    try {
        let id = req.params.id || req.body.id;

        if (!id) {
            return res.status(400).json({ message: "Category ID is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid category ID format" });
        }

        const deletedCategory = await Category.findByIdAndDelete(id);
        if (!deletedCategory) {
            return res.status(404).json({ message: "Category not found" });
        }

        res.status(200).json({
            message: "Category deleted successfully",
            deletedCategory
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { 
    getAllCategories, 
    getCategoryById, 
    getCategoryByName, 
    createCategory,
    updateCategory,
    updateCategories: updateCategory,
    changeCategory: updateCategory,
    changeCategories: updateCategory,
    changeCategoryStatus,
    deleteCategory,
    deleteCategories: deleteCategory
};
