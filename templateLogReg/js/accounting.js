var types = {
1: '食物',
   2: '交通',
   3: '娛樂',
   4: '醫療',
   5: '消費',
   6: '住家',
   99: '其他',
}

function list_report() {
	var today = new Date();
	var todayDate = today.toISOString().slice(0,10);
	var monthDate = today.toISOString().slice(0,7);
	document.getElementById("todayDate").innerHTML = todayDate;
	document.getElementById("thisMonth").innerHTML = monthDate;
	
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
	xhttp.open("GET", "/list/time/"+start_ts+'-'+end_ts, true);
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

function shift_month(offset) {
	var isodate = document.getElementById('thisMonth').innerHTML;
	var date = new Date(isodate);
	date.setMonth(date.getMonth() + offset);
	
	isodate = date.toISOString().slice(0,7);
	document.getElementById('thisMonth').innerHTML = isodate;

	google.charts.load('current', {'packages':['corechart']});
	google.charts.setOnLoadCallback(drawChart);
}

function drawChart() {
	var isodate = document.getElementById('thisMonth').innerHTML;
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
			var topMonth = '';

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
			for(i = rowdata.rows.length - 1, j = 0; i>=0 && j < 5; i--, j++) {
				var note = '<td>'+rowdata.rows[i].note+'</td>';
				var cost = '<td>'+rowdata.rows[i].cost+'</td>';
				topMonth += '<tr>'+note+cost+'</tr>';
			}
			document.getElementById('topMonth').innerHTML = topMonth;
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
	xhttp.open("GET", '/list/month/'+isodate, true);
	xhttp.send();
}

function render_line() {
	var isocurr = (new Date()).toISOString().slice(0,10); // get current date
	var curr = new Date(isocurr);
	var first = curr.getDate() - curr.getDay(); // First day is the day of the month - the day of the week
	var last = first + 6; // last day is the first day + 6

	var start_ts = new Date(curr.setDate(first)).getTime();
	var end_ts = new Date(curr.setDate(last)).getTime();

	console.log(start_ts+', '+end_ts);

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var rowdata = JSON.parse(this.responseText);
			var g = new line_graph();
			var buget = 1000;
			var summary = {0: buget}
			var weekday = {}
			weekday[0] =  "Sun";
			weekday[1] = "Mon";
			weekday[2] = "Tue";
			weekday[3] = "Wed";
			weekday[4] = "Thu";
			weekday[5] = "Fri";
			weekday[6] = "Sat";
			var typesum = {}

			for(i in rowdata.rows) {
				var date = parseInt(rowdata.rows[i].date);
				var cost = parseInt(rowdata.rows[i].cost);
				var type = parseInt(rowdata.rows[i].type);
				var wd = (new Date(date)).getDay();

				if(summary[wd]) {
					summary[wd] -= cost;	
				} else {
					summary[wd] = buget - cost;
				}

				if(typesum[type]) {
					typesum[type] += cost;
				} else {
					typesum[type] = cost;
				}
			}

			var typedraw = [];
			for(i in typesum) {
				typedraw.push({'type': types[i], 'cost': typesum[i]});
			}
			draw(typedraw, 456);

			for(i in summary) {
				g.add(weekday[i], summary[i]);
			}
			g.render("lineCanvas", "預算1000");
		}
	};
	xhttp.open("GET", '/list/time/'+start_ts+'-'+end_ts, true);
	xhttp.send();
}

function draw(data, max) {
  d3.select('.barChart') //選擇放在barChart這個div容器裡面
  .selectAll('div') //選取".barChart"範圍內的所有的div
  .data(data) //將資料加入div
  .enter() //傳入資料
  .append('div') //放到畫面上
  .attr('class','item') //將剛剛放到畫面上的div，加上class "item"
  .text(function(d){return d.type}) //加上文字描述，使用json檔案裡面的 "type" 欄位
  .append('div') //加入包含資料的div，這個div是用來畫圖用的
  .text(function (data) {
      return data.cost; //畫圖用div加上文字描述，使用json檔案裡面的 "cost" 欄位
  })
  .attr('class','bar') //畫圖用div加上class "bar"
  .style('width', function(d){
      return (d.cost)*80/max  + '%'
  });
};
