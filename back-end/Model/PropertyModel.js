const mongoose = require ("mongoose");
const Schema = mongoose.Schema;

const propertySchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model(
    "PropertyModel", // File name
    propertySchema // Function name
    );