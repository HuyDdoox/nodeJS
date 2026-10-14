const mongoose = require('mongoose');
const Bills = require('../models/bill');

const getAllBills = async (req, res, next) => {
    try {
        let data = await Bills.find().populate('userID', 'username email fullname phone');
        let bills = data.map(b => ({
            id: b._id,
            user: b.userID,
            date: b.date,
            total: b.total,
            status: b.status
        }));
        // 200: Xử lý thành công
        res.status(200).json(bills);
    } catch (err) {
        // 500: Lỗi Server
        res.status(500).json({ message: err.message });
    }
}

const getBillById = async (req, res, next) => {
    try {
        const id = req.params.id;

        // 400: Sai định dạng ID
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid bill ID format" });
        }

        let b = await Bills.findById(id).populate('userID', 'username email fullname phone');
        // 404: Không tìm thấy hóa đơn
        if (!b) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        // 200: Thành công
        res.status(200).json({
            id: b._id,
            user: b.userID,
            date: b.date,
            total: b.total,
            status: b.status
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

module.exports = { getAllBills, getBillById };
