var Controler4 = function(renderer){
	this.camera4 = renderer.camera4;
	this.camera3 = renderer.camera3;
	this.renderer = renderer;
	this.thicknessStep = 0.1;
	this.flowStep = 0.1;
	this.brightnessStep = 0.1;
	this.brightness = 1;
	this.retinaStep = 0.05;
	this.fov = this.camera4.fov;
	this.fovStep = 5;
	this.enableKey = true;
	//camera3 rotation euler angle:
	this.rx3 = Math.PI/6;
	this.ry3 = Math.PI/8;
	this.keyConfig = {
		wireFrame: "C".charCodeAt(0),
		darker: 188,  //,
		brighter: 190,//.
		flowm: 219,//[
		flowp: 221,//]
		thumbm: 186,//;
		thumbp: 222,//'
		layerm: 189,
		layerp: 187,
		retinaleft: 37,
		retinaright: 39,
		retinaup: 38,
		retinadown: 40,
		fovm:57,
		fovp:48
	}
	this.needUpdate = true;
	this.keyPressed = {};
	var _this = this;
	document.addEventListener('keydown', function( ev ) {
		//ev.preventDefault();
		_this.keyPressed[ev.keyCode] = true;
		if(_this.keyPressed[_this.keyConfig.wireFrame]){
			_this.renderer.wireFrameMode = !_this.renderer.wireFrameMode;
			_this.needUpdate = true;
		}
		if(_this.onkeydown) _this.onkeydown(ev);
	});
	document.addEventListener('keyup', function( ev ) {
		_this.keyPressed[ev.keyCode] = false;
		if(_this.onkeyup) _this.onkeyup(ev);
	});
	var canvas = _this.renderer.hudCanvas || _this.renderer.gl.canvas;
	this.canvas = canvas;
	canvas.addEventListener('contextmenu', function(ev) {
		ev.preventDefault();
	}, false);
	canvas.addEventListener('mousedown', function( ev ) {
		if(ev.button != 0){
			_this._dealTransparentColor(ev);
		}
		if(_this.onmousedown) _this.onmousedown(ev);
	});
}
Controler4.prototype._dealTransparentColor = function(ev){
	var gl = this.renderer.gl;
	if(this.keyPressed[18]){ //Alt + 1
		if(this.keyPressed[18])
		var pixels = new Uint8Array(4);
		this.renderer.render();
		this.needUpdate = true;
		gl.readPixels(ev.offsetX, this.renderer.height-ev.offsetY, 1,1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
		var key = this.keyPressed[49]?0:this.keyPressed[50]?1:this.keyPressed[51]?2:this.keyPressed[52]?3:-1;
		if(key<0){
			this.renderer.opaqueColors[0].color = 0x030201;
			this.renderer.opaqueColors[0].tolerance = 0;
			this.renderer.opaqueColors[1].color = 0x030201;
			this.renderer.opaqueColors[1].tolerance = 0;
			this.renderer.opaqueColors[2].color = 0x030201;
			this.renderer.opaqueColors[2].tolerance = 0;
			this.renderer.opaqueColors[3].color = 0x030201;
			this.renderer.opaqueColors[3].tolerance = 0;
		}else{
			this.renderer.opaqueColors[key].color = (pixels[0]<<16) + (pixels[1]<<8) + pixels[2];
			this.renderer.opaqueColors[key].tolerance = 5;
		}
	}
}
Controler4.prototype._dealRendererSettings = function(){
	//render layer number settings:
	if(this.keyPressed[this.keyConfig.layerm]){//moin
		if(this.renderer.thickness<1)
			this.renderer.thickness *= 1+this.thicknessStep;
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.layerp]){//plus
		if(this.renderer.thickness>0.01)
			this.renderer.thickness /= 1+this.thicknessStep;
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.flowm]){//moin
		if(this.renderer.flow>0.01)
			this.renderer.flow /= 1+this.flowStep;
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.flowp]){//plus
		if(this.renderer.flow<100)
			this.renderer.flow *= 1+this.flowStep;
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.thumbp]){//moin
		if(this.renderer.thumbSize>2)
			this.renderer.thumbSize /= 1+this.flowStep;
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.thumbm]){//plus
		if(this.renderer.thumbSize<20)
			this.renderer.thumbSize *= 1+this.flowStep;
		this.needUpdate = true;
	}
	//retina camera3 control:
	if(this.keyPressed[this.keyConfig.retinaleft]){
		if(this.rx3>-Math.PI/6) this.rx3 -= this.retinaStep;
		this.camera3.rotation = new Vec3(1,0,0).expQ(this.ry3).mul(new Vec3(0,1,0).expQ(this.rx3));
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.retinaright]){
		if(this.rx3<Math.PI/6) this.rx3 += this.retinaStep;
		this.camera3.rotation = new Vec3(1,0,0).expQ(this.ry3).mul(new Vec3(0,1,0).expQ(this.rx3));
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.retinaup]){
		if(this.ry3>-Math.PI/3) this.ry3 -= this.retinaStep;
		this.camera3.rotation = new Vec3(1,0,0).expQ(this.ry3).mul(new Vec3(0,1,0).expQ(this.rx3));
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.retinadown]){
		if(this.ry3<Math.PI/3) this.ry3 += this.retinaStep;
		this.camera3.rotation = new Vec3(1,0,0).expQ(this.ry3).mul(new Vec3(0,1,0).expQ(this.rx3));
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.darker]){
		this.brightness -= this.brightnessStep;
		if(this.brightness < 0) this.brightness = 0;
		this.renderer.bgColor3 = 0x010101 * Math.round(this.brightness*255);
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.brighter]){
		this.brightness += this.brightnessStep;
		if(this.brightness >1) this.brightness = 1;
		this.renderer.bgColor3 = 0x010101 * Math.round(this.brightness*255);
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.fovm]){
		if(this.fov>10) this.fov -= this.fovStep;
		this.camera4.setProjectMat4(this.fov);
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.fovp]){
		if(this.fov<170) this.fov += this.fovStep;
		this.camera4.setProjectMat4(this.fov);
		this.needUpdate = true;
	}
}
Controler4.prototype.update = function(callback){
	this.beforeUpdate();
	if(this.enableKey) this._dealRendererSettings();
	if(this.needUpdate && callback) {
		callback();//call renderer
	}
	if(this.gui){
		this.gui.updateDisplay();
	}
	this.needUpdate = false;
}
Controler4.prototype.addGUI = function(gui){
	var _this = this;
	this.gui = gui;
	var change = function(){_this.needUpdate = true};
	var renderer = this.renderer;
	var rend = gui.addFolder('Renderer');
	var trans = rend.addFolder('Transparency');
	trans.addColor(renderer.opaqueColors[0],"color").onChange(change);
	trans.add(renderer.opaqueColors[0],"tolerance").onChange(change);
	trans.addColor(renderer.opaqueColors[1],"color").onChange(change);
	trans.add(renderer.opaqueColors[1],"tolerance").onChange(change);
	trans.addColor(renderer.opaqueColors[2],"color").onChange(change);
	trans.add(renderer.opaqueColors[2],"tolerance").onChange(change);
	trans.addColor(renderer.opaqueColors[3],"color").onChange(change);
	trans.add(renderer.opaqueColors[3],"tolerance").onChange(change);
	rend.add(renderer,"thickness",0.01,1).onChange(change);
	rend.add(renderer,"flow",0,20).onChange(change);
	rend.add(renderer,"thumbSize",1.8,22).onChange(change);
	rend.add(renderer,"wireFrameMode").onChange(change);
	rend.addColor(renderer,"bgColor4").onChange(change);
	rend.addColor(renderer,"bgColor3").onChange(change);
	var cam4 = gui.addFolder('Camera4');
	cam4.add(this,"fov",10,170).onChange(function(fov){_this.camera4.setProjectMat4(fov);_this.needUpdate = true;});
}
Controler4.Trackball = function(renderer){
	Controler4.call(this,renderer);
	var _this = this;
	this.rotateMouseStep = 100;
	this.rotateKeyStep = 0.05;
	this.zoomStep = 0.02;
	this.button = false;
	this.center = new Vec4(0,0,0,0);
	this.damp = 0.3;
	//this.isDamping = false;
	this.resRot = new Bivec(0,0,0,0,0,0);
	this.resZoom = 0;
	this.camera4.lookAt(this.center);
	document.addEventListener('mousemove', function( ev ) {
		var x = ev.movementX/_this.rotateMouseStep;
		var y = ev.movementY/_this.rotateMouseStep;
		if(_this.button === 0){
			_this._rotateA_B(-x,y,_this.x.cross(_this.z),_this.y.cross(_this.z));
		}else if(_this.button === 2){
			_this._rotateA_B(-x,y,_this.x.cross(_this.t),_this.y.cross(_this.t));
		}else if(_this.button === 1){
			_this._rotateA_B(x,-y,_this.x.cross(_this.y),_this.z.cross(_this.t));
		}
	});
	this.canvas.addEventListener('mousedown', function( ev ) {
		_this.button = ev.button;
	});
	document.addEventListener('mouseup', function( ev ) {
		_this.button = -1;
	});
	document.addEventListener('mousewheel', function( ev ) {
		var step = -ev.wheelDelta/120*_this.zoomStep;
		_this._zoom(step);
		if(step!=0)
			_this.resZoom = step;
	});
	
}
Controler4.Trackball.prototype = Object.create(Controler4.prototype);
Controler4.Trackball.prototype.addGUI = function(gui){
	Controler4.prototype.addGUI.call(this,gui);
	var con = gui.addFolder("Control");
	con.add(this,"damp",0,1);
}
Controler4.Trackball.prototype._needDamping = function(){
	return this.resRot.len(false)>0.00001 || Math.abs(this.resZoom)>0.00001;
}
Controler4.Trackball.prototype._zoom = function(step){
	this.camera4.position.mul(1+step);
}
Controler4.Trackball.prototype._rotateA_B = function(x,y,A,B){
	var R = A.mul(x).add(B.mul(y));
	this._rotate(R);
}
Controler4.Trackball.prototype._rotate = function(Bivec){
	this.resRot = Bivec;
	var R = Bivec.expQ()
	this.camera4.rotate(R);
	this.camera4.position = R[0].mul(this.camera4.position,false).mul(R[1]);
	this.needUpdate = true;
}
Controler4.Trackball.prototype.beforeUpdate = function(){
	var mat = this.camera4.coordMat();
	
	this.x = mat.mul(new Vec4(1,0,0,0));
	this.y = mat.mul(new Vec4(0,1,0,0));
	this.z = mat.mul(new Vec4(0,0,1,0));
	this.t = mat.mul(new Vec4(0,0,0,1));
	if(this._needDamping()){
		this.resRot.div(1+this.damp);
		this.resZoom /= 1+this.damp;
		this._rotate(this.resRot);
		this._zoom(this.resZoom);
	}
}

