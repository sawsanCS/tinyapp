const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");




const express = require("express");
const app = express();
const PORT = 8080;
app.use(cookieParser());
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
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
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};
//adding a helper function to generate a random number
function generateRandomNumber() {
  return Math.floor(Math.random() * 100);  
}
//adding a helper function to fetch if a user exists by his email
const fetchUserByEmail = function(email) {
  for (const u in users) {
    if (users[u].email === email) {
      return true;
    }
  }
  return false;
}
//adding a helper function to generate a random string
function generateRandomString() {
  return Math.random().toString(36).substr(2,8);
}

// adding a route to the new url template
app.get("/urls/new", (req, res) => {
    res.render("urls_new");
  });
  //my home page returns message Hello
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
  // adding a new route get to Login
  app.get('/login', (req, res) => {
    let username = req.cookies['username'];
    const templateVars = {
      username: username,
    };
    res.render("urls_index", templateVars);
  });
  //adding a post route to register 
app.post('/register', (req, res) =>{
  let userId = generateRandomNumber();
  let user_email = req.body.email;
  let user_password = req.body.password;
 
  if (user_email === "" || user_password ==="") {
    res.status(400);
    res.send('your email or your password is empty');
    res.end();
  }
  if (fetchUserByEmail(user_email) === true) {
    res.status(400);
    res.send('Sorry but this email already exists, try to login');
    res.end();
  } else {
    users[userId] = { id: userId, email: user_email, password: user_password};
    res.cookie('user_id', userId);
    res.redirect('/urls')
  }
  
})
// adding a get route to register
app.get('/register', (req, res) => {
  let userId = req.cookies['user_id'];
  let user = {id: userId, email : req.body.email, password: req.body.password};
  const templateVars = { user: user, urls: urlDatabase};
  res.render('register', templateVars);
});

  // adding a new route to post logout
app.post('/logout', (req,res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});
  //adding a new route to post Login
app.post('/login', (req, res) => {
  if (req.body.username) {
    res.cookie('username', req.body.username);
    res.redirect('/urls');
  } else {
     res.cookie('username', null);
     res.redirect('/urls');
  }
});
  // adding a new route to urls 
app.get("/urls", (req, res) => {
  let userId = req.cookies['user_id'];
  const templateVars = {
    user: users[userId],
    urls: urlDatabase,
  };
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
