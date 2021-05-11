const express = require("express");
const app = express();
const PORT = 8080;

// The body-parser library will convert the request body from a Buffer into string that we can read. It will then add the data to the req(request) object under the key body.
// body-parser depreciated
app.use(express.json({extended: true}))
// const bodyParser = require("body-parser");
// app.use(bodyParser.urlencoded({extended: true}));

// sets ejs as the view engine 
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
}

// registers a handler on root path "/"
app.get("/", (req, res) => {
  res.send("Hello!");
});

// additional endpoints 
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);

});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
})

// order matters - order from most to least specific
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { shortURL: req.params.shortURL, longURL: req.params.longURL };
  res.render("urls_show", templateVars);
});

// sending HTML - render HTMl response in the client browser
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
})

app.post("/urls", (req, res) => {
  console.log(req.body);  // Log the POST request body to the console
  res.send("Ok");         // Respond with 'Ok' (we will replace this)
});

// function generates a unique shortURL of 6 letters
function generateRandomString() {
  const letters = 'ABCDEFGHIJKLMNOPQRSTUPWXYZabcdefghijklmnopqrstupwxyz';
  const randomStr = [];
  for (let i = 0; i < 7; i++) {
    let random = Math.floor(Math.random()*letters.length);
    randomStr.push(letters.charAt(random));
  }
  return randomStr.join('')
}

app.listen(PORT, () => {
  console.log(`example app listening on port ${PORT}!`)
})


 