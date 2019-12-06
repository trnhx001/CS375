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

app.listen(8080);