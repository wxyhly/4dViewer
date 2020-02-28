Controler4.MC = function(renderer,hitTest){
	Controler4.call(this,renderer);
	
	this.hitTest = hitTest || (()=>false);
	this.figure_height = 1.52; // used in hitTest
	this.figure_width = 0.25; // used in hitTest
	this.rotateMouseStep = 100;
	this.moveStep = 0.1;
	this.jumpHeight = 1;
	this.jumpStep = 1;
	this.rotateKeyStep = 0.05;
	this.wheelDeltaStep = 5;
	this.maxLineWidth = 0.5;
	this.needUpdate = true;//forvever
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
		rotateback: "O".charCodeAt(0),
		
		toggleHUD: "H".charCodeAt(0)
	});
	this.rendererPresets = [
		{
			thumbSize : 3.5,
			thickness : 0.15,
			resolution: 0.333
		},
		{
			thumbSize : 20,
			thickness : 0.025,
			resolution: 0.12
		},
		{
			thumbSize : 2,
			thickness : 1.08,
			resolution: 1
		},
	];
	
	//camera4 rotation quanternions:
	this.updateCamera();
	//and vertical angle:
	
	var _this = this;
	
	document.addEventListener('mousemove', function( ev ) {
		if(!!document.pointerLockElement){
			var x = ev.movementX;
			var y = ev.movementY;
			_this._rotateHorizontal(x/_this.rotateMouseStep,y/_this.rotateMouseStep);
			//_this.needUpdate = true;
		}
	});
	document.addEventListener('mousewheel', function( ev ) {
		if(!!document.pointerLockElement){
			var step = _this.wheelDeltaStep/180*Math.PI;
			_this.verticalDelta += ev.wheelDelta/120*step;
			var yt = _this.y.cross(_this.t).mul(_this.verticalDelta);
			_this.verticalRotation = yt.expQ();
			//_this.needUpdate = true;
		}
	});
	this.canvas.addEventListener('click', function( ev ) {
		if(ev.button == 0){
			document.body.requestPointerLock();
			if(HUD){ 
				HUD.togglePause(false);
				HUD.blur2Game();
			}
		}
	});
	this.canvas.style.zoom = 2;
}

Controler4.MC.prototype = Object.create(Controler4.prototype);

