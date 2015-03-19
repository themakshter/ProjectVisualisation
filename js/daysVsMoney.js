var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 1300 - margin.left - margin.right,
    height = 700 - margin.top - margin.bottom;

var x,y,xAxis,yAxis,zoom,svg;
var color = d3.scale.category20();
var parseDate = d3.time.format.iso.parse;

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
    (d3.max(d3.extent(data, function(d) { return d.daysToComplete; })))]).range([0, width]);

y = d3.scale.linear()
    .domain([0, d3.max(d3.extent(data, function(d) { return d.Planned_Cost_M; }))])
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
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
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
        .attr("transform","translate(" + -40 + " " + height/2+") rotate(-90)");
  
d3.select("button").on("click", reset);

redraw();
 

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
  svg.selectAll(".startPoint").remove();
  
  // Add the points!
  svg.selectAll(".point")
      .data(data)
    .enter()
    .append("circle")
    .call(point);
}

});


function point(point){
  point.attr("class","startPoint")
          .attr("cx",function(d){
            return x(d.daysToComplete);
          })
          .attr("cy",function(d){
            return y(d.Planned_Cost_M);
          })
          .attr("r",5)
          .attr("fill",function(d){
            return color(d.Agency_Name);
          })
          .attr("stroke-fill",function(d){
            return color(d.Agency_Name);
          })
          .attr("fill-opacity",0.65)
          .on("mousemove", mousemove)
          .on("mouseout", mouseout);;
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

function position() {
  this.style("left", function(d) { return d.x + "px"; })
      .style("top", function(d) { return d.y + "px"; })
      .style("width", function(d) { return Math.max(0, d.dx - 2) + "px"; })
      .style("height", function(d) { return Math.max(0, d.dy - 2) + "px"; });
}

var mousemove = function(d) {
  var xPosition = d3.event.pageX + 5;
  var yPosition = d3.event.pageY + 5;

  d3.select("#tooltip")
    .style("left", xPosition + "px")
    .style("top", yPosition + "px");
  d3.select("#tooltip #heading")
    .text(d.Project_Name);
  d3.select("#tooltip #spend")
    .text(formatNumber(Math.round(d.Planned_Cost_M * 1000000)));
  d3.select("#tooltip").classed("hidden", false);
};

var mouseout = function() {
  d3.select("#tooltip").classed("hidden", true);
};