var express = require("express");
var fs = require("fs");
//Request is designed to be the simplest way possible to make http calls
//It supports HTTPS and follows redirects by default.
var request = require("request");
//Cheerio is jQuery for the server
var cheerio = require("cheerio");

require("dotenv").config({
    
    silent: true 
    
});

var path = require("path");

//var bodyParser = require("body-parser");

//use native mongoDB driver
var mongodb = require("mongodb");

//load ObjectID method so we can generate new objectID, using objectId = new ObjectID
//MongoDB uses ObjectIDs as the default value of _id field of each document which is generated while creating any document
var ObjectID = mongodb.ObjectID;

var RATES_COLLECTION = "rates";

var app = express();

app.use(express.static(__dirname + "/public"));

//app.use(bodyParser.json);

mongodb.MongoClient.connect(process.env.DB_URL, function(err, database){
    
   if(err){
       
       console.log(err);
       process.exit(1);
       
   } 
    
   var db = database;
   
   console.log("successfully connected to the database");
   
   var server = app.listen(process.env.PORT || 8080, function(){
    
        var port = server.address().port;
   
        console.log("App is now running on port ", port);
        
    });
    
    /*API Services*/

    function handleError(res,reason, message,code){
        
        console.log("ERROR: " + reason);
        res.status(code || 500).json({
            
            "error": message
        });
        
    };

    app.get('/scrape', function(req,res){
    //Web Scraping API
    
        //the URL we will scrape from    
        var url = "http://hk.ttrate.com/en_us/index.php?b=0&c=CNY&s=3&t=3";
        
        request(url, function(error,response,html){
        //we capture error, response and html in the request callback
            
            if(error){
                
                console.log("there was an error" + error);
                
            }
            
            if(!error){
                
                //use cheerio library on returned html, gives jQuery like functionality
                var $ = cheerio.load(html);   
                
                console.log($);
                
                var json = { bank: " ", buy: "", sell: "" };
                
                //get the bank name
               $('.bank_name').filter(function(){
                    
                    //store data in we filter in a variable
                    var data = $(this); 
                    
                    console.log(data);
                    
                    var bank_name = data.children().first();
                    
                    console.log(bank_name);
                    
                    //json.bank = bank_name;
                    
                })
                
                
                
            }
            
            
        });
        
        res.send(200).end();
        
    });//app.get

});//mongodb.MongoClient


exports = module.exports = app;

