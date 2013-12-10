'use strict';

var workerPool = (function worker() {
	var workerPool = {},
		workers = {},
		workingWorkers = 0,
		maxWorkingWorker = 2,
		queue = [];

	workerPool.createWorker = function(fileUrl,id,callback) {
		workers[id] = {file:fileUrl,callback:callback};
	}

	workerPool.getWorker = function(id) {
		return workers[id];
	}

	workerPool.executeWorker = function(id,payload) {
		if(workingWorkers <= maxWorkingWorker) {
			var worker = new Worker(workers[id].file);

			worker.addEventListener('message',function(e) {
				workers[id].callback(e);
				workingWorkers--;

				if(queue.length > 0) {
					var nextJob = queue.shift();

					workerPool.executeWorker(nextJob.id,nextJob.payload);
				}
				worker.terminate();
			});

			worker.postMessage(payload);

			workingWorkers++;
		} else {
			queue.push({id:id,payload:payload});
		}
	};

	return workerPool;
})();

'use strict';

var readerPool =(function () {
	var ns = {};

	ns.canvasQueue = function (handler) {
		var canvasRoom = 3, queue = [];

		var run = function (item) {
			var canvasFinish = function (/*obj*/) {
				canvasRoom++;
				if (queue.length > 0) {
					canvasRoom--;
					run(queue.shift());
				}
			};

			handler(item, canvasFinish);
		};

		this.append = function (task) {
			queue.push(task);

			if (canvasRoom > 0) {
				canvasRoom--;
				run(queue.shift());
			}
		};
	};

	ns.TaskCanvas = function (url, success,height) {
		this.url = url;
		this.success = success;
		this.height = height ||250;
	};

	ns.taskCanvasHandler = function (task, finish) {
		var reader = new FileReader();

		reader.onload = function() {
			var imageArray = new Uint8Array(reader.result);
			task.success({maxHeight:task.height,buffer:imageArray,bufferLength:imageArray.byteLength});
			finish();
		};

		reader.readAsArrayBuffer(task.url);
	};
	
	return ns;
})();

var queueG = new readerPool.canvasQueue(readerPool.taskCanvasHandler)

var i = 1000,
	times = [];

function loadImageASM(file,script,key) {
	var reader  = new FileReader(),
		time;

	var worker = workerPool.createWorker(script,file.name,function(e) {
		var newCanvas = $('<canvas />',{Height:e.data.newHeight,Width:e.data.newWidth}).css('display','inline-block')[0],
			ctx = newCanvas.getContext('2d'),
			newImg = ctx.createImageData(e.data.newWidth,e.data.newHeight);

		newImg.data.set(e.data.result);
		$('#images').append(newCanvas);
		newCanvas.getContext('2d').putImageData(newImg,0,0);
		times.push(new Date().getTime() - time);
		$(key+'#count').text(1+(+$('#count').text()));
		if(--i) {
			loadImage(file,script);
		} else {
			printStat()
		}
	});

	reader.onloadend = function () {
		var imageArray = new Uint8Array(reader.result);
		workerPool.executeWorker(file.name,{maxHeight:250,buffer:imageArray,bufferLength:imageArray.byteLength});
	}
	time = new Date().getTime();
	reader.readAsArrayBuffer(file);
}

function printStat() {
	var avgTime = _.reduce(times,function(memo,num) { return num/times.length + memo},0),
		max = _.max(times),
		min = _.min(times),
		ecartType = Math.sqrt(_.reduce(times,function(memo,num) {return memo + Math.pow(num - avgTime,2)/times.length},0));

	$('body').append('avg : '+avgTime+ ' max : ' + max + ' min : ' + min + ' ecartType : ' + ecartType);
}

var scriptMap = {
	o3:'asm/o3/worker-script.js',
	o2:'asm/o2/worker-script.js',
	o1:'asm/o1/worker-script.js',
	noop:'asm/no-op/worker-script.js',
}
_.each(scriptMap,function(value,key) {
	$('#'+key+' #obo input').change(function() {
		loadImageASM(this.files[0],value,'#'+key+' #obo ');
	});

	$('#'+key+' #parallel input').change(function() {
		var time = new Date().getTime();
		var self = this;
		for(var j = 1000;--j;) {
			workerPool.createWorker(value,this.files[0].name,function(e) {
				var newCanvas = $('<canvas />',{Height:e.data.newHeight,Width:e.data.newWidth}).css('display','inline-block')[0],
					ctx = newCanvas.getContext('2d'),
					newImg = ctx.createImageData(e.data.newWidth,e.data.newHeight);

				newImg.data.set(e.data.result);
				$('#images').append(newCanvas);
				newCanvas.getContext('2d').putImageData(newImg,0,0);
				$('#'+key+' #parallel #count').text(1+(+$('#'+key+' #parallel #count').text()));
				if($('#images canvas').length >= 500) {
					console.log(new Date().getTime() - time);
				}
			});

			var task = new readerPool.TaskCanvas(this.files[0],function(result) {
				workerPool.executeWorker(self.files[0].name,result);
			},250);

			queueG.append(task);
		}
	});
})

