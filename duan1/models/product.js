const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;
// khi nào có product_id khi nào không?
// khi gộp bảng thì không cần tạo thêm bảng variant
// 1. khi tách bảng
const variant = new Schema({
    id: { type: ObjectId },
    productID: { type: ObjectId, ref: 'product' },
    name: { type: String },
    price: { type: Number },
    quantity: { type: Number },
    image: { type: String }
});

const product = new Schema({
    id: { type: ObjectId }, //khóa chính
    name: { type: String, required: true, unique: true },
    price: { type: Number },
    quantity: { type: Number },
    image: { type: String },
    description: { type: String },
    stock: { type: Number, required: true, min: 0, default: 0 },
    sold: { type: Number, required: true, min: 0 },
    status: { type: Boolean, default: true }, // true: hiện, false: ẩn
    createdAt: { type: Date, default: Date.now }, // 
    vairiant: { type: [variant] },
    category: { type: ObjectId, ref: 'category' }, //khóa ngoại

});
module.exports = mongoose.models.product || mongoose.model('product', product);
// product -----> products
