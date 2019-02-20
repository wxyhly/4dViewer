/**
require math.js;
require shape.js;
require webgl.js;

reserved:
	Scene, Camera3, Camera4, Renderer4
**/
'use strict';

Mesh4.prototype.update = function(){
	this.getNormal();
	this.getBoundingObjs();
}
Mesh4.prototype.inFrustum = function(renderer,camera,gg){
	var border = 1/camera.projectMat.ctg;
	var f1 = renderer.__getGeomFrustum(gg,renderer.__getWorldFrustum(camera,new Vec4(1,0,0,border)));
	var f2 = renderer.__getGeomFrustum(gg,renderer.__getWorldFrustum(camera,new Vec4(1,0,0,-border)));
	var f3 = renderer.__getGeomFrustum(gg,renderer.__getWorldFrustum(camera,new Vec4(0,1,0,border)));
	var f4 = renderer.__getGeomFrustum(gg,renderer.__getWorldFrustum(camera,new Vec4(0,1,0,-border)));
	var f5 = renderer.__getGeomFrustum(gg,renderer.__getWorldFrustum(camera,new Vec4(0,0,1,border)));
	var f6 = renderer.__getGeomFrustum(gg,renderer.__getWorldFrustum(camera,new Vec4(0,0,1,-border)));
	if(this.intersectBoundingObj(f1)==-1)return false;
	if(this.intersectBoundingObj(f2)==1)return false;
	if(this.intersectBoundingObj(f3)==-1)return false;
	if(this.intersectBoundingObj(f4)==1)return false;
	if(this.intersectBoundingObj(f5)==-1)return false;
	if(this.intersectBoundingObj(f6)==1)return false;
	return true;
}
Mesh4.prototype.intersectBoundingObj = function(plane){
	var min, max;
	var box = this.boundingBox;
	if ( plane.n.x > 0 ) {
		min = plane.n.x * box.min.x;
		max = plane.n.x * box.max.x;
	} else {
		min = plane.n.x * box.max.x;
		max = plane.n.x * box.min.x;
	}
	if ( plane.n.y > 0 ) {
		min += plane.n.y * box.min.y;
		max += plane.n.y * box.max.y;
	} else {
		min += plane.n.y * box.max.y;
		max += plane.n.y * box.min.y;
	}
	if ( plane.n.z > 0 ) {
		min += plane.n.z * box.min.z;
		max += plane.n.z * box.max.z;
	} else {
		min += plane.n.z * box.max.z;
		max += plane.n.z * box.min.z;
	}
	if ( plane.n.t > 0 ) {
		min += plane.n.t * box.min.t;
		max += plane.n.t * box.max.t;
	} else {
		min += plane.n.t * box.max.t;
		max += plane.n.t * box.min.t;
	}
	if ( min <= plane.t && max >= plane.t ){
		return 0;
	}
	if ( min <= plane.t && max <= plane.t ){
		return -1;
	}
	if ( min >= plane.t && max >= plane.t ){
		return 1;
	}
}
Mesh4.prototype.getNormal = function(){
	for(var e of this.E){
		e._center2 = this.V[e[0]].add(this.V[e[1]],false);
	}
	for(var f of this.F){
		var sum = f.length;
		var O = new Vec4(0,0,0,0);
		for(var i=0; i<sum; i++){
			var e = this.E[f[i]];
			O.add(e._center2);
		}
		f.center = O.div(sum<<1);//before edge center is mul by 2
	}
	for(var c of this.C){
		c.info = c.info || {};
		if(c.info.glow){ c.info.normal = new Vec4(0,0,0,0); continue;}//frag shader will recognise null vec as glow obj
		var sum = 0;
		var O = new Vec4(0,0,0,0);
		var centers = [];
		for(var i=0; i<c.length; i++){
			var f = this.F[c[i]];
			O.add(f.center);
			centers.push(f.center);
		}
		var cn = Mesh4._util.calNorm4FromPoints(centers);
		if(!cn){
			continue;
		}
		c.info.normal = cn;
	}
}
Mesh4.prototype.getBoundingObjs = function(){
	var min = new Vec4(Infinity,Infinity,Infinity,Infinity);
	var max = new Vec4(-Infinity,-Infinity,-Infinity,-Infinity);
	var O = new Vec4();
	for(var v of this.V){
		min.x = Math.min(min.x,v.x);
		min.y = Math.min(min.y,v.y);
		min.z = Math.min(min.z,v.z);
		min.t = Math.min(min.t,v.t);
		max.x = Math.max(max.x,v.x);
		max.y = Math.max(max.y,v.y);
		max.z = Math.max(max.z,v.z);
		max.t = Math.max(max.t,v.t);
		O.add(v);
	}
	O.div(this.V.length);
	var r = 0;
	for(var v of this.V){
		r = Math.max(r,v.sub(O,false).len(false));
	}
	this.boundingBox = {min:min, max:max};
	this.boundingSphere = {center:O, radius:r};
}

