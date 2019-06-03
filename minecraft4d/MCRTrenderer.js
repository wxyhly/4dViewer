/**
require math.js;
require shape.js;
require webgl.js;

reserved:
	Scene, Camera3, Camera4, Renderer4
**/
'use strict';

var Camera3 = function(fov,nz,fz){
	Obj3.call(this);
	this.setProjectMat(fov,nz,fz);
}
Camera3.prototype = Object.create(Obj3.prototype);
Camera3.prototype.setProjectMat = function(fov,nz,fz,w_h){
	if(!fov)return new Mat4(1,0,0,0,0,1,0,0,0,0,0.01,0,0,0,0,1);//Orthographic Camera
	w_h = w_h||1;
	var ctg = 1/Math.tan(Math.PI/360*fov);
	this.projectMat = new Mat4(
		ctg/w_h,0,0,0,
		0,ctg,0,0,
		0,0,(nz+fz)/(nz-fz),2*nz*fz/(nz-fz),
		0,0,-1,0
	);
}

var Camera4 = function(fov,nz,fz){
	Obj4.call(this);
	this.setProjectMat4(fov,nz,fz);
}
Camera4.prototype = Object.create(Obj4.prototype);
Camera4.prototype.setProjectMat4 = function(fov,nz,fz){
	this.fov = fov;
	if(fov){
		this.nz = nz || this.nz;
		this.fz = fz || this.fz;
		this.projectMat = {
			ctg : 1/Math.tan(Math.PI/360*fov),
			mtt : (nz+fz)/(nz-fz),
			mtw : 2*nz*fz/(nz-fz)
		}
	}
}
Camera4.prototype.project = function(p){
	if(!this.fov)return p;
	var m = this.projectMat;
	var a = -m.ctg/p.t;
	p.t = -m.mtt - m.mtw/p.t;
	p.x *= a;
	p.y *= a;
	p.z *= a;
}

var MCRTRenderer4 = function(ctxt,scene4,camera4,light4,camera3){
	this.gl = ctxt;
	this.chunkCenter = new Vec4();
	ctxt.canvas.style.backgroundColor = "#000000";//bgcolor must be black to avoid alpha transparency bug
	this.scene4 = scene4;
	this.camera4 = camera4;
	this.camera3 = camera3 || new Camera3(15,1,20);//don't use position infomation, it's decided par eyeDistanceF/H;
	this.camera3.rotation = new Vec3(1,0,0).expQ(Math.PI/12).mul(new Vec3(0,1,0).expQ(Math.PI/16));
	this.bgColor4 = 0x66FFFF;//sky
	this.bgColor3 = 0xFFFFFF;//background
	this.ambientLight = 0.3;
	this.enableThumbnail = true;
	if(!light4){
		this.light4 = new Vec4(2,1,0.3,-5).norm()
	}else{
		this.light4 = light4 || new Vec4(2,1,0.3,-5).norm();
	}
	this.eyeDistanceF = 10;
	this.eyeDistanceH = 1;
	this.eyeDistance4 = 0.2;
	this.thickness = 0.08;
	this.thumbSize = 3;
	this.flow = 1.0;
	this.wireFrameMode = false;
	this.focusPos = new Vec4();
	this.width = this.gl.canvas.width>>1;
	this.height = this.gl.canvas.height;
	this.aspect = this.width/this.height;
	this.center = new Vec2(this.width/2,this.height/2);
	//this._initGL(this.gl); 由于加载贴图，放在loop前了
	this.opaqueColors = [
		{
			color: 0x030201,
			tolerance: 0
		},
		{
			color: 0x030201,
			tolerance: 0
		},
		{
			color: 0x030201,
			tolerance: 0
		},
		{
			color: 0x030201,
			tolerance: 0
		}
	]
}
MCRTRenderer4.ShaderProgram = {
	fbo4D: {
		F: MCRTRenderer_FragmentShader,
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
			"int renderDistance":{},//opacity per layer
			"vec4 vCam4":{},"mat4 mCam4":{},//PMat5 Cam4
			"vec4 light_Dir":{},
			"vec4 dx4":{},
			"float light_Density":{},
			"float ambientLight":{},
			"vec3 bgColor4":{},
			"vec4 focusPos":{},
			"vec3 sunColor":{},
			"int displayMode":{}//wireFrameMode: 1
		}
	}
}

