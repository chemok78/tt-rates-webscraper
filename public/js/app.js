/*global d3*/

//set margins for div container, SVG and chart area(g element)
var margin = {
    
    top: 20,
    right: 50,
    bottom: 20,
    left: 50
    
};

//width and height of chart, within SVG element
var w = 1000 - margin.left - margin.right,
    h = 700 - margin.top - margin.bottom;
    
var ratesData = "http://rateswebscraper.herokuapp.com/rates";

//load buy or sell data    
var loadData = function(dataSet, title){
    
    //set chart title
    document.getElementById("title").innerHTML = title;

    //reset SVG container element
    d3.select("#chart").select("svg").remove();
    
    //create SVG element and append to #chart div container
    var svg = d3.select("#chart")
    .append("svg")
        .attr("width", w + margin.left + margin.right)
        .attr("height", h + margin.top + margin.bottom)
    .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
        .attr("id", "area");
        
    //Create the scales    
    var x = d3.scaleTime().range([0,w]),
        y = d3.scaleLinear().range([h,0]),
        z = d3.scaleOrdinal(d3.schemeCategory10);
       
    //Line generator for path   
    var line = d3.line()
        .curve(d3.curveBasis)
        .x(function(d) {return x(d.date);})
        .y(function(d) {return y(d.rate);});   
    
    d3.json(ratesData, function(data){
        
       //convert date strings bank to date objects for d3.scaleTime    
       var rates = data.map(function(item){
       //every item is a date with bank rates in data
           
           item.date = new Date(item.date);
           
           //remove U&E from dataset
           //item.data is an array of objects with rates for each bank
           item.data.forEach(function(element, index){
           //every element is a bank object          
                  
              if(element.name == "U&E"){
                  
                  item.data.splice(index,1);
                  
              }
               
           });
           
           return item;
           
       });
       
       
       //rates is one array per day
       //[{date: object, data:[{"name": ICBC, "buy": "009309", sell:"090318"}, {"name": ICBC, "buy": "009309", sell:"090318"}] ]
       //Convert to an array per Bank name:
       //[{id: "bank", values: [{date: object, rate: number}]},{},{},{},{}]
     
       //create a list of banks first, like so:
       /*[
        
            {
                id: "HSBC",
                values: [
                ]
                
            },
            
       ]
       */
       var banks = rates[0].data.map(function(item){
       //get the first object(day) in the array
       //loop through the .data array and get the bank names for the series
       
          var bank ={};
          
          bank.id = item.name;
          
          bank.values = [];
          
          return bank;
          
       });
       
       
       var createRates = function(type){
       
           rates.forEach(function(item){
           //loop through every day of the rates array
              
              item.data.forEach(function(rate){
              //loop through every item       
                    
                    //banks if an array of objects of banks
                    //item.name is the bank name
                    //check in banks array which element that is
                    
                    for(var i = 0; i < banks.length; i ++){
                        
                        if(banks[i].id === rate.name){
                            
                            var rateObject = {};
                            
                            rateObject.date = new Date(item.date);
                            
                            if(type === "buy"){
                            
                                rateObject.rate = Number(rate.buy);
                            
                            } else {
                                
                                rateObject.rate = Number(rate.sell);
                                
                            }
                            
                            banks[i].values.push(rateObject);
                            
                        }
                        
                    }
                  
              });
               
           });
       
       };//createRates
       
       //Create a rates array per bank of buy values
       if(dataSet === "buy"){
           
          createRates("buy");
           
       } else {
           
           createRates("sell");
           
       }
       
       //var rates = array of objects per day (and nested data object per bank)
       //var banks = array of objects per bank (and nested value array of values per day)
       
       //Get the Min/Max values for date and rates and setup color scale based on bank ID
       x.domain(d3.extent(rates, function(d) { return d.date; }));
        y.domain([
        d3.min(banks, function(c) { return d3.min(c.values, function(d) { if(d.rate !== 0) {return d.rate;} else {return} }); }),
        d3.max(banks, function(c) { return d3.max(c.values, function(d) { return d.rate; }); })
      ]);
       //color scale needs an array of bank id's
       z.domain(banks.map(function(c) { return c.id; }));
       
        //append x Axis
        svg.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + h + ")")
          .call(d3.axisBottom(x));
    
        //append y Axis
        svg.append("g")
          .attr("class", "axis axis--y")
          .call(d3.axisLeft(y))
        .append("text")
          .attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", "0.71em")
          .attr("fill", "#000")
          .text("Rates in HKD");
          
        //for every bank element we append a g group element 
        var bank = svg.selectAll(".bank")
            .data(banks)
            .enter().append("g")
                .attr("class", "bank");
                
    //for every bank element we append a path element and use the line generator            
    bank.append("path")
            .attr("class", "line")
            .attr("d", function(d) { return line(d.values);})
            .style("stroke", function(d) { return z(d.id);})
            .style("fill", "none");
    
    //append a text next to the line for every bank    
     bank.append("text")
          .datum(function(d) { return {id: d.id, value: d.values[d.values.length - 1]}; })
          .attr("transform", function(d) { return "translate(" + x(d.value.date) + "," + y(d.value.rate) + ")"; })
          .attr("x", 3)
          .attr("dy", "0.35em")
          .style("font", "10px work sans")
          .text(function(d) { return d.id; });
                    
    });//d3.json

};//loadData function

//Call loadData function on page load with buy rates
loadData("buy", "Buy Rates");


//Add click events to buttons to load buy or sell data
document.getElementById("buyData").addEventListener("click", function(){
    
    loadData("buy", "Buy Rates");
    
});

document.getElementById("sellData").addEventListener("click", function(){
    
    loadData("sell", "Sell Rates");
    
})












