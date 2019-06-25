/**
reserved: Webgl

static Webgl(WebGLRenderingContext gl):void; add terms below to gl
	
	gl.addShader(String source):WebGLShader;
	gl.addProgram(WebGLShader s1, s2):WebGLProgram;
	gl.addAttribute(String type, name, WebGLProgram p):{
		bind(Webgl.ArrayBuffer ab)
	};
	gl.addUniform(String type, name, WebGLProgram p):{
		set((Number||Array) value)
	};
	gl.addFBO(int width,height, bool floatFlag):(fbo){};
	gl.addFBOLink(WebGLProgram p, Number inputNumber):{
		use((fbo)[] from, (fbo) to),
		release()
	};
	
	gl.drawFaces(Webgl.ElementBuffer);
	gl.drawLines(Webgl.ArrayBuffer);
	
Webgl.ArrayBuffer
	
	Webgl.ArrayBuffer(WebGLRenderingContext gl);
	Webgl.ArrayBuffer.set(Array a, flag dynamicDraw);
	
Webgl.ElementBuffer
	
	Webgl.ElementBuffer(WebGLRenderingContext gl);
	Webgl.ElementBuffer.set(Array a, flag dynamicDraw);	

Webgl.ShaderProgram

	Webgl.ShaderProgram(WebGLRenderingContext gl, {V:String glsl,F:String glsl, attribute: {...}, uniform: {...}} data);
	Webgl.ShaderProgram.use();
**/


"use strict";

