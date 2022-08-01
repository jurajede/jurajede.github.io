


updateTraceplotKm = (rows) => {
	// Define margins
	var margin = {top: 20, right: 40, bottom: 40, left: 60},
	width = parseInt(d3.select("div#traceplot-km").style("width")) - margin.left - margin.right,
	height = parseInt(d3.select("div#traceplot-km").style("height")) - margin.top - margin.bottom;
	console.log("traceplot-km " + height + "x" + width)
	// Define svg canvas
	var svg = d3.select("#traceplot-km")
		.append("svg")
        	.attr("width", width + margin.left + margin.right)
        	.attr("height", height + margin.top + margin.bottom)
        .append("g")
        	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Parse data
	rows = rows.map((row) => {
		row.date = d3.timeParse("%Y-%m")(String(row.year)+"-"+row.month)
		return row
	})

	// Add X axis --> it is a date format
    var xScale = (d3.scaleTime()
    	.domain(d3.extent(rows, function(d) { return d.date; }))
    	.range([ 0, width ]));
	var xAxis = d3.axisBottom(xScale);
    svg.append("g")
		.attr("class", "x axis")
    	.attr("transform", "translate(0," + height + ")")
    	.call(xAxis);

	// Add Y axis
	var maxKm = d3.max(rows, (d) => d.km)
    var yScale = (d3.scaleLinear()
    	.domain([0, maxKm])
    	.range([ height, 0 ]));
	var yAxis = d3.axisLeft(yScale);

	// Axes labels
    svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
	var xlabel = svg.append('g')
		.attr('transform', 'translate(' + xScale(rows[Math.ceil(rows.length/2)].date) + ', ' + yScale(-400) + ')')
	xlabel.append("text")
		.style("text-anchor", "middle")
		.style("font", "11px arial")
		.text("Měsíc a rok")
	var ylabel = svg.append('g')
		.attr('transform', 'translate(' + -40 + ', ' + yScale(1500) + ')')
	ylabel.append("text")
		.style("text-anchor", "middle")
		.attr("transform", "rotate(-90)")
		.style("font", "11px arial")
		.text("Ujeté kilometry")

	redrawLine = () => {
		// Force D3 to recalculate and update the line
		svg.selectAll('.line')
			.attr("d",
				d3.line()
					.x(d => xScale(d.date))
					.y(d => yScale(d.km))
			)
		xAxis.ticks(Math.max(width/75, 2))
		yAxis.ticks(Math.max(height/50, 2))
	}

	// Add the line
	svg.append("path")
		.attr("class", "line")
    	.datum(rows)
    	.attr("fill", "none")
    	.attr("stroke", "steelblue")
    	.attr("stroke-width", 1.5)

	redrawLine()

	// This allows to find the closest X index of the mouse:
	var bisect = d3.bisector(d => d.date).left;
	// Create the circle that travels along the curve of chart
	var focus = svg
		.append('g')
		.append('circle')
				.style("fill", "steelblue")
				.attr("stroke", "none")
				.attr('r', 6)
				.style("opacity", 0)
	// Create the text that travels along the curve of chart
	var focusText = svg
		.append('g')
		.append('text')
			.style("opacity", 0)
			.attr("text-anchor", "top")
			.attr("alignment-baseline", "center")
	// Create the text that stays on the top
	var yearText = svg
		.append('g')
		.append('text')
			.style("opacity", 0)
			.attr("text-anchor", "top")
			.attr("alignment-baseline", "center")


	var rect = svg
		.append('rect')
		.style("fill", "none")
		.style("pointer-events", "all")
		.attr('width', width)
		.attr('height', height)
		.on('mouseover', mouseover)
		.on('mousemove', mousemove)
		.on('mouseout', mouseout);
	var g = svg.append("g");

	// Define responsive behavior
	function resize() {
		var width = parseInt(d3.select("#traceplot-km").style("width")) - margin.left - margin.right,
		height = parseInt(d3.select("#traceplot-km").style("height")) - margin.top - margin.bottom;

		// Update the scales
		xScale.range([ 0, width ])
		yScale.range([ height, 0 ])

		// Update the axes
		svg.select('.x.axis')
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);
		svg.select('.y.axis')
			.call(yAxis);

		xlabel.attr('transform', 'translate(' + xScale(rows[Math.ceil(rows.length/2)].date) + ', ' + yScale(-400) + ')')

		// redraw line
		redrawLine()

	};

	// What happens when the mouse move -> show the annotations at the right positions.
	function mouseover() {
		focus.style("opacity", 1)
		focusText.style("opacity",1)
		yearText.style("opacity",1)
	}
	function mousemove(event) {
		// recover coordinate we need
		let x0 = xScale.invert(d3.pointer(event, g.node())[0]);
		let i = bisect(rows, x0, 1);
		selectedData = rows[i]
		focus
			.attr("cx", xScale(selectedData.date))
			.attr("cy", yScale(selectedData.km))
		focusText
			.html(selectedData.km.toFixed(0))
			.attr("x", xScale(selectedData.date) + 5)
			.attr("y", yScale(selectedData.km))
		yearText
			.html(selectedData.month_cz + " " + selectedData.year)
			.attr("x", 12)
			.attr("y", yScale(maxKm-200))
	}
	function mouseout() {
		focus.style("opacity", 0)
		focusText.style("opacity", 0)
		yearText.style("opacity", 0)
	}

	// Call the resize function whenever a resize event occurs
	d3.select(window).on('resize', resize);

	// Call the resize function
	resize();


	// // Set the domain of the axes
	// xScale.domain(d3.extent(rows, d => d.date))
	// yScale.domain([0, d3.max(rows, d => d.km)])

	// // Place the axes on the chart
	// svg.append("g")
	// 	.attr("class", "x axis")
	// 	.attr("transform", "translate(0," + height + ")")
	// 	.call(xAxis);

	// svg.append("g")
	// 		.attr("class", "y axis")
	// 		.call(yAxis)
	// 	.append("text")
	// 		.attr("class", "label")
	// 		.attr("y", 6)
	// 		.attr("dy", ".71em")
	// 		.attr("dx", ".71em")
	// 		.style("text-anchor", "beginning")
	// 		.text("Kilometers");

	// var products = svg.selectAll(".category")
	// 	.data(rows)
	// 	.enter().append("g")
	// 	.attr("class", "category");

	// products.append("path")
	// 	.attr("class", "line")
	// 	.attr("d", function(d) {return line(d.datapoints); })
	// 	.style("stroke", function(d) {return color(d.category); });
















	// let svg = d3.select("div#traceplot-km")
	// 	.append("div")
   	// 	.classed("svg-container", true)
	// 	.append("svg")
	// 		.attr("preserveAspectRatio", "xMinYMin meet")
	// 		.attr("viewBox", "0 0 400 600")
	// 		.classed("svg-content-responsive", true)
    // 		//.attr("width", width + margin.left + margin.right)
    // 		//.attr("height", height + margin.top + margin.bottom)
	// 	.append("g")
	// 		.attr("transform",
	// 			  "translate(" + margin.left + "," + margin.top + ")");








}



