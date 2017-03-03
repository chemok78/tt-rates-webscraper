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
        
    }

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
                //load the html in a $ variable
                var $ = cheerio.load(html);   
                
                //Array to hold all the bank rate objects 
                var json = {
                    
                    date: "",
                    
                    data: [ ]
                    
                    
                };
                
                //create a date and put it in the JSON object
                
                var d = new Date();
                
                //save as JS Date object. Modify for use in front-end after retrieving from database
                json.date = d;
                
                /*Table is structured like this:
                <tbody>
                    <tr>
                        <td>Bank Name</td>
                        <td>Buy</td>
                        <td>Sell</td>
                    </tr>
                    <tr>
                        <td class="bank_name><span>HSBC</span></td>
                        <td class="rc_a"><a>0.89000</a></td>
                        <td class="rc_a"><a>0.90000</a></td>
                    </tr>
                <tbody>
                
                */
                
                //the first column of the rates table have the bank names with class .bank_name
                //We use that as our starting point for traversing 
                //.bank_name is a <td> element within <tr>
                $(".bank_name").each(function(i,elem){
                    
                    //in Cheerio JS: every element in the loop is available as $(this)
                    
                    //An empty object for each bank
                    var bank = {};
                    
                    //the bankname is in a span element within <td> with class .bank_name
                    var bank_name = $(this).children().text();
                    
                    //we get the second <td> element which is the buy rate
                    var tt_buy = $(this).next().children().text();
                    
                    //we get the third <td> element which is the sell rate
                    var tt_sell = $(this).next().next().children().text();
                    
                    bank.name = bank_name;
                    
                    bank.buy = tt_buy;
                    
                    bank.sell = tt_sell;
                    
                    json.data.push(bank);
                    
                    
                });//$(".bank_name").each
                
                
                //Insert JSON in database
                db.collection(RATES_COLLECTION).insertOne(json,function(err,doc){
                //insert new rates object, result contains the document from MongoDB
                //ops contains the document(s) inserted with added _id fields
                
                    if(err){
                        
                        handleError(res,err.message, "Failed to create new rates object");
                        
                    } else {
                        
                        res.status(201).json(doc.ops[0]);
                        //201 Created status code and send the inserted document to browser in JSON format
                        
                    }
                     
                    
                });
                
            }//if(!error)
            
            
        });
        
        //res.send(200).end();
        
    });//app.get

});//mongodb.MongoClient

exports = module.exports = app;

