const WEB_URL_FORMAT = 'https://rent.591.com.tw/rent-detail-POST_ID.html';
const WEB_API = 'https://rent.591.com.tw/home/search/rsList';
const request = require('request');
const cheerio = require('cheerio');
const Async = require('async');

module.exports.query = function(arg, callback) {
	var url = WEB_API + '?region=1';
	for(i in arg) {
		url += '&' + i + '=' + arg[i];
	}

	request(url, (err, res, body) => {
		var houses = JSON.parse(body);
		var records = houses['records'];
		var ret = {'records': records, 'info': []};

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

				ret.info.push(house);
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
