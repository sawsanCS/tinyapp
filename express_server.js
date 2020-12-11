const bodyParser = require("body-parser");


const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//adding a helper function to generate a random string
function generateRandomString() {
  return Math.random().toString(36).substr(2,8);
}

// adding a route to the new url template
app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });
  app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
  });
  // adding a new route to display a single route
app.get('/urls/:shortURL', (req, res) => {
    shortURL = req.params.shortURL;
    longURL = req.body.newLongURL;
    const templateVars = {shortURL: shortURL, longURL: longURL};
    res.render('urls_show', templateVars);

});
// adding a new route to redirect the user to the corresponding web page
app.get("/u/:shortURL", (req, res) => {
    const shortURL = req.params.shortURL;
    const longURL = urlDatabase[shortURL];
    if (longURL === undefined) {
        res.send('non existent');
       
    } else {
        res.redirect(longURL);
       }
      
  });
  //adding a new route to post Login
app.post('/login', (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
})
  // adding a new route to urls 
app.get("/urls", (req, res) => {
    const templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
  });

//adding a post request to delete a url
app.post('/urls/:shortURL/delete', (req, res) => {
    shortURL = req.params.shortURL;
    console.log(shortURL);
    delete urlDatabase[shortURL];
    res.redirect('/urls');
});
  
//addding our first post request to send the url to the list of urls
app.post('/urls/:shortURL', (req, res) => {
    shortURL = req.params.shortURL;
    urlDatabase[shortURL] = req.body.newLongURL;
    res.redirect('/urls');
});
app.post('/urls', (req, res) => {
    longURL = req.body.longURL;
    shortURL = generateRandomString();
    urlDatabase[shortURL]= longURL;
    res.redirect('/urls');
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
