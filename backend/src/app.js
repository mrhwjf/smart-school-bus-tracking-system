const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./config/dbConfig');
const sessionStore = new SequelizeStore({ db: sequelize });
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const globalExceptionHandler = require('./exception/globalExceptionHandler');
const swaggerDocument = require('./config/swagger.json');

const app = express();

// Security headers
app.use(helmet());

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS (adjust origin for production)
app.use(cors({
  origin: '*',
  credentials: true
}));

// Health check
app.get('/api/v1/health', (req, res) => res.json({ status: 'ok' }));

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  swaggerOptions: {
    docExpansion: 'list',
    defaultModelRendering: 'model',
    defaultModelsExpandDepth: 1,
    defaultModelExpandDepth: 4,
  },
}));

// Session
const IN_PROD = process.env.NODE_ENV === 'production';
app.set('trust proxy', IN_PROD);

app.use(
  session({
    secret: process.env.SESSION_SECRET || "supersecretkey",
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: IN_PROD,
      maxAge: 1000 * 60 * 60 * 2,
      sameSite: IN_PROD ? 'none' : 'lax'
    }
  })
);

// Create Session table
sessionStore.sync();

// Routes
const authRoutes = require('./routes/auth');
app.use('/auth', authRoutes);

// API root
app.use('/api/v1', require('./routes'));

// Error handler
app.use(globalExceptionHandler);

module.exports = app;