MCRTRenderer4.prototype._initGL = function(gl){
	Webgl(gl);
	gl.enable(gl.DEPTH_TEST);
	gl.viewport(0, 0, this.width, this.height);
	
	gl.fboProgram = new Webgl.ShaderProgram(gl,MCRTRenderer4.ShaderProgram.fbo4D);
	gl.VfboBuffer = new Webgl.ArrayBuffer(gl);
	gl.FfboBuffer = new Webgl.ElementBuffer(gl);
	
	//gl.fboL = gl.addFBO(this.width,this.height);
	//gl.fboR = gl.addFBO(this.width,this.height);
	//gl.fbolink1 = gl.addFBOLink(gl.crossProgram.program,0);
	//gl.fbolink2 = gl.addFBOLink(gl.fboProgram.program,1);
	//enumerations of viewport:
	this.LEFT_BOTTOM = 4 ;
	this.LEFT_UP = 1;
	this.RIGHT_BOTTOM = 2;
	this.RIGHT_UP = 3;
	
	//load chunk data to glsl: by sampler2D
	this.chunkTxt = gl.createTexture();
	this.chunkTxtData = new Uint8Array(2048*2048*4);
	
	this.blocTxt = gl.createTexture();
	gl.activeTexture(gl.TEXTURE0);
	gl.bindTexture(gl.TEXTURE_2D, this.blocTxt);
	//[r,g,b,a]-> size4chunk x
	gl.texImage2D(gl.TEXTURE_2D,0,gl.RGB,gl.RGB,gl.UNSIGNED_BYTE,this.blocTxtImg);
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	//gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
	//gl.bindTexture(gl.TEXTURE_2D, null);
}
MCRTRenderer4.prototype.writeChunk = function(){
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
MCRTRenderer4.prototype.viewportL = function(){
	this.gl.viewport(0, 0, this.width, this.height);
}
MCRTRenderer4.prototype.viewportR = function(){
	this.gl.viewport(this.width, 0, this.width, this.height);
}
MCRTRenderer4.prototype.clearColor = function(c){
	this.gl.clearColor((c >> 16)/256,(c>> 8 & 0xFF)/256,(c & 0xFF)/256, 1.0);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
}
MCRTRenderer4.prototype.render = function(){
	var _this = this;
	//3d Settings below:
	var gl = this.gl;
	this.clearColor(this.bgColor3);
	document.bgColor = "#"+this.bgColor3.toString(16);
	//prepare 3d viewport
	this.viewport4 = Mesh3.cube(2/this.camera4.projectMat.ctg).embed(true).move(new Vec4(0,0,0,1));
	//this.writeChunk();
	gl.fboProgram.use();
	function _setEyeMatrix(eye,pos,r){ //set Camera3's affine Mat4
		var dx = _this.camera3.projectMat.mul(
			new Vec4(pos.x,pos.y,pos.z,1)
		);
		eye.Mat = new Mat4(1,0,0,-dx.x/dx.t,0,1,0,0,0,0,1,0,0,0,0,1).mul(_this.camera3.projectMat).mul(new Mat4(
			r[0],r[1],r[2],pos.x,
			r[3],r[4],r[5],pos.y,
			r[6],r[7],r[8],pos.z,
			0,0,0,1
		),false).t();
	}
	this.eyeL = {eye:"L"};
	this.eyeR = {eye:"R"};
	var r = this.camera3.rotation.toMatLR().array;
	_setEyeMatrix(this.eyeL,new Vec3(-this.eyeDistanceH,0,-this.eyeDistanceF),r);
	_setEyeMatrix(this.eyeR,new Vec3(this.eyeDistanceH,0,-this.eyeDistanceF),r);
	
	//CrossSection Rendering below:
	this._matProject = this.camera4.projectMat;
	this._matCamera = this.camera4.coordMat();
	
	var mt = 0.99/this.camera4.projectMat.ctg;
	var displayMode = this.wireFrameMode;
	this._setFboProgramUniform();
	for(var i = 0; i <= 1; i += this.thickness);
	while(i >= -1){
		gl.fboProgram.uniform["float flow"].set(this.thickness * this.flow*(i+1));
		this.renderCrossSection(new Vec4(0,0,1,mt*i),false,false);
		i -= this.thickness*Math.round(Math.abs(i)+1);
	}
	function renderThumbnail(vec3,angle,crossSection,viewport){
		var r = vec3.expQ(angle).toMatLR().array;
		_setEyeMatrix(_this.eyeL,new Vec3(-_this.eyeDistanceH,0,-_this.eyeDistanceF),r);
		_setEyeMatrix(_this.eyeR,new Vec3(_this.eyeDistanceH,0,-_this.eyeDistanceF),r);
		_this.renderCrossSection(crossSection,true,viewport);
		_this.viewportL();
	}
	this.wireFrameMode = false;
	if(this.enableThumbnail){
		gl.fboProgram.uniform["int displayMode"].set(0);
		renderThumbnail(new Vec3(0,0,1),0,new Vec4(0,0,1,0),this.LEFT_BOTTOM);
		renderThumbnail(new Vec3(1,0,0),Math.PI/2,new Vec4(0,1,0,0),this.RIGHT_UP);
		renderThumbnail(new Vec3(0,1,0),Math.PI/2,new Vec4(1,0,0,0),this.RIGHT_BOTTOM);
	}
	this.wireFrameMode = displayMode;
}

MCRTRenderer4.prototype._setFboProgramUniform = function(){
	var gl = this.gl;
	var matProject = this._matProject;
	gl.fboProgram.uniform["int chunk"].set(1);
	gl.fboProgram.uniform["int bloc"].set(0);
	gl.fboProgram.uniform["mat4 mCam4"].set(this._matCamera.t(false).array);
	gl.fboProgram.uniform["vec4 vCam4"].set([this.camera4.position.x,this.camera4.position.y,this.camera4.position.z,this.camera4.position.t]);
	gl.fboProgram.uniform["vec3 Camera4Proj"].set([matProject.ctg,matProject.mtt,matProject.mtw]);
	gl.fboProgram.uniform["float flow"].set(this.thickness * this.flow);
	gl.fboProgram.uniform["int renderDistance"].set(Math.floor(MCWorld.renderDistance));
	gl.fboProgram.uniform["vec4 dx4"].set([0,0,0,0]);
	gl.fboProgram.uniform["float ambientLight"].set(this.ambientLight);
	gl.fboProgram.uniform["float light_Density"].set(this.light4.len());
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
MCRTRenderer4.prototype.renderCrossSection = function(frustum,mode3d,thumbnail){
	var _this = this;
	this._viewportSection = this.viewport4.crossSection(0,frustum).flat();

	var gl = this.gl;
	var viewport4 = this._viewportSection;
	var dx4, eye4 = this.eyeDistance4;
	var m = this._matCamera.array;
	switch(thumbnail){
		case this.LEFT_BOTTOM:
		case this.RIGHT_UP:
			dx4 = new Vec4(m[0],m[4],m[8],m[12]).mul(eye4);
			break;
		case this.RIGHT_BOTTOM:
			dx4 = new Vec4(m[2],m[6],m[10],m[14]).mul(eye4);
			break;
	}
	gl.fboProgram.attribute["vec4 V"].bind(gl.VfboBuffer);
	gl.VfboBuffer.set(viewport4.v,true);
	gl.FfboBuffer.set(viewport4.f,true);
	if(!thumbnail){
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		//gl.fbolink2.use([gl.fboL],null);
		this.viewportL();
		gl.fboProgram.uniform["mat4 mCamera3"].set(this.eyeL.Mat.array);
		gl.drawFaces(gl.FfboBuffer);
		//gl.fbolink2.use([gl.fboR],null);
		this.viewportR();
		gl.fboProgram.uniform["mat4 mCamera3"].set(this.eyeR.Mat.array);
		gl.drawFaces(gl.FfboBuffer);
		gl.disable(gl.BLEND);
	}else{
		gl.disable(gl.DEPTH_TEST);
		var w = this.width/this.thumbSize;
		var h = this.height/this.thumbSize;
		var LEFT = 0, RIGHT = 10;
		function setViewport(gl,_this,thumbnail,LR){
			switch(thumbnail + LR){
				case _this.LEFT_BOTTOM + LEFT:
					gl.viewport(0, 0, w, h);
				break;
				case _this.LEFT_UP + LEFT:
					gl.viewport(0, _this.height-h, w, h);
				break;
				case _this.RIGHT_BOTTOM + LEFT:
					gl.viewport(_this.width-w, 0, w, h);
				break;
				case _this.RIGHT_UP + LEFT:
					gl.viewport(_this.width-w, _this.height-h, w, h);
				break;
				case _this.LEFT_BOTTOM + RIGHT:
					gl.viewport(_this.width, 0, w, h);
				break;
				case _this.LEFT_UP + RIGHT:
					gl.viewport(_this.width, _this.height-h, w, h);
				break;
				case _this.RIGHT_BOTTOM + RIGHT:
					gl.viewport(_this.width*2-w, 0, w, h);
				break;
				case _this.RIGHT_UP + RIGHT:
					gl.viewport(_this.width*2-w, _this.height-h, w, h);
				break;
				
			}
		}
		
		//gl.fbolink2.use([gl.fboL],null);
		setViewport(gl,this,thumbnail,LEFT);
		gl.fboProgram.uniform["vec4 dx4"].set(dx4.flat());
		gl.fboProgram.uniform["mat4 mCamera3"].set(this.eyeL.Mat.array);
		gl.drawFaces(gl.FfboBuffer);
		
		//gl.fbolink2.use([gl.fboR],null);
		setViewport(gl,this,thumbnail,RIGHT);
		gl.fboProgram.uniform["vec4 dx4"].set(dx4.sub().flat());
		gl.fboProgram.uniform["mat4 mCamera3"].set(this.eyeR.Mat.array);
		gl.drawFaces(gl.FfboBuffer);
		gl.enable(gl.DEPTH_TEST);
	}
	//gl.fbolink2.release();
	
}


		
