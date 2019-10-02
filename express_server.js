const express = require("express");
const app = express();
const PORT = 3000;
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const bcrypt = require('bcrypt');

const generateRandomString = () => {
  let result = '';
  let chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz123456789';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};
const checkEmail = (testEmail) => {
  for (let user in users) {
    if (users[user].email === testEmail) {
      return true;
    }
  }
};
const getUserByEmail = (email) => {
  for (let user in users) {
    if (users[user].email === email) {
      return users[user];
    }
  }
};
const urlsForUser = (id) => {
  let result = {};
  for (let urls in urlDatabase) {
    if (urlDatabase[urls].userID === id) {
      result[urls] = urlDatabase[urls].longURL;
    }
  }
  return result;
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

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "user2RandomID" }
};

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));

app.use(cookieSession({
  name: 'session',
  keys: ['secret_keys'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

//redirects to "home"
app.get("/", (req, res) => {
  res.redirect("/urls");
});

//renders /urls
app.get("/urls", (req, res) => {
  let cookies = users[req.session.userID];
  if (!cookies) {
    res.redirect("/register");
  } else {
    let templateVars = {
      urls: urlsForUser(cookies),
      user: users[req.session.userID]
    };
    console.log(cookies.id);
    console.log(urlsForUser(cookies));
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

//adds new user to users for /register
app.post("/register", (req, res) => {
  let newID = generateRandomString();
  if (req.body.email === '' || req.body.password === '') {
    res.status(400);
    res.send('400: Please put in a valid email/password');
  } else if (checkEmail(req.body.email)) {
    res.status(400);
    res.send('400: Email already exists');
  } else {
    users[newID] = {
      id: newID,
      email: req.body.email,
      password: bcrypt.hashSync(req.body.password, 10)
    };
    req.session.userID = newID;
    res.redirect("/urls");
  }
});

//handles when submit is clicked /login
app.post("/login", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user = getUserByEmail(email);
  if (!checkEmail(email)) {
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


//changes longURL associated to shortURL
app.post("/urls/:shortURL", (req, res) => {
  let cookies = users[req.session.userID];
  if (cookies) {
    let shortURL = req.params.shortURL;
    urlDatabase[shortURL] = `http://${req.body.newURL}`;
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.send("ya ain't logged in!");
  }
});

//logs out when "logout" is clicked
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});


//add new URLs
app.post("/urls", (req, res) => {
  let newId = generateRandomString();
  urlDatabase[newId] = {
    longURL: req.body.longURL, userID: users[req.session.userID]
  };
  res.redirect(`/urls/${newId}`);
});

//Removes URL from list
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