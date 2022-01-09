/**
require math.js;
require shape.js;
require webgl.js;
require renderer.js;

reserved:
	Scene, Camera3, Camera4, MCRenderer4
**/
'use strict';
var MCRenderer4 = function(ctxt,scene4,camera4,light4){
	Renderer4.call(this,ctxt,scene4,camera4,light4);
	this.chunkCenter = new Vec4();
	this.focusPos = new Vec4();
	this.light4Density = new Vec3();
	this.lineWidth = 0.1;
	this.time = 0.0;//for water wave animation
}
MCRenderer4.prototype = Object.create(Renderer4.prototype);
MCRenderer4.ShaderProgram = {
	fbo4D: {
		F: MCRenderer_FragmentShader,
		V: `
		attribute vec4 V;
		varying vec4 coord;
		varying vec4 coord4;
		uniform mat4 mCamera3;
		uniform vec3 Camera4Proj;
		uniform vec4 vCam4;
		uniform mat4 mCam4;
		
		void main(void) {
			vec4 v = vec4(V.xyz*Camera4Proj.x,V.w*Camera4Proj.y+Camera4Proj.z);
			vec4 pos = mCamera3*vec4(v.xyz,1.0);
			coord = vec4(pos.x,pos.yzw); 
			coord4 = mCam4*V;
			gl_Position = coord;
		}
		`,
		attribute:{
			"vec4 V":{}
		},
		uniform:{
			"int chunk":{},
			"int bloc":{},
			//sampler2d above
			"mat4 mCamera3":{},
			"vec3 Camera4Proj":{},//vec3(ctg,mtt,mtw)
			"vec3 chunkCenter":{},
			"float flow":{},//opacity per layer
			"float time":{},//for water wave
			"int renderDistance":{},//opacity per layer
			"vec4 vCam4":{},"mat4 mCam4":{},//PMat5 Cam4
			"vec4 light_Dir":{},
			"vec4 dx4":{},
			"vec3 light_Density":{},
			"float lineWidth":{},
			"float ambientLight":{},
			"vec3 bgColor4":{},
			"vec4 focusPos":{},
			"vec3 sunColor":{},
			"int displayMode":{}//wireFrameMode: 1
		}
	}
}

MCRenderer4.prototype.initGL = function(gl){
	Webgl(gl);
	gl.enable(gl.DEPTH_TEST);
	gl.viewport(0, 0, this.width, this.height);
	
	gl.fboProgram = new Webgl.ShaderProgram(gl,MCRenderer4.ShaderProgram.fbo4D);
	gl.VfboBuffer = new Webgl.ArrayBuffer(gl);
	gl.FfboBuffer = new Webgl.ElementBuffer(gl);
	
	//load chunk data to glsl: by sampler2D
	this.chunkTxt = gl.createTexture();
	this.chunkTxtData = new Uint8Array(2048*2048*4);
	
	this.blocTxt = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.blocTxt);
	//[r,g,b,a]-> size4chunk x
	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.blocTxtImg);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
}

MCRenderer4.prototype.writeChunk = function(){
	var gl = this.gl;
	this.scene4.toSamplerBuffer(this.camera4.position.x,this.camera4.position.z,this.camera4.position.t,this.chunkTxtData);
	gl.activeTexture(gl.TEXTURE1);
	gl.bindTexture(gl.TEXTURE_2D, this.chunkTxt);
	//[r,g,b,a]-> size4chunk x
	//gl.activeTexture(gl.TEXTURE1);
	gl.texImage2D(
		gl.TEXTURE_2D, 0, gl.RGBA, 2048, 2048, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.chunkTxtData
	);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	//gl.bindTexture(gl.TEXTURE_2D, null);
}
MCRenderer4.prototype.beforeRender = function(){
	document.bgColor = "#"+this.bgColor3.toString(16);
	this.gl.fboProgram.use();
	this.clearColor(this.bgColor3);
}
MCRenderer4.prototype._renderLayers = function(){
	var mt = 0.99/this.camera4.projectMat.ctg;
	var displayMode = this.wireFrameMode;
	this._setFboProgramUniform();
	for(var i = 0; i <= 1; i += this.thickness);
	while(i >= -1){
		this.gl.fboProgram.uniform["float flow"].set(this.thickness * this.flow*(i+1));
		this.renderCrossSection(new Vec4(0,0,1,mt*i),false,false);
		i -= this.thickness*Math.round(Math.abs(i)+1);
	}
}

