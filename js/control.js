$( document ).ready(function() {
	// You can comment out the whole csv section if you just have a JSON file.
	// loadJSONFile('data/portaldata.json');

	d3.csv("data/ProjectsCW1.csv", function(csv_data){
		// Add, remove or change the key values to change the hierarchy. 
		var nested_data = d3.nest()
			.key(function(d)  { return d.Agency_Name; })
			.key(function(d)  { return d.Investment_Title; })
			.key(function(d)  { return d.Project_Name;})
			.key(function(d)  {return d.Project_Description;})
			.entries(csv_data);

		// Creat the root node for the treemap
		var root = {};

		// Add the data to the tree
		root.key = "Data";
		root.values = nested_data;

		// Change the key names and children values from .next and add values for a chosen column to define the size of the blocks
		root = reSortRoot(root,"Lifecycle_Cost");

		// DEBUG
		// $("#rawdata").html(JSON.stringify(root));

		loadData(root);
	});

});
