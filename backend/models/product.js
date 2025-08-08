const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  brand: {
    type: String,
    required: true
  },

  description: String,

  price: {
    type: Number,
    required: true
  },
  
  discount: {
    type: Number,
    default: 0
  },

  stock: {
    type: Number,
    default: 0
  },

  category: {
    type: String,
    required: true
  },

  size: {
    type: String
  },

  color: {
    type: String
  },

  tags: {
    type: String
  },

  image: String,

  rating: {
    type: Number,
    default: 0
  }
});

module.exports = mongoose.model('Product', ProductSchema);
