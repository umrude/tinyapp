/*------------boilerplate and functions/methods --------------*/
const express = require("express");
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const routes = require("./routes/routes.js");
const morgan = require('morgan');
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(morgan('combined'));
app.use(cookieSession({
  name: 'session',
  keys: ['secret_keys'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
//uses routes.js instead of crowding the express_server.js
app.use("/", routes);

//gets the server to listen for input
app.listen(PORT, () => {
  console.log(`Welcome to TinyApp on PORT: ${PORT}!`);
});

