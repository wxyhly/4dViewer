/**
require math.js;

reserved:
	Obj2, Obj3, Obj4, Chunk4,
	Mesh2, Mesh3, Mesh4, Geom2, Geom3, Geom4,
	
Object: Obj (Obj2 || Obj3 || Obj4)
	
	Construct Obj:
	
		Obj2(Vec2 pos, Number rot);
		Obj3(Vec3 pos, Vec4 rot);
		Obj4(Vec4 pos, Vec4[2] rot);
	
	Methodes:
	
		Obj.move(Vec p):Obj;
		Obj.coord(Vec p): Vec; transform Point p
		Obj.coordMat(): Mat; affine Mat(n+1)*(n+1), only surpport n<4
		
		Obj2.rotate(Number s):Obj2;
		Obj3.rotate(Vec3 axis[, Number s]):Obj3;
		Obj3.rotate(Vec4 quanternion):Obj3;
		Obj4.rotate(Bivec axis[, Number s]):Obj4;
		Obj4.rotate(Vec4[2] quanternion):Obj4;

Geometry: Geom extends Obj (Geom2 || Geom3 || Geom4)
	
	Construct Geom:
	
		Geom2(Mesh2 m) extends Obj2;
		Geom3(Mesh3 m) extends Obj3;
		Geom4(Mesh4 m) extends Obj4;
	
Mesh: (Mesh2 || Mesh3 || Mesh4)
	
	Construct Mesh:
	
		Mesh2({V:Vec2[],E:int[][2]} data);
		Mesh3({V:Vec3[],E:int[][2],F:int[][]} data);
		Mesh4({V:Vec4[],E:int[][2],F:int[][],C:int[][]} data);
	
	Mesh Libraries:
	
		Mesh2.points(Vec2[] v, flag):Mesh2; flag decide whether close loop
		Mesh2.polygon(Number r, int n);
		Mesh2.rectangle(Number w, Number h);
		
		Mesh3.cube(Number r);
		Mesh3.cuboid(Number a, Number b, Number c);
		Mesh3.cylinder(Number r, int n,h);
		Mesh3.cone(Number r, int n, Number h);
		Mesh3.sphere(Number r, int u, int v);
		Mesh3.torus(Number r, Number R, int u, int v);
		Mesh3.grid(int m, n[, Function f(int x,y):Vec3]);
		
		Mesh4.tesseract(Number r);
		Mesh4.cuboid(Number a,N umber b, Number c, Number d);		Mesh4.glome(Number r, int u, int v, int w);		Mesh4.spherinder(Number r, int u, int v, Number h);		Mesh4.sphone(Number r, int u, int v, Number h);		Mesh4.duocylinder(Number R1, Number R2, int u, int v);		Mesh4.cubinder(Number r, int n, Number h1, Number h2);		Mesh4.cylindrone(Number r, int n, Number h, Number hc);		Mesh4.dicone(Number r, int n, Number h1, Number h2);		Mesh4.duocone(Number R1, Number R2, int u, int v);		Mesh4.coninder(Number r, int n, Number h, Number hc);		Mesh4.torinder(Number r, Number R, int u, int v, Number h);		Mesh4.spheritorus(Number r, Number R, int u, int v, int w);		Mesh4.torisphere(Number r, Number R, int u, int v, int w);		Mesh4.ditorus(Number r, Number Rr, Number R, int u, int v, int w);		Mesh4.tiger(Number r, Number R1, Number R2, int u, int v, int w);
		Mesh4.grid(int m, n, o[, Function f(int x,y,z):Vec4]);
		//todo: polytopes and polytwisters
	
	common operations:
		
		Note: flag===true -> insert face or cell; else: no insertion
	
		Mesh.clone():Mesh;
		Mesh.move(Vec v):Mesh; translate vertices
		Mesh.apply(function(Vec v) f):Mesh; apply function f to each vertex
		Mesh.join(Mesh m):Mesh;
	
		Mesh2.rotate(Number s):Mesh2;
		Mesh3.rotate(Vec3 axis[, Number s]):Mesh3;
		Mesh3.rotate(Vec4 quanternion):Mesh3;
		Mesh4.rotate(Bivec axis[, Number s]):Mesh4;
		Mesh4.rotate(Vec4[2] quanternion):Mesh4;
		
		Mesh2.embed(int d=3, bool flag[, Vec3 x, Vec3 y]):Mesh3;
		Mesh2.embed(int d=4, bool flag[, Vec4 x, Vec4 y]):Mesh4;
		Mesh3.embed(bool flag[, Vec4 x, Vec4 y, Vec4 z]):Mesh4;
		
	constructional operators:
		
		Note - flag for Mesh.loft:
			flag===true -> insert; flag===false -> loop; else: no insertion
		Note - flag for Mesh.turning:
			flag===false: half turing and form loop; else: full turing loop
		
		
		Mesh3.pyramid(Vec3 v):Mesh3;
		Mesh3.loft(function(int m, Vec3 v) f, int n, bool flag):Mesh3;
		Mesh3.extrude(Vec3 v, bool flag):Mesh3;
		Mesh3.turning(Vec3 axis, Number n, bool flag):Mesh3;
		Mesh3.crossSection(Number t, Vec3 n):Mesh3;
		
		Mesh4.pyramid(Vec3 v):Mesh3;
		Mesh4.loft(function(int m, Vec3 v) f, int n, bool flag):Mesh4;
		Mesh4.extrude(Vec4 v, bool flag):Mesh4;
		Mesh4.turning(Bivec b, Number n, bool flag):Mesh4;
		Mesh4.crossSection(Number t, Vec4 n):Mesh4;
		
		Mesh4.directProduct(Mesh4 m1, Mesh4 m2):Mesh4;
		Mesh4.duopyramid(Mesh4 m1, Mesh4 m2):Mesh4;
		
		Mesh4.stick(Number radius[, Mesh3 cross]):Mesh4;
		
	output operations:
	
		Mesh3.smoothFlat():{v:Number[],n:int[],f:int[]};
		Mesh3.flat():{v:Number[],n:int[],f:int[]};
		Mesh3.triangulate():Mesh3; attention modify itself, no flag, use clone instead
		Mesh3.collapse():Mesh2;
		Mesh4.collapse():Mesh3;
		
**/
'use strict'

