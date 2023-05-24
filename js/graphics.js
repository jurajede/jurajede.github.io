
updateBarchartKm = (rows) => {
	var plotDiv = d3.select("#barchart-km")
	// Define margins
	var margin = {top: 20, right: 40, bottom: 80, left: 60},
	width = parseInt(plotDiv.style("width")) - margin.left - margin.right,
	height = parseInt(plotDiv.style("height")) - margin.top - margin.bottom;
	// Define svg canvas
	var svg = plotDiv.append("svg")
        	.attr("width", width + margin.left + margin.right)
        	.attr("height", height + margin.top + margin.bottom)
        .append("g")
        	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Parse data
	rows = rows.map(row => {
		row.date = d3.timeParse("%Y")(String(row.year))
		return row
	})
	rows = d3.rollups(
		rows,
		v => d3.sum(v, d => d.km),
		d => d.year
	)
		.map(([k,v]) => { return {year: k, km: v}; })

	// Add X axis --> it is a year format
	let xDomain = d3.extent(rows, d => d.year);
	xDomain[1] += 1
    var xScale = (d3.scaleLinear()
		.domain(xDomain)
    	.range([ 0, width ]));
	var xAxis = d3.axisBottom(xScale)
		.tickFormat(d3.format("d"));
    svg.append("g")
		.attr("class", "x axis")
    	.attr("transform", "translate(0," + height + ")")
    	.call(xAxis)
		.selectAll("text")
		  .attr("transform", "translate(-10,0)rotate(-45)")
		  .style("text-anchor", "end");

	// Add Y axis
	var maxKm = d3.max(rows, d => d.km)
    var yScale = (d3.scaleLinear()
    	.domain([0, maxKm*1.05])
    	.range([ height, 0 ]));
	var yAxis = d3.axisLeft(yScale);
	svg.append("g")
		.attr("class", "y axis yaxis")
		.call(yAxis)

	// Axes labels
	let xlabel = svg.append('g')
		// .attr("x", xScale(rows[Math.ceil(rows.length/2)].year))
		// .attr("y", yScale(-5000))
		// .attr("transform",
		// 	  "translate(" + xScale(rows[Math.ceil(rows.length/2)].year) + ", " + yScale(-2000) + ")")

	xlabel.append("text")
		.style("text-anchor", "middle")
		.style("font-size", ".7em")
		.text("Rok")
	let ylabel = svg.append('g')
		.attr('transform', 'translate(' + -50 + ', ' + yScale(12000) + ')')
	ylabel.append("text")
		.style("text-anchor", "middle")
		.attr("transform", "rotate(-90)")
		.style("font-size", ".7em")
		.text("Ujeté kilometry")

	// Bars
	let bar_width = width / rows.length;
	const spacing = 0.05 * bar_width;
	let left_offset = (width - bar_width*rows.length)/2;
	svg.selectAll("svg")
		.data(rows)
		.enter()
		.append("rect")
			.attr("x", (d, i) => left_offset + bar_width * i)
			.attr("y", d => yScale(d.km))
			.attr("width", bar_width - spacing)
			.attr("height", d => height - yScale(d.km))
			.attr("fill", "steelblue")


	// This allows to find the closest X index of the mouse:
	var bisect = d3.bisector(d => d.year).right;
	// Create the text that travels along the curve of chart

	var labelG = svg.append('g').style("opacity", 0)
	var focusText = labelG.append('text')
		.style("opacity", 1)
		.style("font-size", ".7em")
		.attr("text-anchor", "top")
		.attr("alignment-baseline", "center")
	let labelRect = labelG.append("rect")
		.attr("opacity", 1)
		.attr("width", bar_width - spacing)
		.attr("fill", "none")
		.style("stroke", "black")
		.style("stroke-width", 2)
	// Create the text that stays on the top
	var yearText = svg
		.append('g')
		.append('text')
			.attr("x", xScale(1992.5))
			.attr("y", yScale(24000))
			.style("opacity", 0)
			.style("font-size", ".7em")
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
		width = parseInt(plotDiv.style("width")) - margin.left - margin.right,
		height = parseInt(plotDiv.style("height")) - margin.top - margin.bottom;

		// Update the scales
		xScale.range([ 0, width ])
		yScale.range([ height, 0 ])

		// Update the axes
		svg.select('.x.axis')
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);
		svg.select('.y.axis')
			.call(yAxis);

		xlabel.attr('transform', 'translate(' + xScale(rows[Math.ceil(rows.length/2)].year) + ', ' + yScale(-5000) + ')')

	};

	// What happens when the mouse move -> show the annotations at the right positions.
	function mouseover() {
		labelG.style("opacity", 1)
		yearText.style("opacity", 1)
	}
	function mousemove (event) {
		// recover coordinate we need
		let x0 = xScale.invert(d3.pointer(event, g.node())[0]);
		let i = bisect(rows, x0, 1) - 1;
		selectedData = rows[i]
		let selectedYear = Math.floor(selectedData.year)
		let selectedKm = selectedData.km
		focusText
			.html(selectedData.km.toFixed(0))
			// .attr("transform", "rotate(-90)")
        	.attr("transform", "translate(" + (xScale(selectedYear) + bar_width/3) + "," + yScale(selectedKm) + ")rotate(-45)")
			// .attr("x", xScale(Math.floor(selectedData.year) + .1))
			// .attr("y", yScale(selectedData.km))
		labelRect
			.attr("x", xScale(selectedYear))
			.attr("y", yScale(selectedKm))
			.attr("opacity", 1)
			.attr("width", bar_width - spacing)
			.attr("height", yScale(0) - yScale(selectedKm))

		yearText
			.html(selectedData.year)
	}
	function mouseout () {
		labelG.style("opacity", 0)

		yearText.style("opacity", 0)
	}

	// Call the resize function whenever a resize event occurs
	// d3.select(window).on('resize.updatesvg', resize);
	window.addEventListener('resize', resize)

	// Call the resize function
	resize();

}

