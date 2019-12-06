var express = require("express");
var request = require("request");
var mysql = require("mysql");
var app = express();

// enables server to serve up static files
app.use(express.static('./public'));

var connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "password",
  database: "CS375"
});

connection.connect(function(err) {
  if (err) throw err;
  console.log("Connected!");
});

function scanForCode(text)
{
  text.split("\n");
}

app.post("/addModerator", function(request, response)
{
  var addToModerators = `INSERT INTO Moderators (name)
  VALUES
  (
    "${request.name}"
  )`;

  connection.query(addToModerators, function(err, result) {
    if (err) throw err;
    console.log("Result: " + result.message);
  });
});

app.post("/addModeratorPermission", function(request, response)
{
  var sqlQuery = `INSERT INTO ModeratorPermissions
  VALUES
  (
      "${connection.escape(request.modID)}",
      "${connection.escape(request.classID)}"
  )`

  connection.query(sqlQuery, function(err, result) {
      if (err) throw err;
      console.log("Result: " + result.message);
    });
});

app.get("/modInfo", function(request, response)
{
  var sqlQuery = `SELECT * FROM Moderators`;

  connection.query(sqlQuery, function(err, result) {
      if (err) throw err;
      response.send(result);
    });

    return;
});

app.get("/classes", function(request, response)
{
  var sqlQuery = `SELECT * FROM classes`;

  connection.query(sqlQuery, function(err, result) {
      if (err) throw err;
      response.send(result);
      response.end();
    });
});

app.get("/topics", function(request, response)
{
  var sqlQuery = `SELECT * FROM topics`;

  connection.query(sqlQuery, function(err, result) {
      if (err) throw err;
      response.send(result);
    });

    return;
});

app.get("/addSubject", function(request, response)
{
  var sqlQuery = `INSERT INTO Classes (subject, classname) VALUES ("${request.query.subject}", "${request.query.className}")`;

  connection.query(sqlQuery, function(err, result) {
      if (err) throw err;
      response.send(result);
    });

    return;
});

app.get("/threads", function(request, response)
{
  var sqlQuery = `SELECT * FROM Threads WHERE threads.topicID = ${request.query.topicID}`;

  connection.query(sqlQuery, function(err, result) {
      if (err) throw err;
      response.send(result);
    });

    return;
});

app.get("/postThread", function(request, response)
{
  var sqlQuery = `INSERT INTO threads (topicID, name, text, creatorName, dateCreated) VALUES 
  ("${request.query.topicID}"
  "${request.query.name}",
  "${request.query.text}",
  "${request.query.creatorName}",
  "${request.query.dateCreated}"
  )`;

  connection.query(sqlQuery, function(err, result) {
      if (err) throw err;
      response.send(result);
    });

    return;
});

app.get("/addComment", function(request, response)
{
  var sqlQuery = `INSERT INTO comments (threadID, text) VALUES 
  (${request.query.threadID},
  "${request.query.text}"
  )`;

  connection.query(sqlQuery, function(err, result) {
      if (err) throw err;
      response.send(result);
    });

    return;
});

app.get("/getComments", function(request, response)
{
  var sqlQuery = `SELECT * from comments WHERE comments.threadID = ${request.query.threadID}`;

  connection.query(sqlQuery, function(err, result) {
      if (err) throw err;
      response.send(result);
    });

    return;
});

// Email Verification and User Creation
// Session Control
var nodemailer = require("nodemailer");
const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;

var info = require('./config.json');

const oauth2Client = new OAuth2(
    info.clientId,   // ClientID
    info.clientSecret, // Client Secret
    "https://developers.google.com/oauthplayground" // Redirect URL
);

oauth2Client.setCredentials({
    refresh_token: info.refreshToken
});
const accessToken = oauth2Client.getAccessToken()
/*
    Here we are configuring our SMTP Server details.
    STMP is mail server which is responsible for sending and recieving email.
*/
var smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
         type: "OAuth2",
         user: info.user, 
         clientId: info.clientId,
         clientSecret: info.clientSecret,
         refreshToken: info.refreshToken,
         accessToken: accessToken
    }
});
var rand,mailOptions,host,link;

