const mongoose = require("mongoose");
const express = require("express");
const app = express();

mongoose.connect("mongodb://localhost:27017/", {useNewUrlParser: true, useUnifiedTopology: true});
const UserSchema = mongoose.Schema({name: String, ip: String});
const User = mongoose.model("User", UserSchema);

const verifySecret = (request, response, next) => {
    if (request.url === "/favicon.ico") {
        return response.end();
    }
    
    if (request.headers["iknowyoursecret"] !== "TheOwlsAreNotWhatTheySeem") {
        return response.end("You don't know the secret");
    }
    
    next();
};

const processRequest = async (request, response) => {
    const name = request.query.name;
    if (!name) {
        return response.end("Name not detected");
    }

    const ip = request.ip;
    const user = new User({ name, ip });

    user.save((err) => {
        if (err) {
            throw err;
        }
    })

    const db = await User.find({}, "name ip -_id");
    response.send(`Hello, ${db.map(visitor => visitor.name).join(", ")}!`);
    return response.end();
};

app.use(verifySecret);
app.post("/", processRequest);
app.listen(8080, console.log("Server listening at port 8080"));