// updateTraceplotKm = (rows) => {
// 	var plotDiv = d3.select("#traceplot-km")
// 	// Define margins
// 	var margin = {top: 20, right: 40, bottom: 40, left: 60},
// 	width = parseInt(plotDiv.style("width")) - margin.left - margin.right,
// 	height = parseInt(plotDiv.style("height")) - margin.top - margin.bottom;
// 	// Define svg canvas
// 	var svg = plotDiv.append("svg")
//         	.attr("width", width + margin.left + margin.right)
//         	.attr("height", height + margin.top + margin.bottom)
//         .append("g")
//         	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// 	// Parse data
// 	rows = rows.map(row => {
// 		row.date = d3.timeParse("%Y-%m")(String(row.year)+"-"+row.month)
// 		return row
// 	})
// 	console.log(rows)

// 	// Add X axis --> it is a date format
//     var xScale = (d3.scaleTime()
//     	.domain(d3.extent(rows, function(d) { return d.date; }))
//     	.range([ 0, width ]));
// 	var xAxis = d3.axisBottom(xScale);
//     svg.append("g")
// 		.attr("class", "x axis")
//     	.attr("transform", "translate(0," + height + ")")
//     	.call(xAxis);

// 	// Add Y axis
// 	var maxKm = d3.max(rows, d => d.km)
//     var yScale = (d3.scaleLinear()
//     	.domain([0, maxKm])
//     	.range([ height, 0 ]));
// 	var yAxis = d3.axisLeft(yScale);

// 	// Axes labels
//     svg.append("g")
// 		.attr("class", "y axis")
// 		.call(yAxis)
// 	var xlabel = svg.append('g')
// 		.attr('transform', 'translate(' + xScale(rows[Math.ceil(rows.length/2)].date) + ', ' + yScale(-400) + ')')
// 	xlabel.append("text")
// 		.style("text-anchor", "middle")
// 		.style("font-size", ".7em")
// 		.text("Měsíc a rok")
// 	var ylabel = svg.append('g')
// 		.attr('transform', 'translate(' + -40 + ', ' + yScale(1500) + ')')
// 	ylabel.append("text")
// 		.style("text-anchor", "middle")
// 		.attr("transform", "rotate(-90)")
// 		.style("font-size", ".7em")
// 		.text("Ujeté kilometry")

