Build with MEAN Stack and D3

Live app at: https://nodejswebscraperttrates.herokuapp.com/ 

Server Side:

Node and Express Server

Connects first to a MongoDB database in mLab and then sets the routes
RESTful API:
-GET request /scrape for scraping a TT rates website with table using Request JS and Cheerio JS. Scraper returns date, bank names, buy rate and sell rate
-GET request /rates for returning all documents from database

Cronjob on server to scrape every day and enter document in database

Front-end

Using D3 JSON method to access /rates route and pull in the data

