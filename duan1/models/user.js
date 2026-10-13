const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const user = new Schema({
    id: { type: ObjectId }, // luôn luôn ko có require => _id
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    email: { type: String, required: true, unique: true }, // nếu người dùng thêm vô trùng => ko thêm
    fullname: { type: String },
    phone: { type: String },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    status: { type: Boolean, default: true }, // true: hoạt động (hiện), false: bị khóa (ẩn)
    createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.models.user || mongoose.model('user', user);
//cấu trúc bảng user và ràng buộc do nghiệp vụ dev quyết định
