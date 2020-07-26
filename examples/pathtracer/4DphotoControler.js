Controler4.PhotoView = function(renderer){
	Controler4.call(this,renderer);
	
	this.rotateMouseStep = 100;
	this.moveStep = 0.01;
	this.rotateKeyStep = 0.05;
	this.wheelDeltaStep = 5;
	this.retinaRotRangeX = Infinity;
    this.retinaRotRangeY = Math.PI/2;

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
	
	var _this = this;
	
	document.addEventListener('mousemove', function( ev ) {
		if(!!document.pointerLockElement){
			var x = ev.movementX;
			var y = ev.movementY;
			//_this._rotateHorizontal(x/_this.rotateMouseStep,y/_this.rotateMouseStep);
			_this.needUpdate = true;
		}
	});
	document.addEventListener('mousewheel', function( ev ) {
		if(!!document.pointerLockElement){
			var step = _this.wheelDeltaStep/180*Math.PI;
			_this.verticalDelta += ev.wheelDelta/120*step;
			//var yt = _this.y.cross(_this.t).mul(_this.verticalDelta);
			//_this.verticalRotation = yt.expQ();
			_this.needUpdate = true;
		}
	});
	document.addEventListener('mousedown', function( ev ) {
		//canvas onmousedown 在soor鼠标后就失效了，所以还要写document
		if(!!document.pointerLockElement){
			if(_this.onmousedown)_this.onmousedown(ev);
		}
	});
	this.canvas.addEventListener('click', function( ev ) {
		if(ev.button == 0){
			document.body.requestPointerLock();
		}
	});
}
Controler4.PhotoView.prototype = Object.create(Controler4.prototype);
Controler4.PhotoView.prototype.beforeUpdate = function(){
	var dtime = (this.dTime)/(1000/60); //60fps
	if(dtime>100)dtime = 1;//太卡了不会强制响应响应时间
	var camera = this.camera4;
	//8 directions:
    var step = Math.min(this.moveStep*dtime,1)*Math.exp(-camera.position.t);
    var X = new Vec3(1,0,0);
    var Y = new Vec3(0,1,0);
    var Z = new Vec3(0,0,1);
    var r = this.camera3.rotation.conj(false);
    this.x = r.mul(X);
    this.z = r.mul(Z);
    this.x.y = 0;
    this.z.y = 0;
    this.x.norm();
    this.z.norm();
    this.y = Y;
    this.t = camera.position.t;
    
	if(this.keyPressed[this.keyConfig.left]){
		camera.position.add(this.x.mul(-step,false));
	}
	if(this.keyPressed[this.keyConfig.right]){
		camera.position.add(this.x.mul(step,false));
	}
	if(this.keyPressed[this.keyConfig.sidefront]){
		camera.position.add(this.z.mul(-step,false));
	}
	if(this.keyPressed[this.keyConfig.sideback]){
		camera.position.add(this.z.mul(step,false));
	}
	if(this.keyPressed[this.keyConfig.up]){//space
		camera.position.add(this.y.mul(step,false));
	}else if(this.gravity || this.keyPressed[this.keyConfig.down]){//L shift
		camera.position.add(this.y.mul(-step,false));
    }
    camera.position.t = this.t;
    if(this.keyPressed[this.keyConfig.forward]){
		camera.position.t += Math.min(this.moveStep*dtime,1);
	}
	if(this.keyPressed[this.keyConfig.back]){
		camera.position.t -= Math.min(this.moveStep*dtime,1);
	}
}