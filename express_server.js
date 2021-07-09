const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "ozv250": "http://www.something.com"
};

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

// generates random string to be used as the shortURL and as the user's ID
const generateRandomString = function(){
  return Math.random().toString(20).substr(2, 6)
}

// function to check if user is already registered
const checkExistentEmail = function(inputEmail) {
  let output;
  for (let user in users) {
    console.log('user:', user, 'user.email:', users[user].email);
    if (users[user].email === inputEmail) {
      output = true;
    } else {
      output = false;
    }
  }
  return output;
};

// function to get user by email
const getUserByEmail = function(inputEmail) {
  for (user in users) {
    if (users[user].email === inputEmail) {
      return user;
    }
  }
  return null;
};

// Just for demo purpose? - Handler to the root path
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Just for demo purpose? - Handler to hello page
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Passing data to the index
app.get("/urls", (req, res) => {
  const userId = req.cookies.user_id;
  const userObj = users[userId];

  const templateVars = { 
    urls: urlDatabase, 
    user: userObj
  };
  
  res.render("urls_index", templateVars);
});

// Render the page with the new URL form
app.get("/urls/new", (req, res) => {
  const userId = req.cookies.user_id;
  const userObj = users[userId];

  const templateVars = { 
    user: userObj 
  };

  res.render("urls_new", templateVars);
});

// Render the individual URL page
app.get("/urls/:shortURL", (req, res) => {
  const tempShortURL = req.params.shortURL;
  const userId = req.cookies.user_id;
  const userObj = users[userId];

  const templateVars = { 
    shortURL: tempShortURL, 
    longURL: urlDatabase[tempShortURL], 
    user: userObj
  };
  res.render("urls_show", templateVars);
});

// handles the new URL form submission
app.post("/urls", (req, res) => {
  const newShortUrl = generateRandomString();
  const newLongUrl = req.body.longURL;

  urlDatabase[newShortUrl] = newLongUrl;

  res.redirect(`/urls/${newShortUrl}`);
});

// redirect users to the long url if they click the short url
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// deletes a url from the urls_index page
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  delete urlDatabase[shortURL];
  res.redirect('/urls');
});

// Edit the long url
app.post('/urls/:shortURL', (req, res) => {
  const id = req.params.shortURL;
  const body = req.body[id];
  urlDatabase[id] = body;
  res.redirect('/urls');
});

// renders the login page
app.get('/login', (req, res) => {
  const userId = req.cookies.user_id;
  const userObj = users[userId];

  const templateVars = {  
    user: userObj 
  };

  res.render('login', templateVars);
});

// accepts the login form
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email);

  //check if there a user with the email
  if (user) {
    // check if password match
    if (users[user].password === password) {
      res.cookie('user_id', user);
      res.redirect('/urls');
    } else {
      res.status(403);
      res.send('incorrect password');
    }
  } else {
    res.status(403);
    res.send('user not found');
  }
});

// accepts the logout request
app.post('/logout', (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/urls');
});

// renders the register page
app.get('/register', (req, res) => {
  const userId = req.cookies.user_id;
  const userObj = users[userId];

  const templateVars = { 
    user: userObj 
  };

  res.render('register', templateVars);
});

// handles the registration form data
app.post('/register', (req, res) => {
  const newUserID = generateRandomString();
  const newUserEmail = req.body.email;
  const newUserPassword = req.body.password;

  if (newUserEmail === '' || newUserPassword === '') {
    res.status(400);
    res.send('You need to define your email and password');
  } else if (checkExistentEmail(newUserEmail)) {
    res.status(400);
    res.send('You are already registered');
  } else {
    users[newUserID] = {
      id: newUserID,
      email: newUserEmail,
      password: newUserPassword
    };
    
    res.cookie('user_id', newUserID);
    res.redirect('/urls');
    console.log('pass info:', users);
  }
});


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

