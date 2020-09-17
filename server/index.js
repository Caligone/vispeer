const express = require('express')
const path = require('path')
const app = express()
const port = 3000

app.get('/api', (req, res) => {
  res.send('Hello World!');
});

console.log(path.join(__dirname, '../client'));

app.use(express.static(path.join(__dirname, '../client')))

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
