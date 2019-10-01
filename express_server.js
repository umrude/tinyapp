const express = require("express");
const app = express();
const PORT = 8080;
const bodyParser = require("body-parser");
const generateRandomString = () => {
  let result = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
const cookieparser = require("cookie-parser");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieparser());
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

//renders /urls
app.get("/urls", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]};
  res.render("urls_index", templateVars);
});

//renders urls/register
app.get("/urls/register", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    username: req.cookies["username"]
  };
  res.render("urls_register", templateVars);
});
//renders /urls/new
app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  };
  res.render("urls_new", templateVars);
});

//changes longURL associated to shortURL
app.post("/urls/:shortURL", (req, res) => {
  let shortURL = req.params.shortURL;
  urlDatabase[shortURL] = `http://${req.body.newURL}`;

  res.redirect(`/urls/${shortURL}`);
});

//renders the page for :shortURL
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    username: req.cookies["username"]};
  res.render("urls_show", templateVars);
});

//logs out when "logout" is clicked
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});


//add new URLs
app.post("/urls", (req, res) => {
  let newId = generateRandomString();
  urlDatabase[newId] = req.body.longURL;
  res.redirect(`/urls/${newId}`);
});

//Removes URL from list
app.post("/urls/:shortURL/delete",(req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//redirects to full URL from short URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

//login cookies
app.post("/login", (req, res) => {
  let username = req.body.username;
  res.cookie("username", username);
  res.redirect("/urls");
});

//gets the server to listen for input
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});