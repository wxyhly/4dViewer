var Controler4 = {};
Controler4.keepUp = function(renderer,hitTest){
	this.camera4 = renderer.camera4;
	this.camera3 = renderer.camera3;
	this.renderer = renderer;
	this.rotateMouseStep = 100;
	this.moveStep = 0.1;
	this.rotateKeyStep = 0.05;
	this.wheelDeltaStep = 5;
	this.thicknessStep = 0.1;
	this.retinaStep = 0.05;
	this.keyConfig = {
		left: "A".charCodeAt(0),
		right: "D".charCodeAt(0),
		up: 32,    //space
		down: 16,  //shift
		forward: "W".charCodeAt(0),
		back: "S".charCodeAt(0),
		sidefront: "Q".charCodeAt(0),
		sideback: "E".charCodeAt(0),
		rotate3dp: "Z".charCodeAt(0),
		rotate3dm: "X".charCodeAt(0),
		rotateleft: "J".charCodeAt(0),
		rotateright: "L".charCodeAt(0),
		rotateup: "I".charCodeAt(0),
		rotatedown: "K".charCodeAt(0),
		rotatefront: "U".charCodeAt(0),
		rotateback: "O".charCodeAt(0),
		layerm: 189,
		layerp: 187,
		retinaleft: 37,
		retinaright: 39,
		retinaup: 38,
		retinadown: 40
	};
	//camera4 rotation quanternions:
	this.planeRotation = [new Vec4(1,0,0,0),new Vec4(1,0,0,0)];
	this.verticalRotation = [new Vec4(1,0,0,0),new Vec4(1,0,0,0)];
	//and vertical angle:
	this.verticalDelta = 0;
	//camera3 rotation euler angle:
	this.rx3 = Math.PI/6;
	this.ry3 = Math.PI/8;
	this.hitTest = hitTest || (()=>false);
	this.needUpdate = true;
	var _this = this;
	this.keyPressed = {};
	document.addEventListener('keydown', function( ev ) {
		_this.keyPressed[ev.keyCode] = true;
	});
	document.addEventListener('keyup', function( ev ) {
		_this.keyPressed[ev.keyCode] = false;
	});
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
	document.addEventListener('click', function( ev ) {
		document.body.requestPointerLock();
	});
}
Controler4.keepUp.prototype._rotateHorizontal = function(x,y){
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
Controler4.keepUp.prototype.update = function(callback){
	var camera = this.camera4;
	//camera4 标架:
	var mat = this.planeRotation[0].toMatL().mul(this.planeRotation[1].toMatR());
	this.x = mat.mul(new Vec4(1,0,0,0));
	this.y = mat.mul(new Vec4(0,1,0,0));
	this.z = mat.mul(new Vec4(0,0,1,0));
	this.t = mat.mul(new Vec4(0,0,0,1));
	//8 directions:
	var step = this.moveStep;
	if(this.keyPressed[this.keyConfig.left]){
		this.tryMove(this.x.mul(-step,false));
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.right]){
		this.tryMove(this.x.mul(step,false));
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.forward]){
		this.tryMove(this.t.mul(step,false));
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.back]){
	this.tryMove(this.t.mul(-step,false));
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.sidefront]){
		this.tryMove(this.z.mul(-step,false));
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.sideback]){
		this.tryMove(this.z.mul(step,false));
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.up]){//space
		this.tryMove(this.y.mul(step,false));
		this.needUpdate = true;
	}else{
		if(this.walkmode || this.keyPressed[this.keyConfig.down]){//L shift
			this.tryMove(this.y.mul(-step,false));
			this.needUpdate = true;
		}
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
		if(this.ry3<Math.PI/3) this.ry3 += this.retinaStep;
		this.camera3.rotation = new Vec3(1,0,0).expQ(this.ry3).mul(new Vec3(0,1,0).expQ(this.rx3));
		this.needUpdate = true;
	}
	if(this.keyPressed[this.keyConfig.retinadown]){
		if(this.ry3>-Math.PI/3) this.ry3 -= this.retinaStep;
		this.camera3.rotation = new Vec3(1,0,0).expQ(this.ry3).mul(new Vec3(0,1,0).expQ(this.rx3));
		this.needUpdate = true;
	}
	if(this.needUpdate) {
		camera.rotation[0] = this.verticalRotation[0].mul(this.planeRotation[0],false);
		camera.rotation[1] = this.planeRotation[1].mul(this.verticalRotation[1],false);
		callback();//call renderer
	}
	this.needUpdate = false;
}
Controler4.keepUp.prototype.tryMove = function(movement){
	var eye = this.camera4.position.add(movement,false);
	var foot = eye.clone();
	foot.y -= 1.5; //height of the figure
	if((!this.hitTest(eye))&&(!this.hitTest(foot))){
		this.camera4.position.set(eye);
	}
}