const mongoose = require('mongoose');
const Products = require('../models/product');
const Category = require('../models/categories');

// Lấy toàn bộ danh sách sản phẩm
const getAllProducts = async (req, res, next) => {
    try {
        let data = await Products.find().populate('category');
        let products = data.map(p => ({
            id: p._id,
            name: p.name,
            price: p.price,
            quantity: p.quantity,
            image: p.image,
            description: p.description,
            stock: p.stock,
            sold: p.sold,
            status: p.status !== undefined ? p.status : true,
            category: p.category
        }));
        // 200: Xử lý thành công
        res.status(200).json(products);
    } catch (err) {
        // 500: Lỗi Server
        res.status(500).json({ message: err.message });
    }
}

// Thêm mới một sản phẩm vào cơ sở dữ liệu
const createProduct = async (req, res, next) => {
    try {
        let { name, price, quantity, image, description, stock, sold, category } = req.body;

        // 400: Lỗi Client - Kiểm tra thiếu trường bắt buộc
        if (!name || price === undefined || quantity === undefined || !image || !description || !category) {
            return res.status(400).json({ message: "All fields (name, price, quantity, image, description, category) are required" });
        }

        name = name.trim();
        description = description.trim();

        if (!name || !description) {
            return res.status(400).json({ message: "Name and description cannot be empty" });
        }

        // 400: Lỗi Client - Giá không hợp lệ
        if (isNaN(price) || Number(price) < 0) {
            return res.status(400).json({ message: "Price must be a valid positive number" });
        }
        
        // 400: Lỗi Client - Số lượng không hợp lệ
        if (isNaN(quantity) || Number(quantity) < 0) {
            return res.status(400).json({ message: "Quantity must be a valid positive number" });
        }

        // 400: Lỗi Client - Định dạng ID danh mục không đúng
        if (!mongoose.Types.ObjectId.isValid(category)) {
            return res.status(400).json({ message: "Invalid category ID format" });
        }

        // 404: Lỗi Client - Danh mục không tồn tại
        const existingCategory = await Category.findById(category);
        if (!existingCategory) {
            return res.status(404).json({ message: "Category does not exist" });
        }

        // 409: Lỗi Client - Trùng tên sản phẩm
        const existingProduct = await Products.findOne({ name });
        if (existingProduct) {
            return res.status(409).json({ message: "Product already exists" });
        }

        // Create product
        const newProduct = new Products({
            name,
            price: Number(price),
            quantity: Number(quantity),
            image,
            description,
            stock: (stock !== undefined && !isNaN(stock)) ? Number(stock) : 0,
            sold: (sold !== undefined && !isNaN(sold)) ? Number(sold) : 0,
            category: existingCategory._id
        });

        const savedProduct = await newProduct.save();
        // 201: Tạo mới thành công
        res.status(201).json(savedProduct);

    } catch (err) {
        // 500: Lỗi Server
        res.status(500).json({ message: err.message });
    }
}