var Obj2 = function(pos,rot){
	this.position = pos||new Vec2(0,0);
	this.rotation = rot||0;
}
var Obj3 = function(pos,rot){
	this.position = pos||new Vec3(0,0,0);
	this.rotation = rot||new Vec4(1,0,0,0);//quanternion[R,R*]
}
var Obj4 = function(pos,rot){
	this.position = pos||new Vec4(0,0,0,0);
	this.rotation = rot||[new Vec4(1,0,0,0),new Vec4(1,0,0,0)];//quanternion[L,R]
}
Obj4.Group = function(child,pos,rot){
	Obj4.call(this,pos,rot);
	this.child = child;
	for(var c of this.child){
		c.parent = this;
	}
	this.getBoundingObjs();
}
Obj4.Group.prototype = Object.create(Obj4.prototype);
Obj4.Group.prototype.add = function(s){
	if(s.mesh)s.mesh.update();
	this.child.push(s);
	s.parent = this;
	this.getBoundingObjs();
}
Obj2.prototype.coord = function(p){
	var s = Math.sin(this.rotation),
		c = Math.cos(this.rotation);
	p.set(mat2(c,s,-s,c).mul(p).add(this.position));
	return p;
}
Obj3.prototype.coord = function(p){
	p.set(this.rotation.mul(p).add(this.position));
	return p;
}
Obj4.prototype.coord = function(p){
	p.set(this.rotation[0].mul(p,false).mul(this.rotation[1]).add(this.position));
	return p;
}
Obj2.prototype.coordMat = function(){//affine mat
	var s = Math.sin(this.rotation),
		c = Math.cos(this.rotation);
	return mat3(
		c,s,this.position.x,
		-s,c,this.position.y,
		0,0,1
	);
}
Obj3.prototype.coordMat = function(){//affine mat
	var r = this.rotation.toMatLR().array;
	return mat4(
		r[0],r[1],r[2],this.position.x,
		r[3],r[4],r[5],this.position.y,
		r[6],r[7],r[8],this.position.z,
		0,0,0,1
	);
}
Obj4.prototype.coordMat = function(){//not affine mat, just rotation part
	return PMat5Q.prototype.coordMat.call(this);
}

Obj2.prototype.move = Obj3.prototype.move = Obj4.prototype.move = function(p){
	this.position.add(p);
	return this;
}
Obj2.prototype.rotate = function(s){
	this.rotation += s;
	return this;
}
Obj3.prototype.rotate = function(axis,s){
	if(axis instanceof Vec4 && !s){//quanternion
		this.rotation = axis.mul(this.rotation,false);
		return this;
	}
	if(axis instanceof Vec3 && !s){
		this.rotation = axis.expQ().mul(this.rotation);
		return this;
	}
	this.rotation = axis.expQ(s).mul(this.rotation);
	return this;
}
Obj4.prototype.rotate = function(bivec,s){
	var R;
	if(bivec[1]){//quanternion [L,R]
		R = [bivec[0],bivec[1]];
	}else if(typeof s=="number"){
		console.error("expQ failed");
		R = bivec.expQ(s);
	}else{
		R = bivec.expQ();
	}
	this.rotation[0] = R[0].mul(this.rotation[0],false);
	this.rotation[1].mul(R[1]);
	return this;
}
Obj3.prototype.lookAt = function(pos,up){
	var rayon = pos.sub(this.position,false).norm();
	if(!up){
		var R = new Vec3(0,0,1).cross(rayon);
		var s = R.len();
		var c = rayon.z; //Vec3(0,0,1) dot M
		if(Math.abs(s)>0.000001){
			R.mul(Math.atan2(s,c)/s);
		}
		this.rotation = R.expQ().mul(this.rotation);
	}else{
		up.norm();
		var rayon_horizontal = rayon.sub(rayon.mul(rayon.dot(up),false),false);
		this.lookAt(pos.add(rayon_horizontal,false), false);
		this.lookAt(pos.add(rayon,false), false);
	}
	return this;
}
Obj4.prototype.lookAt = function(pos,up){
	return PMat5Q.prototype.lookAt.call(this, pos,up);
}


var Geom2 = function(m,pos,rot,color){
	if(m instanceof Mesh2) this.mesh = m;
	else throw "Geom2(m): m must be instance of Mesh2";
	Obj2.call(this,pos,rot);
	this.scale = 1;
	this.color = color;
	this.visible = true;
}
Geom2.prototype = Object.create(Obj2.prototype);
var Geom3 = function(m,pos,rot,color){
	if(m instanceof Mesh3) this.mesh = m;
	else throw "Geom3(m): m must be instance of Mesh3";
	Obj3.call(this,pos,rot);
	this.scale = 1;
	this.color = color;
	this.visible = true;
}
Geom3.prototype = Object.create(Obj3.prototype);
var Geom4 = function(m,pos,rot,color){
	if(m instanceof Mesh4) this.mesh = m;
	else throw "Geom4(m): m must be instance of Mesh4";
	Obj4.call(this,pos,rot);
	this.scale = 1;
	this.color = color;
	this.visible = true;
}
Geom4.prototype = Object.create(Obj4.prototype);

/**
	Mesh
**/

var Mesh2 = function(data){
	data = data||{V:[],E:[]};
	this.V = data.V;
	this.E = data.E;
}
var Mesh3 = function(data){
	data = data||{V:[],E:[],F:[]};
	this.V = data.V;
	this.E = data.E;
	this.F = data.F;
}
var Mesh4 = function(data){
	data = data||{V:[],E:[],F:[],C:[]};
	this.V = data.V;
	this.E = data.E;
	this.F = data.F;
	this.C = data.C;
}
Mesh4._util = {
	copyPushArr : function(sour,dest,offset){
		offset = offset || 0;
		sour.forEach(function(a){
			if(a===false)dest.push(a);
			else{
			var a0 = [];
			a.forEach(function(a1){a0.push(a1 + offset);});
			if(a.info) {
				a0.info = {};
				for(var i in a.info)
					a0.info[i] = a.info[i];
			};
			dest.push(a0);}
		});
		
	},
	uniqueArr: function(array){
		var r = [];
		for(var i = 0, l = array.length; i < l; i++) {
			for(var j = i + 1; j < l; j++){
				if (array[i] === array[j]) j = ++i;
			}
			r.push(array[i]);
		}
		return r;
	},
	calNorm3FromPoints: function(arr,threshold){
		var N;
		var foo = false;
		threshold = threshold || 0.000000000001;
		for(var i=0; i<arr.length && !foo;i++){
			for(var j=i+1; j<arr.length && !foo;j++){
				for(var k=j+1; k<arr.length && !foo;k++){
					N = arr[i].sub(arr[j],false).cross(arr[i].sub(arr[k],false));
					if(N.len(false)>threshold){
						N.norm();
						foo = true;
					}
				}
			}
		}
		return N;
	},
	calNorm4FromPoints: function(arr,threshold){
		var N;
		var foo = false;
		threshold = threshold || 0.0000000000000000001;
		for(var i=0; i<arr.length && !foo;i++){
			for(var j=i+1; j<arr.length && !foo;j++){
				for(var k=j+1; k<arr.length && !foo;k++){
					for(var l=k+1; l<arr.length && !foo;l++){
						N = arr[i].sub(arr[j],false).cross(arr[i].sub(arr[k],false)).cross(arr[i].sub(arr[l],false));
						if(N.len(false)>threshold){
							N.norm();
							foo = true;
						}
					}
				}
			}
		}
		if(foo) return N;
	}
};
Mesh2.prototype.clone = function(){
	var M = new Mesh2();
	this.V.forEach(function(a){M.V.push(a.clone());});
	Mesh4._util.copyPushArr(this.E,M.E);
	return M;
}
Mesh3.prototype.clone = function(){
	var M = new Mesh3();
	this.V.forEach(function(a){M.V.push(a.clone());});
	Mesh4._util.copyPushArr(this.E,M.E);
	Mesh4._util.copyPushArr(this.F,M.F);
	return M;
}
Mesh4.prototype.clone = function(){
	var M = new Mesh4();
	this.V.forEach(function(a){M.V.push(a.clone());});
	Mesh4._util.copyPushArr(this.E,M.E);
	Mesh4._util.copyPushArr(this.F,M.F);
	Mesh4._util.copyPushArr(this.C,M.C);
	return M;
}

