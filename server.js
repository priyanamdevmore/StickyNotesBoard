const express = require('express');
const path = require('path');

const app = express();
const port = 8000;

try {
  require('./index.js');
} catch (err) {
  console.error('Failed to start DB connection module:', err);
}

app.use(express.static(path.join(__dirname, '.')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
