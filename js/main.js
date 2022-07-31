
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

function updateLastData(data) {
	// console.log("last data")
	// console.log(data[data.length-1])
	let last_data = data[data.length-1]

	d3.select('.last-data')
		.text(last_data.month_cz_year)
}