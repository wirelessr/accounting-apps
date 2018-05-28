var types = {
1: '食物',
   2: '交通',
   3: '娛樂',
   4: '醫療',
   5: '消費',
   6: '住家',
   99: '其他',
}

function getWeeksInMonth(month, year){
   var weeks=[],
       firstDate=new Date(year, month, 1),
       lastDate=new Date(year, month+1, 0),
       numDays= lastDate.getDate();

   var start=1;
   var end=7-firstDate.getDay();
   while(start<=numDays){
       weeks.push({start:start,end:end});
       start = end + 1;
       end = end + 7;
       if(end>numDays)
           end=numDays;
   }
    return weeks;
}

function list_report() {
	var today = new Date();
	var todayDate = today.toISOString().slice(0,10);
	var monthDate = today.toISOString().slice(0,7);
	document.getElementById("todayDate").innerHTML = todayDate;
	document.getElementById("thisMonth").innerHTML = monthDate;
	
	list_daily_report(todayDate);
    render_line();
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

Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) {s = "0" + s;}
  return s;
}

function drawChart() {
	var isodate = document.getElementById('thisMonth').innerHTML;

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var rowdata = JSON.parse(this.responseText);
			var summary = {}
			var list = [['type', 'cost']]
			var total = 0;
			var topMonth = '';

			for(i in rowdata.rows) {
                var cost = parseInt(rowdata.rows[i].cost);
                total += cost;
                if(summary[rowdata.rows[i].type]) {
                    summary[rowdata.rows[i].type] += cost;
                } else {
                    summary[rowdata.rows[i].type] = cost;
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

            var isoy_m = isodate.split('-');
            var weeks = getWeeksInMonth(isoy_m[1]-1, isoy_m[0]);
            var weeks_ts = weeks.map(function(w) {
                var week_ts = {};
                week_ts.start = new Date(isoy_m+'-'+w.start.pad(2)).getTime();
                endday = new Date(isoy_m+'-'+w.end.pad(2));
                endday.setHours(24,0,0,0);
                week_ts.end = endday.getTime();
                return week_ts;
            });
            var month_budget = 60000;
            var weeks_report = {};
            var dataset = [];
            var max_idx = 0;

            rowdata.rows.forEach(function(row) {
                var idx = weeks_ts.findIndex(function(elem) { return elem.start <= row.date && row.date < elem.end });
                var cost = parseInt(row.cost);
                if(idx == -1) {console.log(row); }
                else {
                   if(idx > max_idx) max_idx = idx;
                   if(weeks_report[idx]) {
                        weeks_report[idx] += cost;
                    } else {
                        weeks_report[idx] = cost;
                    }
                }
            });
            for(i = 0; i <= max_idx; i++) {
                if(weeks_report[i]) {
                    month_budget -= weeks_report[i];
                }
                dataset.push(month_budget);
            }
            vBarChart(dataset);
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

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && this.status == 200) {
			var rowdata = JSON.parse(this.responseText);
			var typesum = {}

			for(i in rowdata.rows) {
				var date = parseInt(rowdata.rows[i].date);
				var cost = parseInt(rowdata.rows[i].cost);
				var type = parseInt(rowdata.rows[i].type);

				if(typesum[type]) {
					typesum[type] += cost;
				} else {
					typesum[type] = cost;
				}
			}

			var typedraw = [];
			var max = 0;
			for(i in typesum) {
				if(typesum[i] > max) {
					max = typesum[i];
				}
				typedraw.push({'type': types[i], 'cost': typesum[i]});
			}
			draw(typedraw, max);
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

function vBarChart(dataset) {
//var dataset=[100, 27, 133, 19, 23, 76, 42, 58, 45,66,33];
//var dataset=[100, 27, 133, 19, 23, 76, 42, ];
const max = Math.max(...dataset);
const height = 300;

var chart = d3.select('.vchart')
	.attr("width", '100%')
	.attr('height', height)
	

var bar = chart.selectAll("g")
	.data(dataset)
	.enter().append("g")

bar.append("rect")
    .attr("y",function(d,i){return height-(d/max*(height*0.8));})
    .attr("x",function(d,i){
         return i * 100/dataset.length+'%'; //position
    })
    .attr("height",function(d){
         return (d*3);
    })
    .attr("width",100/dataset.length+'%') //width
    .attr("fill","#5F4B8B")
	.attr("stroke-width",2)
	.attr("stroke","black");

bar.append('text')
	.attr('y',function(d){return height-(d/max*(height*0.8))+21;})
	.attr("x",function(d,i){
         return (i * 100/dataset.length + 50/dataset.length)+'%'; //position
    })
	.style('fill', '#F00')
	.style('font-size', '18px')
	.style('font-weight', 'bold')
	.style("text-anchor", 'middle')
	.text(function(d){
	return d;}
		 );

bar.append('text')
	.attr('y',function(d){return height*0.1})
	.attr("x",function(d,i){
         return (i * 100/dataset.length + 50/dataset.length)+'%'; //position
    })
	.style('fill', '#000')
	.style('font-size', '18px')
	.style('font-weight', 'bold')
	.style("text-anchor", 'middle')
	.text(function(d,i){
	return i+1;}
		 );
}

function switchmode(item) {
    var items = ['income', 'outcome'];
    items.forEach(function(i) {
        if(i == item.id) {
            document.getElementById(i).classList.add('w3-border-red');
        } else {
            document.getElementById(i).classList.remove('w3-border-red');
        }
    });

    if(item.id == 'outcome') {
        inputform = ''+
        '<form action="/accounting" method="post" class="w3-container w3-card-4">'+
          '<h2>消費紀錄</h2>'+
          '<div class="w3-section">'+
          '<label>品項</label> '+
          '<input class="w3-input" type="text" name="note" required="" /></div>'+
          '<div class="w3-section">'+
          '<label>金額</label> '+
          '<input class="w3-input" type="text" name="cost" required="" /></div>'+
          '<div class="w3-section">'+
          '<label>種類</label> '+
          '<select class="w3-select w3-border" name="type">'+
            '<option value="" disabled="disabled" selected="selected">選一個</option>'+
            '<option value="1">食物</option>'+
            '<option value="2">交通</option>'+
            '<option value="3">娛樂</option>'+
            '<option value="4">醫療</option>'+
            '<option value="5">消費</option>'+
            '<option value="6">住家</option>'+
            '<option value="99">其他</option>'+
          '</select></div>'+
          '<div class="w3-section">'+
            '<input class="w3-input" type="submit" value="輸入" />'+
          '</div>'+
        '</form>';

        console.log(inputform);
        document.getElementById('inputform').innerHTML = inputform;
    } else {
        document.getElementById('inputform').innerHTML = '404 Not Found';
    }
}
