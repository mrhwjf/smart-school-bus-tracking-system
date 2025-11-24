const dotenv = require('dotenv');
const app = require('./app');
const {sequelize} = require('./config/dbConfig');

// Load environment variables
dotenv.config();

const port = process.env.PORT || 5000;

// Start server
(async () => {
    try {
        await sequelize.authenticate();
        console.log("Database connected...");

        await require('./models').sequelize.sync();

        app.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
        });
    } catch (error) {
        console.error("DB connection error:", error);
        process.exit(1);
    }
})();
