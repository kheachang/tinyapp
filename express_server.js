const express = require("express");
const app = express();
const PORT = 8080;

// MIDDLEWARE:
app.use(express.urlencoded({ extended: true }))
app.use(express.json())

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
  const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

// shows the form to submit new url
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

// sending HTML - render HTMl response in the client browser
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// user submits forms and presses submit
app.post("/urls", (req, res) => {
  console.log("req.body: ", req.body); // req.body shows up in post request only
  const longURL = req.body.longURL;
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = longURL
  res.redirect(`./urls/${shortURL}`);
});

// route for showing users their newly created shortURL link
// colon indicates a url that is changing
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
  };
  res.render("urls_show", templateVars);
});

// server responds with a redirect to "/u/:shortURL" to its longURL
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

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
