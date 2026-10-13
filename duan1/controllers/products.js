const mongoose = require('mongoose');
const Products = require('../models/product');
const Category = require('../models/categories'); // Đã sửa từ category thành categories
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
        res.json(products);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}
// //add product
// id: { type: ObjectId }, //khóa chính
//     name: { type: String, required: true, unique: true },
//     price: { type: Number },
//     quantity: { type: Number },
//     image: { type: String },
//     description: { type: String },
//     stock: { type: Number, required: true, min: 0, default: 0 },
//     sold: { type: Number, required: true, min: 0 },
//     createdAt: { type: Date, default: Date.now }, // 
//     vairiant: { type: [variant] },
//     category: { type: ObjectId, ref: 'categories' }, //khóa ngoại
// Thêm mới một sản phẩm vào cơ sở dữ liệu
const createProduct = async(req,res,next) => {
    try {
        let { name, price, quantity, image, description,sold,category} = req.body;

        // 1. Kiểm tra bắt buộc validate (Phải kiểm tra trước khi dùng .trim() để tránh lỗi crash do biến bị undefined)
        if (!name || !price || !quantity || !image || !description || !category) {
            return res.status(500).json({ message: "All fields are required" });
        }

        name = name.trim();
        description = description.trim();

        // 2. check giá
        if(isNaN(price) || Number(price) < 0) {
            return res.status(500).json({ message: "Price must be a valid positive number" });
        }
        
        // 3. check số lượng
        if(isNaN(quantity) || Number(quantity) < 0) {
            return res.status(500).json({ message: "Quantity must be a valid positive number" });
        }
        //4 check category id
        const existingCategory = await Category.findById(category);
        if (!existingCategory) {
            return res.status(500).json({ message: "Category does not exist" });
        }

        // 5. Kiểm tra trùng tên (nếu muốn)
        const existingProduct = await Products.findOne({ name });
        if (existingProduct) {
            return res.status(500).json({ message: "Product already exists" });
        }

        // 6. Create product
        const newProduct = new Products({
            name,
            price: Number(price),
            quantity: Number(quantity),
            image,
            description,
            sold: Number(sold),
            category: existingCategory._id
        });

        const savedProduct = await newProduct.save();
        res.status(201).json(savedProduct);

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Lấy chi tiết thông tin một sản phẩm dựa trên ID
const getProductById = async (req, res, next) => {
    try {
        let id = req.params.id;
        let product = await Products.findById(id).populate('category');
        if (!product) {
            return res.status(404).json({ message: "Product not found" });
        }
        res.status(200).json(product);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

// Lấy danh sách sản phẩm dựa trên ID của danh mục
const getProductsByCategory = async (req, res, next) => {
    try {
        let categoryId = req.params.id;
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

        // 1. Kiểm tra ID có được truyền vào không và đúng định dạng ObjectId không
        if (!id) {
            return res.status(500).json({ message: "Product ID is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(500).json({ message: "Invalid product ID format" });
        }

        // 2. Kiểm tra sản phẩm có tồn tại trong database không
        const product = await Products.findById(id);
        if (!product) {
            return res.status(500).json({ message: "Product not found" });
        }

        let { name, price, quantity, image, description, stock, sold, category, status, isHidden } = req.body;

        // 3. Validate dữ liệu đầu vào
        // Kiểm tra tên sản phẩm nếu có cập nhật
        if (name !== undefined) {
            name = name.trim();
            if (!name) {
                return res.status(500).json({ message: "Product name cannot be empty" });
            }
            // Kiểm tra trùng tên với sản phẩm khác (ngoại trừ chính sản phẩm này)
            const existingProduct = await Products.findOne({ name, _id: { $ne: id } });
            if (existingProduct) {
                return res.status(500).json({ message: "Product name already exists" });
            }
        }

        // Kiểm tra giá nếu có cập nhật
        if (price !== undefined) {
            if (isNaN(price) || Number(price) < 0) {
                return res.status(500).json({ message: "Price must be a valid positive number" });
            }
        }

        // Kiểm tra số lượng nếu có cập nhật
        if (quantity !== undefined) {
            if (isNaN(quantity) || Number(quantity) < 0) {
                return res.status(500).json({ message: "Quantity must be a valid positive number" });
            }
        }

        // Kiểm tra tồn kho (stock) nếu có cập nhật
        if (stock !== undefined) {
            if (isNaN(stock) || Number(stock) < 0) {
                return res.status(500).json({ message: "Stock must be a valid positive number" });
            }
        }

        // Kiểm tra số lượng đã bán (sold) nếu có cập nhật
        if (sold !== undefined) {
            if (isNaN(sold) || Number(sold) < 0) {
                return res.status(500).json({ message: "Sold must be a valid positive number" });
            }
        }

        // Kiểm tra category nếu có cập nhật
        if (category !== undefined) {
            if (!mongoose.Types.ObjectId.isValid(category)) {
                return res.status(500).json({ message: "Invalid category ID format" });
            }
            const existingCategory = await Category.findById(category);
            if (!existingCategory) {
                return res.status(500).json({ message: "Category does not exist" });
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

        // 4. Tạo đối tượng cập nhật
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

        // 5. Cập nhật vào cơ sở dữ liệu
        const updatedProduct = await Products.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        ).populate('category');

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
            return res.status(500).json({ message: "Product ID is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(500).json({ message: "Invalid product ID format" });
        }

        const product = await Products.findById(id);
        if (!product) {
            return res.status(500).json({ message: "Product not found" });
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

        // 1. Kiểm tra ID có được truyền vào không và đúng định dạng ObjectId không
        if (!id) {
            return res.status(500).json({ message: "Product ID is required" });
        }
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(500).json({ message: "Invalid product ID format" });
        }

        // 2. Kiểm tra và xóa sản phẩm trong database
        const deletedProduct = await Products.findByIdAndDelete(id);
        if (!deletedProduct) {
            return res.status(500).json({ message: "Product not found" });
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
