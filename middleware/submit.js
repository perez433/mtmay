const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = 3001;

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.post('/receive', (req, res) => {
  // Access the POST data from the request body
  const userId = req.body.UserId;
  const password = req.body.Password;

  // Log the data
  console.log('Received POST data:');
  console.log('UserId:', userId);
  console.log('Password:', password);

  // You can send a response back to the client if needed
  res.send('Data received successfully');
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
