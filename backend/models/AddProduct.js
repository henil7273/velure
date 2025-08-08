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


});

module.exports = mongoose.model('AddProduct', ProductSchema);
