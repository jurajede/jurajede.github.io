


updateTraceplotKm = (rows) => {
	var plotDiv = d3.select("#traceplot-km")
	// Define margins
	var margin = {top: 20, right: 40, bottom: 40, left: 60},
	width = parseInt(plotDiv.style("width")) - margin.left - margin.right,
	height = parseInt(plotDiv.style("height")) - margin.top - margin.bottom;
	//console.log("traceplot-km " + height + "x" + width)
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
    var xScale = (d3.scaleTime()
    	.domain(d3.extent(rows, function(d) { return d.date; }))
    	.range([ 0, width ]));
	var xAxis = d3.axisBottom(xScale);
    svg.append("g")
		.attr("class", "x axis")
    	.attr("transform", "translate(0," + height + ")")
    	.call(xAxis);

	// Add Y axis
	var maxKm = d3.max(rows, d => d.km)
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
	function mousemove (event) {
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
	function mouseout () {
		focus.style("opacity", 0)
		focusText.style("opacity", 0)
		yearText.style("opacity", 0)
	}

	// Call the resize function whenever a resize event occurs
	d3.select(window).on('resize', resize);

	// Call the resize function
	resize();

}

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

	// Axes labels
    svg.append("g")
		.attr("class", "y axis")
		.call(yAxis)
	var xlabel = svg.append('g')
		.attr('transform', 'translate(' + xScale(6) + ', ' + yScale(-400) + ')')
	xlabel.append("text")
		.style("text-anchor", "middle")
		.style("font", "11px arial")
		.text("Měsíc")
	var ylabel = svg.append('g')
		.attr('transform', 'translate(' + -40 + ', ' + yScale(1500) + ')')
	ylabel.append("text")
		.style("text-anchor", "middle")
		.attr("transform", "rotate(-90)")
		.style("font", "11px arial")
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
			.attr("alignment-baseline", "center")
	var focusText_ma = svg.append('g')
		.append('text')
			.style("opacity", 0)
			.attr("text-anchor", "top")
			.attr("alignment-baseline", "center")
	// Create the text that stays on the top
	var yearText = svg.append('g')
		.append('text')
			.style("opacity", 0)
			.attr("text-anchor", "top")
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

		xlabel.attr('transform', 'translate(' + xScale(6) + ', ' + yScale(-400) + ')')

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




