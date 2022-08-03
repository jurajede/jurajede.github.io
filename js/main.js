
updateTable = (rows, columns) => {
	let table = d3.select('div#data-table-block')
		.append("table")
		.attr("id", "data-table")
		.attr("class", "table table-hover table-sm")
	// header
	let header = table.append("thead")
		.attr("class", "thead-dark")
		.append("tr")
	header.append("th")
		.attr("scope", "col")
		.text("#")
	header.append("th")
		.attr("scope", "col")
		.text("Měsíc")
	header.append("th")
		.attr("scope", "col")
		.text("Ujeté kilometry")
	header.append("th")
		.attr("scope", "col")
		.text("Aktivní dny")

	// body
	let tbody = table.append("tbody")
		.attr("id", "data-table-body")
		.attr("class", "text-left")
	let trs = tbody.selectAll('tr')
		.data(rows)
		.enter()
		.append('tr')
	trs.append('th')
		.attr('scope', 'row')
		.text(d => d.id)
	trs.selectAll('td')
		.data(row => columns.map(col => row[col]))
		.enter()
		.append('td')
		.text(d => d)

}

processRow = (row) => {
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

updateIndicators = (data, window) => {
	// sum distance
	let sum_distance = d3.sum(data.map(d => d['km'])) + 8326
	let sum_days = d3.sum(data.map(d => d['days']))
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
	let last_row = data[data.length-1]
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
	let year_active_day_mean = (sum_distance_year / year_active_days).toFixed(1)

	d3.selectAll('.year-distance-km')
		.text(sum_distance_year + " km")
	d3.selectAll('.year-active-day-mean')
		.text(year_active_day_mean + " km/den")
	d3.selectAll('.year-daily-mean')
		.text(year_daily_mean + " km/den")
	d3.selectAll('.year-active-days')
		.text(year_active_days)

	// 5-year moving average
	let last_5 = data.filter(d => (d.year >= last_row.year-5) && (d.year < last_row.year) && (d.month <= last_row.month))
	let days_5 = last_5.reduce((acc, item) => acc+item.month_days, 0)
	let years_5 = last_5.length / last_row.month
	let sum_distance_5 = last_5.reduce((acc, item) => acc+item.km, 0)
	let sum_active_days_5 = last_5.reduce((acc, item) => acc+item.days, 0)
	let sum_distance_ma5 = sum_distance_5 / years_5
	let active_days_ma5 = sum_active_days_5 / years_5
	let daily_mean_ma5 = sum_distance_5 / days_5
	let active_day_mean_ma5 = sum_distance_5 / sum_active_days_5

	getSign = (v1, v2) => {
		if(v1 > v2) return "^ "
		else if(v1 < v2) return "v "
		else return ""
	}
	getDelta = (v1, v2) => {
		if(v1 > v2) return 100*(Math.abs(v1/v2) - 1)
		else if(v1 < v2) return 100*(1 - Math.abs(v1/v2))
		else return 0
	}
	d3.selectAll('.year-distance-km-delta')
		.text(
			"(" +
			getSign(sum_distance_year, sum_distance_ma5) +
			getDelta(sum_distance_year, sum_distance_ma5).toFixed(1) + "%)"
		)
	d3.selectAll('.year-active-day-mean-delta')
		.text(
			"(" +
			getSign(year_active_day_mean, active_day_mean_ma5) +
			getDelta(year_active_day_mean, active_day_mean_ma5).toFixed(1) + "%)"
		)
	d3.selectAll('.year-active-days-delta')
		.text(
			"(" +
			getSign(year_active_days, active_days_ma5) +
			getDelta(year_active_days, active_days_ma5).toFixed(1) + "%)"
		)
	d3.selectAll('.year-daily-mean-delta')
		.text(
			"(" +
			getSign(year_daily_mean, daily_mean_ma5) +
			getDelta(year_daily_mean, daily_mean_ma5).toFixed(1) + "%)"
		)

	//console.log(year_daily_mean, daily_mean_ma5, sum_distance_ma5, days_5)
}

updateLastData = (data) => {
	d3.select('.last-data')
		.text(data[data.length-1].month_cz_year)
}


updateData = (rows) => {
	data = rows

	// table
	updateTable(rows, ['month_cz_year', 'km', 'days'])
	$('table#data-table').DataTable( {
		//responsive: true,
		"pageLength": 12,
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
	updateTraceplotYearly(rows)
	updateHeatmap(rows)
	updateLastData(rows)
}