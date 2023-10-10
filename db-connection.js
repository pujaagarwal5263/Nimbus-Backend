var mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URL).then(() => {
    console.log("Database Connected Successfully");
}).catch((err) => {
    console.log("No Connection to Database");
})