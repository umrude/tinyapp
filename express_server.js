/*------------boilerplate and functions/methods --------------*/
const express = require("express");
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');
const { generateRandomString, checkEmail, getUserByEmail, urlsForUser } = require('./helpers');
const {users, urlDatabase} = require("./db.js");

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['secret_keys'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//redirects to "home" aka /urls
app.get("/", (req, res) => {
  res.redirect("/urls");
});

/*-------------all the routes that render a page --------------*/

//renders /urls
app.get("/urls", (req, res) => {
  let cookies = users[req.session.userID];
  if (!cookies) {
    res.redirect("/register");
  } else {
    let templateVars = {
      urls: urlsForUser(cookies, urlDatabase),
      user: users[req.session.userID]
    };
    res.render("urls_index", templateVars);
  }
});

//renders /register
app.get("/register", (req, res) => {
  let templateVars = {
    urls: urlDatabase,
    user: users[req.session.userID]
  };
  res.render("urls_register", templateVars);
});

//renders /urls/new
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: users[req.session.userID]
  };
  let user = users[req.session.userID];
  if (!user) {
    res.redirect("/login");
  } else {
    res.render("urls_new", templateVars);
  }
});

//renders the page for :shortURL
app.get("/urls/:shortURL", (req, res) => {
  let cookies = users[req.session.userID];
  if (!cookies) {
    res.send("Please Log In");
  } else {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL]["longURL"],
      user: users[req.session.userID]
    };
    res.render("urls_show", templateVars);
  }
});

//renders page for /login
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.session.userID]
  };
  res.render("urls_login", templateVars);
});

/*----------------- all the routes that have a "function"/handle an event ------------------*/

//adds new user to users object for /register
app.post("/register", (req, res) => {
  let newID = generateRandomString();
  const hashedPassword = bcrypt.hashSync(req.body.password, 10);
  if (req.body.email === '' || req.body.password === '') {
    res.status(400).send("400: Please put in a valid email/password");
  } else if (checkEmail(req.body.email, users)) {
    res.status(400).send("400: Email already exists");
  } else {
    users[newID] = {
      id: newID,
      email: req.body.email,
      password: hashedPassword
    };
    req.session.userID = newID;
    res.redirect("/urls");
  }
});

//handles when submit is clicked @ /login and logs user in if credentials are valid
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user = getUserByEmail(email, users);
  if (!checkEmail(email, users)) {
    res.status(403);
    res.send('403: email not found');
  } else {
    if (!bcrypt.compareSync(password, user.password)) {
      res.status(403);
      res.send("403: Wrong password/email");
    } else if (bcrypt.compareSync(password, user.password)) {
      req.session.userID = user.id;
      res.redirect("/urls");
    }
  }
});


//changes longURL associated with shortURL
app.post("/urls/:shortURL", (req, res) => {
  let cookies = users[req.session.userID];
  if (cookies) {
    let shortURL = req.params.shortURL;
    urlDatabase[shortURL] = `http://${req.body.newURL}`;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.send("ya ain't logged in! Log in and try again!");
  }
});

//logs out when "logout" is clicked
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


//add new URLs to urlDatabase
app.post("/urls", (req, res) => {
  let newId = generateRandomString();
  urlDatabase[newId] = {
    longURL: req.body.longURL, userID: users[req.session.userID]
  };
  res.redirect(`/urls/${newId}`);
});

//Removes URL from urlDatabase
app.post("/urls/:shortURL/delete", (req, res) => {
  let cookies = users[req.session.userID];
  if (cookies) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.send("ya ain't logged in!");
  }
});

//redirects to full URL from short URL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]["longURL"];
  res.redirect(longURL);
});


//gets the server to listen for input
app.listen(PORT, () => {
  console.log(`Welcome to TinyApp on PORT: ${PORT}!`);
});