Mesh2.prototype.move = Mesh3.prototype.move = Mesh4.prototype.move = function(p){
	this.V.forEach(function(a){a.add(p);});
	return this;
}
Mesh2.prototype.apply = Mesh3.prototype.apply = Mesh4.prototype.apply = function(f){
	this.V.forEach(function(a){f(a);});
	return this;
}
Mesh2.prototype.join = function(m){
	var V = this.V,
		E = this.E,
		v = V.length;
	m.V.forEach(function(a){V.push(a)});
	m.E.forEach(function(a){if(!a)E.push(a);else E.push([a[0]+v,a[1]+v])});
	return this;
}
Mesh3.prototype.join = function(m){
	var V = this.V,
		E = this.E,
		F = this.F,
		v = V.length,
		e = E.length;
	m.V.forEach(function(a){V.push(a)});
	m.E.forEach(function(a){if(!a)E.push(a);else E.push([a[0]+v,a[1]+v])});
	Mesh4._util.copyPushArr(m.F,this.F,e);
	return this;
}
Mesh4.prototype.join = function(m){
	var V = this.V,
		E = this.E,
		F = this.F,
		C = this.C,
		v = V.length,
		e = E.length,
		f = F.length;
	m.V.forEach(function(a){V.push(a)});
	m.E.forEach(function(a){if(!a)E.push(a);else E.push([a[0]+v,a[1]+v])});
	Mesh4._util.copyPushArr(m.F,this.F,e);
	Mesh4._util.copyPushArr(m.C,this.C,f);
	return this;
}
Mesh2.prototype.rotate = function(t){
	var c = Math.cos(t),
		s = Math.sin(t),
		M = mat2(c,s,-s,c);
	this.V.forEach(function(e){e.set(M.mul(e));});
	return this;
}
Mesh3.prototype.rotate = function(axis,t){
	if(axis instanceof Vec4){//axis is quanternion
		this.V.forEach(function(e){e.set(axis.mul(e));});
		return this;
	}
	else if(typeof t=="undefined"){
		var B = axis.exp();
	}else{
		var B = axis.exp(t);
	}
	this.V.forEach(function(e){e.set(B.mul(e));});
	return this;
}
Mesh4.prototype.rotate = function(axis,t){
	if(axis[1]){//axis is quanternion[L,R]
		this.V.forEach(function(e){e.set(axis[0].mul(e,false).mul(axis[1]))});
		return this;
	}
	if(typeof t=="undefined"){//axis is quanternion
		var B = axis.exp();
	}else{
		var B = axis.exp(t);
	}
	this.V.forEach(function(e){e.set(B.mul(e));});
	return this;
}
/** Geometry generators **/
Mesh2.prototype.embed = function(dimension,flag,x,y){//flag: yni insert face
	if(dimension == 3){
		x = x || new Vec3(1,0,0);
		y = y || new Vec3(0,1,0);
		var N = new Mesh3();
	}else if(dimension == 4){
		x = x || new Vec4(1,0,0,0);
		y = y || new Vec4(0,1,0,0);
		var N = new Mesh4();
	}else{
		throw "Mesh2 cannot be embedded in dimension "+ dimension;
	}
	this.V.forEach(function(a){
		N.V.push(x.mul(a.x,false).add(y.mul(a.y,false)));
	});
	Mesh4._util.copyPushArr(this.E,N.E);
	if(flag===true){
		N.F.push([]);
		for(var i=0; i<this.E.length;i++) N.F[0].push(i);
	}
	return N;
	
}
Mesh3.prototype.embed = function(flag,x,y,z){//flag: yni insert face
	if(flag==4) throw "soor Mesh3.embed(4)";
	x = x || new Vec4(1,0,0,0);
	y = y || new Vec4(0,1,0,0);
	z = z || new Vec4(0,0,1,0);
	var N = new Mesh4();
	this.V.forEach(function(a){
		N.V.push(x.mul(a.x,false).add(y.mul(a.y,false)).add(z.mul(a.z,false)));
	});
	Mesh4._util.copyPushArr(this.E,N.E);
	Mesh4._util.copyPushArr(this.F,N.F);
	if(flag===true){
		N.C.push([]);
		for(var i=0; i<this.F.length;i++) N.C[0].push(i);
	}
	return N;
}
Mesh3.prototype.pyramid = function(p){
	var v = this.V.length,
		e = this.E.length;
	this.V.push(p);
	for(var i=0; i< v; i++){
		this.E.push([i,v]);
	}
	for(var i=0; i< e; i++){
		this.F.push([i,e+this.E[i][0],e+this.E[i][1]]);
	}
	return this;
}
Mesh4.prototype.pyramid = function(p){
	var v = this.V.length,
		e = this.E.length,
		f = this.F.length;
	this.V.push(p);
	for(var i=0; i< f; i++){
		var NC = [i];
		this.F[i].forEach(function(a){
			NC.push(f+a);
		});
		this.C.push(NC);
	}
	for(var i=0; i< v; i++){
		this.E.push([i,v]);
	}
	for(var i=0; i< e; i++){
		this.F.push([i,e+this.E[i][0],e+this.E[i][1]]);
	}
	
	return this;
}
Mesh3.prototype.extrude = Mesh4.prototype.extrude = function(v,flag){
	var f = function(m,p){
		if(m==1) p.add(v);
	}
	return this.loft(f,2,flag===false?true:undefined);
}
Mesh3.prototype.turning = Mesh4.prototype.turning = function(B,n,flag){
	if(flag===false){
		var M = B.exp(Math.PI/n);
		var N = [(this instanceof Mesh3)?new Mat3():new Mat4()];
		for(var i=1;i<=n;i++){
			N[i] = N[i-1].mul(M,false);
		}
		var f = function(m,P){
			P.set(N[m].mul(P));
		}
		return this.loft(f,n+1);
	}
	var M = B.exp(Math.PI*2/n);
	var N = [(this instanceof Mesh3)?new Mat3():new Mat4()];
	for(var i=1;i<n;i++){
		N[i] = N[i-1].mul(M,false);
	}
	var f = function(m,P){
		P.set(N[m].mul(P));
	}
	return this.loft(f,n,false);
}
Mesh3.prototype.loft = function(f,n,flag){
	//f(m,p): der m der  crossection of p, total n der.
	//flag: yni ve faces au bout, par default: non, true: oui, false: loop
	var v = this.V.length,
		e = this.E.length;
	var M = new Mesh3();
	for(var i=0; i<n; i++){
		var N = this.clone().apply(f.bind(this,i));
		M.join(N);
	}
	for(var j=0; j<n-1; j++){
		for(var i=0; i<v; i++){
			M.E.push([i+j*v,i+j*v+v]);
		}
		for(var i=0; i<e; i++){
			M.F.push([i+j*e,i+j*e+e, e*n+this.E[i][0]+j*v, e*n+this.E[i][1]+j*v]);
		}
	}
	if(flag===true){
		var sia = [], sie = [];
		for(var i=0; i<e; i++){
			sia.push(i);
			sia.push(i+e*n);
		}
		M.F.push(sia);
		M.F.push(sie);
	}else if(flag===false){
		for(var i=0; i<v; i++){
			M.E.push([i,i+(n-1)*v]);
		}
		for(var i=0; i<e; i++){
			M.F.push([i,i+(n-1)*e, e*n+this.E[i][0]+(n-1)*v, e*n+this.E[i][1]+(n-1)*v]);
		}
	}
	return M;
}
Mesh4.prototype.loft = function(fn,n,flag){
	//f(m,p): translate fn. for mth  crossection of p, total n times.
	//flag: yni ve faces au bout, par default: non, true: oui, false: loop
	var v = this.V.length,
		e = this.E.length,
		f = this.F.length;
	var M = new Mesh4();
	for(var i=0; i<n; i++){
		var N = this.clone().apply(fn.bind(this,i));
		M.join(N);
	}
	for(var j=0; j<n-1; j++){
		for(var i=0; i<v; i++){
			M.E.push([i+j*v,i+j*v+v]);
		}
		for(var i=0; i<e; i++){
			M.F.push([i+j*e,i+j*e+e, e*n+this.E[i][0]+j*v, e*n+this.E[i][1]+j*v]);
		}
		for(var i=0; i<f; i++){
			var arr = [i+j*f,i+j*f+f];
			for(var k=0; k<this.F[i].length; k++){
				arr.push(f*n+this.F[i][k]+j*e);
			}
			M.C.push(arr);
		}
	}
	if(flag===true){
		var sia = [], sie = [];
		for(var i=0; i<f; i++){
			sia.push(i);
			sia.push(i+f*n);
		}
		M.F.push(sia);
		M.F.push(sie);
	}else if(flag===false){
		for(var i=0; i<v; i++){
			M.E.push([i,i+(n-1)*v]);
		}
		for(var i=0; i<e; i++){
			M.F.push([i,i+(n-1)*e, e*n+this.E[i][0]+(n-1)*v, e*n+this.E[i][1]+(n-1)*v]);
		}
		for(var i=0; i<f; i++){
			var arr = [i,i+(n-1)*f];
			for(var k=0; k<this.F[i].length; k++){
				arr.push(f*n+this.F[i][k]+(n-1)*e);
			}
			M.C.push(arr);
		}
	}
	return M;
}
Mesh4.prototype.directProduct = function(M4,color){
	//this and M4: 2d new Mesh4
	var M = new Mesh4();
	var face = M4.F.length;
	for(var i=0; i<this.V.length; i++){
		var N = M4.clone().move(this.V[i]);
		M.join(N);
	}
	//each this.V has copy of M4
	var fa = M.F.length;
	var m = M4.V.length;
	var eall = M.E.length;
	for(var j=0; j<M4.V.length; j++){
		for(var i=0; i<this.E.length; i++){
			
			M.E.push([j+this.E[i][0]*m, j+this.E[i][1]*m]);
			//add edge to connect each copy
		}
		//add face formed by edge loop
	}
	for(var j=0; j<M4.V.length; j++){
		for(var i=0; i<this.F.length; i++){
			var f = [];
			for(var k=0; k<this.F[i].length; k++){
				f.push(this.F[i][k]+j*this.E.length+eall);
			}
			M.F.push(f);
		}
	}
	var fall = M.F.length;
	for(var j=0; j<M4.E.length; j++){
		for(var i=0; i<this.E.length; i++){
			M.F.push([
				j+this.E[i][0]*M4.E.length,
				j+this.E[i][1]*M4.E.length,
				i+M4.E[j][0]*this.E.length+eall,
				i+M4.E[j][1]*this.E.length+eall
			]);
			//facettes rectangulaires
		}
	}
	for(var j=0; j<M4.E.length; j++){
		for(var m=0; m<this.F.length; m++){
			var c = [fa+M4.E[j][0]*this.F.length+m,fa+M4.E[j][1]*this.F.length+m];
			for(var n=0; n<this.F[m].length; n++){
				var l = this.F[m][n];
				c.push(fall+l+j*this.E.length);
			}
			M.C.push(c);
		}
	}
	for(var j=0; j<this.E.length; j++){
		for(var m=0; m<M4.F.length; m++){
			var c = [this.E[j][0]*face+m,this.E[j][1]*face+m];
			for(var n=0; n<M4.F[m].length; n++){
				var l = M4.F[m][n];
				c.push(fall+j+l*this.E.length);
			}
			if(color){
				c.info = {color: color};
			}
			M.C.push(c);
		}
	}
	return M;
	
}
Mesh4.prototype.duopyramid = function(M4){
	var M = this.clone().join(M4);
	var mall = M.E.length;
	for(var j=0; j<M4.V.length; j++){
		for(var i=0; i<this.V.length; i++){
			M.E.push([i,j+this.V.length]);
		}
	}
	for(var j=0; j<M4.E.length; j++){
		for(var i=0; i<this.V.length; i++){
			var a = M4.E[j][0],
				b = M4.E[j][1],
				c = i;
			var ac = a*this.V.length+c,
				bc = b*this.V.length+c;
			M.F.push([j+this.E.length,ac+mall,bc+mall]);
		}
	}
	var eall = M.F.length;
	for(var j=0; j<this.E.length; j++){
		for(var i=0; i<M4.V.length; i++){
			var a = this.E[j][0],
				b = this.E[j][1],
				c = i;
			var ac = c*this.V.length+a,
				bc = c*this.V.length+b;
			M.F.push([j,ac+mall,bc+mall]);
		}
	}
	for(var j=0; j<this.E.length; j++){
		for(var i=0; i<M4.E.length; i++){
			M.C.push([
				this.E[j][0]+this.V.length*i,
				this.E[j][1]+this.V.length*i,
				eall+M4.E[i][0]+this.V.length*j,
				eall+M4.E[i][1]+this.V.length*j
			])
		}
	}
	return M;
}
Mesh4.prototype.dual = function(){
	var M = new Mesh4();
	var ce = [];
	for(var ei=0; ei<this.E.length; ei++){
		var e = this.E[ei];
		ce[ei] = new Vec4();
		for(var i of e){
			ce[ei].add(this.V[i]);
			if(!M.C[i]) M.C[i] = [];
			M.C[i].push(ei);
		}
		ce[ei].div(2);
	}
	var cf = [];
	for(var fi=0; fi<this.F.length; fi++){
		var f = this.F[fi];
		cf[fi] = new Vec4();
		for(var i of f){
			cf[fi].add(ce[i]);
			if(!M.F[i]) M.F[i] = [];
			M.F[i].push(fi);
		}
		cf[fi].div(f.length);
	}
	
	for(var ci=0; ci<this.C.length; ci++){
		var c = this.C[ci];
		var cc = new Vec4();
		for(var i of c){
			cc.add(cf[i]);
			if(!M.E[i]) M.E[i] = [];
			M.E[i].push(ci);
		}
		cc.div(c.length);
		M.V[ci] = cc;
	}
	return M;
}