Controler4.KeepUp = function(renderer,hitTest){
	Controler4.call(this,renderer);
	
	this.hitTest = hitTest || (()=>false);
	this.figure_height = 0.5; // used in hitTest
	this.figure_width = 0.2; // used in hitTest
	this.rotateMouseStep = 100;
	this.moveStep = 0.02;
	this.rotateKeyStep = 0.05;
	this.wheelDeltaStep = 5;
	
	this.keyConfig = Object.assign(this.keyConfig, {
		
		/* 8 move directions */
		
		left: "A".charCodeAt(0),
		right: "D".charCodeAt(0),
		up: 32,    //space
		down: 16,  //shift
		forward: "W".charCodeAt(0),
		back: "S".charCodeAt(0),
		sidefront: "Q".charCodeAt(0),
		sideback: "E".charCodeAt(0),
		
		/* 8 rotate directions (up direction preserved)*/
		
		rotate3dp: "Z".charCodeAt(0),
		rotate3dm: "X".charCodeAt(0),
		rotateleft: "J".charCodeAt(0),
		rotateright: "L".charCodeAt(0),
		rotateup: "I".charCodeAt(0),
		rotatedown: "K".charCodeAt(0),
		rotatefront: "U".charCodeAt(0),
		rotateback: "O".charCodeAt(0)
	});
	//camera4 rotation quanternions:
	this.updateCamera();
	//and vertical angle:
	
	var _this = this;
	
	document.addEventListener('mousemove', function( ev ) {
		if(!!document.pointerLockElement){
			var x = ev.movementX;
			var y = ev.movementY;
			_this._rotateHorizontal(x/_this.rotateMouseStep,y/_this.rotateMouseStep);
			_this.needUpdate = true;
		}
	});
	document.addEventListener('mousewheel', function( ev ) {
		if(!!document.pointerLockElement){
			var step = _this.wheelDeltaStep/180*Math.PI;
			_this.verticalDelta += ev.wheelDelta/120*step;
			var yt = _this.y.cross(_this.t).mul(_this.verticalDelta);
			_this.verticalRotation = yt.expQ();
			_this.needUpdate = true;
		}
	});
	this.canvas.addEventListener('click', function( ev ) {
		if(ev.button == 0){
			document.body.requestPointerLock();
		}
	});
}
Controler4.KeepUp.prototype = Object.create(Controler4.prototype);
Controler4.KeepUp.prototype.updateCamera = function(){
	var mat = this.camera4.coordMat();
	var x = mat.mul(new Vec4(1,0,0,0));
	var y = mat.mul(new Vec4(0,1,0,0));
	var t = mat.mul(new Vec4(0,0,0,1));
	this.verticalDelta = Math.asin(t.y/t.len());
	var hx = new Vec4(x.x,0,x.z,x.t).norm();
	var ht = new Vec4(t.x,0,t.z,t.t).norm();
	var R = new Vec4(0,0,0,1).cross(ht,false);
	var s = R.len();
	var c = ht.t; //Vec4(0,0,0,1) dot M
	if(Math.abs(s)>0.000001){
		R.mul(-Math.atan2(s,c)/s);
	}
	this.planeRotation = R.expQ();
	mat = this.planeRotation[0].toMatL().mul(this.planeRotation[1].toMatR());
	x = mat.mul(new Vec4(1,0,0,0));
	y = mat.mul(new Vec4(0,1,0,0));
	t = mat.mul(new Vec4(0,0,0,1));
	
	var R = x.cross(hx,false);
	var s = R.len();
	var c = hx.dot(x); //Vec4(0,0,0,1) dot M
	if(Math.abs(s)>0.000001){
		R.mul(-Math.atan2(s,c)/s);
	}
	R = R.expQ();
	this.planeRotation[0] = R[0].mul(this.planeRotation[0],false);
	this.planeRotation[1].mul(R[1]);
	
	this.verticalRotation = y.cross(t).mul(this.verticalDelta).expQ();
}
Controler4.KeepUp.prototype.addGUI = function(gui){
	Controler4.prototype.addGUI.call(this,gui);
	var con = gui.addFolder("Control");
	con.add(this,"moveStep");
}
Controler4.KeepUp.prototype._rotateHorizontal = function(x,y){
	var xt = this.x.cross(this.t).mul(x);
	var zt = this.z.cross(this.t).mul(y);
	var M = xt.add(zt).expQ();
	this.planeRotation[0] = M[0].mul(this.planeRotation[0]).norm();
	this.planeRotation[1] = this.planeRotation[1].mul(M[1]).norm();
	var mat = this.planeRotation[0].toMatL().mul(this.planeRotation[1].toMatR());
	this.y = mat.mul(new Vec4(0,1,0,0));
	this.t = mat.mul(new Vec4(0,0,0,1));
	var yt = this.y.cross(this.t).mul(this.verticalDelta);
	this.verticalRotation = yt.expQ();
}
Controler4.KeepUp.prototype.beforeUpdate = function(){
	var camera = this.camera4;
	//camera4 tetrad:
	var mat = this.planeRotation[0].toMatL().mul(this.planeRotation[1].toMatR());
	this.x = mat.mul(new Vec4(1,0,0,0));
	this.y = mat.mul(new Vec4(0,1,0,0));
	this.z = mat.mul(new Vec4(0,0,1,0));
	this.t = mat.mul(new Vec4(0,0,0,1));
	//8 directions:
	var step = this.moveStep;
	if(this.keyPressed[this.keyConfig.left]){
		this.tryMove(this.x.mul(-step,false));
	}
	if(this.keyPressed[this.keyConfig.right]){
		this.tryMove(this.x.mul(step,false));
	}
	if(this.keyPressed[this.keyConfig.forward]){
		this.tryMove(this.t.mul(step,false));
	}
	if(this.keyPressed[this.keyConfig.back]){
		this.tryMove(this.t.mul(-step,false));
	}
	if(this.keyPressed[this.keyConfig.sidefront]){
		this.tryMove(this.z.mul(-step,false));
	}
	if(this.keyPressed[this.keyConfig.sideback]){
		this.tryMove(this.z.mul(step,false));
	}
	if(this.keyPressed[this.keyConfig.up]){//space
		this.tryMove(this.y.mul(step,false));
	}else if(this.gravity || this.keyPressed[this.keyConfig.down]){//L shift
		this.tryMove(this.y.mul(-step,false),false);
	}
	//rotate (the same as mouse):
	if(this.keyPressed[this.keyConfig.rotateleft]){
		this._rotateHorizontal(-this.rotateKeyStep,0);
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.rotateright]){
		this._rotateHorizontal(this.rotateKeyStep,0);
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.rotatefront]){
		this._rotateHorizontal(0,-this.rotateKeyStep);
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.rotateback]){
		this._rotateHorizontal(0,this.rotateKeyStep);
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.rotateup]){
		this.verticalDelta += this.rotateKeyStep;
		var yt = this.y.cross(this.t).mul(this.verticalDelta);
		this.verticalRotation = yt.expQ();
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.rotatedown]){
		this.verticalDelta -= this.rotateKeyStep;
		var yt = this.y.cross(this.t).mul(this.verticalDelta);
		this.verticalRotation = yt.expQ();
		this.needUpdate = true;
	}
	//rotate 3d retina around y axis:
	if(this.keyPressed[this.keyConfig.rotate3dm]){
		var xz = this.x.cross(this.z).mul(this.rotateKeyStep);
		var M = xz.expQ();
		this.planeRotation[0] = M[0].mul(this.planeRotation[0]).norm();
		this.planeRotation[1] = this.planeRotation[1].mul(M[1]).norm();
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.rotate3dp]){
		var xz = this.x.cross(this.z).mul(-this.rotateKeyStep);
		var M = xz.expQ();
		this.planeRotation[0] = M[0].mul(this.planeRotation[0]).norm();
		this.planeRotation[1] = this.planeRotation[1].mul(M[1]).norm();
		this.needUpdate = true;
	}
	if(this.needUpdate){
		camera.rotation[0] = this.verticalRotation[0].mul(this.planeRotation[0],false);
		camera.rotation[1] = this.planeRotation[1].mul(this.verticalRotation[1],false);
	}
}
Controler4.KeepUp.prototype.tryMove = function(movement,climb){
	var eye = this.camera4.position.add(movement,false);
	var foot = eye.clone();
	var height = this.figure_height;
	var width = this.figure_width;
	var _this = this;
	var w = width/Math.sqrt(3);
	function test(eye){
		return (!_this.hitTest(eye))&&
			(!_this.hitTest(eye.sub(new Vec4(0,height,0,0),false)))&&
			
			(!_this.hitTest(eye.sub(new Vec4(w,height,w,w),false)))&&
			(!_this.hitTest(eye.sub(new Vec4(w,height,w,-w),false)))&&
			(!_this.hitTest(eye.sub(new Vec4(w,height,-w,w),false)))&&
			(!_this.hitTest(eye.sub(new Vec4(w,height,-w,-w),false)))&&
			(!_this.hitTest(eye.sub(new Vec4(-w,height,w,w),false)))&&
			(!_this.hitTest(eye.sub(new Vec4(-w,height,w,-w),false)))&&
			(!_this.hitTest(eye.sub(new Vec4(-w,height,-w,w),false)))&&
			(!_this.hitTest(eye.sub(new Vec4(-w,height,-w,-w),false)))&&
			
			(!_this.hitTest(eye.add(new Vec4(width,0,0,0),false)))&&
			(!_this.hitTest(eye.add(new Vec4(-width,0,0,0),false)))&&
			(!_this.hitTest(eye.add(new Vec4(0,0,width,0),false)))&&
			(!_this.hitTest(eye.add(new Vec4(0,0,-width,0),false)))&&
			(!_this.hitTest(eye.add(new Vec4(0,0,0,width),false)))&&
			(!_this.hitTest(eye.add(new Vec4(0,0,0,-width),false)));
	}
	if(test(eye)){
		this.camera4.position.set(eye);
		this.needUpdate = true;
	}else if(climb !== false){
		eye.y += this.moveStep*1.1;
		if(test(eye)){
			this.camera4.position.set(eye);
			this.needUpdate = true;
		}
	}
}