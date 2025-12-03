const dotenv = require('dotenv');
const { app, server, io } = require('./app');
const {sequelize} = require('./config/dbConfig');
const simulationService = require('./services/simulationService');

// Load environment variables
dotenv.config();

const port = process.env.PORT || 5000;

// Start server
(async () => {
    try {
        await sequelize.authenticate();
        console.log("✓ Database connected");

        await require('./models').sequelize.sync();

        server.listen(port, () => {
            console.log(`🚀 Server running on port ${port}`);
            console.log(`📡 WebSocket server ready`);
        });
    } catch (error) {
        console.error("DB connection error:", error);
        process.exit(1);
    }
})();

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n⚠️  SIGTERM received, shutting down gracefully...');
    await simulationService.stopAll();
    server.close(() => {
        console.log('✓ Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', async () => {
    console.log('\n⚠️  SIGINT received, shutting down gracefully...');
    await simulationService.stopAll();
    server.close(() => {
        console.log('✓ Server closed');
        process.exit(0);
    });
});