Mesh3.prototype.weld = Mesh4.prototype.weld = function(threshold){
	function mapreduce(source, map, dest){
		/*example:
			source: this.V;
			map: map[i]=j : i -> j, if no img, mark map[i] with -1
			dest: this.E;
		*/
		for(var i=0; i<source.length; i++){
			var j = i;
			while(map[j] != j && map[j] != -1){
				j = map[j];
			}
			map[i] = map[j]; //find the end of the chain
		}
		//then del redundant sources and update a new map
		var offset = [];
		var count = 0;
		for(var i=0; i<map.length; i++){
			if(map[i]!=i || map[i] == -1){
				source.splice(i-count,1);
				count++;
			}
			offset.push(count);
		}
		for(var i=0; i<map.length; i++){
			if(map[i] != -1) map[i] -= offset[map[i]];
		}
		var t=0;
		for(var i of dest){
			//finally update dest dape map
			for(var j = 0; j<i.length; j++){
				i[j] = map[i[j]];
			}
			//but need to remove -1 elements
			var count = 0;
			var il = i.length;
			for(var j=0; j<il; j++){
				if(i[j-count] == -1){
					i.splice(j-count,1);
					count++;
				}
			}
			t ++;
		}
	}
	threshold = threshold || 0.0001;
	var threshold2 = threshold*threshold;
	var mapV = [];// chain: rv2[i]=j : i -> j, if no change rv2[i] undefined
	for(var i=0; i<this.V.length; i++){
		mapV[i] = i;
		for(var j=i+1; j<this.V.length; j++){
			if(this.V[i].sub(this.V[j],false).len(false)<threshold2){
				mapV[i] = j;
				break;
			}
		}
	}
	mapreduce(this.V, mapV, this.E);
	var mapE = [];
	for(var i=0; i<this.E.length; i++){
		var ei0 = this.E[i][0],
			ei1 = this.E[i][1];//acceleration
		mapE[i] = i;
		if(ei0 == ei1){
			mapE[i] = -1;
		}//mark the edge between single point whith -1, wait to remove
		for(var j=i+1; j<this.E.length; j++){
			if((ei0==this.E[j][0]&&ei1==this.E[j][1])||
				(ei0==this.E[j][1]&&ei1==this.E[j][0])){
				mapE[i] = j;
				break;
			}//edge chain
		}
	}
	mapreduce(this.E, mapE, this.F);
	var mapF = [];
	for(var i=0; i<this.F.length; i++){
		this.F[i] = Mesh4._util.uniqueArr(this.F[i]);
		if(this.F[i].length < 3){
			mapF[i] = -1;
		}else{
			mapF[i] = i;
		}
	}
	//if it's Mesh3, therefore C is undefined
	mapreduce(this.F, mapF, this.C||[]);
	return this;
}
Mesh3.prototype.crossSection = function(t,n){
	var M = new Mesh3();
	var V = [],
		E = [];
	for(var i=0; i<this.V.length; i++){
		//V.push(this.V[i].sub(p,false).dot(n));
		// (A-P).N
		V.push(this.V[i].dot(n)-t);
		//A.N - t  (t = P.N)
	}
	for(var i=0; i<this.E.length; i++){
		var a = this.E[i][0],
			b = this.E[i][1];
		if(!(V[a]<0 ^ V[b]<0)){
			E.push(-1);
			continue;
		}
		E.push(M.V.length);
		var BA = this.V[b].sub(this.V[a],false);
		var d = BA.dot(n);
		if(d==0){
			M.V.push(this.V[a].add(this.V[b],false).div(2));
		}else{
			M.V.push(this.V[a].sub(BA.mul(V[a]/d),false));
		}
		// A - ((A-P).N) (B-A) / ((B-A).N)
	}
	for(var i=0; i<this.F.length; i++){
		var arr = [];
		this.F[i].forEach(function(a){
			if(E[a]!=-1) arr.push(E[a]);
		});
		if(arr.length==2)
		M.E.push(arr);
	}
	return M;
}
Mesh4.prototype.stick = function(radius,cross){
	
	cross = cross || Mesh3.cube(radius*2).embed(false);

	var T = new Vec4(0,0,0,1);
	var V = this.V;
	var mesh = new Mesh4();
	for(var e of this.E){
		var A = V[e[0]],
			B = V[e[1]];
		var AB = A.sub(B,false);
		var M = cross.clone();
		var R = AB.norm(false).cross(T);
		var s = R.len();
		if (Math.abs(s)>0.000001){
			R.mul(-Math.atan2(s,AB.t/AB.len())/s);
		}
		mesh.join(M.rotate(R).extrude(AB).move(B));
	}
	return mesh;
}
Mesh4.prototype.crossSection = function(t,n){
	var M = new Mesh4();
	var V = [],
		E = [],
		F = [];
	for(var i=0; i<this.V.length; i++){
		V.push(this.V[i].dot(n)-t);
	}
	var MVlen = 0;
	for(var i=0; i<this.E.length; i++){
		var a = this.E[i][0],
			b = this.E[i][1];
		if(!(V[a]<0 ^ V[b]<0)){
			E.push(-1);
			continue;
		}
		var A = this.V[a],
			B = this.V[b];
		E.push(MVlen++);
		var BAx = B.x - A.x,
			BAy = B.y - A.y,
			BAz = B.z - A.z,
			BAt = B.t - A.t,
			d = BAx*n.x + BAy*n.y + BAz*n.z + BAt*n.t,
			k = V[a]/d;
		if(d==0){
			M.V.push(A.add(B,false).div(2));
		}else{
			M.V.push(new Vec4(A.x - BAx*k, A.y - BAy*k, A.z - BAz*k, A.t - BAt*k));
		}
		// A - ((A-P).N) (B-A) / ((B-A).N)
	}
	var MElen = 0;
	for(var f of this.F){
		var count = 0;
		var A, B;
		for(var a of f){
			if(E[a]!=-1){
				if(count==0)A = E[a];
				if(count==1)B = E[a];
				count++;
			}
		}
		if(count!=2){
			F.push(-1);
			continue;
		}
		F.push(MElen++);
		M.E.push([A,B]);
	}
	for(var c of this.C){
		var arr = [];
		for(var a of c){
			if(F[a]>=0) arr.push(F[a]);
		}
		if(c.info){
			arr.info = c.info;//record infos comme color, normal
		}
		if(arr.length>=3){
			M.F.push(arr);
		}
	}
	return M;
}
Mesh4.prototype.setInfo = function(info){//record infos comme color, normal
	for(var i of this.C){
		if(!i.info) i.info = {};
		for(var j in info)
			i.info[j] = info[j]; //deep copy
	}
	return this;
}
Mesh3.prototype.triangulate = function(){
	var F1 = [];
	var _this = this;
	for(var j=0; j<this.F.length; j++){
		var n = this.F[j].length,
			f = this.F[j];
		if(n==3) continue;
		var P = this.E[f[0]][0];//first point to be triangulate center
		var v = [],//tous les autres 
			v1 = [this.E[f[0]][1]];//adjacent ala P
		var e = [],
			e1 = [f[0]];
		for(var i=1; i<f.length; i++){
			if(this.E[f[i]][1]==P){
				v1.push(this.E[f[i]][0]);
				e1.push(f[i]);
			}else if(this.E[f[i]][0]==P){
				v1.push(this.E[f[i]][1]);
				e1.push(f[i]);
			}
		}
		for(var i=1; i<f.length; i++){
			var a = this.E[f[i]][0],
				b = this.E[f[i]][1];
			if(a!=P&&b!=P){
				if(v1.indexOf(a)==-1)v.push(a);
				if(v1.indexOf(b)==-1)v.push(b);
			}
		}
		v = Mesh4._util.uniqueArr(v);
		//v1:[p+1,p-1]
		//v:[....]/[p,p-1,p+1]
		v.forEach(function(a){
			e.push(_this.E.length);
			_this.E.push([a,P]);
		});
		//e=[....]
		//e1=[pp+1,pp-1]
		for(var i=1; i<f.length; i++){
			var a = v.indexOf(this.E[f[i]][0]),
				b = v.indexOf(this.E[f[i]][1]);
			if(a>-1&&b>-1) F1.push([f[i],e[a],e[b]]);
			else if(a==-1&&b!=-1){
				a = v1.indexOf(this.E[f[i]][0]);
				if(a>-1){
					F1.push([f[i],e1[a],e[b]])
				}
			}else if(b==-1&&a!=-1){
				b = v1.indexOf(this.E[f[i]][1]);
				if(a>-1){
					F1.push([f[i],e[a],e1[b]])
				}
			}
		}
	}
	this.F = F1;
	return this;
}
Mesh3.prototype.smoothFlat = function(){
	var m = {v:[],n:[],f:[]};
	var N = [];
	for(var j=0; j<this.V.length; j++){
		m.v.push(this.V[j].x,this.V[j].y,this.V[j].z);
		N.push([]);
	}
	for(var j=0; j<this.F.length; j++){
		var f = this.F[j];
		var p = this.E[f[0]][0];
		var v = [];
		for(var i=1; i<f.length; i++){
			var a = this.E[f[i]][0],
				b = this.E[f[i]][1];
			v.push(a,b);
			if(a!=p && b!=p) m.f.push(p,a,b);
		}
		v = Mesh4._util.uniqueArr(v);
		var n = this.V[v[2]].sub(this.V[v[1]],false).cross(this.V[v[2]].sub(this.V[v[0]],false)).norm();
		for(var i=0; i<v.length; i++){
			N[v[i]].push(n);
		}
	}
	for(var j=0; j<this.V.length; j++){
		var n = N[j][0];
		/*for(var i=1; i<N[j].length; i++){
			n.add(N[j][i]);
		}
		n.norm();*/
		m.n.push(n.x,n.y,n.z);
	}
	return m;
}

