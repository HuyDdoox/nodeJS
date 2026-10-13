const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const billDetail = new Schema({
    id: { type: ObjectId },
    billID: { type: ObjectId, ref: 'bill' },
    productID: { type: ObjectId, ref: 'product' },
    price: { type: Number },
    quantity: { type: Number },
    subtotal: { type: Number }
});
const bill = new Schema({
    id: { type: ObjectId },
    userID: { type: ObjectId, ref: 'user' },
    date: { type: Date, default: Date.now },
    total: { type: Number, default: 0 },
    payment_method: { type: String },
    status: { type: Number, default: 0 }
});

module.exports = mongoose.models.bill || mongoose.model('bill', bill);
