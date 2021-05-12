const express = require("express");
const cookieParser = require('cookie-parser');
// const cookieSession = require('cookie-session')
const app = express();
const PORT = 8080;

// bodyParser
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
// app.use(   cookieSession({     name: 'session',     keys: ['key1', 'key2'],   }) );

// sets ejs as the view engine
app.set("view engine", "ejs");

const urlDatabase = {
  b2xVn2: "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
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
  const templateVars = { urls: urlDatabase, username: req.cookies["username"]};
  // console.log(req.cookies["username"])
  res.render("urls_index", templateVars);
});

// shows the form to submit new url
app.get("/urls/new", (req, res) => {
  res.render("urls_new", {username: req.cookies["username"]});
});

// sending HTML - render HTMl response in the client browser
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World!!!</b></body></html>\n");
});

// user submits forms and presses submit
app.post("/urls", (req, res) => {
  console.log("req.body: ", req.body); // req.body shows up in post request only
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
    username: req.cookies["username"]
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
  const itemToUpdate = req.params.shortURL
  urlDatabase[itemToUpdate] = req.body.longURL // change the value of original short url to the new edited long url
  res.redirect(`/urls/`);
})

// handler for accepting new user logins
app.post("/login", (req, res) => {
  res.cookie("username", req.body.username )
  res.redirect("/urls/")
});

// logout endpoint 
app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

// object to store and access users in the app
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

// get register endpoint
app.get("/register", (req, res) => {
  res.render("register");
});

// post register endpoint 
app.post("/register", (req, res) => {
  // add a new user to the users object - id (generate string), email, pass
  console.log("req.body:", req.body)
  let id = generateRandomString();
  users[id] = {id: id, email: req.body.email, password: req.body.password}
  console.log(users)
  // set user_id cookie containing user's newly generated ID
  res.cookie("user_id", users[id].id)
  res.redirect("/urls");
})

app.listen(PORT, () => {
  console.log(`example app listening on port ${PORT}!`);
});

// function generates a unique shortURL of 6 letters
function generateRandomString() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUPWXYZabcdefghijklmnopqrstupwxyz";
  const randomStr = [];
  for (let i = 0; i < 7; i++) {
    let random = Math.floor(Math.random() * letters.length);
    randomStr.push(letters.charAt(random));
  }
  return randomStr.join("");
}
