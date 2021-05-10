const express = require("express");
const app = express();
const PORT = 8080;

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

// sending HTML - render HTMl response in the client browser
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
})

app.listen(PORT, () => {
  console.log(`example app listening on port ${PORT}!`)
})


 