MCRenderer4.prototype._setFboProgramUniform = function(){
	var gl = this.gl;
	var matProject = this._matProject;
	gl.fboProgram.uniform["int chunk"].set(1);
	gl.fboProgram.uniform["int bloc"].set(0);
	gl.fboProgram.uniform["mat4 mCam4"].set(this._matCamera.t(false).array);
	gl.fboProgram.uniform["vec4 vCam4"].set([this.camera4.position.x,this.camera4.position.y,this.camera4.position.z,this.camera4.position.t]);
	gl.fboProgram.uniform["vec3 Camera4Proj"].set([matProject.ctg,matProject.mtt,matProject.mtw]);
	gl.fboProgram.uniform["float flow"].set(this.thickness * this.flow);
	gl.fboProgram.uniform["float time"].set(this.time);
	gl.fboProgram.uniform["int renderDistance"].set(Math.floor(MCWorld.renderDistance));
	gl.fboProgram.uniform["vec4 dx4"].set([0,0,0,0]);
	gl.fboProgram.uniform["float ambientLight"].set(this.ambientLight);
	gl.fboProgram.uniform["vec3 light_Density"].set(this.light4Density.flat());
	gl.fboProgram.uniform["float lineWidth"].set(this.lineWidth);
	gl.fboProgram.uniform["vec4 light_Dir"].set(this.light4.norm(false).flat());
	gl.fboProgram.uniform["vec3 chunkCenter"].set([this.chunkCenter.x,this.chunkCenter.z,this.chunkCenter.t]);
	var c = this.bgColor4;
	gl.fboProgram.uniform["vec3 bgColor4"].set([(c >> 16)/256,(c>> 8 & 0xFF)/256,(c & 0xFF)/256]);
	c = this.sunColor;
	gl.fboProgram.uniform["vec3 sunColor"].set([(c >> 16)/256,(c>> 8 & 0xFF)/256,(c & 0xFF)/256]);
	gl.fboProgram.uniform["vec4 focusPos"].set(this.focusPos.flat());
	if(this.wireFrameMode){
		gl.fboProgram.uniform["int displayMode"].set(1);
	}else{
		gl.fboProgram.uniform["int displayMode"].set(0);
	}
}
MCRenderer4.prototype.renderCrossSection = function(frustum,mode3d,thumbnail){
	var _this = this;
	this._viewportSection = this.viewport4.crossSection(0,frustum).flat();

	var gl = this.gl;
	var viewport4 = this._viewportSection;
	var dx4 = this.getDx4(thumbnail);
	gl.fboProgram.attribute["vec4 V"].bind(gl.VfboBuffer);
	gl.VfboBuffer.set(viewport4.v,true);
	gl.FfboBuffer.set(viewport4.f,true);
	if(!thumbnail){
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		this.viewportL();
		gl.fboProgram.uniform["mat4 mCamera3"].set(this.eyeL.Mat.array);
		gl.drawFaces(gl.FfboBuffer);
		this.viewportR();
		gl.fboProgram.uniform["mat4 mCamera3"].set(this.eyeR.Mat.array);
		gl.drawFaces(gl.FfboBuffer);
		gl.disable(gl.BLEND);
	}else{
		gl.disable(gl.DEPTH_TEST);
		
		this.setThumbViewport(gl,thumbnail,this.LEFT);
		gl.fboProgram.uniform["vec4 dx4"].set(dx4.flat());
		gl.fboProgram.uniform["mat4 mCamera3"].set(this.eyeL.Mat.array);
		gl.drawFaces(gl.FfboBuffer);
		
		this.setThumbViewport(gl,thumbnail,this.RIGHT);
		gl.fboProgram.uniform["vec4 dx4"].set(dx4.sub().flat());
		gl.fboProgram.uniform["mat4 mCamera3"].set(this.eyeR.Mat.array);
		gl.drawFaces(gl.FfboBuffer);
		gl.enable(gl.DEPTH_TEST);
	}
	
}