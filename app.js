
var express = require("express");
var bodyParser = require("body-parser");
var app = express();
var path = require("path");

var mysql = require("mysql");
var connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "MuneqXod8090@x-"
    //database: "activos_fijos"
});

connection.query('CREATE DATABASE IF NOT EXISTS Company', function (err) {

    var table_query = "CREATE TABLE IF NOT EXISTS Employees (\
        EmployeeId                 INT NOT NULL AUTO_INCREMENT,\
        SocialSecurityNumber       longtext not null,\
        FirstName                  longtext not null,\
        LastName                   longtext not null,\
        Title                      longtext not null,\
        Salary                     long not null,\
        City                       longtext not null,\
        Cellphone                  longtext not null,\
        PRIMARY KEY (EmployeeId));";

    if (err) throw err;
    connection.query('USE Company', function (err) {
        if (err) throw err;
        connection.query(table_query, function (err) {
                if (err) throw err;
                console.log("The database was started successfully.");
            });
    });
});


/*
connection.connect(function(err){
    if(err) {
        throw err;
    }
    console.log("La conexion a la BD fue creada exitosamente");
    var query = "CREATE TABLE IF NOT EXISTS Members (Id INTEGER PRIMARY KEY, Firstname TEXT, Lastname TEXT, SSN TEXT, Phone TEXT, Cellphone TEXT, Email TEXT, Address TEXT, RegisterDate TEXT)""
    connection.query("Select * from personalencargado ", function(err, result){
        if(err) {
            throw err;
        }
        else {
            console.log("The query response is: "+result);
        }
    });
});
*/

var urlEncondedParser = bodyParser.urlencoded({ extended: false });

app.use(express.static(__dirname + '/public'));
app.use(express.static(__dirname + '/node_modules'));

app.get("/", function(req, resp){
    resp.sendFile(path.join(__dirname+"/views/employees-list.html"))
});

app.get("/employees/edition", function(req, resp){
    resp.sendFile(path.join(__dirname+"/views/employees.html"))
});

app.get("/employees/list", function(req, resp){

    var query =  "Select * from Employees";

    connection.query(query, function(error, result){
        if(error) {
            throw error;
        }
        resp.sendFile(path.join(__dirname+"/views/employees-list.html"), {personas: resp})
    });
    
});

app.get("/employees-list", urlEncondedParser, function(req, resp) {
    
    console.log("Trying to recover the employees list.");

    var query =  "Select * from Employees;";

    connection.query(query, function(error, result){
        if(error) {
            throw error;
        }            
        console.log("The employees list was successfully recovered.");
        resp.send(result);
    });
});

app.post("/employees-edition", urlEncondedParser, function(req, resp) {

    // Using the connection.scape method to avoid sql injection.
    var firstname = connection.escape(req.body.firstname);
    var lastname = connection.escape(req.body.lastname);
    var socialSecurityNumber = connection.escape(req.body.socialSecurityNumber);
    var title = connection.escape(req.body.title);
    var salary = connection.escape(req.body.salary);
    var city = connection.escape(req.body.city);
    var cellphone = connection.escape(req.body.cellphone);

    console.log("The info received is:/n");
    console.log("firstname -> "+firstname);
    console.log("lastname -> "+lastname);
    console.log("socialSecurityNumber -> "+socialSecurityNumber);
    console.log("title -> "+title);
    console.log("salary -> "+salary);
    console.log("city -> "+city);
    console.log("cellphone -> "+cellphone);

    var query = "Insert into Employees(FirstName, LastName, SocialSecurityNumber, Title, Salary, City, Cellphone )"
    +"values("+firstname+","+ lastname +","+ socialSecurityNumber+","+ title +","+ salary +","+ city +","+cellphone+");"

    connection.query(query, function(error, result){
        if(error) {
            throw error;
        }
        else {
            console.log("The row was inserted sucessfully.")
        }
    });
    
    resp.end("Req Body -> "+socialSecurityNumber);
});

var port = 9086;

app.listen(port, function(){
    console.log('Server running on '+port+"...");
});