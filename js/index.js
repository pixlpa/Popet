var ucan = document.getElementById("ui_canvas");
var uc = ucan.getContext('2d');
var jam = new Image(); //image for texturing (w/ mask)
var maj = new Image(); //source image

var mcan = document.createElement('canvas');
mcan.width = 640;
mcan.height = 640;
var mc = mcan.getContext('2d');
mc.globalCompositeOperation = 'source-over';
mc.fillRect(0,0,640,640);
mc.globalCompositeOperation = 'source-in';

var erase = false;
var eraser = new EraseBrush();
var framenum = 0;
var active = -1;
var lastpos = [0,0];
var sourcemode = false;
var rotamode = false;

var gif;
var giffing = false;
var recording = false;

var pops = [];
var spops = [];
var track = [];
freshpops();

var stack = new FrameBank(32);

function freshpops(){
	for (i=0;i<4;i++){
  		pops[i] = new UIPoint(Math.random()*640,Math.random()*640,"#FF9900");
  		pops[i].draw();
  		spops[i] = new UIPoint(pops[i].x,pops[i].y,"#00bbFF");
  		spops[i].draw();
  		var xx = pops[i].x;
  		var yy = pops[i].y;
  		track[i] = new history();
  		for(j=0;j<30;j++){
    		track[i].x[j]=xx;
    		track[i].y[j]=yy;
    		track[i].theta[j] = 0;
  		}
	}
}

function UIPoint(x,y,color) {
  this.x = x;
  this.y = y;
  this.color = color;
  this.theta = 0;
  this.draw = function(){
    uc.beginPath();
    uc.arc(this.x,this.y,10,0,Math.PI*2);
    uc.fillStyle = color;
    uc.closePath();
    uc.fill();
  }
  this.test = function(x,y){
    if(Math.abs(this.x-x)<13){
      if(Math.abs(this.y-y)<13){
        return true;
      }
      else return false;
    }
    else return false;
  }
  this.set = function(x,y){
    this.x = x;
    this.y = y;
  }
  this.get = function(){
  	var tx = this.x/320-1;
  	var ty = this.y/320-1;
  	return [tx,-ty];
  }
}

function EraseBrush() {
  this.x = 0;
  this.y = 0;
  this.mode = "paint";
  this.active = false;
  this.draw = function(){
    if (this.mode == "paint"){
      uc.drawImage(webcam, (this.x-20)/1.3333+80, (this.y-20)/1.3333, 30,30,this.x-20, this.y-20, 40, 40);
    }
    else if (this.mode == "erase"){
      uc.clearRect(this.x-20,this.y-20,40,40);
    }
  }
  this.set = function(x,y){
    this.x = x;
    this.y = y;
  }
}

function history(){
  this.x = [];
  this.y = [];
  this.theta = [];
  this.draw = function(){
    uc.strokeStyle = "#ff9090"
    uc.moveTo(this.x[0],this.y[0]);
    uc.beginPath();
    for(f=0;f<this.x.length;f++){
      uc.lineTo(this.x[f],this.y[f]);
    }
    uc.closePath();
    uc.stroke();
  }
}

function testPoints (x,y){
  active = -1;
  for(i=0;i<4;i++){
    if(spops[i].test(x,y)) {
      active = i;
      break;
    }
  }
}

function FrameBank(frames){
	this.f = [];
	this.current = 0;
	this.count = frames;
	for(ff=0;ff<frames;ff++){
		this.f[ff] = new Image();
		this.f[ff].width = 640;
		this.f[ff].height = 640;
		uc.fillStyle = "#FFF";
		uc.fillRect(0,0,640,640);
		this.f[ff].src = ucan.toDataURL;
	}
	this.update = function(){
		this.current++;
		if (this.current>=this.count) this.current = 0;
		return this.f[this.current];
	}
	this.record = function(source){
		this.f[framenum].src = source.toDataURL();
	}	
}

function ui_redraw(){
  uc.clearRect(0,0,640,640);
  if(active != -1){
    track[active].draw();
  }
  uc.strokeStyle="rgba(0,100,50,0.6)";
  for(i=0;i<4;i++){
    uc.beginPath();
    uc.moveTo(spops[i].x,spops[i].y);
    uc.lineTo(pops[i].x,pops[i].y);
    uc.stroke();
    spops[i].draw();
    pops[i].draw();
  }
}

function setGLpoints(){
	var gx = pops[0].get();
	var sx = spops[0].get();
	SKINSTATE.p1 = [sx[0],sx[1],(gx[0]-sx[0]),(gx[1]-sx[1])];
	gx = pops[1].get();
	sx = spops[1].get();
	SKINSTATE.p2 = [sx[0],sx[1],(gx[0]-sx[0]),(gx[1]-sx[1])];
	gx = pops[2].get();
	sx = spops[2].get();
	SKINSTATE.p3 = [sx[0],sx[1],(gx[0]-sx[0]),(gx[1]-sx[1])];
	gx = pops[3].get();
	sx = spops[3].get();
	SKINSTATE.p4 = [sx[0],sx[1],(gx[0]-sx[0]),(gx[1]-sx[1])];
	SKINSTATE.theta = [pops[0].theta,pops[1].theta,pops[2].theta,pops[3].theta];
}	

