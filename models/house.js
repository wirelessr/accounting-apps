const WEB_URL_FORMAT = 'https://rent.591.com.tw/rent-detail-POST_ID.html';
const WEB_API = 'https://rent.591.com.tw/home/search/rsList';
const url = WEB_API + '?kind=1&region=1&pattern=2&area=10,20&rentprice=3&option=naturalgas,washer&other=cook,balcony_1';
const request = require('request');
const cheerio = require('cheerio');
const Async = require('async');

		function _query(next) {
			request(url, (err, res, body) => {
				//console.log(body);
				var houses = JSON.parse(body);
				var ret = [];

				var data = houses['data']['data'];
				for(i in data) {
					//data[i] : house info
					var detail_url = WEB_URL_FORMAT.replace('POST_ID', data[i].post_id);
					request(detail_url, (err, res, body) => {
						var $ = cheerio.load(body);
						var images = '[' + $('#hid_imgArr').val() + ']';
						var json_img = JSON.parse(images);
						var house = {};

						var info = data[i];
						house['img'] = json_img;
						house['name'] = info.region_name + '-' + info.section_name + '-' + info.fulladdress;
						house['price'] = info.price + ' ' + info.unit;
						house['area'] = info.area;
						house['layout'] = info.layout;
						house['url'] = detail_url;
						house['update_at'] = info.refreshtime;

						console.log(house);
						ret.push(house);
					});
				}
				console.log('!RESULT!' + ret);
				callback(err, ret);
			});
		}

function asyncio(msg, done) {
    setTimeout(function(){
        console.log('asyncio: '+msg);
        done();
    }, 3000);
}

module.exports.query = function(arg, callback) {
	request(url, (err, res, body) => {
		var houses = JSON.parse(body);
		var ret = [];

		var data = houses['data']['data'];

		var taskHandler = function(task, done) {
			var info = task.info;
			var detail_url = WEB_URL_FORMAT.replace('POST_ID', info.post_id);
			request(detail_url, (err, res, body) => {
				var $ = cheerio.load(body);
				var images = '[' + $('#hid_imgArr').val() + ']';
				var json_img = JSON.parse(images);
				var house = {};

				house['img'] = json_img;
				house['name'] = info.region_name + '-' + info.section_name + '-' + info.fulladdress;
				house['price'] = info.price + ' ' + info.unit;
				house['area'] = info.area;
				house['layout'] = info.layout;
				house['url'] = detail_url;
				house['update_at'] = info.refreshtime;

				ret.push(house);
				done();
			});
		};

		var queueSize = 4;

		var myQueue = Async.queue(taskHandler, queueSize);

		myQueue.drain = function() {
			callback(null, ret);
		}

		for(i in data) {
			myQueue.push({ info: data[i] });
		}
	});
}
