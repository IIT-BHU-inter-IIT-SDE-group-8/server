const app = require('./app.js');
const { createUsersTable } = require("./src/models/userModel");
const PORT = process.env.PORT || 3000;

// Database Models
createUsersTable();

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});




