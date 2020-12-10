const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");



const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Hello!");
});
// adding a new route to urls 
app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
  });
app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });
  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });
  // adding a new route to display a single route
app.get('/urls/:shortURL', (req, res) => {
    const templateVars = {url : urlDatabase[shortURL]};
    res.render('urls_show', templateVars);

})  
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
