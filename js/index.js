var ucan = document.getElementById("ui_canvas");
var uc = ucan.getContext('2d');
var framenum = 0;
var active = -1;
var lastpos = [0,0];
var sourcemode = false;
var rotamode = false;

var gif;
var giffing = false;

var pops = [];
for (i=0;i<4;i++){
  pops[i] = new UIPoint(Math.random()*640,Math.random()*640,"#FF9900");
  pops[i].draw();
}

var spops = [];
for (i=0;i<4;i++){
  spops[i] = new UIPoint(pops[i].x,pops[i].y,"#00bbFF");
  spops[i].draw();
}

var track = [];
for (i=0;i<4;i++){
  var xx = pops[i].x;
  var yy = pops[i].y;
  track[i] = new history();
  for(j=0;j<30;j++){
    track[i].x[j]=xx;
    track[i].y[j]=yy;
    track[i].theta[j] = 0;
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

ucan.addEventListener("mousedown",function(e){
    e.preventDefault();
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
      lastpos = [e.pageX,e.pageY];
    }
});

ucan.addEventListener("mousemove",function(e){
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
    }
    ui_redraw();  
    lastpos = [e.pageX,e.pageY];
});

window.addEventListener('mouseup',function(){
       active = -1;
       rotamode = false;
       sourcemode = false;
});

window.setInterval(animate2,50);

function animate2(){
  if (framenum >= 30){
   framenum = 0;
   if(giffing){
   		giffing = false;
   		gif.render();
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
  ui_redraw();
  setGLpoints();
  animate();
  if (giffing) gif.addFrame(c,{copy:true,delay:60});
}

function makeGIF(){
	giffing = true;
	framenum = 0;
	gif = new GIF({
		workers: 2,
		quality: 20,
		dither: "Atkinson"
	});
	
	gif.on('finished', function(blob) {
        var link = document.createElement('a');
        window.open(URL.createObjectURL(blob));
	});	
}