function scaleUpdate(num, val){
	SKINSTATE.size[num] = val/50.;
}

function mask_redraw(){
}

function startEraser(){
	erase = !erase;
	var erasebtn = document.getElementById("erasebutton");
	if (erase){
	 	erasebtn.innerHTML = "Animate";
	 	uc.clearRect(0,0,640,640);
	 	uc.drawImage(mcan,0,0);
	 	c.style.display = "none";
	}
	else {
		erasebtn.innerHTML = "Edit Mask";
		mc.clearRect(0,0,640,640);
		mc.globalCompositeOperation = 'source-over';
		mc.drawImage(ucan,0,0,640,640);
		mc.globalCompositeOperation = 'source-in';
		c.style.display = "block";
	}
}

function collapseLayer(){
	recording = true;
	framenum = 0;
}

ucan.addEventListener("mousedown",function(e){
    e.preventDefault();
    if(erase){
    	eraser.active = true;
        if (e.shiftKey) eraser.mode = "paint";
    	else eraser.mode = "erase";
    	eraser.set(e.pageX-8,e.pageY-8);
    	eraser.draw();
    }
    else {
    	testPoints(e.pageX-8,e.pageY-8);
    	if (active != -1){
    		if (e.shiftKey){
    			sourcemode = true;
    			rotamode = false;
    		}
    		else if (e.altKey){
    			rotamode = true;
    			sourcemode = false;
    		}
    		else {		
      			pops[active].x = spops[active].x;
      			pops[active].y = spops[active].y;
      			sourcemode = false;
      		}
      	}
      }
      lastpos = [e.pageX,e.pageY];
});

ucan.addEventListener("mousemove",function(e){
	if(erase && eraser.active){
    	if (e.shiftKey) eraser.mode = "paint";
    	else eraser.mode = "erase";
    	eraser.set(e.pageX-8,e.pageY-8);
    	eraser.draw();
  	}
  	else {
    	if(active != -1) {
   	   		var xoff = e.pageX-lastpos[0];
   		   	var yoff = e.pageY-lastpos[1];
      		if (sourcemode){
      			spops[active].x = spops[active].x+xoff;
      			spops[active].y = spops[active].y+yoff;
      		}
      		else if (rotamode){
      			pops[active].theta = pops[active].theta+xoff/40;
      		}
      		else {
      			pops[active].x = pops[active].x+xoff;
      			pops[active].y = pops[active].y+yoff;
      		}
			ui_redraw();
    	}
    }
    lastpos = [e.pageX,e.pageY];
});

window.addEventListener('mouseup',function(){
       active = -1;
       rotamode = false;
       sourcemode = false;
       eraser.active = false;
});

window.setInterval(animate2,50);

function animate2(){
	if (erase){
		;;
	}
	else {
  		if (framenum >= 30){
   			framenum = 0;
   			if(giffing){
   				giffing = false;
   				gif.render();
			}
			if(recording){
				recording = false;
				freshpops();
			}
   		}
  		for(i=0;i<4;i++){
    		if (i==active){
    			if (rotamode){
    				track[i].theta[framenum] = pops[i].theta;
    				pops[i].set(track[i].x[framenum],track[i].y[framenum]);
    			}
      			else if (!sourcemode) {
      				track[i].x[framenum] = pops[i].x;
      				track[i].y[framenum] = pops[i].y;
      				pops[i].theta = track[i].theta[framenum];
      			}
    		}
    		else {
				pops[i].set(track[i].x[framenum],track[i].y[framenum]);
				pops[i].theta = track[i].theta[framenum];
			}
  		}
  		framenum++;
  		if (!erase) ui_redraw();
  		setGLpoints();
  		animate();
 		if (giffing) gif.addFrame(c,{copy:true,delay:60});
 		if (recording) stack.record(c);
 	}
}

function makeGIF(){
	giffing = true;
	var gifbutton = document.getElementById("gifbutton");
	gifbutton.classList.add("spinning");
	framenum = 0;
	gif = new GIF({
		workers: 2,
		quality: 20,
		dither: "Atkinson"
	});
	
	gif.on('finished', function(blob) {
        var link = document.createElement('a');
        window.open(URL.createObjectURL(blob));
        var gifbutton = document.getElementById("gifbutton");
        gifbutton.classList.remove("spinning");
        //var image = new Image();
        //image.src = blob;
        //link.href = image;
       	//link.download = "popet.gif";
        //link.click();
	});	
}
