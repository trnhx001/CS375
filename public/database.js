'use strict'

var EventEmitter = require('events').EventEmitter;
var mysql = require('mysql');

var dbinfo = require('../Passwords/databaseinfo.json');

var con = mysql.createConnection(dbinfo);
con.connect(function(err) {
    if (err) {
        console.log('Error connecting to database');
    }
    else {
        console.log('Database successfully connected');
    }
});

class Database extends EventEmitter{
    constructor(){super();}
    login (name,password){
        var str = "SELECT * FROM Users WHERE name="+con.escape(name)
            + " AND password=PASSWORD("+ con.escape(password) +")";
        var self = this;
        con.query(str,
            function(err, rows, fields){
                if(err){
                    console.log('Error');
                    self.emit('loggedin',-1);
                }
                else{
                    if(rows.length>0)
                        self.emit('loggedin',1);
                    else
                        self.emit('loggedin',0);
                }
            }
        );
    }

    getUserTable(){
        var str = 'SELECT name, type FROM Users order by name';
        var self = this;
        con.query(str, function(err, rows, fields){
            if(err){
                console.log('Error');
                self.emit('usertable',-1);
            }
            else{
                self.emit('usertable',rows);
            }
        })
    }

}
exports.Database = Database