var Webgl = function(gl){
	gl._FBOVertexID = 0;
	gl.addShader = function (source){
		var type = source.indexOf("gl_FragColor")!=-1;
		var shader = gl.createShader(type ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER);
		gl.shaderSource(shader, source);
		gl.compileShader(shader);
		if(gl.getShaderInfoLog(shader))
			console.log(gl.getShaderInfoLog(shader)+"\n--------------\n"+source);
		return shader;
	};
	gl.addProgram = function (shader1,shader2){
		var shaderProgram = gl.createProgram();
		gl.attachShader(shaderProgram, shader1);
		gl.attachShader(shaderProgram, shader2);
		gl.linkProgram(shaderProgram);
		return shaderProgram;
	};
	gl.addAttribute = function (type,name,shaderProgram){
		var location = gl.getAttribLocation(shaderProgram, name);
		gl.enableVertexAttribArray(location);
		return {
			bind: function (arrayBuffer){
				gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer.buffer);
				switch(type){
					case "vec2":
						gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
						arrayBuffer.type = 2;
					break;
					case "vec3":
						gl.vertexAttribPointer(location, 3, gl.FLOAT, false, 0, 0);
						arrayBuffer.type = 3;
					break;
					case "vec4":
						gl.vertexAttribPointer(location, 4, gl.FLOAT, false, 0, 0);
						arrayBuffer.type = 4;
					break;
				}
			},
			shaderProgram:shaderProgram,name:name,type:type
		}
	};
	gl.addUniform = function (type,name,shaderProgram){
		var location = gl.getUniformLocation(shaderProgram, name);
		var valeur = null;
		return {
			set: function (value){
				valeur = value;
				if(type.split("[")[1]){
					var size = Number(type.split("[")[1].split("]")[0]);
				}
				switch(type.split("[")[0]){
					case "int":
						gl.uniform1i(location,value);
					break;
					case "float":
						if(size){
							gl.uniform1fv(location,new Float32Array(value),size);
						}
						gl.uniform1f(location,value);
					break;
					case "vec2":
						gl.uniform2fv(location, new Float32Array(value), 2);
					break;
					case "vec3":
						gl.uniform3fv(location, new Float32Array(value), 3);
					break;
					case "vec4":
						gl.uniform4fv(location, new Float32Array(value), 4);
					break;
					case "mat2":
						gl.uniformMatrix2fv(location, false, value);
					break;
					case "mat3":
						gl.uniformMatrix3fv(location, false, value);
					break;
					case "mat4":
						gl.uniformMatrix4fv(location, false, value);
					break;
				}
			},
			get: function (){
				return valeur;
			},
			shaderProgram:shaderProgram,name:name,type:type
		}
	};
	gl.drawFaces = function(elementBuffer){
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer.buffer);
		gl.drawElements(gl.TRIANGLES,elementBuffer.length,gl.UNSIGNED_SHORT,0);
	};
	gl.drawPoints = function(elementBuffer){
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, elementBuffer.buffer);
		gl.drawElements(gl.POINTS,elementBuffer.length,gl.UNSIGNED_SHORT,0);
	};
	gl.drawLines = function(arrayBuffer){
		gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer.buffer);
		gl.drawArrays(gl.LINES, 0, arrayBuffer.length/arrayBuffer.type);
	};
	gl.drawStrip = function(arrayBuffer){
		gl.bindBuffer(gl.ARRAY_BUFFER, arrayBuffer.buffer);
		gl.drawArrays(gl.TRIANGLE_STRIP, 0, arrayBuffer.length/arrayBuffer.type);
	};
	gl.addFBO = function(width,height,floatFlag){
		var num = gl._FBOVertexID;
		gl._FBOVertexID++;
		var framebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		if(floatFlag !== true){
			var renderbuffer = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		}
		var txt = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0+num);
		gl.bindTexture(gl.TEXTURE_2D, txt);
		
		if(floatFlag === true){// no depth, used for calculation
			gl.texImage2D(
				gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null
			);
		}else{
			gl.texImage2D(
				gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null
			);
		}
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, txt, 0);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		return ({
			id:num,
			fbo:framebuffer,
			txt:txt
		});
	};
	gl.setFBO = function(FBO, width,height,floatFlag){
		var num = FBO.id;
		var framebuffer = gl.createFramebuffer();
		gl.bindFramebuffer(gl.FRAMEBUFFER, framebuffer);
		if(floatFlag !== true){
			var renderbuffer = gl.createRenderbuffer();
			gl.bindRenderbuffer(gl.RENDERBUFFER, renderbuffer);
			gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, width, height);
			gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderbuffer);
			gl.bindRenderbuffer(gl.RENDERBUFFER, null);
		}
		var txt = gl.createTexture();
		gl.activeTexture(gl.TEXTURE0+num);
		gl.bindTexture(gl.TEXTURE_2D, txt);
		
		if(floatFlag === true){// no depth, used for calculation
			gl.texImage2D(
				gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, null
			);
		}else{
			gl.texImage2D(
				gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null
			);
		}
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
		gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, txt, 0);
		gl.bindTexture(gl.TEXTURE_2D, null);
		gl.bindFramebuffer(gl.FRAMEBUFFER, null);
		FBO.fbo = framebuffer;
		FBO.txt = txt;
	};
	gl.addFBOLink = function(program,inputNumber){
		var IN = [];
		for(var i=0;i<inputNumber;i++){
			IN.push(gl.addUniform("int","texture"+i,program));
		}
		return {
			program:program,
			inputNumber:inputNumber,
			IN:IN,
			use: function(from,to){
				gl.useProgram(program);
				gl.bindFramebuffer(gl.FRAMEBUFFER, (!to)?null:to.fbo);
				if(to){
					gl.activeTexture(to.id+gl.TEXTURE0);
				}else{
					gl.activeTexture(gl.TEXTURE31);
				}
				gl.bindTexture(gl.TEXTURE_2D, (!to)?null:to.txt);
				if(from.length!=inputNumber){
					throw "Error: invalide "+from.length+" Texture inputs for the program, "+inputNumber+" inputs expected."
				}
				for(var i=0;i<from.length;i++){
					IN[i].set(from[i].id);
				}
			},
			release: function(){
				gl.bindFramebuffer(gl.FRAMEBUFFER, null);
			}
		};
	};
};
Webgl.ArrayBuffer = function(gl){
	var Buf = gl.createBuffer();
	this.buffer = Buf;
	var _this = this;
	this.length = 0;
	this.set = function (value,flag){
		gl.bindBuffer(gl.ARRAY_BUFFER, Buf);
		_this.length = value.length;
		gl.bufferData(gl.ARRAY_BUFFER, value instanceof Float32Array ? value : new Float32Array(value),flag===true ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
	};
}
Webgl.ElementBuffer = function(gl){
	var Buf = gl.createBuffer();
	this.buffer = Buf;
	var _this = this;
	this.length = 0;
	this.set = function (value,flag){
		gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.buffer);
		_this.length = value.length;
		gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, value instanceof Uint16Array ? value : new Uint16Array(value),flag===true ? gl.DYNAMIC_DRAW : gl.STATIC_DRAW);
	}
}
Webgl.ShaderProgram = function(gl,data){
	this.gl = gl;
	this.V = data.V;
	this.F = data.F;
	this.attribute = {};
	
	for(var a in data.attribute){
		this.attribute[a] = null;
	}
	this.uniform = {};
	for(var a in data.uniform){
		this.uniform[a] = null;
	}
	this._create();
	this.use();
}
Webgl.ShaderProgram.prototype._create = function(){
	var shaderV = this.gl.addShader(this.V),
		shaderF = this.gl.addShader(this.F);
	var program = this.gl.addProgram(shaderV,shaderF);
	var _this = this;
	for(var i in this.attribute){
		var typeName = i.split(" ");
		this.attribute[i] = this.gl.addAttribute(typeName[0],typeName[1],program);
	}
	for(var i in this.uniform){
		var typeName = i.split(" ");
		this.uniform[i] = this.gl.addUniform(typeName[0],typeName[1],program);
	}
	this.program = program;
}

Webgl.ShaderProgram.prototype.use = function(){
	this.gl.useProgram(this.program);
}
Webgl.ShaderProgram.basic = {
	F: "precision highp float;varying vec3 vcolor;void main(void) {gl_FragColor=vec4(vcolor,1.0);}",
	V: "attribute vec3 V, N;varying vec3 vcolor;uniform vec3 color, light; uniform mat4 mObj, mCamera; uniform mat3 mN;void main(void) {gl_Position = mCamera*mObj*vec4(V,1.0);vec3 n = mN*N; vcolor = abs(dot(n,light))*color;}",//*sign(n.z)
	attribute:{
		"vec3 V":{},
		"vec3 N":{}
	},
	uniform:{
		"vec3 color":{},
		"vec3 light":{},
		"mat3 mN":{},//pure rot mat for normal
		"mat4 mObj":{},
		"mat4 mCamera":{}
	}
}

