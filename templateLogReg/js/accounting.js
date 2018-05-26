function list_report() {
	var todayDate = (new Date()).toISOString().slice(0,10);
	document.getElementById("todayDate").innerHTML = todayDate;
	
	list_daily_report(todayDate);
}

function list_daily_report(isodate) {
	var date = new Date(isodate);
	var start_ts = date.getTime();
	date.setDate(date.getDate() + 1)
	var end_ts = date.getTime();
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var rowdata = JSON.parse(this.responseText);
			var table = '';
			for(i in rowdata.rows) {
				if(start_ts <= rowdata.rows[i].date && rowdata.rows[i].date < end_ts) {
					table += '<tr>';
					table += '<td>'+rowdata.rows[i].note+'</td>';
					table += '<td>'+rowdata.rows[i].type+'</td>';
					table += '<td>'+rowdata.rows[i].cost+'</td>';
					table += '</tr>';
				}
			}
			document.getElementById("todayReport").innerHTML = table;
		}
	};
	xhttp.open("GET", "/list/all", true);
	xhttp.send();
}

function shift_day(offset) {
	var isodate = document.getElementById("todayDate").innerHTML;
	var date = new Date(isodate);
	date.setDate(date.getDate() + offset);
	
	isodate = date.toISOString().slice(0,10);
	document.getElementById("todayDate").innerHTML = isodate;
	list_daily_report(isodate);
}