// 	redrawLine = () => {
// 		// Force D3 to recalculate and update the line
// 		svg.selectAll('.line')
// 			.attr("d",
// 				d3.line()
// 					.x(d => xScale(d.date))
// 					.y(d => yScale(d.km))
// 			)
// 		xAxis.ticks(Math.max(width/75, 2))
// 		yAxis.ticks(Math.max(height/50, 2))
// 	}

// 	// Add the line
// 	svg.append("path")
// 		.attr("class", "line")
//     	.datum(rows)
//     	.attr("fill", "none")
//     	.attr("stroke", "steelblue")
//     	.attr("stroke-width", 1.5)

// 	redrawLine()

// 	// This allows to find the closest X index of the mouse:
// 	var bisect = d3.bisector(d => d.date).left;
// 	// Create the circle that travels along the curve of chart
// 	var focus = svg
// 		.append('g')
// 		.append('circle')
// 				.style("fill", "steelblue")
// 				.attr("stroke", "none")
// 				.attr('r', 6)
// 				.style("opacity", 0)
// 	// Create the text that travels along the curve of chart
// 	var focusText = svg
// 		.append('g')
// 		.append('text')
// 			.style("opacity", 0)
// 			.style("font-size", ".7em")
// 			.attr("text-anchor", "top")
// 			.attr("alignment-baseline", "center")
// 	// Create the text that stays on the top
// 	var yearText = svg
// 		.append('g')
// 		.append('text')
// 			.style("opacity", 0)
// 			.style("font-size", ".7em")
// 			.attr("text-anchor", "top")
// 			.attr("alignment-baseline", "center")

// 	function redrawLegend () {
// 		// update legends
// 		legend_icon1.attr("cx", width - 100)
// 			.attr("cy", 20)
// 		legend_text1.attr("x", width - 80)
// 			.attr("cy", 20)
// 	}

// 	// Legend
// 	let legend_icon1 = svg.append("circle")
// 		.attr("cy", 20)
// 		.attr("r", 6)
// 		.style("fill", "steelblue")
// 	let legend_text1 = svg.append("text")
// 		.attr("y", 20)
// 		.text("Ujeté kilometry")
// 		.style("font-size", ".7em")
// 		.attr("alignment-baseline","middle")
// 	redrawLegend()

// 	var rect = svg
// 		.append('rect')
// 		.style("fill", "none")
// 		.style("pointer-events", "all")
// 		.attr('width', width)
// 		.attr('height', height)
// 		.on('mouseover', mouseover)
// 		.on('mousemove', mousemove)
// 		.on('mouseout', mouseout);
// 	var g = svg.append("g");

// 	// Define responsive behavior
// 	function resize() {
// 		var width = parseInt(plotDiv.style("width")) - margin.left - margin.right,
// 		height = parseInt(plotDiv.style("height")) - margin.top - margin.bottom;

// 		// Update the scales
// 		xScale.range([ 0, width ])
// 		yScale.range([ height, 0 ])

// 		// Update the axes
// 		svg.select('.x.axis')
// 			.attr("transform", "translate(0," + height + ")")
// 			.call(xAxis);
// 		svg.select('.y.axis')
// 			.call(yAxis);

// 		xlabel.attr('transform', 'translate(' + xScale(rows[Math.ceil(rows.length/2)].date) + ', ' + yScale(-400) + ')')

// 		// redraw line
// 		redrawLine()

// 	};

