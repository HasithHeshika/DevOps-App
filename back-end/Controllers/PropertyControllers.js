const Property = require("../Model/PropertyModel");

// Display function
const gellAllProperties = async (req, res, next) => {
    let properties;

    // Get all properties from the database
    try {
        properties = await Property.find();
    } catch (err) {
        console.log(err);
    }

    // If no properties found, return 404
    if (!properties) {
        return res.status(404).json({ message: "No products found" });
    }

    // Return the list of properties with 200 status
    return res.status(200).json({ properties });
};

// Insert function
const insertProperty = async (req, res, next) => {
    

}



exports.gellAllProperties = gellAllProperties;