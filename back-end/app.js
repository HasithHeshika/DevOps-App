// NLBfVhFT1iYLTjOv

const express = require("express");
const mongoose = require("mongoose");
const router = require("./Routes/PropertyRoutes");


const app = express();

//Middleware
app.use("/properties",router);

mongoose.connect("mongodb+srv://admin:NLBfVhFT1iYLTjOv@cluster0.cpebzeg.mongodb.net/")
.then(() => console.log("Connected to MongoDB"))
.then(() => {
    app.listen(5000);
})
.catch((err) => console.log(err));