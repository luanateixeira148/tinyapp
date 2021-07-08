const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser')

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser())

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
  "olm076": "http://www.something.com"
};


//generates random string to be used as the shortURL
const generateRandomString = function(){
  return Math.random().toString(20).substr(2, 6)
}

// app.get("/", (req, res) => {
//   res.send("Hello!");
// });

// app.get("/hello", (req, res) => {
//   res.send("<html><body>Hello <b>World</b></body></html>\n");
// });

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  //1. We will try to read the value of cookie
  const templateVars = {};
  //If the cookies are there
  if(req.cookies){
    if(req.cookies["username"]){
      templateVars["urls"] = urlDatabase;
      templateVars["username"] = req.cookies["username"];
    } else {
      templateVars["urls"] = urlDatabase;
      templateVars["username"] = null;
    }
  } else {
    templateVars["urls"] = urlDatabase
    templateVars["username"] = null;
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  const tempShortURL = req.params.shortURL;
  const templateVars = { shortURL: tempShortURL, longURL: urlDatabase[tempShortURL] };
  res.render("urls_show", templateVars);
});

// Add POST /urls
app.post("/urls", (req, res) => {
  let newLongURL = req.body.longURL;
  let newShortURL = generateRandomString();
  urlDatabase[newShortURL] = newLongURL;
  res.redirect(`/urls/${newShortURL}`);
});

app.get("/u/:shortURL", (req, res) => {
  const tempLongURL = urlDatabase[req.params.shortURL];
  // console.log(tempLongURL);
  res.redirect(tempLongURL);
});

// Edit POST /urls/:shortURL
app.post('/urls/:shortURL', (req, res) => {
  const id = req.params.shortURL;
  const body = req.body[id];
  
  // console.log(id);
  urlDatabase[id] = body;

  res.redirect('/urls');
});

// Delete POST /urls/:shortURL/delete
app.post('/urls/:shortURL/delete', (req, res) => {
  const deleteShortURL = req.params.shortURL;
  delete urlDatabase[deleteShortURL];

  res.redirect('/urls');
});

// Login POST /login
app.post('/login', (req, res) => {
  const newUser = req.body.username;
  console.log(newUser);
  //Write a cookie within the browser. We have the cookiename as "username"
  res.cookie('username', newUser);

  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});