Mesh3.prototype.flat = function(){
	var m = {v:[],n:[],f:[]};
	var _this = this;
	for(var j=0; j<this.F.length; j++){
		var f = this.F[j];
		var v = [];
		for(var i=1; i<f.length; i++){
			var a = this.E[f[i]][0],
				b = this.E[f[i]][1];
			v.push(a,b);
		}
		v = Mesh4._util.uniqueArr(v);// all vertices of face F[j]
		var N = Mesh4._util.calNorm3FromPoints(v.map(function(e){
			return _this.V[e];
		}));
		var va = Math.round(m.v.length/3);
		for(var i=0; i<v.length; i++){
			var vp = this.V[v[i]];//for each vertex vp of F[j]
			m.v.push(vp.x,vp.y,vp.z);
			m.n.push(N.x,N.y,N.z);
			var a = v.indexOf(this.E[f[i]][0]),
				b = v.indexOf(this.E[f[i]][1]);
			if(a && b) m.f.push(a+va,b+va,0+va);
		}	
	}
	return m;
}
Mesh4.prototype.flat = function(){//just used for rendering 3d section but not collapsed in 3d
	var m = {v:[],n:[],f:[],c:[]};
	var _this = this;
	for(var j=0; j<this.F.length; j++){
		var f = this.F[j];
		var v = [];
		for(var i=1; i<f.length; i++){
			var a = this.E[f[i]][0],
				b = this.E[f[i]][1];
			v.push(a,b);
		}
		v = Mesh4._util.uniqueArr(v);// all vertices of face F[j]
		var N;
		if(f.info) N = f.info.normal;//Normalement we have calulé N in crossSection from cell
		N = N || new Vec4(1,0,0,0);
		if(!f.info){f.info = {color: 0xEEEEEE}}
		var va = Math.round(m.v.length/4);
		for(var i=0; i<v.length; i++){
			var vp = this.V[v[i]];//for each vertex vp of F[j]
			m.v.push(vp.x,vp.y,vp.z,vp.t);
			m.n.push(N.x,N.y,N.z,N.t);
			m.c.push((f.info.color >> 16)/256,(f.info.color>> 8 & 0xFF)/256,(f.info.color & 0xFF)/256);
			if(f[i]>=0){
				var a = v.indexOf(this.E[f[i]][0]),
					b = v.indexOf(this.E[f[i]][1]);
				if(a && b) m.f.push(a+va,b+va,0+va);
			}
		}	
	}
	return m;
}
Mesh3.prototype.collapse = function(){
	var a = new Mesh2();
	this.V.forEach(function(e){a.V.push(new Vec2(e.x,e.y));});
	Mesh4._util.copyPushArr(this.E,a.E);
	return a;
}
Mesh4.prototype.collapse = function(){
	var a = new Mesh3();
	this.V.forEach(function(e){a.V.push(new Vec3(e.x,e.y,e.z));});
	Mesh4._util.copyPushArr(this.E,a.E);
	Mesh4._util.copyPushArr(this.F,a.F);
	return a;
}
/*******Lib********/
Mesh2.points = function(v,flag){
	var E = (flag===false)?[]:[[0,v.length-1]];
	for(var i=1; i< v.length; i++){
		E.push([i,i-1]);
	}
	return new Mesh2({
		V: v,
		E: E
	});
}
Mesh2.polygon = function(radius,n){
	var step = Math.PI*2/n,
		M = new Mesh2();
	for(var i=0;i<n;i++){
		var t = i*step;
		M.V.push(new Vec2(Math.cos(t)*radius,Math.sin(t)*radius));
		M.E.push([i,(i)?(i-1):(n-1)]);
	}
	return M;
}
Mesh2.rectangle = function(w,h){
	w /= 2;
	h /= 2;
	return new Mesh2({
		V: [new Vec2(-w,-h),new Vec2(-w,h),new Vec2(w,h),new Vec2(w,-h)],
		E: [[0,1],[1,2],[2,3],[3,0]]
	});
}
/**lib3d**/
Mesh3.cube = function(r){
	return Mesh2.rectangle(r,r).embed(3,true).extrude(new Vec3(0,0,r)).move(new Vec3(0,0,-r/2));
}
Mesh3.cuboid = function(a,b,c){
	return Mesh2.rectangle(a,b).embed(3,true).extrude(new Vec3(0,0,c)).move(new Vec3(0,0,-c/2));
}
Mesh3.cylinder = function(r,n,h){
	return Mesh2.polygon(r,n).embed(3,true).extrude(new Vec3(0,0,h)).move(new Vec3(0,0,-h/2));
}
Mesh3.cone = function(r,n,h){
	return Mesh2.polygon(r,n).embed(3,true).pyramid(new Vec3(0,0,h)).move(new Vec3(0,0,-h/2));
}
Mesh3.sphere = function(r,u,v){
	return Mesh2.polygon(r,u*2).embed(3).turning(new Vec3(1,0,0),v,false).weld();
}
Mesh3.torus = function(r,R,u,v){
	return Mesh2.polygon(r,u).move(new Vec2(R,0)).embed(3,false,new Vec3(1,0,0),new Vec3(0,0,1)).turning(new Vec3(0,0,1),v);
}
Mesh3.grid = function(m,n,f){
	var Arr = [];
	m += 1;
	n += 1;
	for(var x = 0; x<m; x++){
		Arr[x] = new Vec2(x/(m-1)-0.5,0);
	}
	var lf = function(k,P){
		P.y += k/(n-1)-0.5;
	}
	var M = Mesh2.points(Arr,false).embed(3).loft(lf,n);
	if(f){
		for(var x = 0; x<m; x++){
			for(var y = 0; y<n; y++){
				M.V[x + m*y] = f(x/(m-1)-0.5,y/(n-1)-0.5);
			}
		}
	}
	return M;
}
/**lib4d**/
Mesh4.tesseract = function(r){
	return Mesh3.cube(r).embed(true).extrude(new Vec4(0,0,0,r)).move(new Vec4(0,0,0,-r/2));
}
Mesh4.cuboid = function(a,b,c,d){
	return Mesh3.cuboid(a,b,c).embed(true).extrude(new Vec4(0,0,0,d)).move(new Vec4(0,0,0,-d/2));
}
Mesh4.glome = function(r,u,v,w){
	return Mesh3.sphere(r,u,v).embed().turning(new Bivec(0,0,1,0,0,0),w,false).weld();
}
Mesh4.spherinder = function(r,u,v,h){
	return Mesh3.sphere(r,u,v).embed(true).extrude(new Vec4(0,0,0,h)).move(new Vec4(0,0,0,-h/2));
}
Mesh4.sphone = function(r,u,v,h){
	return Mesh3.sphere(r,u,v).embed(true).pyramid(new Vec4(0,0,0,h)).move(new Vec4(0,0,0,-h/2));
}
Mesh4.duocylinder = function(R1,R2,u,v,color){
	return Mesh2.polygon(R1,u).embed(4,true).directProduct(Mesh2.polygon(R2,v).embed(4,true,new Vec4(0,0,1,0),new Vec4(0,0,0,1)),color);
}
Mesh4.cubinder = function(R,n,h1,h2){
	return Mesh2.polygon(R,n).embed(4,true).directProduct(Mesh2.rectangle(h1,h2).embed(4,true,new Vec4(0,0,1,0),new Vec4(0,0,0,1)));
}
Mesh4.cylindrone = function(r,n,h,hc){
	return Mesh3.cylinder(r,n,h).embed(true).pyramid(new Vec4(0,0,0,hc)).move(new Vec4(0,0,0,-hc/2));
}
Mesh4.dicone = function(r,n,h1,h2){
	return Mesh3.cone(r,n,h1).move(new Vec3(0,0,h1/2)).embed(true).pyramid(new Vec4(0,0,0,h2)).move(new Vec4(0,0,-h1/3,-h2/3));
}
Mesh4.duocone = function(R1,R2,u,v){
	return Mesh2.polygon(R1,u).embed(4).duopyramid(Mesh2.polygon(R2,v).embed(4,false,new Vec4(0,0,1,0),new Vec4(0,0,0,1)));
} 
Mesh4.coninder = function(r,n,h,hc){
	return Mesh3.cone(r,n,h).embed(true).extrude(new Vec4(0,0,0,hc)).move(new Vec4(0,0,0,-hc/2));
}
Mesh4.torinder = function(r,R,u,v,h){
	return Mesh3.cylinder(r,u,h).move(new Vec3(R,0,0)).embed().turning(new Bivec(0,0,1,0,0,0),v);
}
Mesh4.spheritorus = function(r,R,u,v,w){
	return Mesh3.sphere(r,u,v).move(new Vec3(R,0,0)).embed(false).turning(new Bivec(0,0,1,0,0,0),w);//.weld();
}
Mesh4.torisphere = function(r,R,u,v,w){
	return Mesh3.torus(r,R,u,v).embed(false,new Vec4(1,0,0,0),new Vec4(0,1,0,0),new Vec4(0,0,0,1)).turning(new Bivec(0,1,0,0,0,0),w,false).weld();
}
Mesh4.ditorus = function(r,R,RR,u,v,w){
	return Mesh3.torus(r,R,u,v).embed(false,new Vec4(0,1,0,0),new Vec4(0,0,0,1),new Vec4(0,0,1,0)).move(new Vec4(0,RR,0,0)).turning(new Bivec(1,0,0,0,0,0),w);
}
Mesh4.tiger = function(r,R1,R2,u,v,w){
	return Mesh4.torus(r,R1,u,v).move(new Vec4(0,0,R2,0)).turning(new Bivec(0,0,0,0,0,1),w);
}
Mesh4.torus = function(r,R,u,v){
	return Mesh2.polygon(r,u).move(new Vec2(R,0)).embed(4,true,new Vec4(1,0,0,0),new Vec4(0,0,1,0)).turning(new Bivec(1,0,0,0,0,0),v);
}
Mesh4.grid = function(m,n,o,f){
	var lf = function(i,p){
		p.z += i/o-0.5;
	}
	var M = Mesh3.grid(m,n).embed().loft(lf,o+1);
	if(f){
		m += 1;
		n += 1;
		for(var x = 0; x<m; x++){
			for(var y = 0; y<n; y++){
				for(var z = 0; z<o+1; z++){
					M.V[x + m*y + m*n*z] = f(x/(m-1)-0.5,y/(n-1)-0.5,z/o-0.5);
				}
			}
		}
	}
	return M;
}

