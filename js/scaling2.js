var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 500 - margin.top - margin.bottom;

var x,y,xAxis,yAxis,zoom,svg;

var parseDate = d3.time.format.iso.parse;

d3.csv("data/ProjectsCW1.csv", function(data) {
  // Coerce the strings to numbers.
  data.forEach(function(d) {
    d.Start_Date = parseDate(d.Start_Date);
    d.Completion_Date = parseDate(d.Completion_Date);
    d.Projected_Actual_Project_Completion_Date = parseDate(d.Projected_Actual_Project_Completion_Date);
    d.Planned_Cost_M = +d.Planned_Cost_M;
    d.Projected_Actual_Cost_M = +d.Projected_Actual_Cost_M;
  });

x =  d3.time.scale()
	.domain([
		d3.min(d3.extent(data, function(d) { return d.Start_Date; })),
		d3.max(d3.extent(data, function(d) { return d.Completion_Date; }))
		])
    .range([0, width]);

y = d3.scale.linear()
    .domain([
		d3.min(d3.extent(data, function(d) { return d.Projected_Actual_Cost_M; })),
		d3.max(d3.extent(data, function(d) { return d.Projected_Actual_Cost_M; }))
	])
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

d3.select("button").on("click", reset);

 // Add the points!
  svg.selectAll(".point")
      .data(data)
    .enter()
    .append("circle")
    .call(startPoint);
    
  svg.selectAll(".point")
      .data(data)
    .enter()
    .append("circle")
    .call(endPoint);  
   
  svg.selectAll(".point")
      .data(data)
    .enter()
    .append("line")
    .call(line);



});


function zoomed() {
  svg.select(".x.axis").call(xAxis);
  svg.select(".y.axis").call(yAxis);
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
            return y(d.Projected_Actual_Cost_M);
          })
          .attr("r",3)
          .attr("fill","green");
}