const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");

const app = express();
const PORT = 8080;

// bodyParser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// sets ejs as the view engine
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

let id = generateRandomString();

// object to store and access users in the app
const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "123",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

// registers a handler on root path "/"
app.get("/", (req, res) => {
  res.send("Hello!");
});

// additional endpoints
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_index", templateVars);
});

// shows the form to submit new url
app.get("/urls/new", (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies["user_id"]],
  }; // identify users as their user_id cookie
  res.render("urls_new", templateVars);
});

// sending HTML - render HTMl response in the client browser
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World!!!</b></body></html>\n");
});

// user submits forms and presses submit
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL;
  res.redirect(`./urls/${shortURL}`);
});

// route for showing users their newly created shortURL link
// colon indicates a url that is changing
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: users[req.cookies["user_id"]],
  };
  res.render("urls_show", templateVars);
});

// server responds with a redirect to "/u/:shortURL" to its longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

// delete route
app.post("/urls/:shortURL/delete", (req, res) => {
  const itemToDelete = req.params.shortURL;
  delete urlDatabase[itemToDelete];
  res.redirect("/urls");
});

// update route page
app.post("/urls/:shortURL/update", (req, res) => {
  const itemToUpdate = req.params.shortURL;
  urlDatabase[itemToUpdate] = req.body.longURL; // change the value of original short url to the new edited long url
  res.redirect(`/urls/`);
});

// get login endpoint
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]]
  };
  if (!req.cookies["user_id"]) {
    res.render("login", templateVars);
  } else {
    res.redirect("/urls");
  }
});

// handler for accepting new user logins
app.post("/login", (req, res) => {
    // return user from database
  const user = getUserByEmail(req.body.email, users);
  // if email is not in database, return 400
  if (!verifyEmail(req.body.email)) {
    return res.status(400).send('There is no email registered.');
  }
  // verify password and direct accordingly
  // if (!bcrypt.compareSync(req.body.password, user.password)) {
  //   return res.status(403).send('Password and email incorrect.');
  // } else {
    // attach existing account to session
    // req.cookie["user_id"] = user.id;
    res.cookie("user_id", user.id);
    res.redirect('/urls');
  
});

// logout endpoint
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

// get register endpoint
app.get("/register", (req, res) => {
  res.render("register");
});

// post register endpoint
app.post("/register", (req, res) => {
  // add a new user to the users object - id (generate string), email, pass
  users[id] = { id: id, email: req.body.email, password: req.body.password };
  // set user_id cookie containing user's newly generated ID
  if (users[id].email === "" || users[id].password === "") {
    res.status(400).send("Please enter a valid email and password.");
    // } else if (lookUpEmail(users[id].email, users) === true) {
    //   res.status(400).send("This email already exists. Please login.")
    // }
  }
  res.cookie("user_id", users[id].id);
  res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`example app listening on port ${PORT}!`);
});

// helper functions
function generateRandomString() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUPWXYZabcdefghijklmnopqrstupwxyz";
  const randomStr = [];
  for (let i = 0; i < 7; i++) {
    let random = Math.floor(Math.random() * letters.length);
    randomStr.push(letters.charAt(random));
  }
  return randomStr.join("");
}

const lookUpEmail = (email, object) => {
  for (const user in object) {
    if (email === object[user].email) {
      return true;
    }
  }
  return false;
};

// passwordFinder helper function
const passwordExists = function(password) {
  for (Id in users) {
    if (bcrypt.compareSync(password, users[Id].password)) {
      return true;
    }
  }
};


// ID catcher helper function
const idCatcher = function (password) {
  for (Id in users) {
    if (passwordExists(password)) {
      return Id;
    }
  }
  return false;
};

// Confirm that the cx username and pw match
const identityConfirm = function (email, password) {
  if (users[idCatcher(password)]["email"] === email) {
    return true;
  }
};

// return object from user input
const getUserByEmail = (email, users) => {
  // loop through the users object
  for (const key of Object.keys(users)) {
    if (users[key].email === email) {
      return users[key];
    }
  }
  return false;
};

const verifyEmail = email => {
  let user = getUserByEmail(email, users);
  if (!user) {
    return false;
  } else {
    if (email === user.email) {
      return true;
    }
  }
};

