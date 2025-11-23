const express = require('express');
const session = require('express-session');
const SequelizeStore = require('connect-session-sequelize')(session.Store);
const { sequelize } = require('./config/dbConfig');
const sessionStore = new SequelizeStore({ db: sequelize });
const helmet = require('helmet');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
const globalExceptionHandler = require('./exception/globalExceptionHandler');

// Load swagger
const swaggerDocument = YAML.load('src/config/swagger.yml');

const app = express();

// Helmet
app.use(helmet());

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS
app.use(cors({
    origin: '*',        
    credentials: true
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
//const dashboardRoutes = require('./routes/dashboard');

app.use("/auth", authRoutes);
//app.use("/dashboard", dashboardRoutes);

// Health check
app.get('/health', (req, res) => res.json({ status: 'ok' }));

// Swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// API root
app.use('/api/v1', require('./routes'));

// Error handler
app.use(globalExceptionHandler);


module.exports = app;
