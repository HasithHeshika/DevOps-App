const express = require("express");
const router = express.Router();

// Insert the Model
const Property = require("../Model/PropertyModel");

// Insert the Controller
const PropertyController = require("../Controllers/PropertyControllers");

// Define the routes and link to the controller functions
router.get("/", PropertyController.gellAllProperties);


// Export the router
module.exports = router;