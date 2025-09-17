const express = require("express");
const router = express.Router();

// Insert the Model
const Property = require("../Model/PropertyModel");

// Insert the Controller
const PropertyController = require("../Controllers/PropertyControllers");

// Define the routes and link to the controller functions
router.get("/", PropertyController.gellAllProperties);
router.post("/", PropertyController.insertProperty);
router.get("/:id", PropertyController.getById);
router.put("/:id", PropertyController.updateProperty);
router.delete("/:id", PropertyController.deleteProperty);


// Export the router
module.exports = router;