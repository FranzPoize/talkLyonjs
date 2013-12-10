/*jshint -W016 */
/*jshint -W117 */
'use strict';
importScripts('prout-O3.js');

self.addEventListener('message',function(e) {
	
	var newHeight = e.data.maxHeight;

	var buf = q._malloc(e.data.bufferLength),
		resPtrStar = q._malloc(4),
		heightPtr = q._malloc(4),
		widthPtr = q._malloc(4);

	q.HEAPU8.set(e.data.buffer,buf);
	q.HEAP32.set([0],resPtrStar>>2);
	q.HEAP32.set([0],widthPtr>>2);
	q.HEAP32.set([0],heightPtr>>2);

	var len = q.ccall('convert','number',['number','number','number','number','number'],[buf,e.data.bufferLength,resPtrStar,widthPtr,heightPtr]);

	var resPtr = q.HEAP32[resPtrStar>>2],
		oldHeight = q.HEAP32[heightPtr>>2],
		ratio = oldHeight/newHeight,
		oldWidth = q.HEAP32[widthPtr>>2],
		newWidth = Math.floor(oldWidth/ratio);

	q._free(buf);
	q._free(resPtrStar);
	q._free(widthPtr);

	var imageBuffer = q.HEAPU8.subarray(resPtr,resPtr+len);

	var resultImage = new Uint8ClampedArray(newWidth*newHeight*4);

	for (var i = 0;i<newHeight;i++) {
		for (var j = 0; j<newWidth;j++) {
			var oldPos = Math.floor(i*ratio)*oldWidth*3+Math.floor(j*ratio)*3;


			// for(var k = 0 ;k<ratio;k++) {
			// 	for (var m = 0;m<ratio;m++) {
					var newValue = imageBuffer[oldPos+0*oldWidth*3+0*3]/4+
								imageBuffer[oldPos+1*oldWidth*3+0*3]/4+
								imageBuffer[oldPos+1*oldWidth*3+1*3]/4+
								imageBuffer[oldPos+0*oldWidth*3+1*3]/4;
					resultImage[i*4*newWidth+j*4] = newValue > 255 ? 255 : newValue;

					newValue = imageBuffer[oldPos+0*oldWidth*3+0*3+1]/4+
								imageBuffer[oldPos+1*oldWidth*3+0*3+1]/4+
								imageBuffer[oldPos+1*oldWidth*3+1*3+1]/4+
								imageBuffer[oldPos+0*oldWidth*3+1*3+1]/4;
					resultImage[i*4*newWidth+j*4+1] = newValue > 255 ? 255 : newValue;

					newValue = imageBuffer[oldPos+0*oldWidth*3+0*3+2]/4+
								imageBuffer[oldPos+1*oldWidth*3+0*3+2]/4+
								imageBuffer[oldPos+1*oldWidth*3+1*3+2]/4+
								imageBuffer[oldPos+0*oldWidth*3+1*3+2]/4;
					resultImage[i*4*newWidth+j*4+2] = newValue > 255 ? 255 : newValue;

					resultImage[i*4*newWidth+j*4+3] = 255;
			// 	}
			// }			
		}
	}

	self.postMessage({result:resultImage,newWidth:newWidth,newHeight:newHeight});
});