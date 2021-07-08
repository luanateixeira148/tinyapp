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

// //generates random string to be used as the shortURL
const generateRandomString = function(){
  return Math.random().toString(20).substr(2, 6)
}

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

// app.get("/urls", (req, res) => {
//   const cookieUsername = req.cookies.username;
//   const templateVars = { urls: urlDatabase, username: cookieUsername };
  
//   console.log(templateVars);
  
//   res.render("urls_index", templateVars);
// });

// Passing data to the template
app.get("/urls", (req, res) => {
  const templateVars = { 
    urls: urlDatabase, 
    username: req.cookies.username 
  };
  
  res.render("urls_index", templateVars);
});

// Render the page with the new URL form
app.get("/urls/new", (req, res) => {
  const templateVars = { 
    username: req.cookies.username 
  };
  
  res.render("urls_new", templateVars);
});

// Render the individual URL page
app.get("/urls/:shortURL", (req, res) => {
  const tempShortURL = req.params.shortURL;
  const templateVars = { 
    shortURL: tempShortURL, 
    longURL: urlDatabase[tempShortURL], 
    username: req.cookies.username 
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
})

// accepts the login form
app.post('/login', (req, res) => {
  const username = req.body.username;
  res.cookie('username', username);

  res.redirect('/urls');
});

// accepts the logout request
app.post('/logout', (req, res) => {
  res.clearCookie('username');
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

