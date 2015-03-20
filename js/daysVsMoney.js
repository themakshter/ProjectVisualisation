var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var padding = 250;
var x,y,xAxis,yAxis,zoom,svg;
var color = d3.scale.category20();
var parseDate = d3.time.format.iso.parse;
var cValue = function(d) { return d.Agency_Name;};
var formatNumber = d3.format("$,");
d3.csv("data/ProjectsCW1.csv", function(data) {
  // Coerce the strings to numbers.
  data.forEach(function(d) {
    d.Start_Date = parseDate(d.Start_Date);
    d.Completion_Date = parseDate(d.Completion_Date);
    d.Projected_Actual_Project_Completion_Date = parseDate(d.Projected_Actual_Project_Completion_Date);
    d.Planned_Cost_M = +d.Planned_Cost_M;
    d.Projected_Actual_Cost_M = +d.Projected_Actual_Cost_M;
    d.daysToComplete = Math.abs((d.Completion_Date - d.Start_Date)/86400000);
  });



x =  d3.scale.linear()
  .domain([0,
    (d3.max(d3.extent(data, function(d) { return d.daysToComplete; }))) + 10])
  .range([0, width]);

y = d3.scale.linear()
    .domain([0, d3.max(d3.extent(data, function(d) { return d.Planned_Cost_M; }))+100])
    .range([height, 0]);

xAxis = d3.svg.axis()
    .scale(x)
    .orient("bottom")
    .tickSize(-height);

yAxis = d3.svg.axis()
    .scale(y)
    .orient("left")
    .tickSize(-width);

zoom = d3.behavior.zoom()
    .x(x)
    .y(y)
    .scaleExtent([1, 10])
    .on("zoom", zoomed);

svg = d3.select("body").append("svg")
    .attr("width", width +padding + margin.left + margin.right)
    .attr("height", height+padding + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
    .call(zoom);



svg.append("rect")
    .attr("width", width)
    .attr("height", height);

svg.append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0," + height + ")")
    .call(xAxis);

svg.append("g")
    .attr("class", "y axis")
    .call(yAxis);

     // Add the x-axis label
   svg.append("text")
        .attr("class", "axis")
        .text("Duration of Project (days)")
        .attr("x", width/2)
        .attr("y", height)
        .attr("dy","2.4em")
        .style("text-anchor","middle");
  
 // add y-axis label
    svg.append("g").append("text")
        .attr("class", "axis")
        .text("Projected Cost ($M)")
        .style("text-anchor","middle")
        .attr("transform","translate(" + 20 + " " + height/2+") rotate(-90)");
  
redraw();

// draw legend
  var legend = svg.selectAll(".legend")
      .data(color.domain())
    .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

  // draw legend colored rectangles
  legend.append("rect")
      .attr("x", width+padding - 18)
      .attr("width", 18)
      .attr("height", 18)
      .style("fill", color);

  // draw legend text
  legend.append("text")
      .attr("x", width+padding - 24)
      .attr("y", 9)
      .attr("dy", ".35em")
      .style("text-anchor", "end")
      .text(function(d) { return d;})


 

function zoomed() {
  svg.select(".x.axis").call(xAxis);
  svg.select(".y.axis").call(yAxis);
  redraw(data);
}

function reset() {
  d3.transition().duration(750).tween("zoom", function() {
    var ix = d3.interpolate(x.domain(), [-width / 2, width / 2]),
        iy = d3.interpolate(y.domain(), [-height / 2, height / 2]);
    return function(t) {
      zoom.x(x.domain(ix(t))).y(y.domain(iy(t)));
      zoomed();
    };
  });
}


function redraw(){
  svg.selectAll(".point").remove();
  
  // Add the points!
  svg.selectAll(".point")
      .data(data)
    .enter()
    .append("circle")
    .call(point);
}

});


function point(point){
  point.attr("class","point")
          .attr("cx",function(d){
            return x(d.daysToComplete+30);
          })
          .attr("cy",function(d){
            return y(d.Planned_Cost_M+30);
          })
          .attr("r",5)
          .attr("fill",function(d){
            return color(d.Agency_Name);
          })
          .attr("stroke-fill",function(d){
            return color(cValue(d));
          })
          .attr("fill-opacity",0.65)
          .on("click", mousemove)
          ;
}


function line(line) {
    line.attr("class","timeLine")
    .attr("x1", function(d){ return x(d.Start_Date);})
    .attr("x2", function(d){ return x(d.Completion_Date);})
    .attr("y1", function(d){ return y(d.Planned_Cost_M);})
    .attr("y2", function(d){ return y(d.Projected_Actual_Cost_M);})
    .attr("stroke","black");
}

function startPoint(point){
    point.attr("class","startPoint")
          .attr("cx",function(d){
            return x(d.Start_Date);
          })
          .attr("cy",function(d){
            return y(d.Planned_Cost_M);
          })
          .attr("r",3)
          .attr("fill","red");
}

function endPoint(point){
    point.attr("class","endPoint")
          .attr("cx",function(d){
            return x(d.Completion_Date);
          })
          .attr("cy",function(d){
            return y(d.Planned_Cost_M);
          })
          .attr("r",3)
          .attr("fill","green");
}



var mousemove = function(d) {
   d3.select("#tooltip #heading")
    .text(d.Project_Name);
  d3.select("#tooltip #spend")
    .text("Planned cost is" + formatNumber(Math.round(d.Planned_Cost_M * 1000000)));
  d3.select("#tooltip #duration")
    .text("Lasts " +  d.daysToComplete + " days ("+new Date(d.Start_Date).toLocaleDateString() +" to " + new Date(d.Completion_Date).toLocaleDateString()+")");
  d3.select("#tooltip").classed("hidden", false);
};

var mouseout = function() {
  d3.select("#tooltip").classed("hidden", true);
};