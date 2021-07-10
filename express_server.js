const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session')

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());
app.use(cookieSession({
  name: 'session',
  keys: ['no significance', 'key2', 'more stuff']
}))

const { getUserByEmail } = require('./helpers');

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.tsn.ca",
      userID: "user2RandomID"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "userRandomID"
  },
  i36oPS: {
    longURL: "https://www.something.com",
    userID: "userRandomID"
  },
  a367PG: {
    longURL: "https://www.somethingelse.com",
    userID: "user2RandomID"
  }
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

// function - returns the URLs where the userID is equal to the id of the input id user.
const urlsForUser = function(id) {
  const output = {};
  for (let item in urlDatabase) {
    if (urlDatabase[item].userID === id) {
      output[item] = urlDatabase[item].longURL;
    }
  }
  return output;
}

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

/* GET /  */
app.get("/", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect('/urls');
  } else {
    res.redirect('/login');
  }
});


/* GET /urls --- renders the index */
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const userObj = users[userId];
  const urlsOfUser = urlsForUser(userId);

  const templateVars = { 
    user_id: userId,
    urls: urlsOfUser, 
    user: userObj
  };

  res.render("urls_index", templateVars);
});


/* GET /urls/new --- renders the new URL page */
/* IMPORTANT --- 
--- this function needs to ALWAYS be placed before the /urls/:shortURL */
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  const userObj = users[userId];

  const templateVars = { 
    user: userObj 
  };

  if (userId) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});


/* GET /urls/:shortURL --- renders individual URL pages */
app.get("/urls/:shortURL", (req, res) => {
  const tempShortURL = req.params.shortURL;
  const userId = req.session.user_id;
  const userObj = users[userId];
  const urlsOfUser = urlsForUser(userId);

  const templateVars = { 
    shortURL: tempShortURL, 
    longURL: urlDatabase[tempShortURL].longURL, 
    user: userObj,
    user_id: userId
  };

  // checks if the short url is onwed by the user
  if (urlsOfUser.hasOwnProperty(tempShortURL)) {
    res.render("urls_show", templateVars);
  } else {
    res.send('You do not have permission to access this content.');
  }
});


/* GET /u/:shortURL --- redirects users to the long URL from the short URL */
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const originalURL = urlDatabase[shortURL].longURL;
  res.redirect(originalURL);
});


/* POST /urls --- handles new URL form submission */
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  const newShortUrl = generateRandomString();
  const newLongUrl = req.body.longURL;

  urlDatabase[newShortUrl] = {
    longURL: newLongUrl,
    userID: userId
  };

  res.redirect(`/urls/${newShortUrl}`);
});


/* POST /urls/:shortURL --- edits URL form */
app.post('/urls/:shortURL', (req, res) => {
  const id = req.params.shortURL;
  const body = req.body[id];
  const userId = req.session.user_id;
  const urlsOfUser = urlsForUser(userId);

  if (urlsOfUser.hasOwnProperty(id)) {
    urlDatabase[id].longURL = body;
    res.redirect('/urls');
  } else {
    res.send('You do not have permission to edit this content');
  }

  console.log(body);
});


/* POST /urls/:shortURL/delete --- handles delete URL button from the index page */
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortURL = req.params.shortURL;
  const userId = req.session.user_id;
  const urlsOfUser = urlsForUser(userId);

    // checks if the short url is onwed by the user
    if (urlsOfUser.hasOwnProperty(shortURL)) {
      delete urlDatabase[shortURL];
      res.redirect('/urls');
    } else {
      res.send('You do not have permission to delete this content');
    }

});


/***** LOGIN *****/

/* GET /login --- renders the login page */
app.get('/login', (req, res) => {
  const userId = req.session.user_id;
  const userObj = users[userId];

  const templateVars = {  
    user: userObj 
  };

  if (userId) {
    res.redirect('/urls')
  } else {
    res.render('login', templateVars);
  }

});

/* POST /login --- handles the login form */
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const user = getUserByEmail(email, users);

  //check if there a user with the email
  if (user) {
    // check if password match
    if (bcrypt.compareSync(password, users[user].password )) {
      req.session.user_id = user;
      res.redirect('/urls');
    } else {
      res.status(403);
      res.send('Incorrect password');
    }
  } else {
    res.status(403);
    res.send('User not found');
  }
});


/***** LOGOUT *****/

/* POST /logout --- handles the logout request */
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});


/***** REGISTRATION *****/

/* GET /register --- renders register page */
app.get('/register', (req, res) => {
  const userId = req.session.user_id;
  const userObj = users[userId];

  const templateVars = { 
    user: userObj 
  };

  if (userId) {
    res.redirect('/urls')
  } else {
    res.render('register', templateVars);
  }
});


/* POST /register --- handles registration form */
app.post('/register', (req, res) => {
  const newUserID = generateRandomString();
  const newUserEmail = req.body.email;
  const inputPassword = req.body.password;
  const newUserPassword = bcrypt.hashSync(inputPassword, 10);
  

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
    
    req.session.user_id = newUserID;
    res.redirect('/urls');
    console.log('pass info:', users);
  }
});


/*************/


app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});