var ucan = document.getElementById("ui_canvas");
var uc = ucan.getContext('2d');
var framenum = 0;
var active = -1;
var lastpos = [0,0];
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
  }
}

function UIPoint(x,y,color) {
  this.x = x;
  this.y = y;
  this.color = color;
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
}

function history(){
  this.x = [];
  this.y = [];
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
  uc.strokeStyle="rgba(0,100,50,0.2)";
  for(i=0;i<4;i++){
    uc.beginPath();
    uc.moveTo(spops[i].x,spops[i].y);
    uc.lineTo(pops[i].x,pops[i].y);
    uc.stroke();
    spops[i].draw();
    pops[i].draw();
  }
}

ucan.addEventListener("mousedown",function(e){
    e.preventDefault();
    testPoints(e.pageX-8,e.pageY-8);
    if (active != -1){
      pops[active].x = spops[active].x;
      pops[active].y = spops[active].y;
      lastpos = [e.pageX,e.pageY];
    }
});

ucan.addEventListener("mousemove",function(e){
    if(active != -1) {
      var xoff = e.pageX-lastpos[0];
      var yoff = e.pageY-lastpos[1];
      pops[active].x = pops[active].x+xoff;
      pops[active].y = pops[active].y+yoff;
    }
    ui_redraw();  
    lastpos = [e.pageX,e.pageY];
});

window.addEventListener('mouseup',function(){
       active = -1;
});

window.setInterval(animate,50);

function animate(){
  if (framenum >= 30) framenum = 0;
  for(i=0;i<4;i++){
    if (i==active){
      track[i].x[framenum] = pops[i].x;
      track[i].y[framenum] = pops[i].y;
    }
    else pops[i].set(track[i].x[framenum],track[i].y[framenum]);
  }
  framenum++;
  ui_redraw();
}