// Lấy chi tiết thông tin một sản phẩm dựa trên ID
const getProductById = async (req, res, next) => {
    try {
        let id = req.params.id;

        // 400: Sai định dạng ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }

        let product = await Products.findById(id).populate('category');
        // 404: Không tìm thấy sản phẩm
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        // 200: Thành công
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Lấy danh sách sản phẩm dựa trên ID của danh mục
const getProductsByCategory = async (req, res, next) => {
    try {
        let categoryId = req.params.id;

        // 400: Sai định dạng category ID
        if (!mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ message: "Invalid category ID format" });
        }

        let products = await Products.find({ category: categoryId }).populate('category');
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Tìm kiếm danh sách sản phẩm dựa trên tên (tìm kiếm gần đúng)
const getProductByName = async (req, res, next) => {
    try {
        let name = req.params.name;
        let products = await Products.find({ name: { $regex: name, $options: 'i' } }).populate('category');
        res.status(200).json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Cập nhật thông tin sản phẩm dựa trên ID
const updateProducts = async (req, res, next) => {
    try {
        let id = req.params.id || req.body.id;

        // 400: Lỗi Client
        if (!id) {
            return res.status(400).json({ message: "Product ID is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }

        // 404: Không tìm thấy sản phẩm để cập nhật
        const product = await Products.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let { name, price, quantity, image, description, stock, sold, category, status, isHidden } = req.body;

        // Validate tên sản phẩm nếu có cập nhật
        if (name !== undefined) {
            name = name.trim();
            if (!name) {
                return res.status(400).json({ message: "Product name cannot be empty" });
            }
            // 409: Trùng tên với sản phẩm khác
            const existingProduct = await Products.findOne({ name, _id: { $ne: id } });
            if (existingProduct) {
                return res.status(409).json({ message: "Product name already exists" });
            }
        }

        // Validate giá
        if (price !== undefined) {
            if (isNaN(price) || Number(price) < 0) {
                return res.status(400).json({ message: "Price must be a valid positive number" });
            }
        }

        // Validate số lượng
        if (quantity !== undefined) {
            if (isNaN(quantity) || Number(quantity) < 0) {
                return res.status(400).json({ message: "Quantity must be a valid positive number" });
            }
        }

        // Validate tồn kho
        if (stock !== undefined) {
            if (isNaN(stock) || Number(stock) < 0) {
                return res.status(400).json({ message: "Stock must be a valid positive number" });
            }
        }

        // Validate số lượng đã bán
        if (sold !== undefined) {
            if (isNaN(sold) || Number(sold) < 0) {
                return res.status(400).json({ message: "Sold must be a valid positive number" });
            }
        }

        // Validate category
        if (category !== undefined) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(400).json({ message: "Invalid category ID format" });
            }
            const existingCategory = await Category.findById(category);
            if (!existingCategory) {
                return res.status(404).json({ message: "Category does not exist" });
            }
        }

        if (description !== undefined) {
            description = description.trim();
        }

        // Xử lý trạng thái ẩn / hiện (status: true = hiện, false = ẩn)
        let productStatus;
        if (status !== undefined) {
            if (status === false || status === 'false' || status === 0 || status === '0' || status === 'hidden' || status === 'hide') {
                productStatus = false; // Ẩn
            } else {
                productStatus = true; // Hiện
            }
        } else if (isHidden !== undefined) {
            if (isHidden === true || isHidden === 'true' || isHidden === 1 || isHidden === '1') {
                productStatus = false; // Ẩn
            } else {
                productStatus = true; // Hiện
            }
        }

        const updateData = {};
        if (name !== undefined) updateData.name = name;
        if (price !== undefined) updateData.price = Number(price);
        if (quantity !== undefined) updateData.quantity = Number(quantity);
        if (image !== undefined) updateData.image = image;
        if (description !== undefined) updateData.description = description;
        if (stock !== undefined) updateData.stock = Number(stock);
        if (sold !== undefined) updateData.sold = Number(sold);
        if (category !== undefined) updateData.category = category;
        if (productStatus !== undefined) updateData.status = productStatus;

        const updatedProduct = await Products.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('category');

        // 200: Cập nhật thành công
        res.status(200).json(updatedProduct);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Thay đổi trạng thái ẩn / hiện sản phẩm (changeProductStatus)
const changeProductStatus = async (req, res, next) => {
    try {
        let id = req.params.id || req.body.id;

        if (!id) {
            return res.status(400).json({ message: "Product ID is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }

        const product = await Products.findById(id);
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }

        let { status, isHidden } = req.body;
        let newStatus;

        if (status !== undefined) {
            newStatus = !(status === false || status === 'false' || status === 0 || status === '0' || status === 'hidden' || status === 'hide');
        } else if (isHidden !== undefined) {
            newStatus = !(isHidden === true || isHidden === 'true' || isHidden === 1 || isHidden === '1');
        } else {
            // Tự động toggle (nếu đang hiện -> ẩn, đang ẩn -> hiện) khi không truyền status
            newStatus = product.status !== undefined ? !product.status : false;
        }

        product.status = newStatus;
        const updatedProduct = await product.save();
        await updatedProduct.populate('category');

        res.status(200).json({
            message: newStatus ? "Sản phẩm hiện đang hiển thị" : "Sản phẩm đã được ẩn",
            product: updatedProduct
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Xóa sản phẩm dựa trên ID
const deleteProducts = async (req, res, next) => {
    try {
        let id = req.params.id || req.body.id;

        if (!id) {
            return res.status(400).json({ message: "Product ID is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid product ID format" });
        }

        const deletedProduct = await Products.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(404).json({ message: "Product not found" });
        }

        res.status(200).json({ 
            message: "Product deleted successfully", 
            deletedProduct 
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { 
    getAllProducts, 
    createProduct, 
    getProductById, 
    getProductsByCategory, 
    getProductByName,
    updateProducts,
    updateProduct: updateProducts,
    changeProduct: updateProducts,
    changeProducts: updateProducts,
    changeProductStatus,
    deleteProducts,
    deleteProduct: deleteProducts
};