var Scene = function(){
	this.child = [];
}
Scene.prototype.add = function(s){
	this.child.push(s);
	if(s.mesh) s.mesh.update();
}
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

var Renderer4 = function(ctxt,scene4,camera4,light4,camera3){
	this.gl = ctxt;
	ctxt.canvas.style.backgroundColor = "#000000";//bgcolor must be black to avoid alpha transparency bug
	this.scene4 = scene4;
	this.camera4 = camera4;
	this.camera3 = camera3 || new Camera3(15,1,20);//don't use position infomation, it's decided par eyeDistanceF/H;
	this.camera3.rotation = new Vec3(1,0,0).expQ(Math.PI/8).mul(new Vec3(0,1,0).expQ(Math.PI/6));
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
	this.eyeDistanceH = 0.5;
	this.eyeDistance4 = 0.15;
	this.thickness = 0.08;
	this.thumbSize = 3;
	this.flow = 1.0;
	this.wireFrameMode = false;
	this.width = this.gl.canvas.width>>1;
	this.height = this.gl.canvas.height;
	this.aspect = this.width/this.height;
	this.center = new Vec2(this.width/2,this.height/2);
	this._initGL(this.gl);
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
Renderer4.ShaderProgram = {
	cross4D: {
		F: `
		precision highp float;
		varying vec3 vcolor;
		uniform int vertice;
		void main(void) {
			if(vertice==0){
				gl_FragColor=vec4(1.0,0.0,0.0,0.5);
			}else{
				gl_FragColor=vec4(vcolor,1.0);
			}
		}
		`,
		V: `
		attribute vec4 V, N;
		attribute vec3 color;
		varying vec3 vcolor;
		uniform mat4 mCamera3;
		uniform mat4 mModel; uniform vec4 vModel;
		uniform mat4 mCam4; uniform vec4 vCam4;
		uniform vec4 light;
		uniform float ambientLight;
		uniform vec3 Camera4Proj;
		void main(void) {
			//V est model coord, V0 est camera coord, v est coord after projection
			vec4 V0 = mCam4*(mModel*V + vModel - vCam4);
			vec4 v = vec4(V0.xyz*Camera4Proj.x,V0.w*Camera4Proj.y+Camera4Proj.z);
			float Vt = -V0.w;
			gl_PointSize = clamp(-10.0/Vt,1.5,10.0);
			//vec5(v,vt) est gl_Position4
			vec4 pos = mCamera3*vec4(v.xyz,-Vt);
			//drop vw, and get gl_Position3
			gl_Position = vec4(pos.x , pos.y, -0.2, pos.w);
			
			float angleCos = 1.0;
			vec4 wN = mModel*N;
			if(dot(mModel*V + vModel - vCam4,wN)<0.0){
				wN = -wN;
			}
			if(length(N) > 0.1){
				angleCos = dot(wN,light);
			}
			if(angleCos > 0.0){
				vcolor = color*clamp(angleCos + (1.0 - angleCos)*ambientLight,ambientLight,1.0); //Front
			}else{
				vcolor = color*clamp(-angleCos*0.3 + (1.0 + angleCos*0.3)*ambientLight,ambientLight,1.0); //Behind
			}
		}
		`,
		attribute:{
			"vec4 V":{},
			"vec4 N":{},
			"vec3 color":{}
		},
		uniform:{
			"mat4 mCamera3":{},
			"vec3 Camera4Proj":{},//vec3(ctg,mtt,mtw)
			"vec4 vModel":{},"mat4 mModel":{},//PMat5 Model
			"vec4 vCam4":{},"mat4 mCam4":{},//PMat5 Cam4
			"vec4 light":{},
			"float ambientLight":{},
			"int vertice":{}//wireFrameMode 0 or 1
		}
	},
	fbo4D: {
		F: `
		precision highp float;
		varying vec4 coord;
		uniform sampler2D texture0;
		uniform float flow;
		uniform vec4 oC0;
		uniform vec4 oC1;
		uniform vec4 oC2;
		uniform vec4 oC3;
		float opacity(vec3 cc){
			return 1.0
				- clamp(1.0-distance(oC0.rgb, cc)*oC0.a,0.0,1.0)*0.99
				- clamp(1.0-distance(oC1.rgb, cc)*oC1.a,0.0,1.0)*0.99
				- clamp(1.0-distance(oC2.rgb, cc)*oC2.a,0.0,1.0)*0.99
				- clamp(1.0-distance(oC3.rgb, cc)*oC3.a,0.0,1.0)*0.99;
		}
		void main(void) {
			vec4 color1 = texture2D(texture0, coord.xy/coord.w/2.0+vec2(0.5,0.5));
			if((abs(coord.x)<0.05 || abs(coord.y)<0.05 || abs(coord.z)<0.05)
				&&(abs(coord.x)<0.5 && abs(coord.y)<0.5)){
				gl_FragColor=vec4(vec3(1.0,1.0,1.0)-color1.rgb,1.0);
			}else if(color1.a<0.9){
				gl_FragColor=vec4(color1.rgb,1.0);
			}else{
				gl_FragColor=vec4(color1.rgb,clamp(flow*opacity(color1.rgb),0.0,1.0));
			}
		}
		`,
		V: `
		attribute vec4 V;
		varying vec4 coord;
		uniform mat4 mCamera3;
		uniform vec3 Camera4Proj;
		void main(void) {
			vec4 v = vec4(V.xyz*Camera4Proj.x,V.w*Camera4Proj.y+Camera4Proj.z);
			vec4 pos = mCamera3*vec4(v.xyz,1.0);
			coord = vec4(pos.x,pos.yzw); 
			gl_Position = coord;
		}
		`,
		attribute:{
			"vec4 V":{}
		},
		uniform:{
			"mat4 mCamera3":{},
			"vec3 Camera4Proj":{},//vec3(ctg,mtt,mtw)
			"float flow":{},//opacity per layer
			"vec4 oC0":{},//opaqueColor
			"vec4 oC1":{},//opaqueColor
			"vec4 oC2":{},//opaqueColor
			"vec4 oC3":{}//opaqueColor
		}
	}
}

Renderer4.prototype._initGL = function(gl){
	Webgl(gl);
	gl.enable(gl.DEPTH_TEST);
	gl.viewport(0, 0, this.width, this.height);
	
	gl.crossProgram = new Webgl.ShaderProgram(gl,Renderer4.ShaderProgram.cross4D);
	gl.crossProgram.use();
	gl.crossProgram.uniform["vec4 light"].set(this.light4.flat());
	gl.crossProgram.uniform["float ambientLight"].set(0.5);
	gl.VBuffer = new Webgl.ArrayBuffer(gl);
	gl.NBuffer = new Webgl.ArrayBuffer(gl);
	gl.CBuffer = new Webgl.ArrayBuffer(gl);
	gl.crossProgram.attribute["vec4 V"].bind(gl.VBuffer);
	gl.crossProgram.attribute["vec4 N"].bind(gl.NBuffer);
	gl.crossProgram.attribute["vec3 color"].bind(gl.CBuffer);
	gl.FBuffer = new Webgl.ElementBuffer(gl);
	
	gl.fboProgram = new Webgl.ShaderProgram(gl,Renderer4.ShaderProgram.fbo4D);
	gl.VfboBuffer = new Webgl.ArrayBuffer(gl);
	gl.FfboBuffer = new Webgl.ElementBuffer(gl);
	
	gl.fboL = gl.addFBO(this.width,this.height);
	gl.fboR = gl.addFBO(this.width,this.height);
	gl.fbolink1 = gl.addFBOLink(gl.crossProgram.program,0);
	gl.fbolink2 = gl.addFBOLink(gl.fboProgram.program,1);
	//enumerations of viewport:
	this.LEFT_BOTTOM = 4 ;
	this.LEFT_UP = 1;
	this.RIGHT_BOTTOM = 2;
	this.RIGHT_UP = 3;
}

Renderer4.prototype.viewportL = function(){
	this.gl.viewport(0, 0, this.width, this.height);
}
Renderer4.prototype.viewportR = function(){
	this.gl.viewport(this.width, 0, this.width, this.height);
}
Renderer4.prototype.clearColor = function(c){
	this.gl.clearColor((c >> 16)/256,(c>> 8 & 0xFF)/256,(c & 0xFF)/256, 1.0);
	this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
}
Renderer4.prototype.render = function(){
	var _this = this;
	//3d Settings below:
	var gl = this.gl;
	this.clearColor(this.bgColor3);
	//prepare 3d viewport
	this.viewport4 = Mesh3.cube(2/this.camera4.projectMat.ctg).embed(true).move(new Vec4(0,0,0,1));
	
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
	
	var oc = this.opaqueColors;
	this._opaqueColor = [
		[(oc[0].color>> 16)/256,(oc[0].color>>8 & 0xFF)/256,(oc[0].color & 0xFF)/256, oc[0].tolerance||1e10],
		[(oc[1].color>> 16)/256,(oc[1].color>>8 & 0xFF)/256,(oc[1].color & 0xFF)/256, oc[1].tolerance||1e10],
		[(oc[2].color>> 16)/256,(oc[2].color>>8 & 0xFF)/256,(oc[2].color & 0xFF)/256, oc[2].tolerance||1e10],
		[(oc[3].color>> 16)/256,(oc[3].color>>8 & 0xFF)/256,(oc[3].color & 0xFF)/256, oc[3].tolerance||1e10]
	];
	
	//CrossSection Rendering below:
	this._Meshbuffer = [];
	this._matProject = this.camera4.projectMat;
	this._matCamera = this.camera4.coordMat();
	
	var mt = 0.99/this.camera4.projectMat.ctg;
	if(this.thickness>=1){
		this.renderCrossSection(new Vec4(0,0,1,mt*i),true,false);
	}else{
		for(var i = 0; i <= 1; i += this.thickness);
		while(i >= -1){
			this.renderCrossSection(new Vec4(0,0,1,mt*i),false,false);
			i -= this.thickness;
		}
	}
	function renderThumbnail(vec3,angle,crossSection,viewport){
		var r = vec3.expQ(angle).toMatLR().array;
		_setEyeMatrix(_this.eyeL,new Vec3(-_this.eyeDistanceH,0,-_this.eyeDistanceF),r);
		_setEyeMatrix(_this.eyeR,new Vec3(_this.eyeDistanceH,0,-_this.eyeDistanceF),r);
		_this.renderCrossSection(crossSection,true,viewport);
		_this.viewportL();
	}
	if(this.enableThumbnail){
		renderThumbnail(new Vec3(0,0,1),0,new Vec4(0,0,1,0),this.LEFT_BOTTOM);
		renderThumbnail(new Vec3(1,0,0),Math.PI/2,new Vec4(0,1,0,0),this.RIGHT_UP);
		renderThumbnail(new Vec3(0,1,0),Math.PI/2,new Vec4(1,0,0,0),this.RIGHT_BOTTOM);
	}
}
Renderer4.prototype._setCrossProgramUniform = function(){
	var gl = this.gl;
	var matProject = this._matProject;
	gl.crossProgram.uniform["vec3 Camera4Proj"].set([matProject.ctg,matProject.mtt,matProject.mtw]);
	gl.crossProgram.uniform["mat4 mCam4"].set(this._matCamera.array);
	gl.crossProgram.uniform["float ambientLight"].set(this.ambientLight);
	gl.crossProgram.uniform["vec4 light"].set(this.light4.flat());
}
Renderer4.prototype._setFboProgramUniform = function(){
	var gl = this.gl;
	var matProject = this._matProject;
	gl.fboProgram.uniform["vec3 Camera4Proj"].set([matProject.ctg,matProject.mtt,matProject.mtw]);
	gl.fboProgram.uniform["float flow"].set(this.thickness * this.flow);
	gl.fboProgram.uniform["vec4 oC0"].set(this._opaqueColor[0]);
	gl.fboProgram.uniform["vec4 oC1"].set(this._opaqueColor[1]);
	gl.fboProgram.uniform["vec4 oC2"].set(this._opaqueColor[2]);
	gl.fboProgram.uniform["vec4 oC3"].set(this._opaqueColor[3]);
}
Renderer4.prototype.renderCrossSection = function(frustum,mode3d,thumbnail){
	var _this = this;
	this._Meshbuffer.length = 0;
	var wF = this.__getWorldFrustum(this.camera4, frustum);
	for(var gg of this.scene4.child){
		findCrossSection(gg,wF);
	}
	function findCrossSection(gg, wF){
		if(gg.visible == false) return false;
		if (gg instanceof Array){
			for(var g of gg){
				findCrossSection(g, wF);//recursive here
			}
		}else{
			var gF = _this.__getGeomFrustum(gg,wF); //from world to geom coordinate
			if (gg.mesh.intersectBoundingObj(gF)!=0) return false;
			if (!gg.mesh.inFrustum(_this,_this.camera4,gg)) return false;
			//return false;
			gg.__renderMeshbuffer = gg.__renderMeshbuffer || {changed: true, geom4: gg};
			var M = generateCrossSection(gg,gF.n,gF.t,gg.__renderMeshbuffer);
			if(M.v.length){
				_this._Meshbuffer.push(M);
			}
		}
	}
	function generateCrossSection(gg,n,t,RMB){
		var M = gg.mesh;
		//var d = performance.now();
		var V = RMB.V = RMB.V || new Array(M.V.length);
		var E = RMB.E = RMB.E || new Array(M.E.length);
		var F = RMB.F = RMB.F || new Array(M.F.length);
		var changed = RMB.changed;
		for(var i=0; i<M.V.length; i++){
			var newV = M.V[i].x*n.x+M.V[i].y*n.y+M.V[i].z*n.z+M.V[i].t*n.t - t;
			if(!changed && (V[i]<0 ^ newV<0)) changed = true;
			V[i] = newV;
		}
		var MVlen = 0;
		RMB.changed = changed;
		/* 	M is the raw Mesh4 in the scene
			MB is the Mesh4 cut by the plane
			RMB is the mesh array that can be sent to GL, structure:
				v, n, c, f: own data
				MB: storage of MB
				V: storage of V
				changed: wether the storage is useful
		*/
		var MB = RMB.MB;
		if(changed){
			MB = RMB.MB = new Mesh4();
		}
		//console.log("V: "+(performance.now()-d));d = performance.now();
		for(var i=0; i<M.E.length; i++){
			var a = M.E[i][0],
				b = M.E[i][1];
			if(!(V[a]<0 ^ V[b]<0)){
				E[i] = -1;
				continue;
			}
			var A = M.V[a],
				B = M.V[b];
			var BAx = B.x - A.x,
				BAy = B.y - A.y,
				BAz = B.z - A.z,
				BAt = B.t - A.t,
				k = V[a]/(V[b] - V[a]);
			MB.V[MVlen] = new Vec4(A.x - BAx*k, A.y - BAy*k, A.z - BAz*k, A.t - BAt*k);
			E[i] = MVlen++;
			// A - ((A-P).N) (B-A) / ((B-A).N)
		}
		//console.log("E: "+(performance.now()-d));d = performance.now();
		if(changed){
			
			var MElen = 0;
			var Flen = 0;
			for(var f of M.F){
				var count = 0;
				var A, B;
				for(var a of f){
					var Ea = E[a];
					if(Ea!=-1){
						if(count==0)A = Ea;
						if(count==1)B = Ea;
						if(++count>2)break;
					}
				}
				if(count!=2){
					F[Flen++] = -1;
					continue;
				}
				F[Flen++] = MElen++;
				MB.E.push([A,B]);
			}
			//console.log("F: "+(performance.now()-d));d = performance.now();
			for(var c of M.C){
				var arr = [];
				for(var a of c){
					var Fa = F[a];
					if(Fa>=0) arr.push(Fa);
				}
				if(c.info){
					arr.info = c.info;//record infos comme color, normal
				}
				if(arr.length>=3){
					MB.F.push(arr);
				}
			}
			//console.log("C: "+(performance.now()-d));d = performance.now();
		}
		var v = RMB.v = [],
			f = RMB.f,
			n = RMB.n,
			c = RMB.c;
		if(changed){
			f = RMB.f = [];
			n = RMB.n = [];
			c = RMB.c = [];
			for(var mf of MB.F){
				var mfv = [];
				for(var i=1; i<mf.length; i++){
					var a = MB.E[mf[i]][0],
						b = MB.E[mf[i]][1];
					mfv.push(a,b);
				}
				mfv = Mesh4._util.uniqueArr(mfv);// all vertices of face F[j]
				var N;
				if(gg.glow){
					N = new Vec4();
				}else if(mf.info) N = mf.info.normal;//Normalement on a calculé N in crossSection from cell
				N = N || new Vec4(1,0,0,0);
				var Ccolor = (typeof mf.info.color=="number") ? mf.info.color : gg.color;
				var colorR = (Ccolor >> 16)/256;
				var colorG = (Ccolor >> 8 & 0xFF)/256;
				var colorB = (Ccolor & 0xFF)/256;
				var va = v.length >> 2;
				var mfvl = mfv.length;
				for(var i=0; i<mfvl; i++){
					var vp = MB.V[mfv[i]];//for each vertex vp of mf
					var mfi = mf[i];
					v.push(vp.x,vp.y,vp.z,vp.t);
					n.push(N.x,N.y,N.z,N.t);
					c.push(colorR,colorG,colorB);
					if(mfi>=0){
						var a = mfv.indexOf(MB.E[mfi][0]),
							b = mfv.indexOf(MB.E[mfi][1]);
						if(a && b) f.push(a+va,b+va,0+va);
					}
				}
				mf.v = mfv;
			}
		} else {
			for(var mf of MB.F){
				for(var i of mf.v){
					var vp = MB.V[i];//for each vertex vp of F[j]
					v.push(vp.x,vp.y,vp.z,vp.t);
				}
			}
		}
		//console.log("M: "+(performance.now()-d));d = performance.now();
		return RMB;
	}
	this._viewportSection = this.viewport4.crossSection(0,frustum).flat();
	this._renderMeshbuffer(mode3d,thumbnail);
}
Renderer4.prototype.__getWorldFrustum = function(camera, frustum){//camera's frustum is a plane with {n:frustum, t:0}
	var R = camera.rotation;
	var n = R[0].mul(frustum,false).mul(R[1]);
	var t = camera.position.dot(n);
	return {n:n, t:t};
}
Renderer4.prototype.__getGeomFrustum = function(geom,worldFrustum){
	var pm = PMat5Q.prototype.inv.call(geom,false);
	var n = pm.rotation[0].mul(worldFrustum.n,false).mul(pm.rotation[1]);
	var t = worldFrustum.t + pm.position.dot(n);
	return {n:n, t:t};
}
Renderer4.prototype._renderMeshbuffer = function(mode3d,thumbnail){
	var gl = this.gl;
	var viewport4 = this._viewportSection;
	gl.crossProgram.use();
	this._setCrossProgramUniform();
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
	gl.fbolink1.use([],gl.fboL);
	this.clearColor(this.bgColor4);
	gl.fbolink1.use([],gl.fboR);
	this.clearColor(this.bgColor4);
	for(var G of this._Meshbuffer){
		gl.crossProgram.uniform["mat4 mModel"].set(G.geom4.coordMat().t().array);
		gl.crossProgram.uniform["vec4 vModel"].set(G.geom4.position.flat());
		gl.crossProgram.attribute["vec4 V"].bind(gl.VBuffer);
		gl.VBuffer.set(G.v,true);
		if(G.changed){
			gl.crossProgram.attribute["vec4 N"].bind(gl.NBuffer);
			gl.crossProgram.attribute["vec3 color"].bind(gl.CBuffer);
			gl.FBuffer.set(G.f,true);
			gl.NBuffer.set(G.n,true);
			gl.CBuffer.set(G.c,true);
		}
		gl.fbolink1.use([],gl.fboL);
		this.viewportL();
		if(thumbnail){
			gl.crossProgram.uniform["vec4 vCam4"].set(this.camera4.position.add(dx4,false).flat());
		}else{
			gl.crossProgram.uniform["vec4 vCam4"].set(this.camera4.position.flat());
		}
		gl.crossProgram.uniform["int vertice"].set(1);
		gl.crossProgram.uniform["mat4 mCamera3"].set(this.eyeL.Mat.array);
		gl.drawFaces(gl.FBuffer);
		if(this.wireFrameMode){
			gl.crossProgram.uniform["int vertice"].set(0);
			gl.drawPoints(gl.FBuffer);
		}
		gl.fbolink1.use([],gl.fboR);
		this.viewportL();//not R, because is in the fbo
		if(thumbnail){
			gl.crossProgram.uniform["vec4 vCam4"].set(this.camera4.position.sub(dx4,false).flat());
		}else{
			gl.crossProgram.uniform["vec4 vCam4"].set(this.camera4.position.flat());
		}
		gl.crossProgram.uniform["int vertice"].set(1);
		gl.crossProgram.uniform["mat4 mCamera3"].set(this.eyeR.Mat.array);
		gl.drawFaces(gl.FBuffer);
		if(this.wireFrameMode){
			gl.crossProgram.uniform["int vertice"].set(0);
			gl.drawPoints(gl.FBuffer);
		}
	}
	gl.fboProgram.use();
	this._setFboProgramUniform();
	gl.fboProgram.attribute["vec4 V"].bind(gl.VfboBuffer);
	gl.VfboBuffer.set(viewport4.v,true);
	gl.FfboBuffer.set(viewport4.f,true);
	if(!thumbnail){
		gl.enable(gl.BLEND);
		gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
		gl.fbolink2.use([gl.fboL],null);
		this.viewportL();
		gl.fboProgram.uniform["mat4 mCamera3"].set(this.eyeL.Mat.array);
		gl.drawFaces(gl.FfboBuffer);
		gl.fbolink2.use([gl.fboR],null);
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
		
		gl.fbolink2.use([gl.fboL],null);
		setViewport(gl,this,thumbnail,LEFT);
		gl.fboProgram.uniform["mat4 mCamera3"].set(this.eyeL.Mat.array);
		gl.drawFaces(gl.FfboBuffer);
		
		gl.fbolink2.use([gl.fboR],null);
		setViewport(gl,this,thumbnail,RIGHT);
		gl.fboProgram.uniform["mat4 mCamera3"].set(this.eyeR.Mat.array);
		gl.drawFaces(gl.FfboBuffer);
		gl.enable(gl.DEPTH_TEST);
	}
	gl.fbolink2.release();
	
}

