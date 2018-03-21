var c = document.getElementById('c');
var gl;

//set up globals
var basevs,basefs,feedback;
var camtex,skinvs,skinfs,skinpgm,ppgm,gridfs,gridpgm;
var popet;
var bstock,btex;
var webcam=document.createElement('video');

//set the initial state of the effect
var SKINSTATE = {
	p1:	[0,0,0,0],
	p2:	[0,0,0,0],
	p3: [0,0,0,0],
	p4: [0,0,0,0],
	theta: [0,0,0,0],
	size: [0.6,0.6,0.6,0.6],
	falloff: [0.75,0.75,0.75,0.75]
}
//method to translate stored settings into shader uniforms
SKINSTATE.calc = function(){
	gl.useProgram(skinpgm);
	gl.uniform4f(gl.getUniformLocation(skinpgm,"p1"),this.p1[0],this.p1[1],this.p1[2],this.p1[3]);
	gl.uniform4f(gl.getUniformLocation(skinpgm,"p2"),this.p2[0],this.p2[1],this.p2[2],this.p2[3]);
	gl.uniform4f(gl.getUniformLocation(skinpgm,"p3"),this.p3[0],this.p3[1],this.p3[2],this.p3[3]);
	gl.uniform4f(gl.getUniformLocation(skinpgm,"p4"),this.p4[0],this.p4[1],this.p4[2],this.p4[3]);
	gl.uniform4f(gl.getUniformLocation(skinpgm,"theta"),this.theta[0],this.theta[1],this.theta[2],this.theta[3]);
	gl.uniform4f(gl.getUniformLocation(skinpgm,"size"),this.size[0],this.size[1],this.size[2],this.size[3]);
	gl.uniform4f(gl.getUniformLocation(skinpgm,"falloff"),this.falloff[0],this.falloff[1],this.falloff[2],this.falloff[3]);
}

//initialize the important stuff
initGL();
initSlabs();
//resizeCanvas();	

function initGL(){
	gl = c.getContext('webgl');
	gl.blendFunc(gl.ONE,gl.ONE_MINUS_SRC_ALPHA);
	gl.enable(gl.BLEND);
	gl.disable(gl.DEPTH_TEST);
	gl.clearColor(1,1,1,1);
	gl.viewport(0,0,c.width,c.height);
	gl.getExtension('OES_standard_derivatives');
	gl.getExtension('EXT_shader_texture_lod');
}

function initSlabs(){
	// generate the shaders
	popet = new warpMesh(200,200);
	bstock = new pxBB();
	basevs = pxShader(shades.basevs,gl.VERTEX_SHADER);
	basefs = pxShader(shades.basefs,gl.FRAGMENT_SHADER);
	skinvs = pxShader(shades.skinvs,gl.VERTEX_SHADER);
	skinfs = pxShader(shades.skinfs,gl.FRAGMENT_SHADER);
	gridfs = pxShader(shades.gridfs,gl.FRAGMENT_SHADER);
	ppgm = pxProgram(basevs,basefs);
	skinpgm = pxProgram(skinvs,skinfs);
}

function initImages(){	
	mc.globalCompositeOperation = 'source-in';
	mc.drawImage(webcam,80,0,480,480,0,0,640,640);
	camtex = gl.createTexture();
	camtex.image = mcan;
	gl.bindTexture(gl.TEXTURE_2D, camtex);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
   	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mcan);	
   	btex = gl.createTexture();
	gl.bindTexture(gl.TEXTURE_2D, btex);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  	gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
   	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, backcrop);		
}

//the "animate" function is where the draw loop happens
function animate() {
	//set up the next frame
	//window.requestAnimFrame( animate );
	//recalculate the settings
	SKINSTATE.calc();
	
	//clear the frame
	gl.clear(gl.COLOR_BUFFER_BIT);
	
	if (useback) bstock.draw(ppgm,btex);
	popet.draw(skinpgm,camtex);

   	//update camera texture
   	mc.globalCompositeOperation = 'source-in';
   	if(usefront) mc.drawImage(frontcrop,0,0,640,640,0,0,640,640); 
   	else mc.drawImage(webcam,80,0,480,480,0,0,640,640);
	gl.bindTexture(gl.TEXTURE_2D, camtex);
   	gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, mcan);
   	if(useback) {
   		gl.bindTexture(gl.TEXTURE_2D, btex);
   		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, backcrop);
   	}
}

//The current best practice for camera input. This seems to change regularly so could break.	
function startvideo() {
    webcam.style.width = '640px';
    webcam.style.height = '640px';
    webcam.setAttribute('autoplay', '');
    webcam.setAttribute('muted', '');
	webcam.setAttribute('playsinline', '');

    var constraints = {
         audio: false,
         video: {
             facingMode: 'user'
         }
    }
 	navigator.mediaDevices.getUserMedia(constraints).then(function success(stream) {
        webcam.srcObject = stream;
        initImages();
    });
}

//You need to bind a user interaction in order to start video input on Safari and iOS
$(document).ready (function(){
	$('body').bind("click touchstart",function(){
		startvideo();
		$('#startmessage').empty();
		$('body').unbind("click touchstart");
	});
});

//This makes sure everything is the right size
function resizeCanvas() {
    gl.viewport(0,0,c.width,c.height);
    
}

//who knows if this polyfill is still necessary
window.requestAnimFrame = (function() {
  return window.requestAnimationFrame ||
         window.webkitRequestAnimationFrame ||
         window.mozRequestAnimationFrame ||
         window.oRequestAnimationFrame ||
         window.msRequestAnimationFrame ||
         function(/* function FrameRequestCallback */ callback, /* DOMElement Element */ element) {
           return window.setTimeout(callback, 1000/60);
         };
})();


