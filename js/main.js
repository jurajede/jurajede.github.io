
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

function processRow(row) {
	row = {
		id: row.id,
		year: +row.year,
		month: +row.month,
		km: +row.km,
		days: +row.days,
	}
	row.month_cz = MONTHS_CZ[row.month]
	row.month_cz_year = row.month_cz + " " + row.year
	row.month_days = getDaysInMonth(row.year, row.month)

	return row
}

function updateIndicators(data, window) {
	// sum distance
	let sum_distance = d3.sum(data.map((d) => d['km']))
	let sum_days = d3.sum(data.map((d) => d['days']))
	let last_row = data[data.length-1]
	let sum_distance_km = sum_distance.toFixed(1)
	let sum_distance_eq = (sum_distance / 40075).toFixed(5)
	let sum_active_days = (sum_days).toString()
	// set sum distance
	d3.selectAll('.sum-distance-km')
		.text(sum_distance_km + " km")
	d3.selectAll('.sum-distance-equators')
		.text(sum_distance_eq + "\u00D7")//"&#215;")
	d3.selectAll('.sum-active-days')
		.text(sum_active_days)

	// last year
	let sum_distance_year = data.reduce(
		(acc, item) => (item.year == last_row.year) ? acc+item.km : acc,
		0
	)
	let year_active_days = data.reduce(
		(acc, item) => (item.year == last_row.year) ? acc+item.days : acc,
		0
	)
	let year_days = data.reduce(
		(acc, item) => (item.year == last_row.year) ? acc+item.month_days : acc,
		0
	)
	let year_daily_mean = (sum_distance_year / year_days).toFixed(1)
	d3.selectAll('.year-distance-km')
		.text(sum_distance_year + " km")
	d3.selectAll('.year-daily-mean')
		.text(year_daily_mean + " km/den")
	d3.selectAll('.year-active-days')
		.text(year_active_days)

	// 5-year moving average

}

updateLastData = (data) => {
	d3.select('.last-data')
		.text(data[data.length-1].month_cz_year)
}


updateData = (rows) => {
	data = rows
	$('#data-table').DataTable( {
		//responsive: true,
		"pageLength": 10,
		searching: false,
		//paging: false,
		//info: false
		language: {
			processing:     "Zpracovávám",
			search:         "Hledat&nbsp;:",
			lengthMenu:    	"_MENU_ položek na stránku",
			info:           "Zobrazuji položky _START_ až _END_ z celkových _TOTAL_",
			infoEmpty:      "Zobrazuji položky 0 až 0 z celkových 0",
			//infoFiltered:   "(filtr&eacute; de _MAX_ &eacute;l&eacute;ments au total)",
			infoPostFix:    "",
			loadingRecords: "Načítám...",
			zeroRecords:    "Žádné položky",
			emptyTable:     "Žádná data",
			paginate: {
				first:      "První",
				previous:   "Předchozí",
					next:       "Následující",
				last:       "Poslední"
			},
			aria: {
				sortAscending:  "Seřadit vzestupně podle sloupce",
				sortDescending: "Seřadit sestupně podle sloupce"
			}
		}
	});
	updateIndicators(rows)
	updateTraceplotKm(rows)
	updateLastData(rows)
}