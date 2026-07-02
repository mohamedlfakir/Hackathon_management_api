const express = require("express");

const authRoutes = require("./routes/auth.routes");
const userRoutes = require("./routes/user.routes");
const hackathonRoutes = require("./routes/hackathon.routes");
const teamRoutes = require("./routes/team.routes");
const submissionRoutes = require("./routes/submission.routes");
const evaluationRoutes = require("./routes/evaluation.routes");

const errorHandler = require("./middleware/error.middleware");

const authenticate = require("./middleware/auth.middleware");

const app = express();

app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/hackathons", hackathonRoutes);
app.use("/api/teams", teamRoutes);
app.use("/api/submissions", submissionRoutes);
app.use("/api/evaluations", evaluationRoutes);

const path = require("path");

app.use(
    "/uploads",
    express.static(path.join(process.cwd(), "uploads"))
);

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