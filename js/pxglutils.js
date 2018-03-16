function warpMesh(xnum,ynum){
	this.vertices = new Array();
	this.colors = new Array();
	this.texcoord = new Array();
	this.elements = new Array();
	this.vert = gl.createBuffer();
	this.tex = gl.createBuffer();
	this.color = gl.createBuffer();
	this.xnum = xnum;
	this.ynum = ynum;
	this.gen();
	var eindex=0;
	for(y=0;y<(ynum-1);y++){
		for(x=0;x<(xnum-1);x++){
			var pt=x+xnum*y;
			this.elements[eindex++]=pt;
			this.elements[eindex++]=pt+1;
			this.elements[eindex++]=pt+xnum;
			this.elements[eindex++]=pt+1;
			this.elements[eindex++]=pt+1+xnum;
			this.elements[eindex++]=pt+xnum;
		}
	}
    this.elem = gl.createBuffer();
    this.elem.numitems = this.elements.length;
  	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elem);
  	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.elements), gl.STATIC_DRAW);
}
warpMesh.prototype.gen = function(){
	var vindex=0;
	var cindex=0;
	var tindex = 0;
	for (y=0;y<this.ynum;y++){
		for (x=0;x<this.xnum;x++){
			for (b=0;b<4;b++){
				if(b<3){
					if(b==0){
						var pt = x*(1./(this.xnum-1));
						this.texcoord[tindex++]=pt;
						pt = 2*pt-1;
						this.vertices[vindex++]= pt;
					}
					else if(b==1){
						var pt = y*(1./(this.ynum-1));
						this.texcoord[tindex++]=1-pt;
						pt = 1.-(2*pt);
						this.vertices[vindex++]= pt;
					}			
					else if(b==2) this.vertices[vindex++]=0;
				}
				this.colors[cindex++]= 1.;
			}
		}
	}
	initBuffer(this.vert,this.vertices);
	initBuffer(this.tex,this.texcoord);
	initBuffer(this.color,this.colors);
}
warpMesh.prototype.draw = function(gl,texture){
	gl.bindBuffer(gl.ARRAY_BUFFER, this.color);
  	gl.vertexAttribPointer(program.vertexColorAttrib, 4, gl.FLOAT, false, 0, 0);
  	gl.bindBuffer(gl.ARRAY_BUFFER, this.vert);
  	gl.vertexAttribPointer(program.vertexPosAttrib, 3, gl.FLOAT, false, 0, 0);
  	gl.bindBuffer(gl.ARRAY_BUFFER, this.tex);
  	gl.vertexAttribPointer(program.vertexTexAttrib, 2, gl.FLOAT, false, 0, 0);
    gl.uniform1i(gl.getUniformLocation(program,"tex0"), 0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elem);
    gl.drawElements(gl.TRIANGLES, this.elem.numitems, gl.UNSIGNED_SHORT, 0);		
}

warpMesh.prototype.predraw = function(pgm){
	//hook up the vertex attributes
	//assumes the vertex shader used will have pos,color, texcoord inputs
	gl.useProgram(pgm);
	pgm.vertexPosAttrib = gl.getAttribLocation(pgm, 'pos');
	gl.enableVertexAttribArray(pgm.vertexPosAttrib);

	pgm.vertexColorAttrib = gl.getAttribLocation(pgm, 'color');
	gl.enableVertexAttribArray(pgm.vertexColorAttrib);
	
	pgm.vertexTexAttrib = gl.getAttribLocation(pgm, 'texcoord');
	gl.enableVertexAttribArray(pgm.vertexTexAttrib);
	gl.bindBuffer(gl.ARRAY_BUFFER, this.color);
  	gl.vertexAttribPointer(pgm.vertexColorAttrib, 4, gl.FLOAT, false, 0, 0);
  	gl.bindBuffer(gl.ARRAY_BUFFER, this.vert);
  	gl.vertexAttribPointer(pgm.vertexPosAttrib, 3, gl.FLOAT, false, 0, 0);
  	gl.bindBuffer(gl.ARRAY_BUFFER, this.tex);
  	gl.vertexAttribPointer(pgm.vertexTexAttrib, 2, gl.FLOAT, false, 0, 0);
}
warpMesh.prototype.draw = function(pgm,texture){
	this.predraw(pgm);
    gl.uniform1i(gl.getUniformLocation(pgm,"tex0"), 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.elem);
    gl.drawElements(gl.TRIANGLES, this.elem.numitems, gl.UNSIGNED_SHORT, 0);
}

