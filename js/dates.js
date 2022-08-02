function getDaysInMonth(year, month) {
	return new Date(year, month, 0).getDate();
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