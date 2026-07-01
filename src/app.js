const express = require("express");

const authRoutes = require("./routes/auth.routes");
const errorHandler = require("./middleware/error.middleware");

const authenticate = require("./middleware/auth.middleware");

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
    res.json({
        success: true,
        message: "Hackathon API is running"
    });
});


app.get("/api/profile", authenticate, (req, res) => {
    res.json(req.user);
});

app.use(errorHandler);
module.exports = app;