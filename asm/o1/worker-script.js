/*jshint -W016 */
/*jshint -W117 */
'use strict';
importScripts('prout-O1.js');

self.addEventListener('message',function(e) {
	
	var newHeight = e.data.maxHeight;

	var buf = Module._malloc(e.data.bufferLength),
		resPtrStar = Module._malloc(4),
		heightPtr = Module._malloc(4),
		widthPtr = Module._malloc(4);

	Module.HEAPU8.set(e.data.buffer,buf);
	Module.HEAP32.set([0],resPtrStar>>2);
	Module.HEAP32.set([0],widthPtr>>2);
	Module.HEAP32.set([0],heightPtr>>2);

	var len = Module.ccall('convert','number',['number','number','number','number','number'],[buf,e.data.bufferLength,resPtrStar,widthPtr,heightPtr]);

	var resPtr = Module.HEAP32[resPtrStar>>2],
		oldHeight = Module.HEAP32[heightPtr>>2],
		ratio = oldHeight/newHeight,
		oldWidth = Module.HEAP32[widthPtr>>2],
		newWidth = Math.floor(oldWidth/ratio);

	Module._free(buf);
	Module._free(resPtrStar);
	Module._free(widthPtr);

	var imageBuffer = Module.HEAPU8.subarray(resPtr,resPtr+len);

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