var Spline = function(ps,ctrl){
	this.ps = ps;
	this.ctrl = ctrl;
	this._curve = null;
	this._tetrad = null;
}
Spline._diff = function(Vs){
	//diff[i] = Vs[i+1] - Vs[i];
	var diff = [];
	for(var i = 0; i<Vs.length-1; i++){
		diff[i] = Vs[i+1].sub(Vs[i], false);
	}
	return diff;
}
Spline.prototype._generateCurve = function(h){
	var resultPs = [];
	for(var i=0; i<this.ps.length -1; i++){
		var p0 = this.ps[i];
		var p1 = this.ps[i+1];
		var d0 = this.ctrl[i];
		var d1 = this.ctrl[i+1];
		var p01 = p0.sub(p1,false);
		var A = d0.add(d1,false).add(p01.mul(2));
		var B = d0.mul(-2,false).sub(d1).sub(p01.mul(1.5));
		for(var j=0; j<h; j++){
			var t = j/h;
			var x = p0.x + t*(d0.x + t*(B.x + t*A.x));
			var y = p0.y + t*(d0.y + t*(B.y + t*A.y));
			var z = p0.z + t*(d0.z + t*(B.z + t*A.z));
			var w = p0.t + t*(d0.t + t*(B.t + t*A.t));
			resultPs.push(new Vec4(x,y,z,w));
		}
	}
	this._curve = resultPs;
	return resultPs;
}
Spline.prototype.getValue = function(t){
	var i = Math.floor(t);
	t -= i;
	i %= this.ps.length-1;
	if(i<0) i+=this.ps.length-1
	//i = i < this.ps.length - 1 ? i : i % (this.ps.length-1);
	var p0 = this.ps[i];
	var p1 = this.ps[i+1];
	var d0 = this.ctrl[i];
	var d1 = this.ctrl[i+1];
	var p01 = p0.sub(p1,false);
	var A = d0.add(d1,false).add(p01.mul(2));
	var B = d0.mul(-2,false).sub(d1).sub(p01.mul(1.5));
	var x = p0.x + t*(d0.x + t*(B.x + t*A.x));
	var y = p0.y + t*(d0.y + t*(B.y + t*A.y));
	var z = p0.z + t*(d0.z + t*(B.z + t*A.z));
	var w = p0.t + t*(d0.t + t*(B.t + t*A.t));
	return new Vec4(x,y,z,w);
}
Spline.prototype._generateTetrad = function(h){
	if (!this._curve) this._curve = this._generateCurve(h);
	var curve = this._curve;
	var ps = Spline._diff(curve);
	var totalM = ps.length;
	var N = [];
	var Mat = new Mat4();
	var dir = new Vec4(0,0,0,1);
	for (var m=0; m<totalM; m++){
		var ndir = ps[m].norm();
		var R = dir.cross(ndir,false);
		var s = R.len();
		if(Math.abs(s)>0.000001){
			var c = dir.dot(ndir); 
			R.mul(-Math.atan2(s,c)/s);
		}
		Mat = R.exp().mul(Mat);
		N[m] = Mat.clone();
		dir = ndir;
	}
	this._tetrad = N;
}
Spline.prototype.loft = function(h,cross,loop,keepUp){
	if (!this._curve) {
		this._generateCurve(h);
		this._generateTetrad(h);
	}
	var curve = this._curve;
	var N = this._tetrad;
	var f = function (m,P){
		P.set(N[m].mul(P).add(curve[m]));
	}
	return cross.loft(f,curve.length - 1,loop==true?false:null);
}

