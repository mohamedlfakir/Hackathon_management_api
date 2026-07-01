require("dotenv").config();

const app = require("./app");
const db = require("./config/database");

const PORT = process.env.PORT || 3000;

async function startServer() {
    try {
        await db.one("SELECT NOW() AS current_time");

        console.log("✅ Connected to PostgreSQL");

        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
        });
    } catch (err) {
        console.error("❌ Database connection failed");
        console.error(err.message);
    }
}

startServer();