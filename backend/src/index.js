const dotenv = require('dotenv');
const app = require('./app');

// Load environment variables
dotenv.config();

const port = process.env.PORT || 5000;

// Start server
app.listen(port, () => {
  console.log(`✅ Backend listening on port ${port}`);
});