var Perlin3 = function(seed){
	this.seed = seed;
	this._seed = seed;
	this._p = [];
	var p = this._p;
	for(var i=0; i<256; i++){
		p[i] = i;
	}
	var i = 255;
	while(i--){
		var x = Math.sin(this._seed++)*6047003;
		var j = Math.floor((x-Math.floor(x))*i);
		x = p[i];
		p[i] = p[j];
		p[j] = x;
	}
	for(var i=0; i<256; i++){
		p[i+256] = p[i];
	}
};

Perlin3.prototype.value = function(x,y,z){
	var p = this._p;
	var X = Math.floor(x) & 255;
	var Y = Math.floor(y) & 255;
	var Z = Math.floor(z) & 255;
	x -= Math.floor(x);
	y -= Math.floor(y);
	z -= Math.floor(z);
	function _fade(t){
		return t * t * t * (t * (t * 6 - 15) + 10);
	}
	var u = _fade(x);
	var v = _fade(y);
	var w = _fade(z);
	
	function _lerp(t,a,b){
		return a + t * (b - a);
	}
	
	function _grad(hash, x, y, z) {
		var h = hash & 15;
		var u = h < 8 ? x : y;
		var v = h < 4 ? y : (h == 12 || h == 14) ? x : z;
		return ((h & 1) == 0 ? u : -u) + ((h & 2) == 0 ? v : -v);
	}
	
	var A = p[X] + Y, AA = p[A] + Z, AB = p[A + 1] + Z;
	var B = p[X + 1] + Y, BA = p[B] + Z, BB = p[B + 1] + Z;

	return _lerp(w, _lerp(v, _lerp(u, _grad(p[AA], x, y, z),
		_grad(p[BA], x - 1, y, z)),
		_lerp(u, _grad(p[AB], x, y - 1, z),
		_grad(p[BB], x - 1, y - 1, z))),
		_lerp(v, _lerp(u, _grad(p[AA + 1], x, y, z - 1),
		_grad(p[BA + 1], x - 1, y, z - 1)),
		_lerp(u, _grad(p[AB + 1], x, y - 1, z - 1),
		_grad(p[BB + 1], x - 1, y - 1, z - 1))));
}

