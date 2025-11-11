const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const globalExceptionHandler = require('./exception/globalExceptionHandler');

// Load Swagger YAML
const swaggerDocument = YAML.load('src/config/swagger.yml');

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
	swaggerOptions: {
		docExpansion: 'list',
		defaultModelRendering: 'model',
		defaultModelsExpandDepth: 1,
		defaultModelExpandDepth: 4,
	},
}));

// Routes
const apiRoutes = require('./routes');
app.use('/api/v1', apiRoutes);

// Global error handler
app.use(globalExceptionHandler);

module.exports = app;