// 	// What happens when the mouse move -> show the annotations at the right positions.
// 	function mouseover() {
// 		focus.style("opacity", 1)
// 		focusText.style("opacity",1)
// 		yearText.style("opacity",1)
// 	}
// 	function mousemove (event) {
// 		// recover coordinate we need
// 		let x0 = xScale.invert(d3.pointer(event, g.node())[0]);
// 		let i = bisect(rows, x0, 1);
// 		selectedData = rows[i]
// 		focus
// 			.attr("cx", xScale(selectedData.date))
// 			.attr("cy", yScale(selectedData.km))
// 		focusText
// 			.html(selectedData.km.toFixed(0))
// 			.attr("x", xScale(selectedData.date) + 5)
// 			.attr("y", yScale(selectedData.km))
// 		yearText
// 			.html(selectedData.month_cz + " " + selectedData.year)
// 			.attr("x", 12)
// 			.attr("y", yScale(maxKm-200))
// 	}
// 	function mouseout () {
// 		focus.style("opacity", 0)
// 		focusText.style("opacity", 0)
// 		yearText.style("opacity", 0)
// 	}

// 	// Call the resize function whenever a resize event occurs
// 	d3.select(window).on('resize', resize);

// 	// Call the resize function
// 	resize();

// }

updateTraceplotYearly = (rows) => {
	var plotDiv = d3.select("#traceplot-yearly")
	// Define margins
	var margin = {top: 20, right: 40, bottom: 40, left: 60},
	width = parseInt(plotDiv.style("width")) - margin.left - margin.right,
	height = parseInt(plotDiv.style("height")) - margin.top - margin.bottom;

	// Define svg canvas
	var svg = plotDiv.append("svg")
        	.attr("width", width + margin.left + margin.right)
        	.attr("height", height + margin.top + margin.bottom)
        .append("g")
        	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Parse data
	rows = rows.map(row => {
		row.date = d3.timeParse("%Y-%m")(String(row.year)+"-"+row.month)
		return row
	})
	let last_row = rows[rows.length-1]
	let rows_year = rows.filter(row => row.year == last_row.year)
	let last_5 = data.filter(
		d => (d.year >= last_row.year-5) && (d.year < last_row.year)
	)
	let last_5_months = d3.group(last_5, d => d.month)
	// let mean_ma5y = d3.map(last_5_months, (d, i) => {
	// 	return {month: i+1, km: d3.reduce(d[1], (acc, item) => acc + item.km, 0) / 5}
	// })
	let ci_ma5y = d3.map(last_5_months, (d, i) => {
		let km_mean = d3.mean(d3.map(d[1], item => item.km))
		let km_sd = d3.deviation(d3.map(d[1], item => item.km))
		let km_n = d[1].length

		return {
			month: i+1,
			month_cz: d[1][0].month_cz,
			mean: km_mean,
			ci_low: km_mean - 1.96*km_sd/Math.sqrt(km_n),
			ci_high: km_mean + 1.96*km_sd/Math.sqrt(km_n)
		}
	})

	// Add X axis --> it is a date format
    var xScale = d3.scaleLinear()
    	.domain([1,12])
	var xAxis = d3.axisBottom(xScale)
		.ticks(12)
		.tickFormat(d => MONTHS_CZ[d])
    svg.append("g")
		.attr("class", "x axis")
    	.attr("transform", "translate(0," + height + ")")
    	.call(xAxis);

	// Add Y axis
	var maxKm = d3.max(rows, d => d.km)
    var yScale = (d3.scaleLinear()
    	.domain([0, maxKm])
    	.range([ height, 0 ]))
	var yAxis = d3.axisLeft(yScale);
	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)

	// Axes labels
	var xlabel = svg.append('g')
		// .attr('transform', 'translate(' + xScale(6) + ', ' + yScale(-400) + ')')
	xlabel.append("text")
		.style("text-anchor", "middle")
		.style("font-size", ".7em")
		.text("Měsíc")
	var ylabel = svg.append('g')
		.attr('transform', 'translate(' + -40 + ', ' + yScale(1500) + ')')
	ylabel.append("text")
		.style("text-anchor", "middle")
		.attr("transform", "rotate(-90)")
		.style("font-size", ".7em")
		.text("Ujeté kilometry")

	function redrawLines () {
		// Force D3 to recalculate and update the line
		svg.selectAll('.ma_ci')
			.attr("d", d3.area()
				.x(d => xScale(d.month))
				.y0(d => yScale(d.ci_low))
				.y1(d => yScale(d.ci_high))
			)
		svg.selectAll('.ma')
			.attr("d",
				d3.line()
					.x(d => xScale(d.month))
					.y(d => yScale(d.mean))
			)
		svg.selectAll('.line')
		.attr("d",
			d3.line()
				.x(d => xScale(d.month))
				.y(d => yScale(d.km))
		)
		xAxis.ticks(Math.max(width/75, 2))
		yAxis.ticks(Math.max(height/50, 2))
	}

	// Add moving average
	svg.append("path")
		.attr("class", "ma_ci")
		.datum(ci_ma5y)
		.attr("fill", "orange")
		.style("opacity", 0.3)
		.attr("stroke", "none")
	svg.append("path")
		.attr("class", "ma")
    	.datum(ci_ma5y)
    	.attr("fill", "none")
    	.attr("stroke", "orange")
    	.attr("stroke-width", 1.5)
	// Add the line
	svg.append("path")
		.attr("class", "line")
    	.datum(rows_year)
    	.attr("fill", "none")
    	.attr("stroke", "steelblue")
    	.attr("stroke-width", 1.5)

	redrawLines()

	function redrawLegend () {
		// update legends
		legend_icon1.attr("cx", width - 100)
			.attr("cy", 20)
		legend_text1.attr("x", width - 80)
			.attr("cy", 20)
		legend_icon2.attr("cx", width - 100)
			.attr("cy", 40)
		legend_text2.attr("x", width - 80)
			.attr("cy", 40)
	}

	// Legend
	let legend_icon1 = svg.append("circle")
		.attr("cy", 20)
		.attr("r", 6)
		.style("fill", "steelblue")
	let legend_text1 = svg.append("text")
		.attr("y", 20)
		.text("Tento rok")
		.style("font-size", ".7em")
		.attr("alignment-baseline","middle")
	let legend_icon2 = svg.append("circle")
		.attr("cy", 40)
		.attr("r", 6)
		.style("fill", "orange")
	let legend_text2 = svg.append("text")
		.attr("y", 40)
		.text("Pětiletý průměr")
		.style("font-size", ".7em")
		.attr("alignment-baseline","middle")
	redrawLegend()
	// svg.append("text").attr("x", 220).attr("y", 160).text("variable B").style("font-size", "15px").attr("alignment-baseline","middle")


	// This allows to find the closest X index of the mouse:
	var bisect = (data, xp) => {
		let month_int = Math.round(xp)
		if (month_int < 1) month_int = 1
		else if(month_int > data.length) month_int = 0
		return month_int - 1
	}
	// Create the circles that travel along the curves of chart
	var focus = svg.append('g')
		.append('circle')
			.style("fill", "steelblue")
			.attr("stroke", "none")
			.attr('r', 6)
			.style("opacity", 0)
	var focus_ma = svg.append('g')
		.append('circle')
			.style("fill", "orange")
			.attr("stroke", "none")
			.attr('r', 6)
			.style("opacity", 0)
	// Create the text that travels along the curve of chart
	var focusText = svg.append('g')
		.append('text')
			.style("opacity", 0)
			.attr("text-anchor", "top")
			.style("font-size", ".7em")
			.attr("alignment-baseline", "center")
	var focusText_ma = svg.append('g')
		.append('text')
			.style("opacity", 0)
			.attr("text-anchor", "top")
			.style("font-size", ".7em")
			.attr("alignment-baseline", "center")
	// Create the text that stays on the top
	var yearText = svg.append('g')
		.append('text')
			.style("opacity", 0)
			.attr("text-anchor", "top")
			.style("font-size", ".7em")
			.attr("alignment-baseline", "center")

	var rect = svg.append('rect')
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
		var width = parseInt(plotDiv.style("width")) - margin.left - margin.right,
		height = parseInt(plotDiv.style("height")) - margin.top - margin.bottom;

		// Update the scales
		xScale.range([ 0, width ])
		yScale.range([ height, 0 ])

		// Update the axes
		svg.select('.x.axis')
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);
		svg.select('.y.axis')
			.call(yAxis);

		// update legends
		redrawLegend()

		xlabel.attr('transform', 'translate(' + xScale(6) + ', ' + yScale(-500) + ')')

		// redraw line
		redrawLines()

	};

	// What happens when the mouse move -> show the annotations at the right positions.
	function mouseover () {
		focus.style("opacity", 1)
		focus_ma.style("opacity", 1)
		focusText.style("opacity", 1)
		focusText_ma.style("opacity", 1)
		yearText.style("opacity",1)
	}
	function mousemove (event) {
		// recover coordinate we need
		let x0 = xScale.invert(d3.pointer(event, g.node())[0]);
		let i = bisect(rows_year, x0);
		let j = bisect(ci_ma5y, x0);

		selectedMa = ci_ma5y[j]
		if(i >= 0) {
			focus.style("opacity", 1)
			focusText.style("opacity", 1)
			selectedData = rows_year[i]
			focus
				.attr("cx", xScale(selectedData.month))
				.attr("cy", yScale(selectedData.km))
			focusText
				.html(selectedData.km.toFixed(0))
				.attr("x", xScale(selectedData.month) + 5)
				.attr("y", yScale(selectedData.km))
		} else {
			focus.style("opacity", 0)
			focusText.style("opacity", 0)
		}
		focus_ma
			.attr("cx", xScale(selectedMa.month))
			.attr("cy", yScale(selectedMa.mean))
		focusText_ma
			.html(selectedMa.mean.toFixed(0))
			.attr("x", xScale(selectedMa.month) + 5)
			.attr("y", yScale(selectedMa.mean))

		yearText
			.html(selectedMa.month_cz)
			.attr("x", 12)
			.attr("y", yScale(maxKm-200))
	}
	function mouseout () {
		focus.style("opacity", 0)
		focus_ma.style("opacity", 0)
		focusText.style("opacity", 0)
		focusText_ma.style("opacity", 0)
		yearText.style("opacity", 0)
	}

	// Call the resize function whenever a resize event occurs
	d3.select(window).on('resize', resize);

	// Call the resize function
	resize();

}


