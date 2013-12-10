'use strict';

$('#canvas input').change(function() {
	var file = this.files[0];

	loadImage(file);
});
var i = 20,
	times = [];

function loadImage(file) {
	var reader  = new FileReader(),
		time;

	reader.onloadend = function () {
		var img = $('<img>')
		img.attr('src',reader.result);
		img.height(250);
		//$('body').append(img)
		times.push(new Date().getTime() - time);
		$('#count').text(1+(+$('#count').text()));
		if(--i) {
			loadImage(file)
		} else {
			printStat();
		}
		$('#images').append(img);
	}
	time = new Date().getTime();
	reader.readAsDataURL(file);
}

function printStat() {
	var avgTime = _.reduce(times,function(memo,num) { return num/times.length + memo},0),
		max = _.max(times),
		min = _.min(times),
		ecartType = Math.sqrt(_.reduce(times,function(memo,num) {return memo + Math.pow(num - avgTime,2)/times.length},0));

	$('body').append('avg : '+avgTime+ ' max : ' + max + ' min : ' + min + ' ecartType : ' + ecartType);
}