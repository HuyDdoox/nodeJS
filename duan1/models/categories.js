const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId; //có thể có hoặc không []

const categories = new Schema({
    id: { type: ObjectId },// không require
    name: { type: String, required: true,unique:true },
    description: { type: String },
    status: { type: Boolean, default: true } // true: hiện, false: ẩn
});

module.exports = mongoose.models.category || mongoose.model('category', categories);
//cấu trúc bảng categories và ràng buộc do nghiệp vụ dev quyết định