updateHeatmap = (rows) => {
	var plotDiv = d3.select("#heatmap")
	// Define margins
	var margin = {top: 20, right: 40, bottom: 40, left: 60},
	width = parseInt(plotDiv.style("width")) - margin.left - margin.right,
	height = parseInt(plotDiv.style("height")) - margin.top - margin.bottom;
	// Define svg canvas
	var svg = plotDiv.append("svg")
        	.attr("width", width + margin.left + margin.right)
        	.attr("height", height + margin.top + margin.bottom)
        .append("g")
        	.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// Parse data
	rows = rows.map(row => {
		row.date = d3.timeParse("%Y-%m")(String(row.year)+"-"+row.month)
		return row
	})

	// Add X axis --> it is a date format
    var xScale = (d3.scaleBand()
		.range([ 0, width ]))
    	.domain([1,2,3,4,5,6,7,8,9,10,11,12])
		.padding(0.01);
	var xAxis = d3.axisBottom(xScale);
    svg.append("g")
		.attr("class", "x axis")
    	.attr("transform", "translate(0," + height + ")")
    	.call(xAxis);

	// Add Y axis
    var yScale = (d3.scaleBand()
    	.range([ height, 0 ])
		.domain(d3.range(d3.min(rows, d=>d.year), d3.max(rows, d=>d.year)+1))//d3.extent(rows, d => d.year))
    	.padding(0.01));
	var yAxis = d3.axisLeft(yScale);
	svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)

	// Build color scale
	var maxKm = d3.max(rows, d => d.km)
	var colorScale = d3.scaleLinear()
		.range(["white","steelblue"])
		.domain([0, maxKm])

	// Axes labels
	var xlabel = svg.append('g')
		.attr('transform', 'translate(' + (xScale(6)+xScale.step()/2) + ', ' + (yScale(d3.min(rows, d => d.year)) + 3*yScale.step()) + ')')
	xlabel.append("text")
		.style("text-anchor", "middle")
		.style("font", "11px arial")
		.text("Měsíc")
	let year_range = d3.extent(rows, d => d.year)
	var ylabel = svg.append('g')
		.attr('transform', 'translate(' + -40 + ', ' + (yScale(year_range[0])/2 + yScale(year_range[1])/2) + ')')
	ylabel.append("text")
		.style("text-anchor", "middle")
		.attr("transform", "rotate(-90)")
		.style("font", "11px arial")
		.text("Rok")

	redrawHeatmap = () => {
		// Force D3 to recalculate and update the line
		svg.selectAll('.heatmapField')
			.attr("x", d => xScale(d.month))
			.attr("y", d => yScale(d.year))
			.attr("width", xScale.bandwidth())
			.attr("height", yScale.bandwidth())
			.style("fill", d => colorScale(d.km))
	}

	//
	svg.selectAll()
		.data(rows)
		.enter()
		.append("rect")
		.attr("class", "heatmapField")

	redrawHeatmap()

	// create a tooltip
	var tooltip = svg.append("div")
		.style("opacity", 0)
		.attr("class", "tooltip")
		.style("background-color", "white")
		.style("border", "solid")
		.style("border-width", "2px")
		.style("border-radius", "5px")
		.style("padding", "5px")

	var labelG = svg.append('g')
	let labelRect = labelG.append("rect")
		.attr("x", xScale(1))
		.attr("y", yScale(2000))
		.attr("opacity", 1)
		.attr("width", xScale.bandwidth())
		.attr("height", yScale.bandwidth())
		.attr("fill", "none")
		.style("stroke", "black")
		.style("stroke-width", 1)
	let label = labelG.append("text")
		.attr("x", xScale(1))
		.attr("y", yScale(2000))
		.style("text-anchor", "middle")
		.style("font-size", ".7em")
		.style("fill", "black")
		.text("")

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
		var width = parseInt(plotDiv.style("width")) - margin.left - margin.right,
		height = parseInt(plotDiv.style("height")) - margin.top - margin.bottom;

		// Update the scales
		xScale.range([ 0, width ])
		yScale.range([ height, 0 ])

		// Update the axes
		svg.select('.x.axis')
			.attr("transform", "translate(0," + height + ")")
			.call(xAxis);
		svg.select('.y.axis')
			.call(yAxis);

		// redraw line
		redrawHeatmap()
	};

	// What happens when the mouse move -> show the annotations at the right positions.
	function mouseover() {
		labelG.style("opacity", 1)
	}
	function mousemove (event) {
		// band step
		let xBand = xScale.step()
		let yBand = yScale.step()
		// mouse position
		let xOffset = d3.pointer(event, g.node())[0]
		let yOffset = d3.pointer(event, g.node())[1]
		yOffset = yScale.range()[1] - yOffset + yScale.range()[0]
		// map mouse to band
		let xVal = xScale.domain()[Math.floor((xOffset / xBand))];
		let yVal = yScale.domain()[Math.floor((yOffset / yBand))];
		// undefine bands without data points
		let selectedData = d3.filter(rows, row => row.year == yVal && row.month == xVal)
		if(selectedData.length === 0 || xVal == undefined || yVal == undefined) {
			xVal = undefined
			yVal = undefined
			labelG.attr("opacity", 0)
		} else {


			let km_extent = d3.extent(rows, d => d.km)
			let textColor = "black"
			if(selectedData[0].km > d3.quantile(km_extent, [.65])) {
				textColor = "white"
			}
			// "black"
			labelG.attr("opacity", 1)
			labelRect.attr("x", xScale(xVal))
				.attr("y", yScale(yVal))
			label.style("fill", textColor)
				.text(selectedData[0].km.toFixed(0))
				.attr("x", xScale(xVal) + xBand/2)
				.attr("y", yScale(yVal) + yBand*2/3)
		}

	}
	function mouseout () {
		labelG.style("opacity", 0)
	}

	// Call the resize function whenever a resize event occurs
	d3.select(window).on('resize', resize);

	// Call the resize function
	resize();

}
