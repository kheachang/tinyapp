const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcrypt");
const morgan = require("morgan");
const app = express();
const PORT = 8080;

// bodyParser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// sets ejs as the view engine
app.set("view engine", "ejs");

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
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

  if (req.cookies["user_id"]) {
      // display url database if user logged in 
      // display their own urls only
    const templateVars = {
      user: users[req.cookies["user_id"]],
      urls: urlsForUser(req.cookies["user_id"]),
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login")
  }
});

// shows the form to submit new url
app.get("/urls/new", (req, res) => {
  if (!req.cookies['user_id']) {
    res.redirect('/login');
  }
  const templateVars = { urls: urlDatabase, user: users[req.cookies['user_id']] };
  res.render('urls_new', templateVars)
});


// user submits forms and presses submit
app.post("/urls", (req, res) => {
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL, userID: req.cookies["user_id"]}
  res.redirect(`./urls/${shortURL}`);
});

// route for showing users their newly created shortURL link
app.get("/urls/:shortURL", (req, res) => {
  // updates urlDatabase
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
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
  urlDatabase[itemToUpdate].longURL = req.body.longURL; // change the value of original short url to the new edited long url
  console.log("urlDatabase[itemToUpdate]", urlDatabase[itemToUpdate].longURL)
  res.redirect(`/urls/`);
});

// get login endpoint
app.get("/login", (req, res) => {
  let templateVars = {
    user: users[req.cookies["user_id"]],
  };
  res.render("login", templateVars);
});

// handler for accepting new user logins
app.post("/login", (req, res) => {
  // return user from database
  const user = getUserByEmail(req.body.email, users);
  // if email is not in database, return 400
  if (!verifyEmail(req.body.email)) {
    return res.status(400).send("There is no email registered.");
  } 
  // check if passwords match
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    res.status(400).send("Invalid password");
  }

  res.cookie("user_id", user.id);
  res.redirect("/urls/new");
  
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
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send("Please enter a valid email and password.");
  } 
  // else if (verifyEmail(req.body.email, users)) {
  //   res.status(400).send("This account already exists.");
  // }
  
  // hash passwords
  const plainTextPassword = req.body.password;
  bcrypt.genSalt(10)
    .then((salt) => {
      return bcrypt.hash(plainTextPassword, salt);
    })
    .then((hash) => {
      users[id] = {
        id: id,
        email: req.body.email,
        password: hash,
      };
      // console.log("users: ", users);    
      res.cookie("user_id", users[id].id);
      res.redirect("/urls/new");    
    })
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

// verify the email exists in database
const verifyEmail = (email) => {
  let user = getUserByEmail(email, users);
  if (!user) {
    return false;
  } else {
    if (email === user.email) {
      return true;
    }
  }
};

// Returns urls that each user created
const urlsForUser = id => {
  const urls = [];
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urls.push(url)
    }
  }
  return urls
}

