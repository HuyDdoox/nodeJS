const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const billdetail = new Schema({
    id: { type: ObjectId },
    billID: { type: ObjectId, ref: 'bill' },
    productID: { type: ObjectId, ref: 'product' },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true }
});

module.exports = mongoose.models.billdetail || mongoose.model('billdetail', billdetail);