Controler4.MC.prototype.onresize = function(w){
	this.canvas.width = Math.round(w/2);
	this.canvas.height = Math.round(w/4);
	$("CMD").style.top = this.canvas.height*2 - 25;
	$("CMD").style.width = this.canvas.width*2;
}
Controler4.MC.prototype.updateCamera = function(){
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
Controler4.MC.prototype.onkeydown = function(ev){
	if(!this.enableKey)return 0;
	if(ev.keyCode=="N".charCodeAt(0) && HUD.block>1){
		HUD.block--;
	}
	if(ev.keyCode=="M".charCodeAt(0)){
		HUD.block++;
	}
	if(ev.keyCode=="P".charCodeAt(0)){
		HUD.togglePause();
	}
	if(ev.keyCode==this.keyConfig.toggleHUD){
		if(this.renderer.hudCanvas){
			this.renderer.hudCanvas.style.display = this.renderer.hudCanvas.style.display=="none"?"block":"none";
		}
	}
	//console.log(ev.keyCode)
	if(ev.keyCode==191){//"/"
		document.exitPointerLock();
		HUD.focusCMD("/");
	}
}
Controler4.MC.prototype.addGUI = function(gui){
	Controler4.prototype.addGUI.call(this,gui);
	var con = gui.addFolder("Control");
	con.add(this,"moveStep");
}
Controler4.MC.prototype._rotateHorizontal = function(x,y){
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
Controler4.MC.prototype.beforeUpdate = function(){
	var dtime = (this.dTime)/(1000/60); //60fps
	if(dtime>100)dtime = 1;//太卡了不会强制响应响应时间
	var camera = this.camera4;
	//camera4 tetrad:
	var mat = this.planeRotation[0].toMatL().mul(this.planeRotation[1].toMatR());
	this.x = mat.mul(new Vec4(1,0,0,0));
	this.y = mat.mul(new Vec4(0,1,0,0));
	this.z = mat.mul(new Vec4(0,0,1,0));
	this.t = mat.mul(new Vec4(0,0,0,1));
	//8 directions:
	var step = Math.min(this.moveStep*dtime,1);
	var rotateKeyStep = this.rotateKeyStep*dtime;
	if(this.enableKey){
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
		//rotate (the same as mouse):
		if(this.keyPressed[this.keyConfig.rotateleft]){
			this._rotateHorizontal(-rotateKeyStep,0);
		}
		if(this.keyPressed[this.keyConfig.rotateright]){
			this._rotateHorizontal(rotateKeyStep,0);
		}
		if(this.keyPressed[this.keyConfig.rotatefront]){
			this._rotateHorizontal(0,-rotateKeyStep);
		}
		if(this.keyPressed[this.keyConfig.rotateback]){
			this._rotateHorizontal(0,rotateKeyStep);
		}
		if(this.keyPressed[this.keyConfig.rotateup]){
			this.verticalDelta += this.rotateKeyStep;
			var yt = this.y.cross(this.t).mul(this.verticalDelta);
			this.verticalRotation = yt.expQ();
		}
		if(this.keyPressed[this.keyConfig.rotatedown]){
			this.verticalDelta -= this.rotateKeyStep;
			var yt = this.y.cross(this.t).mul(this.verticalDelta);
			this.verticalRotation = yt.expQ();
		}
		//rotate 3d retina around y axis:
		if(this.keyPressed[this.keyConfig.rotate3dm]){
			var xz = this.x.cross(this.z).mul(rotateKeyStep);
			var M = xz.expQ();
			this.planeRotation[0] = M[0].mul(this.planeRotation[0]).norm();
			this.planeRotation[1] = this.planeRotation[1].mul(M[1]).norm();
		}
		if(this.keyPressed[this.keyConfig.rotate3dp]){
			var xz = this.x.cross(this.z).mul(-rotateKeyStep);
			var M = xz.expQ();
			this.planeRotation[0] = M[0].mul(this.planeRotation[0]).norm();
			this.planeRotation[1] = this.planeRotation[1].mul(M[1]).norm();
		}
	}
	if(this.keyPressed[this.keyConfig.up]&&this.enableKey){//space
		this.tryMove(this.y.mul(step,false));
	}else if(this.gravity || this.keyPressed[this.keyConfig.down]){//L shift
		this.tryMove(this.y.mul(-step,false),false);
	}
	if((this.keyPressed[16]||this.keyPressed[17]||this.keyPressed[18])&&this.enableKey){//Ctrl or shift or Alt
		var preset = -1;
		
		if(this.keyPressed[49]){//1
			preset = 0;
		}else if(this.keyPressed[50]){//1
			preset = 1;
		}else if(this.keyPressed[51]){//1
			preset = 2;
		}
		if(preset>=0){
			var p = this.rendererPresets[preset];
			this.renderer.thumbSize = p.thumbSize;
			this.renderer.thickness = p.thickness;
			this.renderer.setResolution(p.resolution);
		}
	}
	
	camera.rotation[0] = this.verticalRotation[0].mul(this.planeRotation[0],false);
	camera.rotation[1] = this.planeRotation[1].mul(this.verticalRotation[1],false);

}
Controler4.MC.prototype.tryMove = function(movement,climb){
	var eye = this.camera4.position.add(movement,false);
	var foot = eye.clone();
	var height = this.figure_height;
	var width = this.figure_width;
	var _this = this;
	var w = width/Math.sqrt(3);
	function isUnstuck(eye){
		return (!_this.hitTest(eye))&&
			(!_this.hitTest(eye.sub(new Vec4(0,height,0,0),false)))&&
			(!_this.hitTest(eye.sub(new Vec4(0,height/2,0,0),false)))&&
			
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
	if(isUnstuck(eye)){
		this.camera4.position.set(eye);
	}else if(climb !== false && !_this.hitTest(eye)){//确保头上没方块时可以自动上爬
		var newE = eye.clone();
		newE.y += this.jumpStep;
		if(isUnstuck(newE)){
			this.camera4.position.set(newE);
		}
	}
}
