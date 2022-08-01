
var tabulate = function (row, columns) {
	// var table = d3.select('table#data')
	// var thead = table.append('thead')
	var tbody = d3.select('#data-table-body')
	var rows = tbody.append('tr')

	rows.append('th')
		.attr('scope', 'row')
		.text(row.id)

	var items = rows.selectAll('td')
		.data(columns.map(function(column) { return row[column]; }))
		.enter()
		.append('td')
		.text(function (d) { return d; })

}

const MONTHS_CZ = {
	1: "Leden",
	2: "Únor",
	3: "Březen",
	4: "Duben",
	5: "Květen",
	6: "Červen",
	7: "Červenec",
	8: "Srpen",
	9: "Září",
	10: "Říjen",
	11: "Listopad",
	12: "Prosinec",
}

function processData(data) {
	data = {
		id: data.id,
		year: +data.year,
		month: +data.month,
		km: +data.km,
		days: +data.days,
	}
	data.month_cz = MONTHS_CZ[data.month]
	data.month_cz_year = data.month_cz + " " + data.year

	return data
}

function updateIndicators(data) {
	// sum distance
	let sum_distance = d3.sum(data.map((d) => d['km']))
	let sum_days = d3.sum(data.map((d) => d['days']))
	let last_row = data[data.length-1]
	let sum_distance_km = sum_distance.toFixed(1)
	let sum_distance_eq = (sum_distance / 40075).toFixed(5)
	let sum_active_days = (sum_days).toString()
	// set sum distance
	d3.selectAll('.sum-distance-km')
		.text(sum_distance_km)
	d3.selectAll('.sum-distance-equators')
		.text(sum_distance_eq)
	d3.selectAll('.sum-active-days')
		.text(sum_active_days)

	let sum_distance_year = data.reduce(
		(acc, item) => (item.year == last_row.year) ? acc+item.km : acc,
		0
	)
	let year_active_days = data.reduce(
		(acc, item) => (item.year == last_row.year) ? acc+item.days : acc,
		0
	)
	d3.selectAll('.year-distance-km')
		.text(sum_distance_year)
	d3.selectAll('.year-active-days')
		.text(year_active_days)
}

function updateLastData(data) {
	// console.log("last data")
	// console.log(data[data.length-1])
	let last_data = data[data.length-1]

	d3.select('.last-data')
		.text(last_data.month_cz_year)
}