/*------------------SMTP Over-----------------------------*/

/*------------------Routing Started ------------------------*/

app.get('/',function(req,res){
    res.sendFile('/Users/lhtrinh/Downloads/CS375/Project/test.html');
});

app.get('/send',function(req,res){
    rand=Math.floor((Math.random() * 100) + 54);
    host=req.get('host');
    link="http://"+req.get('host')+"/verify?id="+rand;
    console.log(req.query.emailAddress)
    mailOptions={
        to : req.query.emailAddress,
        subject : "Please confirm your Email account",
        generateTextFromHTML: true,
        html : "<br>Hello, Please Click on the link to verify your email.<br><a href="+link+">Click here to verify</a>" 
    }
    console.log(mailOptions);
    smtpTransport.sendMail(mailOptions, function(error, response){
     if(error){
        console.log(error);
        res.end("error");
     }else{
        console.log("Message sent: " + response.message);
        res.end("sent");
        }
    });
});

app.get('/verify',function(req,res){
console.log(req.protocol+":/"+req.get('host'));
if((req.protocol+"://"+req.get('host'))==("http://"+host))
{
    console.log("Domain is matched. Information is from Authentic email");
    if(req.query.id==rand)
    {
        console.log("email is verified");
        // res.end("<h1>Email "+mailOptions.to+" is been successfully verified");
        res.write("<h1>Email "+mailOptions.to+" is been successfully verified" + 
            `<form method=post action='/createUser'>
            <input type=text name=username>
            <input type=password name=password>
            <input type=submit value=Submit>
            </form>
            </body>
            </html>`);
    }
    else
    {
        console.log("Email is not verified");
        res.end("<h1>Bad Request</h1>");
    }
}
else
{
    res.end("<h1>Request is from unknown source");
}
});

// Create user with password after email is verified
app.post('/createUser', function (req, res){
        userid=req.body.name;
        password=req.body.password;
});

// User login and store user info in session cookie
var database = require('./controllers/database');
var db = new database();

var session = require('client-sessions');
app.use(session({
    cookieName: 'session',
    secret: 'asdfasdf23423', //we could load all this in from an external file
    duration: 30 * 60 * 1000,
    activeDuration: 5 * 60 * 1000, //if timeout, but active, extend timeout by this much
}));

// create routes and apply sessions to them
app.get('/helloWorld', function(req, res) {
    if(req.session.lastpage) {
        res.write('Last page: ' + req.session.lastPage + '. ');
    }
    req.session.lastPage = '/helloWorld';
    res.write('Hello World. ');
    res.end();
});

app.post('/login', function (req, res){
    db.once('loggedin', function(msg){
    if(msg==1){
        req.session.userid=req.body.name;
        return res.redirect('/getUsers');
    }
    else{
        req.session.msg = "Invalid login";
        return res.redirect('/relogin');
    }
    });
    db.login(req.body.username, req.body.password);
});

app.get('/getUsers', function(req,res){
    if(!req.session.userid){
        req.session.msg = 'Not allowed there';
        return res.redirect('/');
    }
    // what to do if logged in…
 });

 app.get('/relogin', function (req, res){
    res.write(`<html><body>`);
    if(req.session.msg){
        res.write(req.session.msg);
        delete req.session.msg;
    }
    res.write(`
        <form method=post action='/login'>
        <input type=text name=username>
        <input type=password name=password>
        <input type=submit value=Login>
        </form>
        </body>
        </html>`);
    res.end();
});

 app.get('/logout', function (req, res){
    req.session.reset();
    req.session.msg = 'You logged out';
    return res.redirect('/');
});
/*--------------------Routing Over----------------------------*/
app.listen(8080);
