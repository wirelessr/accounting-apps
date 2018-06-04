function query_house(page){
    var body = {};
    var i;
    var xhttp = new XMLHttpRequest();

	body['firstRow'] = (page - 1) * 30;

    k = document.getElementById('sgl-kind');
    body['kind'] = k.value;

    if(k.value == '1') {
        body['pattern'] = document.getElementById('sgl-pattern').value;
    }
    
    r = document.getElementsByClassName('sgl-rentprice');
    body['rentprice'] = [r[0].value, r[1].value];

    a = document.getElementsByClassName('sgl-area');
    body['area'] = [a[0].value, a[1].value];

    x = document.getElementsByClassName('sgl-option');
    var option = [];
    for(i = 0; i < x.length; i++) {
        var item = x[i];
        if(item.checked) {
            option.push(item.name);
        }
    }
    body['option'] = option;

    x = document.getElementsByClassName('sgl-other');
    var other = [];
    for(i = 0; i < x.length; i++) {
        var item = x[i];
        if(item.checked) {
            other.push(item.name);
        }
    }
    body['other'] = other;

    xhttp.onreadystatechange = function() {
        if(this.readyState == 4 && this.status == 200) {
            var houses = JSON.parse(this.responseText);
            var render_house = '';
			var render_page = '';

            for(h in houses.info) {
                var house = houses.info[h];

                render_house += '<h1>名稱：' + house.name + '</h1>';
                render_house += '<div class="w3-row-padding">';
                for(idx in house.img) {
                    render_house += '<div class="w3-col s3 w3-margin-bottom"><img src="' + house.img[idx] + '"></div>';
                }
                render_house += '</div>';
                render_house += '<div class="w3-center">';
                render_house += '<p>租金：' + house.price + '</p>';
                render_house += '<p>坪數：' + house.area + '</p>';
                render_house += '<p>格局：' + house.layout + '</p>';
                render_house += '<p>更新時間：' + new Date(house.update_at) + '</p>';
                render_house += '<a href="' + house.url + '">網址：' + house.url + '</a>';
                render_house += '</div>';
            }
            document.getElementById('main-page').innerHTML = render_house;

			var total_page = houses.records / 30 + 1;
			for(i = 1; i <= total_page; i++) {
				render_page += '<a onclick="query_house(this.innerHTML)" class="w3-bar-item w3-button w3-hover-theme rpages">' + i + '</a>';
			}
			document.getElementById('pages').innerHTML = render_page;
			document.getElementsByClassName('rpages')[page - 1].classList.add('w3-indigo');
        }
    };
    xhttp.open('POST', '/sgl', true);
    xhttp.setRequestHeader("Content-Type", "application/json;charset=UTF-8");
    xhttp.send(JSON.stringify(body));
}