//useful tools for Mesh4

Mesh4.prototype.update = function(){
	this.getNormal();
	this.getBoundingObjs();
	return this;
}
Obj4.Group.prototype.update = function(){
	for(var s of this.child){
		s.update ? s.update() : s.mesh.update();
	}
	this.getBoundingObjs();
}
Obj4.Group.prototype.getBoundingObjs = function(plane){
	var min = new Vec4(Infinity,Infinity,Infinity,Infinity);
	var max = new Vec4(-Infinity,-Infinity,-Infinity,-Infinity);
	for(var c of this.child){
		var w = c.coordMat().array;
		var x = new Vec4(w[0],w[1],w[2],w[3]);
		var y = new Vec4(w[4],w[5],w[6],w[7]);
		var z = new Vec4(w[8],w[9],w[10],w[11]);
		var t = new Vec4(w[12],w[13],w[14],w[15]);
		
		function findMinMax(axis){
			var min, max;
			var box = c.boundingBox || c.mesh.boundingBox ||((c.getBoundingObjs)?c.getBoundingObjs().boundingBox : c.mesh.getBoundingObjs().boundingBox);
			if ( axis.x > 0 ) {
				min = axis.x * box.min.x;
				max = axis.x * box.max.x;
			} else {
				min = axis.x * box.max.x;
				max = axis.x * box.min.x;
			}
			if ( axis.y > 0 ) {
				min += axis.y * box.min.y;
				max += axis.y * box.max.y;
			} else {
				min += axis.y * box.max.y;
				max += axis.y * box.min.y;
			}
			if ( axis.z > 0 ) {
				min += axis.z * box.min.z;
				max += axis.z * box.max.z;
			} else {
				min += axis.z * box.max.z;
				max += axis.z * box.min.z;
			}
			if ( axis.t > 0 ) {
				min += axis.t * box.min.t;
				max += axis.t * box.max.t;
			} else {
				min += axis.t * box.max.t;
				max += axis.t * box.min.t;
			}
			return [min,max];
		}
		
		x = findMinMax(x);
		y = findMinMax(y);
		z = findMinMax(z);
		t = findMinMax(t);
		var MIN = new Vec4(x[0],y[0],z[0],t[0]).add(c.position);
		var MAX = new Vec4(x[1],y[1],z[1],t[1]).add(c.position);
		min.x = Math.min(min.x,MIN.x);
		min.y = Math.min(min.y,MIN.y);
		min.z = Math.min(min.z,MIN.z);
		min.t = Math.min(min.t,MIN.t);
		max.x = Math.max(max.x,MAX.x);
		max.y = Math.max(max.y,MAX.y);
		max.z = Math.max(max.z,MAX.z);
		max.t = Math.max(max.t,MAX.t);
	}
	
	this.boundingBox = {
		min:min,
		max:max
	};
	return this;
}
Mesh4.prototype.intersectBoundingObj = Obj4.Group.prototype.intersectBoundingObj = function(plane){
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
	return this;
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
	return this;
}