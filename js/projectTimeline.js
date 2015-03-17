var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = 960 - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var x = d3.time.scale()
    .range([0, width]);

var y = d3.scale.linear()
    .range([height, 0]);

var parseDate = d3.time.format.iso.parse;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

d3.csv("data/ProjectsCW1.csv", function(data) {



  // Coerce the strings to numbers.
  data.forEach(function(d) {
    d.Start_Date = parseDate(d.Start_Date);
    d.Completion_Date = parseDate(d.Completion_Date);
    d.Projected_Actual_Project_Completion_Date = parseDate(d.Projected_Actual_Project_Completion_Date);
    d.Planned_Cost_M = +d.Planned_Cost_M;
    d.Projected_Actual_Cost_M = +d.Projected_Actual_Cost_M;
  });


  

  // Compute the scales’ domains.
  x.domain([
    d3.min(d3.extent(data, function(d) { return d.Start_Date; })),
    d3.max(d3.extent(data, function(d) { return d.Completion_Date; }))
  ]);

  y.domain([
    d3.min(d3.extent(data, function(d) { return d.Projected_Actual_Cost_M; })),
    d3.max(d3.extent(data, function(d) { return d.Projected_Actual_Cost_M; }))
  ]);

  // Add the x-axis.
  svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.svg.axis().scale(x).orient("bottom"));

  // Add the y-axis.
  svg.append("g")
      .attr("class", "y axis")
      .call(d3.svg.axis().scale(y).orient("left"));

  // Add the points!
  svg.selectAll(".point")
      .data(data)
    .enter()
    .append("line")
    .attr("x1", function(d){ return x(d.Start_Date);})
    .attr("x2", function(d){ return x(d.Completion_Date);})
    .attr("y1", function(d){ return y(d.Planned_Cost_M);})
    .attr("y2", function(d){ return y(d.Projected_Actual_Cost_M);})
    .attr("stroke","black");
      //  .append("path")
      //  .attr("class", "point")
      // .attr("d", d3.svg.symbol().type("triangle-up"))
      // .attr("transform", function(d) { return "translate(" + x(d.x) + "," + y(d.y) + ")"; });
});
