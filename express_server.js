const express = require("express");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session");
const bcrypt = require("bcrypt");
const morgan = require("morgan");
const app = express();
const PORT = 8080;
const {getUserByEmail} = require("./helper");

// bodyParser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(cookieSession(
  {
    name: 'user_id',
    keys: ['strings']
  }
))
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
  // if user is logged in, redirect to url page
  if (req.session.user_id) {
    res.redirect('/urls');
  // if not logged in, login page
  } else {
    res.redirect('/login');
  }
});

app.get("/urls", (req, res) => {
  if (req.session.user_id) {
      // display url database if user logged in 
      // display their own urls only
    const templateVars = {
      user: users[req.session.user_id],
      urls: urlsForUser(req.session.user_id),
      userID: req.session["user_id"]
    };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login")
  }
});

// shows the form to submit new url
app.get("/urls/new", (req, res) => {
  if (!req.session.user_id) {
    res.redirect('/login');
  } else {
  const templateVars = { 
    user_id: req.session["user_id"], 
    user: users[req.session.user_id] };
  res.render('urls_new', templateVars)
  }
});


// user submits forms and presses submit
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userID: req.session["user_id"]
  }
  res.redirect(`./urls/${shortURL}`);
});

// redirect to long URL if accessing short URL
app.get('/u/:shortURL', (req, res) => {
  // check if url exists
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send('Page not found');
  }

  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

// display short URL with ability to update (if logged in)
app.get('/urls/:shortURL', (req, res) => {
  const templateVars = {
    user_id: req.session["user_id"],
    user: users[req.session.user_id],
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };

  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send('Page not found');
  }

  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    return res.render('urls_show', templateVars);
  } else {
    res.status(403).send('You are not authorized to view this page');
  }
});

// delete route
app.post("/urls/:shortURL/delete", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    return res.status(404).send('Page not found');
  }
  // delete url record if user ID matches associated ID on url
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    res.status(403).send('Forbidden');
  }
});

// update route page
app.post("/urls/:shortURL/update", (req, res) => {
  if (req.params.shortURL) {
    if (req.session["user_id"] === urlDatabase[req.params.shortURL].userID) {
      urlDatabase[req.params.shortURL].longURL = req.body.longURL;
      res.redirect('/urls');
    } else {
      res.status(401).send('You are not authorized to view this page');
    }
  } else {
    res.status(404).send('Page not found');
  }
});

// get login endpoint
app.get("/login", (req, res) => {
  let templateVars = {
    user_id: req.session["user_id"],
    user: users[req.session["user_id"]],
  };

  if (req.session.user_id) {
    res.redirect('/urls')
  } else {
    res.render("login", templateVars);
  }
});

// handler for accepting new user logins
app.post("/login", (req, res) => {
  // return user from users database
  const user = getUserByEmail(req.body.email, users);
  // if email is not in database, return 400
  if (!verifyEmail(req.body.email)) {
    return res.status(400).send("There is no email registered.");
  } 
  // check if passwords match
  bcrypt.compare(req.body.password, user.password)
  .then((result) => {
    if (result) {
      req.session.user_id = user.id;
      res.redirect('/urls');
    } else {
      return res.status(401).send('Password incorrect');
    }
  });  
});

// logout endpoint
app.post("/logout", (req, res) => {
  req.session = null  
  res.redirect("/urls");
});

// get register endpoint
app.get("/register", (req, res) => {
  const templateVars = {
    user: users[req.session.user_id],
    email: req.body.email,
    userId: req.session.user_id,
  };
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("register", templateVars)
}
})

// post register endpoint
app.post("/register", (req, res) => {
  if (req.body.email === "" || req.body.password === "") {
    return res.status(400).send("Please enter a valid email and password.");
  } else if (verifyEmail(req.body.email, users)) {
    return res.status(401).send("This account already exists.");
  } else {
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
      req.session.user_id = id;
      res.redirect("/urls");    
    })
  }
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
  let userDatabase = {};
  for (let url in urlDatabase) {
    // if user id matches database id, return associated urls
    if (urlDatabase[url].userID === id) {
      userDatabase[url] = urlDatabase[url].longURL;
    }
  }
  return userDatabase;
};
