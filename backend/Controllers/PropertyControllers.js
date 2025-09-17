const Property = require("../Model/PropertyModel");

// Display function (typo preserved for backward-compat, alias provided below)
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
    const {title, description, price, location, imageUrl} = req.body;
    let property;
    try{
        property = new Property({title, description, price, location, imageUrl});
        await property.save();
    }catch(err){
        console.log(err);
    }
    // If not...
    if(!property){
        return res.status(404).json({
            message:"Unable to add property"
        });
    }
    return res.status(200).json({
        property
    });
}

// Get the property according to the ID
const getById = async (req,res,next) => {
    const id = req.params.id;
    let property;
    try{
        property = await Property.findById(id);
    }catch(err){
        console.log(err);
    }
    // If not...
    if(!property){
        return res.status(404).json({
            message:"Property not found"
        });
    }
    return res.status(200).json({
        property
    });
}

// Update property details
const updateProperty = async(req,res,next) => {
    const id = req.params.id;
    const {title, description, price, location, imageUrl} = req.body;
    let property;
    try{
        property = await Property.findByIdAndUpdate(id,
            {title, description, price, location, imageUrl}, { new: true });
    }catch(err){
        console.log(err);
    }
    // If not...
    if(!property){
        return res.status(404).json({
            message:"Unable to update property details"
        });
    }
    return res.status(200).json({
        property
    });
};

const deleteProperty = async(req,res,next) => {
    const id = req.params.id;
    let property;
    try{
        property = await Property.findByIdAndDelete(id);
    }catch(err){
        console.log(err);
    }
    // If not...
    if(!property){
        return res.status(404).json({
            message:"Unable to delete the property details"
        });
    }
    return res.status(200).json({
        property
    });
}

exports.gellAllProperties = gellAllProperties;
exports.getAllProperties = gellAllProperties;
exports.insertProperty = insertProperty;
exports.getById = getById;
exports.updateProperty = updateProperty;
exports.deleteProperty = deleteProperty;