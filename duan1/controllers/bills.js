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
        res.json(bills);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
}

const getBillById = async (req, res, next) => {
    try {
        const id = req.params.id;
        let b = await Bills.findById(id).populate('userID', 'username email fullname phone');
        if (!b) {
            return res.status(404).json({ message: 'Bill not found' });
        }
        res.json({
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
