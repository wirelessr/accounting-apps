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
	var icons = {
		1: 'fa-cutlery',
		2: 'fa-automobile',
		3: 'fa-gamepad',
		4: 'fa-stethoscope',
		5: 'fa-shopping-bag',
		6: 'fa-home',
		99: 'fa-paperclip',
	}
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var rowdata = JSON.parse(this.responseText);
			var table = '';
			for(i in rowdata.rows) {
				if(start_ts <= rowdata.rows[i].date && rowdata.rows[i].date < end_ts) {
					table += '<tr>';
					table += '<td>'+rowdata.rows[i].note+'</td>';
					table += '<td><i class="fa '+icons[rowdata.rows[i].type]+'"></i></td>';
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

function drawChart() {
	var isodate = (new Date()).toISOString().slice(0,7);
	var thisMonth = new Date(isodate);
	var start_ts = thisMonth.getTime();
	thisMonth.setMonth(thisMonth.getMonth() + 1);
	var end_ts = thisMonth.getTime();

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var rowdata = JSON.parse(this.responseText);
			var summary = {}
			var list = [['type', 'cost']]
			var total = 0;
			var types = {
				1: '食物',
				2: '交通',
				3: '娛樂',
				4: '醫療',
				5: '消費',
				6: '住家',
				99: '其他',
			}

			for(i in rowdata.rows) {
				if(start_ts <= rowdata.rows[i].date && rowdata.rows[i].date < end_ts) {
					var cost = parseInt(rowdata.rows[i].cost);
					total += cost;
					if(summary[rowdata.rows[i].type]) {
						summary[rowdata.rows[i].type] += cost;
					} else {
						summary[rowdata.rows[i].type] = cost;
					}
				}
			}
			document.getElementById("monthReport").innerHTML = '總共開銷：'+total;

			for(i in summary) {
				list.push([types[i], summary[i]]);
			}
			var data = google.visualization.arrayToDataTable(list);

			// Optional; add a title and set the width and height of the chart
			var options = {'title':'月結', 'width':'100%'};

			// Display the chart inside the <div> element with id="piechart"
			var chart = new google.visualization.PieChart(document.getElementById('piechart'));
			chart.draw(data, options);
		}
	};
	xhttp.open("GET", "/list/all", true);
	xhttp.send();
}
