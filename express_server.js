const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const express = require("express");
const app = express();
const PORT = 8080;
app.use(cookieParser());
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  }
}

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};
//adding a helper function to verify if a shortened url belong to a user
const urlforUser = function(url, id) {
  const urls = urlsForUser (id);
  for (const u in urls) {
    if (urls[u].userID === id && u === url) {
      return true;
    }
  }
  return false;

}
//adding a helper function to return the urls of a specified user
const urlsForUser = function(id) {
  let urls = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      urls[url] = {longURL: urlDatabase[url].longURL, userID: urlDatabase[url].userID}
    }
  }
  return urls;

}
//adding a helper function to generate a random number
function generateRandomNumber() {
  return Math.floor(Math.random() * 100);
}
//adding a helper function to fetch if a user exists by his email
const fetchUserByEmail = function (email) {
  for (const u in users) {
    if (users[u].email === email) {
      return users[u];
    }
  }
  return null;
}
//adding a helper function to generate a random string
function generateRandomString() {
  return Math.random().toString(36).substr(2, 8);
}

// adding a route to the new url template
app.get("/urls/new", (req, res) => {
  if (req.cookies['user_id']) {
    res.render("urls_new");
  } else {
    res.render('login');
  }
  
});
//my home page returns message Hello

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
// adding a new route to display a single route
app.get('/urls/:shortURL', (req, res) => {
  let userId = req.cookies['user_id'];
  if (!userId) {
    res.send('you need to login first to be able to see shortened urls')
  }
  else {
    let user = fetchUserByEmail(userId);
    shortURL = req.params.shortURL;
    if (urlforUser (shortURL, user.id)) {
      longURL = req.body.newLongURL;
      const templateVars = { shortURL: shortURL, longURL: longURL, user: user };
      res.render('urls_show', templateVars);
    
    }
    else {
      res.send ('Sorry but this short URL was not created by you, you cant access it');
    }
    

  }
 
});
// adding a new route to redirect the user to the corresponding web page
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (longURL === undefined) {
    res.send('non existent');

  } else {
    res.redirect(longURL);
  }

});
// adding a new route get to Login
app.get('/login', (req, res) => {
  let userId = req.cookies['user_id'];
  let user = fetchUserByEmail(userId);
  const templateVars = { user: user, urls: urlDatabase };
  res.render('login', templateVars);

});
//adding a post route to register 
app.post('/register', (req, res) => {
  let userId = generateRandomNumber();
  let user_email = req.body.email;
  let user_password = req.body.password;
  let hashed_user_password = bcrypt.hashSync(user_password, 10);
  if (user_email === "" || user_password === "") {
    res.status(400);
    res.send('your email or your password is empty, please fill in these two fields');
    res.end();
  }
  if (fetchUserByEmail(user_email)) {
    res.status(400);
    res.send('Sorry but this email already exists, try to login');
    res.end();
  } else {
    users[userId] = { id: userId, email: user_email, password: hashed_user_password };
    res.cookie('user_id', user_email);
    res.redirect('/urls')
  }

})
// adding a get route to register
app.get('/register', (req, res) => {
  let userId = req.cookies['user_id'];
  if (userId) {
    email = userId;
  
  } else { email = null;}
  let user = { email: userId };
  const templateVars = { user: user, urls: urlDatabase };
  res.render('register', templateVars);


});

// adding a new route to post logout
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});
//adding a new route to post Login
app.post('/login', (req, res) => {
  let user = fetchUserByEmail(req.body.email);
  let email = req.body.email;
  let password = req.body.password;
  if (user) {
    if (user.password !== password) {
      res.status(403);
      res.send('incorrect password');
    } else {
      res.cookie('user_id', user.email);
      res.redirect('/urls');
    }
  } else {
    res.status(403);
    res.send('the user with that email can not be found');
  }

});
// adding a new route to urls 


//adding a post request to delete a url
app.post('/urls/:shortURL/delete', (req, res) => {
  shortURL = req.params.shortURL;
  let userId = req.cookies['user_id'];
  let user = fetchUserByEmail(userId);
  if (user) {

  
  if (urlforUser(shortURL, user.id)) {
  
  console.log(shortURL);
  delete urlDatabase[shortURL];
  res.redirect('/urls');
  } else {
    res.send('sorry this shortened url can only be deleted by its owner');
  }
}
else {
  res.send('sorry you cant delete while you didnt log in');
}
});

//addding our first post request to send the url to the list of urls
app.post('/urls/:shortURL', (req, res) => {
  shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.newLongURL;
  res.redirect('/urls');
});
app.post('/urls', (req, res) => {
  let userId = req.cookies['user_id'];
  let user = fetchUserByEmail(userId);
  longURL = req.body.longURL;
  shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: longURL, userID: user.id};
  res.redirect('/urls');
});
app.get("/urls", (req, res) => {

  let user = fetchUserByEmail(req.cookies['user_id']);
  
  console.log(user);
  if (user) {
    let urls = urlsForUser (user.id);
    const templateVars = {
      user: user,
      urls: urls,
    };

    res.render("urls_index", templateVars);
  }
  else {
    const templateVars = {
      user: null,
      urls: urlDatabase,
    };

    res.render("urls_index", templateVars);
  }

});



app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});