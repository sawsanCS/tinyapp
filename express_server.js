const getUserByEmail = require('./helpers')
const bcrypt = require('bcrypt'); // to hash passwords
const bodyParser = require("body-parser");
var cookieSession = require('cookie-session');
const express = require("express");
const app = express();
const PORT = 8080;

app.set("view engine", "ejs");
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}))
app.use(bodyParser.urlencoded({ extended: true }));
// list of users : object
const users = {
  "myUserRandomID": {
    id: "myUserRandomID",
    email: "sawsan_sli3i@live.fr",
    password: bcrypt.hashSync("moi", 10)
  },
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
//updated our urlDatabase using the shortURL as key
const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "userRandomID" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "myUserRandomID" }
};
// helper function 

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

//adding a helper function to generate a random string
function generateRandomString() {
  return Math.random().toString(36).substr(2, 8);
}


//routes 

// adding a route to the new url template, where the user will add a new url 
// get 
app.get("/urls/new", (req, res) => {
  if (req.session.user_id) {
    let user = getUserByEmail (req.session.user_id, users);
    const templateVars = { user: user, urls: urlDatabase};
    res.render("urls_new", templateVars);
  } else {
    const templateVars = { user: null}
    res.render('login', templateVars);
  }
  
});
//adding a route that displays our urlDatabase as a json document

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});
// adding a new route to display a single route
app.get('/urls/:shortURL', (req, res) => {
  let userId = req.session.user_id;
  console.log(userId);

    let user = getUserByEmail(userId, users);
    shortURL = req.params.shortURL;
    if (!user) {
      res.send('<html> <body> <h2 style= "color:blue;"> you need to login first to be able to see shortened urls</h2></body></html>\n');
    }
    else {
      if (urlforUser (shortURL, user.id)) {
        longURL = urlDatabase[shortURL].longURL;
        const templateVars = { shortURL: shortURL, longURL: longURL, user: user };
        res.render('urls_show', templateVars);
      
      }
      else {
        res.send ('<html> <body> <h2 style= "color:blue;">Sorry but this short URL was not created by you, you cant access it</h2></body></html>\n');
      }
      
    }
    

  
 
});
// adding a new route to redirect the user to the corresponding web page
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL].longURL;
  if (!urlDatabase[shortURL]) {
    res.send('non existent');
  } else {
    res.redirect(longURL);
  }

});
// adding a new route get to Login
app.get('/login', (req, res) => {
  let userId = req.session.user_id;
  let user = getUserByEmail(userId, users);
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
    res.send('<html> <body> <h2 style= "color:blue;">your email or your password is empty, please fill in these two fields </h2></body></html>');
    res.end();
  }
  if (getUserByEmail(user_email, users)) {
    res.status(400);
    res.send('<html> <body> <h2 style= "color:blue;">Sorry but this email already exists, try to login</h2></body></html>');
    res.end();
  } else {
    users[userId] = { id: userId, email: user_email, password: hashed_user_password };
    req.session.user_id = user_email;
    res.redirect('/urls')
  }

})
// adding a get route to register
app.get('/register', (req, res) => {
  let userId = req.session.user_id;
  if (userId) {
    email = userId;
  
  } else { email = null;}
  let user = { email: userId };
  const templateVars = { user: user, urls: urlDatabase };
  res.render('register', templateVars);


});

// adding a new route to post logout
app.post('/logout', (req, res) => {
  res.clearCookie('session');
  res.clearCookie('session.sig');
  res.redirect('/urls');
});
//adding a new route to post Login
app.post('/login', (req, res) => {
  let email = req.body.email;
  let password = req.body.password;
  let user = getUserByEmail(email, users);
  
  if (user) {
    if (bcrypt.compareSync(password, user.password)) {
      req.session.user_id = user.email;
     
      res.redirect('/urls');
    
    } else {
      res.status(403);
      res.send('<html> <body> <h2 style= "color:blue;">incorrect password</h2></body></html>');
    }
  } else {
    res.status(403);
    res.send('<html> <body> <h2 style= "color:blue;">the user with that email can not be found</h2></body></html>');
  }

});


//adding a post request to delete a url
app.post('/urls/:shortURL/delete', (req, res) => {
  shortURL = req.params.shortURL;
  let userId = req.session.user_id;
  let user = getUserByEmail(userId, users);
  if (user) {

    if (urlforUser(shortURL, user.id)) {
     console.log(shortURL);
     delete urlDatabase[shortURL];
     res.redirect('/urls');
  } else {
    res.send('<html> <body> <h2 style= "color:blue;">sorry this shortened url can only be deleted by its owner</h2></body></html>');
  }
}
else {
  res.send('<html> <body> <h2 style= "color:blue;">sorry you cant delete while you didnt log in</h2></body></html>');
}
});

//addding our first post request to send the url to the list of urls
app.post('/urls/:shortURL', (req, res) => {
  shortURL = req.params.shortURL;
  urlDatabase[shortURL].longURL = req.body.newLongURL;
  res.redirect('/urls');
});
// adding a post route to render the urls
app.post('/urls', (req, res) => {
  let userId = req.session.user_id;
  let user = getUserByEmail(userId, users);
  longURL = req.body.longURL;
  shortURL = generateRandomString();
  urlDatabase[shortURL] = {longURL: longURL, userID: user.id};
  res.redirect('/urls');
});
//adding a get route to urls
app.get('/urls', (req, res) => {

  let user = getUserByEmail(req.session.user_id, users);
  
    
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
      urls: null,
    };
    res.render('urls_index', templateVars);
  }

});
// adding a get route to the main page
app.get('/', (req,res) => {
  let user = getUserByEmail (req.session.user_id);
  let urls = urlsForUser(req.session.user_id)
  const templateVars = { user: user, urls: urls};
  if (req.session.user_id) {
    res.render("urls_index", templateVars);
} else {
  res.render('login', templateVars);
}
})


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});