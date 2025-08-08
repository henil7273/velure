const mongoose = require('mongoose');

const OrdersSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: 'User'
    },
    items: [
        {
            productId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Product',
                required: true
            },
            quantity: {
                type: Number,
                required: true
            },
            size: {
                type: String
            },
            color: {
                type: String
            },
            price: {
                type: Number,
                required: true
            }
        }
    ],
    bill: {
        type: Number,
        required: true
    },
    address: {
        company: {
            type: String,
        },
        street: {
            type: String,
        },
        fullAddress: {
            type: String,
            required: true
        },
        city: {
            type: String,
            required: true
        },
        pincode: {
            type: String,
            required: true
        },
        state: {
            type: String,
            required: true
        },
        phone: {
            type: Number,
            required: false
        },
        email: {
            type: String,
            required: true
        }
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Orders', OrdersSchema);

