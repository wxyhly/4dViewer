//4d physical engine
'use strict';
var Phy4d = function(dt){
	this.dt = dt||0.001;
	this.obj = [];
	this.constrain = [];
	this.force = [];
	this.iterations = 10;
	this.gravity = new Vec4(0,-9.8,0,0);
}
Phy4d.prototype.addObj = function(o){
	this.obj.push(o);
}
Phy4d.prototype.addConstrain = function(c){
	c.engine = this;
	this.constrain.push(c);
}
Phy4d.prototype.addForce = function(f){
	f.engine = this;
	this.force.push(f);
}

//Geometries: PhyGeom

Phy4d.Plane = function(n,t){//x.n - t = 0
	n.norm();
	this.n = n;
	this.t = t;
}
Phy4d.Plane.prototype.getPosition = function(){
	return null;
}
Phy4d.Plane.prototype.getRotation = function(){
	return null;
}
Phy4d.Plane.prototype.generateGeom = function(data){
	if(!data) data={};
	var planeWidth = data.size || data.r || 20;
	var m = Mesh3.cube(planeWidth).embed(true).move(new Vec4(0,0,0,this.t)).rotate(new PMat5Q().lookAt(this.n).rotation);
	return new Geom4(m,null,null,data.color);
}
Phy4d.Plane.prototype.getAABB = function(){
	return this;
}
Phy4d.Plane.prototype.testAABB = function(aabb){
	return aabb.testAABB(this);
}
Phy4d.Glome = function(R){//|x - o| = r
	this.R = R;
}
Phy4d.Glome.prototype.generateGeom = function(data){
	if(!data) data={};
	var m = Mesh4.glome(this.R,data.u||8,data.v||8,data.w||8);
	return new Geom4(m,null,null,data.color);
}
Phy4d.Glome.prototype.getAABB = function(){
	var RRRR = new Vec4(this.R,this.R,this.R,this.R);
	var o = this.Obj.getPosition(true);
	return new Phy4d.AABB(o.sub(RRRR,false),o.add(RRRR,false),this);
}
Phy4d.Spheritorus = function(R1,R2){//default orientation: xOt (same as shape Mesh4.spheritorus)
	this.R1 = R1;
	this.R2 = R2;
}
Phy4d.Spheritorus.prototype.generateGeom = function(data){
	if(!data) data={};
	var m = Mesh4.spheritorus(this.R1,this.R2,data.u||8,data.v||8,data.w||16);
	return new Geom4(m,null,null,data.color);
}
Phy4d.Spheritorus.prototype.getAABB = function(){
	var RRRR = new Vec4(this.R1+this.R2,this.R1+this.R2,this.R1+this.R2,this.R1+this.R2);
	var o = this.Obj.getPosition(true);
	return new Phy4d.AABB(o.sub(RRRR,false),o.add(RRRR,false),this);
}
Phy4d.Torisphere = function(R1,R2){//default orientation: t (same as shape Mesh4.torisphere)
	this.R1 = R1;
	this.R2 = R2;
}
Phy4d.Torisphere.prototype.generateGeom = function(data){
	if(!data) data={};
	var m = Mesh4.torisphere(this.R1,this.R2,data.u||8,data.v||16,data.w||16);
	return new Geom4(m,null,null,data.color);
}
Phy4d.Torisphere.prototype.getAABB = function(){
	var o = this.Obj.getPosition(true);
	var RRRR = new Vec4(this.R1+this.R2,this.R1+this.R2,this.R1+this.R2,this.R1+this.R2);
	return new Phy4d.AABB(o.sub(RRRR,false),o.add(RRRR,false));
}
Phy4d.Tiger = function(R,R1,R2){//default orientation: R1:xy R2:zt (same as shape Mesh4.tiger)
	this.R = R;
	this.R1 = R1;
	this.R2 = R2;
}
Phy4d.Tiger.prototype.generateGeom = function(data){
	if(!data) data={};
	var m = Mesh4.tiger(this.R,this.R1,this.R2,data.u||8,data.v||16,data.w||16);
	return new Geom4(m,null,null,data.color);
}
Phy4d.Tiger.prototype.getAABB = function(){
	if(!this.R12)this.R12 = Math.sqrt(this.R1*this.R1+this.R2*this.R2);
	var R = this.R12+this.R;
	var RRRR = new Vec4(R,R,R,R);
	var o = this.Obj.getPosition(true);
	return new Phy4d.AABB(o.sub(RRRR,false),o.add(RRRR,false));
}
Phy4d.Convex = function(mesh4){//from mesh4 convex hull
	this.mesh = mesh4;
	if(!(mesh4.C[0].info && mesh4.C[0].info.normal)){
		mesh4.getNormal();
	}
	for(var c of mesh4.C){
		var v = mesh4.V[mesh4.E[mesh4.F[c[0]][0]][0]];
		var t = v.dot(c.info.normal);
		if(t<0){
			c.info.normal.sub();
			c.info.t = -t;
		}else{
			c.info.t = t;
		}
		for(var fn of c){
			var f = mesh4.F[fn];
			if(!f.info) f.info = {normal: new Vec4()};
			f.info.normal.add(c.info.normal);
		}
	}
	for(var f of mesh4.F){
		f.info.normal.norm();
		var e1 = mesh4.E[f[0]];
		var e2 = mesh4.E[f[1]];
		var A = mesh4.V[e1[0]];
		var B = mesh4.V[e1[1]];
		var C = (e2[0] != e1[0] && e2[0] != e1[1])?mesh4.V[e2[0]]:mesh4.V[e2[1]];
		var AB = B.sub(A,false);
		var AC = C.sub(A,false);
		f.info.ABAC = AB.cross(AC).norm();
		f.info.A = A;
		f.info.B = B;
		f.info.C = C;
		f.info.AB = AB;
		f.info.AC = AC;
	}
}
Phy4d.Convex.prototype.generateGeom = function(data){
	var m = this.mesh;
	return new Geom4(m,null,null,data?data.color:data);
}
Phy4d.Convex.prototype.getAABB = function(){
	var o = this.Obj.getPosition(true);
	var r = this.Obj.getRotation(true);
	var m = r[0].toMatL().mul(r[1].toMatR());
	var xmax, ymax, zmax, tmax;
	xmax = ymax = zmax = tmax = -Infinity;
	var xmin, ymin, zmin, tmin;
	xmin = ymin = zmin = tmin = Infinity;
	for(var v of this.mesh.V){
		var wv = m.mul(v);
		xmax = Math.max(xmax, wv.x);
		ymax = Math.max(ymax, wv.y);
		zmax = Math.max(zmax, wv.z);
		tmax = Math.max(tmax, wv.t);
		xmin = Math.min(xmin, wv.x);
		ymin = Math.min(ymin, wv.y);
		zmin = Math.min(zmin, wv.z);
		tmin = Math.min(tmin, wv.t);
	}
	return new Phy4d.AABB(o.add(new Vec4(xmin,ymin,zmin,tmin),false),o.add(new Vec4(xmax,ymax,zmax,tmax),false),this);
}
//bug: Union inertie!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//add todo: AABB
Phy4d.Union = function(Objs){
	this.objs = Objs;
	for(var o of Objs){
		o.parent = this;
	}
}
Phy4d.Union.prototype.toWorld = function(o){//convert sub obj to world coordinate
	var wo = this.Obj.getPosition(true);
	var wr = this.Obj.getRotation(true);
	if(o.o){
		o.wo = wr[0].mul(o.o,false).mul(wr[1]).add(wo);
	}
	if(o.r){
		o.wr = [wr[0].mul(o.r[0],false), o.r[1].mul(wr[1],false)];
	}
	return o;//new Phy4d.Obj(o,this.Obj);
}
Phy4d.Union.prototype.generateGeom = function(data){
	//todo
	var list = [];
	var datas;
	if(data && data.length == this.objs.length){
		datas = data;
	}else if(!data || !data.length){
		datas = new Array(this.objs.length).fill(data);
	}else{
		console.error("data length doesn't match the number of objs in the union");
	}
	for(var obj in this.objs){
		var o = this.objs[obj];
		data = datas[obj];
		var g = o.generateGeom(data);
		if(!(o.phyGeom instanceof Phy4d.Union)){
			if(data&&data.flow) g.flow = data.flow;
			if(data&&data.glow) g.glow = data.glow;
		}
		list.push(g);
	}
	return new Obj4.Group(list);
}
Phy4d.Union.prototype.getAABB = function(){
	var min = new Vec4(Infinity,Infinity,Infinity,Infinity);
	var max = new Vec4(-Infinity,-Infinity,-Infinity,-Infinity);
	for(var o of this.objs){
		var ab = this.toWorld(o).getAABB();
		o.AABB = ab;
		min.x = Math.min(min.x,ab.min.x);
		min.y = Math.min(min.y,ab.min.y);
		min.z = Math.min(min.z,ab.min.z);
		min.t = Math.min(min.t,ab.min.t);
		max.x = Math.max(max.x,ab.max.x);
		max.y = Math.max(max.y,ab.max.y);
		max.z = Math.max(max.z,ab.max.z);
		max.t = Math.max(max.t,ab.max.t);
	}
	return new Phy4d.AABB(min,max);
}
//Obj4
Phy4d.Obj = function(phyGeom,mass,o,r){
	this.phyGeom = phyGeom;
	this.phyGeom.Obj = this;
	this.setDefault();
	this.setMass(mass);
	this.setPMat(o,r);
}
Phy4d.Obj.prototype.setPMat = function(PMat,r){
	if(this.phyGeom instanceof Phy4d.Plane) return 0;
	if(r && r[1]){
		this.getRotation()[0].set(r[0]);
		this.getRotation()[1].set(r[1]);
	}
	if(!PMat) return 0;
	if(!PMat.position){
		this.getPosition().set(PMat);
	}else if(PMat.position && PMat.rotation){
		this.getPosition().set(PMat.position);
		this.getRotation()[0].set(PMat.rotation[0]);
		this.getRotation()[1].set(PMat.rotation[1]);
	}
}
Phy4d.Obj.prototype.setDefault = function(){
	this.invMass = 0;
	this.o = new Vec4();
	this.r = [new Vec4(1), new Vec4(1)];
	//linaire:
	this.v = new Vec4();
	this.a = new Vec4();
	//angulaire:
	this.w = new Bivec();
	this.b = new Bivec();
	//surfae:
	this.restitution = 0.7;
	this.friction = 0.1;
	//for sleep:
	this.sleepEpsilon = 0.05;
	this.energy = this.sleepEpsilon*2;
	this.sleep = false;
}
Phy4d.Obj.prototype.getPosition = function(flag){
	if(flag){
		return this.wo || this.o;
	}
	return this.o;
}
Phy4d.Obj.prototype.getRotation = function(flag){
	if(flag){
		return this.wr || this.r;
	}
	return this.r;
}
Phy4d.Obj.prototype.generateGeom = function(data){
	var g = this.phyGeom.generateGeom(data);
	g.position = this.getPosition();
	g.rotation = this.getRotation();
	if(this.phyGeom instanceof Phy4d.Union){
		return g;
	}
	if(data && data.flow) g.flow = data.flow;
	if(data && data.glow) g.glow = data.glow;
	return g;
}
Phy4d.Obj.prototype.bindGeom = function(g){
	g.position = this.getPosition();
	g.rotation = this.getRotation();
}
Phy4d.Obj.prototype.getlinearVelocity = function(worldP){
	var localP = worldP.sub(this.getPosition(true),false);
	return this.w.dual(false).cross(localP).sub().add(this.v);
}
Phy4d.Obj.prototype.setMass = function(mass){
	if(this.phyGeom instanceof Phy4d.Plane) mass = 0;
	if(this.phyGeom.constructor == Phy4d.Union){
		var num = this.phyGeom.objs.length;
		mass = 0;
		//if(!mass.length) mass = new Array(num).fill(mass/num);
		var Is = [];
		for(var o of this.phyGeom.objs){
			Is.push(o.getInertie());
			mass += o.mass;
		}
		this.inertie = Is.reduce((a,b)=>a.add(b));
	}
	if(mass === 0)mass = Infinity;
	this.mass = mass;
	this.invMass = 1/mass;
	if(this.invMass>0 && this.phyGeom.constructor != Phy4d.Union) this.getInertie();
}
Phy4d.Obj.prototype.getInertie = function(){
	var I;
	if(this.phyGeom.constructor == Phy4d.Convex){
		I = [
			[0,0,0,0,0,0],
			[0,0,0,0,0,0],
			[0,0,0,0,0,0],
			[0,0,0,0,0,0],
			[0,0,0,0,0,0],
			[0,0,0,0,0,0]
		];
		for(var v of this.phyGeom.mesh.V){
			var x = v.x, x2 = x*x; 
			var y = v.y, y2 = y*y;
			var z = v.z, z2 = z*z;
			var t = v.t, t2 = t*t;		
			I[0][0]+= x2+y2; I[0][1]+=   y*z; I[0][2]+=   y*t; I[0][3]+=  -x*z; I[0][4]+=  -x*t; I[0][5]+=     0;
			I[1][0]+=  y*z ; I[1][1]+= x2+z2; I[1][2]+=   z*t; I[1][3]+=   x*y; I[1][4]+=   0  ; I[1][5]+=  -x*t;
			I[2][0]+=  y*t ; I[2][1]+=   t*z; I[2][2]+= x2+t2; I[2][3]+=    0 ; I[2][4]+=   x*y; I[2][5]+=   x*z;
			I[3][0]+= -x*z ; I[3][1]+=   y*x; I[3][2]+=   0  ; I[3][3]+= y2+z2; I[3][4]+=   z*t; I[3][5]+=  -t*y;
			I[4][0]+= -x*t ; I[4][1]+=   0  ; I[4][2]+=   y*x; I[4][3]+=   t*z; I[4][4]+= y2+t2; I[4][5]+=   y*z;
			I[5][0]+=    0 ; I[5][1]+=  -t*x; I[5][2]+=   x*z; I[5][3]+=  -t*y; I[5][4]+=   y*z; I[5][5]+= z2+t2;
		}
		var factor = this.mass/this.phyGeom.mesh.V.length;  // 除以3是模拟实心物体而不是质量都在外壳上
		for(var i of I){
			for(var j in i){
				i[j] *= factor;
			}
		}
	}else if(this.phyGeom.constructor == Phy4d.Glome){
		var f = this.mass*this.phyGeom.R*this.phyGeom.R;
		I = [
			[f,0,0,0,0,0],
			[0,f,0,0,0,0],
			[0,0,f,0,0,0],
			[0,0,0,f,0,0],
			[0,0,0,0,f,0],
			[0,0,0,0,0,f]
		];
	}else if(this.phyGeom.constructor == Phy4d.Spheritorus){
		var f1 = this.mass*this.phyGeom.R1*this.phyGeom.R1;
		var f2 = this.mass*this.phyGeom.R2*this.phyGeom.R2;
		var f12 = this.mass*this.phyGeom.R1*this.phyGeom.R2;
		I = [
			[f12,0,0,0,0,0],
			[0,f12,0,0,0,0],
			[0,0,f2,0,0,0],
			[0,0,0,f1,0,0],
			[0,0,0,0,f12,0],
			[0,0,0,0,0,f12]
		];
	}else if(this.phyGeom.constructor == Phy4d.Torisphere){
		var f2 = this.mass*this.phyGeom.R2*this.phyGeom.R2;
		var f12 = this.mass*this.phyGeom.R1*this.phyGeom.R2;
		I = [
			[f2,0,0,0,0,0],
			[0,f2,0,0,0,0],
			[0,0,f12,0,0,0],
			[0,0,0,f2,0,0],
			[0,0,0,0,f12,0],
			[0,0,0,0,0,f12]
		];
	}else if(this.phyGeom.constructor == Phy4d.Tiger){
		var f2 = this.mass*this.phyGeom.R2*this.phyGeom.R2;
		var f12 = this.mass*this.phyGeom.R1*this.phyGeom.R2;
		var f1 = this.mass*this.phyGeom.R1*this.phyGeom.R1;
		I = [
			[f1,0,0,0,0,0],
			[0,f12,0,0,0,0],
			[0,0,f12,0,0,0],
			[0,0,0,f12,0,0],
			[0,0,0,0,f12,0],
			[0,0,0,0,0,f2]
		];
	}else{
		return 0;
	}
	this.inertie = new MatBivec(I);
	return this.inertie;
}
Phy4d.Obj.prototype.getAABB = function(){
	return this.phyGeom.getAABB();
}
Phy4d.Obj.prototype.wake = function(){
	this.sleep = false;
	this.energy = this.sleepEpsilon*2;
}
Phy4d.Obj.prototype.applyForce = function(F,p,t){
	this.a.add(F.mul(this.invMass,false));
	var torque = (p)?F.cross(p.sub(this.getPosition(true),false)):new Bivec();
	if(t) torque.add(t);
	this.b.add(this.inertie.invMul(torque));
}
Phy4d.AABB = function(min,max,obj){
	this.min = min;
	this.max = max;
	this.obj = obj;
}
Phy4d.AABB.prototype.testAABB = function(aabb){
	if(aabb instanceof Phy4d.AABB){
		return (
			((this.min.x >= aabb.min.x && this.min.x <= aabb.max.x) || (aabb.min.x >= this.min.x && aabb.min.x <= this.max.x)) &&
			((this.min.y >= aabb.min.y && this.min.y <= aabb.max.y) || (aabb.min.y >= this.min.y && aabb.min.y <= this.max.y)) &&
			((this.min.t >= aabb.min.t && this.min.t <= aabb.max.t) || (aabb.min.t >= this.min.t && aabb.min.t <= this.max.t)) &&
			((this.min.z >= aabb.min.z && this.min.z <= aabb.max.z) || (aabb.min.z >= this.min.z && aabb.min.z <= this.max.z))
		);
	}
	if(aabb instanceof Phy4d.Plane){
		var min, max;
		var plane = aabb;
		if ( plane.n.x > 0 ) {
			min = plane.n.x * this.min.x;
			max = plane.n.x * this.max.x;
		} else {
			min = plane.n.x * this.max.x;
			max = plane.n.x * this.min.x;
		}
		if ( plane.n.y > 0 ) {
			min += plane.n.y * this.min.y;
			max += plane.n.y * this.max.y;
		} else {
			min += plane.n.y * this.max.y;
			max += plane.n.y * this.min.y;
		}
		if ( plane.n.z > 0 ) {
			min += plane.n.z * this.min.z;
			max += plane.n.z * this.max.z;
		} else {
			min += plane.n.z * this.max.z;
			max += plane.n.z * this.min.z;
		}
		if ( plane.n.t > 0 ) {
			min += plane.n.t * this.min.t;
			max += plane.n.t * this.max.t;
		} else {
			min += plane.n.t * this.max.t;
			max += plane.n.t * this.min.t;
		}
		if ( min <= plane.t && max >= plane.t ){
			return true;
		}
		if ( min <= plane.t && max <= plane.t ){
			return true;
		}
		if ( min >= plane.t && max >= plane.t ){
			return false;
		}
	}
	console.error("unexpected aabb type!");
}
Phy4d.Collision = function(engine,obj1,obj2,n,d,p){
	//obj1,obj2,Vseparation,depth,normal(from 1 to 2),point
	this.engine = engine;
	//find parent (union):
	while(obj1.parent){
		obj1 = obj1.parent.Obj;
	}
	while(obj2.parent){
		obj2 = obj2.parent.Obj;
	}
	this.obj1 = obj1;
	this.obj2 = obj2;
	this.Vrel = this.obj2.getlinearVelocity(p).sub(this.obj1.getlinearVelocity(p),false);//.dot(n);
	this.Vsep = this.Vrel.dot(n);
	this.d = d;
	this.n = n;
	this.p = p;
	this.restitution = obj1.restitution * obj2.restitution;
	this.friction = obj1.friction + obj2.friction;
	
}
Phy4d.Collision.prototype._solve = function(){
	var obj1 = this.obj1;
	var obj2 = this.obj2;
	if(this.Vsep <= 0){//solve Collision (apply pulse)
		obj1.changed = obj2.changed = true;
		var _restitution = this.restitution;
		if(this.Vsep>-this.engine.dt*10) _restitution = 0;		
		var newSepVelocity = -this.Vsep * _restitution;
		var accCausedVelocity = obj2.a.sub(obj1.a,false);
		var accCausedSepVelocity = accCausedVelocity.dot(this.n) * this.engine.dt;
		if (accCausedSepVelocity <= 0){
			newSepVelocity += accCausedSepVelocity;
			// Make sure we haven’t removed more than was
			// there to remove.
			if (newSepVelocity < 0) newSepVelocity = 0;
		}
		var deltaVelocity = newSepVelocity - this.Vsep;//desired change in velocity [V]
		/*if(deltaVelocity>0.001){
			obj1.wake();
			obj2.wake();
		}*/
		var deltaV4 = this.n.mul(deltaVelocity,false).add(this.n.mul(this.Vsep,false).sub(this.Vrel));
		var totalInvMass = obj1.invMass + obj2.invMass;
		if(totalInvMass>0){
			var relContactP1 = this.p.sub(this.obj1.getPosition(true),false);
			var relContactP2 = this.p.sub(this.obj2.getPosition(true),false);
			//relContactP2.z = 0;
			//relContactP2.t = 0;
			var angularComponent_x = new Vec4();
			var angularComponent_y = new Vec4();
			var angularComponent_z = new Vec4();
			var angularComponent_t = new Vec4();
			
			//var angularComponent = new Vec4();
			var r1 = obj1.getRotation(true);
			var r2 = obj2.getRotation(true);
			if(r1 && obj1.invMass){
				var M1 = r1[0].toMatL().mul(r1[1].toMatR());
				var MW1 = M1.toMatBivec();
				var MW1t = MW1.t(false);
				
				var W1_x = MW1t.mul(
					obj1.inertie.invMul(
						MW1.mul(relContactP1.cross(new Vec4(1,0,0,0)),false)
					),false
				);
				angularComponent_x.add(W1_x.dual(false).cross(relContactP1));
				var W1_y = MW1t.mul(
					obj1.inertie.invMul(
						MW1.mul(relContactP1.cross(new Vec4(0,1,0,0)),false)
					),false
				);
				angularComponent_y.add(W1_y.dual(false).cross(relContactP1));
				var W1_z = MW1t.mul(
					obj1.inertie.invMul(
						MW1.mul(relContactP1.cross(new Vec4(0,0,1,0)),false)
					),false
				);
				angularComponent_z.add(W1_z.dual(false).cross(relContactP1));
				var W1_t = MW1t.mul(
					obj1.inertie.invMul(
						MW1.mul(relContactP1.cross(new Vec4(0,0,0,1)),false)
					),false
				);
				angularComponent_t.add(W1_t.dual(false).cross(relContactP1));
				
			}
			if(r2 && obj2.invMass){
				var M2 = r2[0].toMatL().mul(r2[1].toMatR());
				var MW2 = M2.toMatBivec();
				var MW2t = MW2.t(false);
				
				var W2_x = MW2t.mul(
					obj2.inertie.invMul(
						MW2.mul(relContactP2.cross(new Vec4(1,0,0,0)),false)
					),false
				);
				angularComponent_x.add(W2_x.dual(false).cross(relContactP2));
				var W2_y = MW2t.mul(
					obj2.inertie.invMul(
						MW2.mul(relContactP2.cross(new Vec4(0,1,0,0)),false)
					),false
				);
				angularComponent_y.add(W2_y.dual(false).cross(relContactP2));
				var W2_z = MW2t.mul(
					obj2.inertie.invMul(
						MW2.mul(relContactP2.cross(new Vec4(0,0,1,0)),false)
					),false
				);
				angularComponent_z.add(W2_z.dual(false).cross(relContactP2));
				var W2_t = MW2t.mul(
					obj2.inertie.invMul(
						MW2.mul(relContactP2.cross(new Vec4(0,0,0,1)),false)
					),false
				);
				angularComponent_t.add(W2_t.dual(false).cross(relContactP2));
				
			}
			var velocityPerUnitImpulse = new Mat4(
				totalInvMass + angularComponent_x.x, angularComponent_x.y, angularComponent_x.z, angularComponent_x.t,
				angularComponent_y.x, totalInvMass + angularComponent_y.y, angularComponent_y.z, angularComponent_y.t,
				angularComponent_z.x, angularComponent_z.y, totalInvMass + angularComponent_z.z, angularComponent_z.t,
				angularComponent_t.x, angularComponent_t.y, angularComponent_t.z, totalInvMass + angularComponent_t.t
			);
			var impulse = velocityPerUnitImpulse.inv().mul(deltaV4);
			var impulseN = this.n.mul(impulse.dot(this.n),false);
			var impulseT = impulse.sub(impulseN,false);
			var ratio = impulseT.len(false)/impulseN.len(false)
			if(ratio > this.friction * this.friction){
				impulseT.mul(this.friction / Math.sqrt(ratio));
			}
			
			impulse = impulseT.add(impulseN);
			
			//var velocityPerUnitImpulse = totalInvMass + angularComponent.dot(this.n);
			//var factor = deltaVelocity/velocityPerUnitImpulse;
			//var impulse = this.n.mul(factor,false);
			
			obj1.v.sub(impulse.mul(obj1.invMass,false));
			obj2.v.add(impulse.mul(obj2.invMass,false));
			
			if(r1 && obj1.invMass){
				var dw1 = W1_x.mul(impulse.x).add(W1_y.mul(impulse.y)).add(W1_z.mul(impulse.z)).add(W1_t.mul(impulse.t));
				obj1.w.add(
					dw1
				);
			}
			if(r2 && obj2.invMass){
				var dw2 = W2_x.mul(impulse.x).add(W2_y.mul(impulse.y)).add(W2_z.mul(impulse.z)).add(W2_t.mul(impulse.t));
				obj2.w.sub(
					dw2
				);
			}
		}
	}
	if(this.d > 0){//solve penetration (separate 2 objs)
		var totalInvMass = obj1.invMass + obj2.invMass;
		if(totalInvMass>0){
			var totalInvInertie = totalInvMass;
			var r1 = obj1.getRotation(true);
			var r2 = obj2.getRotation(true);
			if(obj1.inertie){
				var relContactP1 = this.p.sub(this.obj1.getPosition(),false);
				if(!MW1) {
					var MW1 = r1[0].toMatL().mul(r1[1].toMatR()).toMatBivec();
					var MW1t = MW1.t(false);
				}
				var W1 = MW1t.mul(
					obj1.inertie.invMul(
						MW1.mul(relContactP1.cross(this.n),false)
					),false
				);
				var angularInertie1 = W1.dual(false).cross(relContactP1).dot(this.n);
				totalInvInertie += Math.abs(angularInertie1);
			}
			if(obj2.inertie){
				var relContactP2 = this.p.sub(this.obj2.getPosition(),false);
				if(!MW2) {
					var MW2 = r2[0].toMatL().mul(r2[1].toMatR()).toMatBivec();
					var MW2t = MW2.t(false);
				}
				var W2 = MW2t.mul(
					obj2.inertie.invMul(
						MW2.mul(relContactP2.cross(this.n),false)
					),false
				);
				var angularInertie2 = W2.dual(false).cross(relContactP2).dot(this.n);
				totalInvInertie += Math.abs(angularInertie2);
			}
			
			var dPerIMass = this.n.mul(this.d/totalInvInertie,false);
			if(obj1.inertie){
				W1.mul(this.d/totalInvInertie);
				var l = W1.len();
				var dr = W1.mul(Math.min(1,0.1/l)).expQ();
				r1[0].set(dr[0].mul(r1[0],false).norm());
				r1[1].set(r1[1].mul(dr[1]).norm());
			}
			if(obj2.inertie){
				W2.mul(this.d/totalInvInertie);
				var l = W2.len();
				var dr = W2.mul(-Math.min(1,0.1/l)).expQ();
				r2[0].set(dr[0].mul(r2[0],false).norm());
				r2[1].set(r2[1].mul(dr[1]).norm());
			}
			var p1 = obj1.getPosition(true);
			var p2 = obj2.getPosition(true);
			if(p1) p1.sub(dPerIMass.mul(obj1.invMass,false));
			if(p2) p2.add(dPerIMass.mul(obj2.invMass));
			
			
		}
	}
}
Phy4d.prototype._detectCollisionBroadPhase = function(obj1,obj2){
	//if(obj1.sleep && obj2.sleep) return 0;
	var A = obj1.AABB;
	var B = obj2.AABB;
	if(A && B){
		if(!A.testAABB(B)) return 0;
	}
	return this._detectCollisionNarrowPhase(obj1,obj2);
}
Phy4d.prototype._detectCollisionNarrowPhase = function(obj1,obj2){
	var t1 = obj1.phyGeom.constructor;
	var t2 = obj2.phyGeom.constructor;
	
	//Union: iteratively solve
	
	if(t1 == Phy4d.Union && t2 != Phy4d.Union){
		var list = [];
		for(var o of obj1.phyGeom.objs){
			var c = this._detectCollisionBroadPhase(obj1.phyGeom.toWorld(o),obj2);
			if(c){
				if(c.length){
					for(var C of c) list.push(C);
				}else list.push(c);
			}
		}
		if (list.length) return list;
	}
	if(t2 == Phy4d.Union && t1 != Phy4d.Union){
		var list = [];
		for(var o of obj2.phyGeom.objs){
			var c = this._detectCollisionBroadPhase(obj2.phyGeom.toWorld(o),obj1);
			if(c){
				if(c.length){
					for(var C of c) list.push(C);
				}else list.push(c);
			}
		}
		if (list.length) return list;
	}
	if(t1 == Phy4d.Union && t2 == Phy4d.Union){
		var list = [];
		for(var o1 of obj1.phyGeom.objs){
			for(var o2 of obj2.phyGeom.objs){
				var c = this._detectCollisionBroadPhase(obj1.phyGeom.toWorld(o1),obj2.phyGeom.toWorld(o2));
				if(c){
					if(c.length){
						for(var C of c) list.push(C);
					}else list.push(c);
				}
			}
		}
		if (list.length) return list;
	}
	
	//Other intercollisions
	
	if(t1 == Phy4d.Plane && t2 == Phy4d.Glome){
		return this.detectCollision_Plane_Glome(obj1,obj2);
	}
	if(t2 == Phy4d.Plane && t1 == Phy4d.Glome){
		return this.detectCollision_Plane_Glome(obj2,obj1);
	}
	
	if(t1 == Phy4d.Plane && t2 == Phy4d.Convex){
		return this.detectCollision_Plane_Convex(obj1,obj2);
	}
	if(t2 == Phy4d.Plane && t1 == Phy4d.Convex){
		return this.detectCollision_Plane_Convex(obj2,obj1);
	}
	if(t1 == Phy4d.Plane && t2 == Phy4d.Spheritorus){
		return this.detectCollision_Plane_Spheritorus(obj1,obj2);
	}
	if(t2 == Phy4d.Plane && t1 == Phy4d.Spheritorus){
		return this.detectCollision_Plane_Spheritorus(obj2,obj1);
	}
	if(t1 == Phy4d.Plane && t2 == Phy4d.Torisphere){
		return this.detectCollision_Plane_Torisphere(obj1,obj2);
	}
	if(t2 == Phy4d.Plane && t1 == Phy4d.Torisphere){
		return this.detectCollision_Plane_Torisphere(obj2,obj1);
	}
	if(t1 == Phy4d.Plane && t2 == Phy4d.Tiger){
		return this.detectCollision_Plane_Tiger(obj1,obj2);
	}
	if(t2 == Phy4d.Plane && t1 == Phy4d.Tiger){
		return this.detectCollision_Plane_Tiger(obj2,obj1);
	}
	
	if(t1 == Phy4d.Glome && t2 == Phy4d.Convex){
		return this.detectCollision_Glome_Convex(obj1,obj2);
	}
	if(t2 == Phy4d.Glome && t1 == Phy4d.Convex){
		return this.detectCollision_Glome_Convex(obj2,obj1);
	}
	if(t1 == Phy4d.Glome && t2 == Phy4d.Spheritorus){
		return this.detectCollision_Glome_Spheritorus(obj1,obj2);
	}
	if(t2 == Phy4d.Glome && t1 == Phy4d.Spheritorus){
		return this.detectCollision_Glome_Spheritorus(obj2,obj1);
	}
	if(t1 == Phy4d.Glome && t2 == Phy4d.Torisphere){
		return this.detectCollision_Glome_Torisphere(obj1,obj2);
	}
	if(t2 == Phy4d.Glome && t1 == Phy4d.Torisphere){
		return this.detectCollision_Glome_Torisphere(obj2,obj1);
	}
	if(t1 == Phy4d.Glome && t2 == Phy4d.Tiger){
		return this.detectCollision_Glome_Tiger(obj1,obj2);
	}
	if(t2 == Phy4d.Glome && t1 == Phy4d.Tiger){
		return this.detectCollision_Glome_Tiger(obj2,obj1);
	}
	
	if(t1 == Phy4d.Spheritorus && t2 == Phy4d.Torisphere){
		return this.detectCollision_Spheritorus_Torisphere(obj1,obj2);
	}
	if(t2 == Phy4d.Spheritorus && t1 == Phy4d.Torisphere){
		return this.detectCollision_Spheritorus_Torisphere(obj2,obj1);
	}
	if(t1 == Phy4d.Spheritorus && t2 == Phy4d.Tiger){
		return this.detectCollision_Spheritorus_Tiger(obj1,obj2);
	}
	if(t2 == Phy4d.Spheritorus && t1 == Phy4d.Tiger){
		return this.detectCollision_Spheritorus_Tiger(obj2,obj1);
	}
	if(t1 == Phy4d.Torisphere && t2 == Phy4d.Tiger){
		return this.detectCollision_Torisphere_Tiger(obj1,obj2);
	}
	if(t2 == Phy4d.Torisphere && t1 == Phy4d.Tiger){
		return this.detectCollision_Torisphere_Tiger(obj2,obj1);
	}
	
	
	//Other autocollisions
	
	if(t2 == Phy4d.Glome && t1 == Phy4d.Glome){
		return this.detectCollision_Glome_Glome(obj2,obj1);
	}
	if(t2 == Phy4d.Convex && t1 == Phy4d.Convex){
		return this.detectCollision_Convex_Convex(obj2,obj1);
	}
	if(t2 == Phy4d.Spheritorus && t1 == Phy4d.Spheritorus){
		return this.detectCollision_Spheritorus_Spheritorus(obj2,obj1);
	}
	if(t2 == Phy4d.Tiger && t1 == Phy4d.Tiger){
		return this.detectCollision_Tiger_Tiger(obj2,obj1);
	}
	if(t2 == Phy4d.Torisphere && t1 == Phy4d.Torisphere){
		return this.detectCollision_Torisphere_Torisphere(obj2,obj1);
	}
	
}
Phy4d.prototype._detectCollisionsAndConstrains = function(){
	var list = [];
	//todo: octTree
	for(var obj of this.obj){
		if(obj.changed) obj.AABB = obj.getAABB();
	}
	
	for(var i = 0; i < this.obj.length; i++){
		var obj1 = this.obj[i];
		for(var j = 0; j < this.obj.length; j++){
			if(i >= j) continue;
			var obj2 = this.obj[j];
			var totalInvMass = obj1.invMass + obj2.invMass;
			if(!totalInvMass)continue;
			if(!(obj2.changed || obj1.changed))continue;
			var c = this._detectCollisionBroadPhase(obj1,obj2);
			if(c&&c.length){
				for(var C of c){
					list.push(C);
				}
			}else if(c){
				list.push(c);
			}
		}
	}
	
	for(var con of this.constrain){
		if(con.enable){
			var c = con._detect();
			if(c){
				list.push(c);
			}
		}
	}
	return list;
}

Phy4d.prototype.clearState = function (){
	this.collisions = [];
	for(var o of this.obj){
		if(o.invMass)o.a = this.gravity.clone();
		else o.a = new Vec4();
		o.b = new Bivec();
	}
}
Phy4d.prototype._forceIterer = function (){
	
}
Phy4d.prototype.next = function (){
	this.clearState();
	
	//force accumulator:
	if(!this.forceAccumulaterMethod){
		for(var f of this.force){
			if(f.enable) f._apply();
		}
		var dt2 = this.dt*this.dt/2;
		for(var obj of this.obj){
			obj.changed = true;
			//linaire:
			var p = obj.getPosition();
			obj.v.add(obj.a.mul(this.dt,false));
			if(p) p.add(obj.v.mul(this.dt,false).add(obj.a.mul(dt2,false)));
			if(obj.v.len(1)==0 && obj.w.len(1)==0)obj.changed = false;
			//angulaire:
			var r = obj.getRotation();
			if(r){
				obj.w.add(obj.b.mul(this.dt,false));
				var dr = obj.w.mul(this.dt,false).add(obj.b.mul(dt2,false));
				dr = dr.expQ();
				r[0].set(dr[0].mul(r[0],false).norm());
				r[1].set(r[1].mul(dr[1]).norm());
			}
		}
	}else if(this.forceAccumulaterMethod == "RK2"){
		for(var f of this.force){
			if(f.enable) f._apply();
		}
		var dtd2 = this.dt/2;
		var dt2 = this.dt*dtd2;
		var dt2d4 = this.dt*this.dt/8;
		for(var obj of this.obj){
			obj.changed = true;
			obj._v0 = obj.v.clone();
			obj._w0 = obj.w.clone();
			var p = obj.getPosition();
			var r = obj.getRotation();
			if(p) {
				obj._p0 = p.clone();
				p.add(obj.v.mul(this.dtd2,false).add(obj.a.mul(dt2d4,false)));
			}
			obj.v.add(obj.a.mul(this.dtd2,false));
			if(r){
				obj._r0 = [r[0].clone(),r[1].clone()];
				var dr = obj.w.mul(this.dtd2,false).add(obj.b.mul(dt2d4,false));
				dr = dr.expQ();
				r[0].set(dr[0].mul(r[0],false).norm());
				r[1].set(r[1].mul(dr[1]).norm());
				obj.w.add(obj.b.mul(this.dtd2,false));
			}
			obj.a = new Vec4();
			obj.b = new Bivec();
		}
		for(var f of this.force){
			if(f.enable) f._apply();
		}
		for(var obj of this.obj){
			var p = obj.getPosition();
			if(p) {
				p.set(obj._p0.add(obj.v.mul(this.dt,false)));
			}
			obj.v.set(obj._v0.add(obj.a.mul(this.dt,false)));
			var r = obj.getRotation();
			if(r){
				var dr = obj._w0.mul(this.dt,false);
				dr = dr.expQ();
				r[0].set(dr[0].mul(obj._r0[0],false).norm());
				r[1].set(obj._r0[1].mul(dr[1]).norm());
				obj.w.set(obj._w0.add(obj.b.mul(this.dt,false)));
			}
			if(obj.v.len(1)==0 && obj.w.len(1)==0)obj.changed = false;
		}
	}else if(this.forceAccumulaterMethod == "RK4"){
		for(var f of this.force){
			//sre K1:
			if(f.enable) f._apply();
		}
		var dt = this.dt;
		var dtd2 = dt/2;
		for(var obj of this.obj){
			obj.changed = true;
			var p = obj.getPosition();
			var r = obj.getRotation();
			if(p){
				obj._p1 = p.clone();
				obj._v1 = obj.v.clone();
				obj._a1 = obj.a.clone();
			}
			if(r){
				obj._r1 = [r[0].clone(),r[1].clone()];
				obj._w1 = obj.w.clone();
				obj._b1 = obj.b.clone();
			}
			//sre K2:
			if(p) p.add(obj._v1.mul(dtd2,false));
			if(r) {
				var dr = obj._w1.mul(dtd2,false).expQ();
				r[0].set(dr[0].mul(r[0],false).norm());
				r[1].set(r[1].mul(dr[1]).norm());
			}
			obj.a = new Vec4();
			obj.b = new Bivec();
		}
		for(var f of this.force){
			if(f.enable) f._apply();
		}
		for(var obj of this.obj){
			var p = obj.getPosition();
			var r = obj.getRotation();
			if(p){
				obj._v2 = obj._a1.mul(dtd2,false).add(obj._v1);
				obj._a2 = obj.a.clone();
				obj.v.set(obj._v2);
			}
			if(r){
				obj._w2 = obj._b1.mul(dtd2,false).add(obj._w1);
				obj._b2 = obj.b.clone();
				obj.w.set(obj._w2);
			}
			//sre K3:
			if(p) p.set(obj._p1.add(obj._v2.mul(dtd2,false),false));
			if(r){
				var dr = obj._w2.mul(dtd2,false).expQ();
				r[0].set(dr[0].mul(obj._r1[0],false).norm());
				r[1].set(obj._r1[1].mul(dr[1]).norm());
			}
			obj.a = new Vec4();
			obj.b = new Bivec();
		}
		for(var f of this.force){
			if(f.enable) f._apply();
		}
		for(var obj of this.obj){
			var p = obj.getPosition();
			var r = obj.getRotation();
			if(p){
				obj._v3 = obj._a2.mul(dtd2,false).add(obj._v1);
				obj._a3 = obj.a.clone();
				obj.v.set(obj._v3);
			}
			if(r){
				obj._w3 = obj._b2.mul(dtd2,false).add(obj._w1);
				obj._b3 = obj.b.clone();
				obj.w.set(obj._w3);
			}
			//sre K4:
			if(p) p.set(obj._p1.add(obj._v3.mul(dt,false),false));
			if(r){
				var dr = obj._w3.mul(dt,false).expQ();
				r[0].set(dr[0].mul(obj._r1[0],false).norm());
				r[1].set(obj._r1[1].mul(dr[1]).norm());
			}
			obj.a = new Vec4();
			obj.b = new Bivec();
		}
		for(var f of this.force){
			if(f.enable) f._apply();
		}
		for(var obj of this.obj){
			var p = obj.getPosition();
			var r = obj.getRotation();
			if(p){
				obj._v4 = obj._a3.mul(dt,false).add(obj._v1);
				obj._a4 = obj.a.clone();
			}
			if(r){
				obj._w4 = obj._b3.mul(dt,false).add(obj._w1);
				obj._b4 = obj.b.clone();
			}
			//sre Total:
			if(p){
				p.set(obj._p1.add(obj._v4.add(obj._v1).add(obj._v2.add(obj._v3).mul(2)).mul(dt/6)));
				obj.v.set(obj._v1.add(obj._a4.add(obj._a1).add(obj._a2.add(obj._a3).mul(2)).mul(dt/6)));
			}
			if(r){
				var dr = obj._w4.add(obj._w1).add(obj._w2.add(obj._w3).mul(2)).mul(dt/6).expQ();
				r[0].set(dr[0].mul(obj._r1[0]).norm());
				r[1].set(obj._r1[1].mul(dr[1]).norm());
				obj.w.set(obj._w1.add(obj._b4.add(obj._b1).add(obj._b2.add(obj._b3).mul(2)).mul(dt/6)));
			}
			obj.v = new Vec4();
			if(obj.v.len(1)==0 && obj.w.len(1)==0) obj.changed = false;
		}
	}
	
	//solve collisions and constrains:
	
	var coList = this._detectCollisionsAndConstrains();
	for(var i = 0; i < this.iterations && coList.length; i++){
		coList.sort(function(a,b){
			return b.d - a.d;
		});
		for(var obj of this.obj){
			obj.changed = false;
		}
		if(coList[0]) coList[0]._solve();//solve the most serious collision.
		
		coList = this._detectCollisionsAndConstrains();
	}
	
	
	
}

Phy4d.prototype.detectCollision_Plane_Glome = function(planeO, glomeO){
	var plane = planeO.phyGeom;
	var glome = glomeO.phyGeom;
	var glome_o = glomeO.getPosition(true);
	var d = glome.R - (glome_o.dot(plane.n) - plane.t);
	if(d<0) return 0;
	return new Phy4d.Collision(this,planeO, glomeO, plane.n, d, glome_o.sub(plane.n.mul(d/2 + glome.R,false),false));
}
Phy4d.prototype.detectCollision_Glome_Glome = function(g1O, g2O){
	var g1 = g1O.phyGeom;
	var g2 = g2O.phyGeom;
	var R = g1.R + g2.R;
	var g1_o = g1O.getPosition(true);
	var g2_o = g2O.getPosition(true);
	var O1O2 = g2_o.sub(g1_o,false);
	var lO1O2 = O1O2.len(false);
	var d = R*R - lO1O2;
	if(d<0) return 0;
	lO1O2 = Math.sqrt(lO1O2);
	d = g1.R + g2.R - lO1O2;
	return new Phy4d.Collision(this,g1O, g2O, O1O2.div(lO1O2), d, g1_o.add(O1O2.mul(d/2 + g1.R,false),false));
}
Phy4d.prototype.detectCollision_Plane_Convex = function(planeO, convexO){
	var plane = planeO.phyGeom;
	var convex = convexO.phyGeom;
	var convex_o = convexO.getPosition(true);
	var convex_r = convexO.getRotation(true);
	var list = [];
	var offset = convex_o.dot(plane.n);
	//n'(Rv + o) - t
	//(R'n)'v + n'o - t
	var n = convex_r[0].conj(false).mul(plane.n).mul(convex_r[1].conj(false));
	for(var v of convex.mesh.V){
		var d = -(v.dot(n) + offset - plane.t);
		if(d<0) continue;
		list.push(new Phy4d.Collision(this,planeO, convexO, plane.n, d, 
			convex_r[0].mul(v,false).mul(convex_r[1]).add(convex_o).sub(plane.n.mul(d/2,false),false)));
	}
	if(list.length) return list;
}
Phy4d.prototype.detectCollision_Glome_Convex = function(glomeO, convexO){
	var glome = glomeO.phyGeom;
	var convex = convexO.phyGeom;
	var glome_o = glomeO.getPosition(true);
	var convex_o = convexO.getPosition(true);
	var convex_r = convexO.getRotation(true);
	var list = [];
	//convert glome_o into convex's local coordinate to reduce sre
	var gOlocal = convex_r[0].conj(false).mul(glome_o.sub(convex_o,false)).mul(convex_r[1].conj(false));
	var R2 = glome.R*glome.R;
	
	// resolve cell to glome
	var cellContacted = null;
	//var cells = [];
	var minD = Infinity;
	for(var c of convex.mesh.C){
		var d = glome.R - (gOlocal.dot(c.info.normal) - c.info.t);
		if(d < 0) return 0;
		if(d < minD){
			minD = d;
			cellContacted = c;
		}
	}
	var cellD = minD;
	//挑出有可能相碰的那部分棱与顶点(所有的 d = 0~r 的胞的所有VEF)
	var commonF = [];
	var commonE = [];
	var commonV = [];
	//for(var C in cells){
	for(var face of cellContacted){
		if(commonF[face]) continue;
		for(var F in convex.mesh.F[face]){
			for(var edge in convex.mesh.F[F]){
				if(isNaN(edge) || commonE[edge]) continue;
				var E = convex.mesh.E[edge];
				commonV[E[0]] = true;
				commonV[E[1]] = true;
				commonE[edge] = true;
			}
		}
		commonF[face] = true;
	}
	
	for(var V in commonV){
		if(!(commonV[V]>=1)) continue;
		var v = convex.mesh.V[V];
		var OV = v.sub(gOlocal,false);
		var d = OV.len(false);
		if(d>R2) continue;
		d = glome.R - Math.sqrt(d);
		var n = convex_r[0].mul(OV,false).mul(convex_r[1]).norm();
		list.push(new Phy4d.Collision(this,glomeO, convexO, n, d, 
			glome_o.add(n.mul(glome.R-d/2,false),false)));
	}
	if(list.length==1){
		return list[0];
	}
	
	//var minD = Infinity;
	var edgeContact = null;
	for(var e of convex.mesh.E){
		var A = convex.mesh.V[e[0]];
		var B = convex.mesh.V[e[1]];
		var OA = A.sub(gOlocal,false);
		var BA = A.sub(B,false);
		var ABdOA = BA.dot(OA);
		if(ABdOA < 0) continue;
		var lenAB = BA.len(false);
		if(ABdOA > lenAB) continue;
		var t0 = ABdOA/lenAB;
		var N = OA.sub(BA.mul(t0));
		var d = N.len(false);
		if(d>R2) continue;
		d = glome.R - Math.sqrt(d);
		var n = convex_r[0].mul(N,false).mul(convex_r[1]).norm();
		edgeContact = new Phy4d.Collision(this,glomeO, convexO, n, d, 
		glome_o.add(n.mul(glome.R-d/2,false),false));
		//minD = d;
		list.push(edgeContact);
			
	}
	if(list.length==1){
		return list[0];
	}
	for(var f of convex.mesh.F){
		//var e1 = convex.mesh.E[f[0]];
		//var e2 = convex.mesh.E[f[1]];
		
		var A = f.info.A;//convex.mesh.V[e1[0]];
		var B = f.info.B;//convex.mesh.V[e1[1]];
		var C = f.info.C;//(e2[0] != e1[0] && e2[0] != e1[1])?convex.mesh.V[e2[0]]:convex.mesh.V[e2[1]];
		
		var AB = f.info.AB;//B.sub(A,false);
		var AC = f.info.AC;//C.sub(A,false);
		
		var AB_AC = f.info.ABAC;//AB.cross(AC).norm();
		var OA = A.sub(gOlocal,false);
		var d = OA.cross(AB_AC).len(false);
		if(d>R2) continue;
		d = Math.sqrt(d);
		var AQ = OA.cross(AB_AC.dual()).cross(AB_AC);
		
		var Q = AQ.add(A,false);
		var n = OA.add(AQ,false).norm();
		var PGlome = gOlocal.add(n.mul(d,false),false)
		var isClip = true;
		for(var cell of convex.mesh.C){
			//var cell = convex.mesh.C[c];
			var depth = - (PGlome.dot(cell.info.normal) - cell.info.t);
			if(depth < -0.0001) {
				isClip = false;
				break;
			}
		}
		if(!isClip) continue;
		
		d = glome.R - d;
		n = convex_r[0].mul(n,false).mul(convex_r[1]).norm();
		list.push(new Phy4d.Collision(this,glomeO, convexO, n, d, 
			glome_o.add(n.mul(glome.R-d/2,false),false))
		);
	}
	if(list.length==1){
		return list[0];
	}
	var N = cellContacted.info.normal;
	var n = convex_r[0].mul(N,false).mul(convex_r[1]).norm().sub();
	var Prel = N.mul(cellD/2 - glome.R,false);
	var P = Prel.add(gOlocal,false);
	for(var c of convex.mesh.C){
		var d = - (P.dot(c.info.normal) - c.info.t);
		if(d < 0) return 0;
	}
	return new Phy4d.Collision(this,glomeO, convexO, n, cellD, glome_o.add(n.mul(-cellD/2 + glome.R,false),false));
	
}
Phy4d.prototype.detectCollision_Convex_Convex = function(c1O, c2O){
	//return 0;
	if(this.GJK){
		var testResult = this.GJK.test(c1O,c2O);
		if(!testResult) return 0;
	}
	var c1 = c1O.phyGeom;
	var c2 = c2O.phyGeom;
	var c1_o = c1O.getPosition(true);
	var c1_r = c1O.getRotation(true);
	var c2_o = c2O.getPosition(true);
	var c2_r = c2O.getRotation(true);
	var list = [];
	var wO1O2 = c2_o.sub(c1_o,false);
	//o1->o2 o2 in o1's coordinate
	var O1O2 = c1_r[0].conj(false).mul(wO1O2,false).mul(c1_r[1].conj(false));
	//o2->o1  o1 in o2's coordinate
	var O2O1 = c2_r[0].conj(false).mul(wO1O2,false).mul(c2_r[1].conj(false)).sub();
	//convert c1.v into c2's local coordinate to reduce sre
	var c2V1 = [];
	var c2v1L = c2_r[0].conj(false).mul(c1_r[0]);
	var c2v1R = c1_r[1].mul(c2_r[1].conj(false),false);
	
	//c2'(c1(v1)c1+o1-o2)c2' = Lv1R + O2O1
	
	for(var v1 of c1.mesh.V){
		c2V1.push(c2v1L.mul(v1,false).mul(c2v1R).add(O2O1));
	}
	//convert c2.v into c1's local coordinate to reduce sre
	var c1V2 = [];
	var c1v2L = c1_r[0].conj(false).mul(c2_r[0]);
	var c1v2R = c2_r[1].mul(c1_r[1].conj(false),false);
	for(var v2 of c2.mesh.V){
		c1V2.push(c1v2L.mul(v2,false).mul(c1v2R).add(O1O2));
	}
	var minD = Infinity;
	var minCell1 = null;
	var minCell2 = null;
	//separate axis of cell normals
	for(var c1c of c1.mesh.C){
		var n = c1c.info.normal;
		var mA = this._projectConvex(c1.mesh.V,n,c1c.info);
		var mB = this._projectConvex(c1V2,n);
		var d = mA[1] - mB[0];
		if(d<0) return 0;
		if(d<minD){
			minD = d;
			minCell1 = c1c;
		}
	}
	for(var c2c of c2.mesh.C){
		var n = c2c.info.normal;
		var mA = this._projectConvex(c2.mesh.V,n,c2c.info);
		var mB = this._projectConvex(c2V1,n);
		var d = mA[1] - mB[0];
		if(d<0) return 0;
		if(d<minD){
			minD = d;
			minCell2 = c2c;
		}
	}
	if((!minCell2)&&minCell1){
		var D = Infinity;
		for(var v2 in c1V2){
			var d = -(c1V2[v2].dot(minCell1.info.normal) - minCell1.info.t);
			if(d < 0) {
				continue;
			}
			if(d<D){
				var n = c1_r[0].mul(minCell1.info.normal,false).mul(c1_r[1]).norm().sub();
				var worldv2 = c2_r[0].mul(c2.mesh.V[v2],false).mul(c2_r[1]).add(c2_o);
				list.push(
					new Phy4d.Collision(this,c2O, c1O, n, d, worldv2.sub(n.mul(d/2,false),false))
				);
			}
		}
	}
	if(minCell2){
		var D = Infinity;
		for(var v1 in c2V1){
			var d = -(c2V1[v1].dot(minCell2.info.normal) - minCell2.info.t);
			if(d < 0) {
				continue;
			}
			if(d<D){
				var n = c2_r[0].mul(minCell2.info.normal,false).mul(c2_r[1]).norm().sub();
				var worldv1 = c1_r[0].mul(c1.mesh.V[v1],false).mul(c1_r[1]).add(c1_o);
				list.push(
					new Phy4d.Collision(this,c1O, c2O, n, d, worldv1.sub(n.mul(d/2,false),false))
				);
			}
		}
	}
	/*if(this.GJK){
		var vs = testResult.info.V;
		var na = [... new Set(vs.map((v)=>(v.a)))];
		var nb = [... new Set(vs.map((v)=>(v.b)))];
		//console.log(na.length+"|"+nb.length);
		if(na.length==2&&nb.length==3){
			
		}
	}*/
	/*if(list.length) {
		return list;
	}else{return 0;}*/
	//c1.E vs c2.F: convert c1.e into c2's local coordinate to reduce sre
	for(var i=0; i<2; i++){
		if(i){
			var tempc = c1O;
			c1O = c2O;
			c2O = tempc;
			c1 = c1O.phyGeom;
			c2 = c2O.phyGeom;
			tempc = c1V2;
			c1V2 = c2V1;
			c2V1 = tempc;
			tempc = O2O1;
			O2O1 = O1O2;
			O2O1 = tempc;
		}
		
		//c1.E: P1P2,  c2.F: ABC, projection on c1: Q1, projection on c2: Q2
		for(var c2f of c2.mesh.F){
			if(c2f.info.normal.dot(O2O1)<0) continue;
			var faceContacted = null;
			
			var A = c2f.info.A;
			var B = c2f.info.B;
			var C = c2f.info.C;
			var AB = c2f.info.AB;
			var AC = c2f.info.AC;
			var ABAC = c2f.info.ABAC;
			
			for(var ee of c1.mesh.E){
				var P1 = c2V1[ee[0]];
				var P2 = c2V1[ee[1]];
				var P1P2 = P2.sub(P1,false);
				var n = P1P2.cross(ABAC,false).norm();
				/*if(this.GJK){
					continue;
					//if(Math.abs(n.dot(testResult.info.normal))>0.01)continue;
				}*/
				//if(n.dot(O2O1)<0) n.sub();
				var mA = this._projectConvex(c2V1,n);
				var mB = this._projectConvex(c2.mesh.V,n);
				var d = mA[1] - mB[0];
				if(d<0) return 0;
				/*var nd = mB[1] - mA[0];
				if(nd>0 && nd< d) {
					d = nd;
					n.sub();
				}*/
				if(d<minD){
					minD = d;
					
					var P1A = A.sub(P1,false);
					var _a1 = P1P2.dot(P1A), _b1 = P1P2.dot(AB), _c1 = P1P2.dot(AC), _d1 = P1P2.dot(P1P2);
					var _a2 =   AB.dot(P1A), _b2 =   AB.dot(AB), _c2 =   AB.dot(AC), _d2 =   _b1;
					var _a3 =   AC.dot(P1A), _b3 =   _c2       , _c3 =   AC.dot(AC), _d3 =   _c1;

					var det = _b3*_c2*_d1 - _b2*_c3*_d1 - _b3*_c1*_d2 + _b1*_c3*_d2 + _b2*_c1*_d3 - _b1*_c2*_d3;
					if(Math.abs(det)<0.001) continue;//共胞的情况不管，可reduce
					var detInv = 1/det;

					var s = (_a3*_b2*_c1 - _a2*_b3*_c1 - _a3*_b1*_c2 + _a1*_b3*_c2 + _a2*_b1*_c3 - _a1*_b2*_c3)*detInv;
					if(s<0||s>1)continue;//Q1必须在AB上
					var u = -(_a3*_c2*_d1 - _a2*_c3*_d1 - _a3*_c1*_d2 + _a1*_c3*_d2 + _a2*_c1*_d3 - _a1*_c2*_d3)*detInv;
					var v = -(-_a3*_b2*_d1 + _a2*_b3*_d1 + _a3*_b1*_d2 - _a1*_b3*_d2 - _a2*_b1*_d3 + _a1*_b2*_d3)*detInv;
					
					var Q1 = P1.add(P1P2.mul(s,false),false);
					var Q2 = A.add(AB.mul(u,false),false).add(AC.mul(v,false));
					var QQ = Q1.add(Q2,false).div(2);
					var P = Q1.add(Q2,false).div(2);
					n = c2_r[0].mul(n,false).mul(c2_r[1]);
					faceContacted = new Phy4d.Collision(this,c1O, c2O, n, d, c2_r[0].mul(P,false).mul(c2_r[1]).add(c2_o),false);
					
				}
				continue;
			}
			if(faceContacted) {
				list.push(faceContacted);
			}
		}
	}
	if(list.length) {
		return list;
	}
}
Phy4d.prototype.detectCollision_Plane_Spheritorus = function(planeO, stO){
	var plane = planeO.phyGeom;
	var st = stO.phyGeom;
	var st_o = stO.getPosition(true);
	var st_r = stO.getRotation(true);
	var R1 = st.R1;
	var R2 = st.R2;
	//plane: x.n-t==0
	//coordinate of st: (rx+o).n-t==0   =>  x.(r'n) + o.n - t == 0
	var offset = st_o.dot(plane.n);
	var n = st_r[0].conj(false).mul(plane.n).mul(st_r[1].conj(false));
	var Rc = new Vec4(n.x,0,0,n.t);
	var lenRc = Rc.len();
	if(lenRc < 0.0001){
		if(offset-plane.t<R1){
			var d = R1 - offset + plane.t;
			return [
				new Phy4d.Collision(
					this, planeO, stO, plane.n, d, 
					st_r[0].mul(new Vec4(R2,0,0,0),false).mul(st_r[1]).add(st_o).sub(plane.n.mul(R1-d/2,false),false)
				),
				new Phy4d.Collision(
					this, planeO, stO, plane.n, d, 
					st_r[0].mul(new Vec4(-R2,0,0,0),false).mul(st_r[1]).add(st_o).sub(plane.n.mul(R1-d/2,false),false)
				),
				new Phy4d.Collision(
					this, planeO, stO, plane.n, d, 
					st_r[0].mul(new Vec4(0,0,-R2,0),false).mul(st_r[1]).add(st_o).sub(plane.n.mul(R1-d/2,false),false)
				),
				new Phy4d.Collision(
					this, planeO, stO, plane.n, d, 
					st_r[0].mul(new Vec4(0,0,R2,0),false).mul(st_r[1]).add(st_o).sub(plane.n.mul(R1-d/2,false),false)
				)
			];
		}else{
			return 0;
		}
	}
	var angle = Math.round(Math.atan2(n.t,n.x)*100)/100;
	Rc.t = Math.sin(angle);
	Rc.x = Math.cos(angle);
	Rc.mul(st.R2);
	var minN = Rc.sub().sub(n.mul(R1,false));
	var d = -(minN.dot(n) + offset - plane.t);
	if(d<0) return 0;
	return new Phy4d.Collision(this,planeO, stO, plane.n, d, st_r[0].mul(minN,false).mul(st_r[1]).add(st_o).add(plane.n.mul(d/2,false),false));
}
Phy4d.prototype.detectCollision_Plane_Torisphere = function(planeO, tsO){
	var plane = planeO.phyGeom;
	var ts = tsO.phyGeom;
	var ts_o = tsO.getPosition(true);
	var ts_r = tsO.getRotation(true);
	var R1 = ts.R1;
	var R2 = ts.R2;
	//plane: x.n-t==0
	//coordinate of ts: (rx+o).n-t==0   =>  x.(r'n) + o.n - t == 0
	var offset = ts_o.dot(plane.n);
	var n = ts_r[0].conj(false).mul(plane.n).mul(ts_r[1].conj(false));
	var Rc = new Vec4(n.x,n.y,n.z,0);
	var lenRc = Rc.len();
	if(lenRc < 0.0001){
		if(offset-plane.t<R1){
			var d = R1 - offset + plane.t;
			return [
				new Phy4d.Collision(
					this, planeO, tsO, plane.n, d, 
					ts_r[0].mul(new Vec4(R2,0,0,0),false).mul(ts_r[1]).add(ts_o).sub(plane.n.mul(R1-d/2,false),false)
				),
				new Phy4d.Collision(
					this, planeO, tsO, plane.n, d, 
					ts_r[0].mul(new Vec4(-R2,0,0,0),false).mul(ts_r[1]).add(ts_o).sub(plane.n.mul(R1-d/2,false),false)
				),
				new Phy4d.Collision(
					this, planeO, tsO, plane.n, d, 
					ts_r[0].mul(new Vec4(0,0,-R2,0),false).mul(ts_r[1]).add(ts_o).sub(plane.n.mul(R1-d/2,false),false)
				),
				new Phy4d.Collision(
					this, planeO, tsO, plane.n, d, 
					ts_r[0].mul(new Vec4(0,0,R2,0),false).mul(ts_r[1]).add(ts_o).sub(plane.n.mul(R1-d/2,false),false)
				),
				new Phy4d.Collision(
					this, planeO, tsO, plane.n, d, 
					ts_r[0].mul(new Vec4(0,-R2,0,0),false).mul(ts_r[1]).add(ts_o).sub(plane.n.mul(R1-d/2,false),false)
				),
				new Phy4d.Collision(
					this, planeO, tsO, plane.n, d, 
					ts_r[0].mul(new Vec4(0,R2,0,0),false).mul(ts_r[1]).add(ts_o).sub(plane.n.mul(R1-d/2,false),false)
				)
				
			];
		}else{
			return 0;
		}
	}
	Rc.mul(ts.R2/lenRc);
	var minN = Rc.sub().sub(n.mul(R1,false));
	var d = -(minN.dot(n) + offset - plane.t);
	if(d<0) return 0;
	
	return new Phy4d.Collision(this,planeO, tsO, plane.n, d, ts_r[0].mul(minN,false).mul(ts_r[1]).add(ts_o).add(plane.n.mul(d/2,false),false));
}
Phy4d.prototype.detectCollision_Plane_Tiger = function(planeO, tigerO){
	var plane = planeO.phyGeom;
	var tiger = tigerO.phyGeom;
	var tiger_o = tigerO.getPosition(true);
	var tiger_r = tigerO.getRotation(true);
	var R1 = tiger.R1;
	var R2 = tiger.R2;
	var R = tiger.R;
	//plane: x.n-t==0
	//coordinate of tiger: (rx+o).n-t==0   =>  x.(r'n) + o.n - t == 0
	var offset = tiger_o.dot(plane.n);
	var n = tiger_r[0].conj(false).mul(plane.n).mul(tiger_r[1].conj(false));
	var Rc1 = new Vec4(n.x,n.y,0,0);
	var lenRc1 = Rc1.len();
	if(lenRc1 < 0.5){
		Rc1 = new Vec4(0,0,n.z,n.t);
		lenRc1 = Rc1.len();
		Rc1.mul(tiger.R2/lenRc1);
		var Rc2 = new Vec4(n.x,n.y,0,0);
		var lenRc2 = Rc2.len();
		if(lenRc2<0.001) Rc2 = new Vec4(tiger.R1,0,0,0);
		else Rc2.mul(tiger.R1/lenRc2);
	}else{
		Rc1.mul(tiger.R1/lenRc1);
		var Rc2 = new Vec4(0,0,n.z,n.t);
		var lenRc2 = Rc2.len();
		if(lenRc2<0.001) Rc2 = new Vec4(0,0,tiger.R2,0);
		else Rc2.mul(tiger.R2/lenRc2);
	}
	var Rc = Rc1.add(Rc2,false);
	var minN = Rc.sub().sub(n.mul(R,false));
	var d = -(minN.dot(n) + offset - plane.t);
	if(d<0) return 0;
	
	return new Phy4d.Collision(this,planeO, tigerO, plane.n, d, tiger_r[0].mul(minN,false).mul(tiger_r[1]).add(tiger_o).add(plane.n.mul(d/2,false),false));
}
Phy4d.prototype.detectCollision_Glome_Spheritorus = function(glomeO, stO){
	var glome = glomeO.phyGeom;
	var glome_o = glomeO.getPosition(true);
	var st = stO.phyGeom;
	var st_o = stO.getPosition(true);
	var st_r = stO.getRotation(true);
	var R1 = st.R1;
	var R2 = st.R2;
	//convert glome_o to st's coordinate
	var gOlocal = st_r[0].conj(false).mul(glome_o.sub(st_o,false)).mul(st_r[1].conj(false));
	var gRR_R1R1 = (glome.R+R1)*(glome.R+R1);
	var Oc = new Vec4(gOlocal.x,0,0,gOlocal.t);
	var lenRc = Oc.len();
	if(lenRc<0.000001){
		Oc = new Vec4(st.R2,0,0,0);
	}else{
		Oc.mul(st.R2/lenRc);
	}
	var n = Oc.sub(gOlocal,false);
	var lenN = n.len(false);
	if(lenN>gRR_R1R1)return 0;
	var d = glome.R + R1 - Math.sqrt(lenN);
	n = st_r[0].mul(n,false).mul(st_r[1]).norm();
	return new Phy4d.Collision(this,glomeO, stO, n, d, glome_o.add(n.mul(-d/2 + glome.R,false),false));
}
Phy4d.prototype.detectCollision_Glome_Torisphere = function(glomeO, tsO){
	var glome = glomeO.phyGeom;
	var glome_o = glomeO.getPosition(true);
	var ts = tsO.phyGeom;
	var ts_o = tsO.getPosition(true);
	var ts_r = tsO.getRotation(true);
	var R1 = ts.R1;
	var R2 = ts.R2;
	//convert glome_o to ts's coordinate
	var gOlocal = ts_r[0].conj(false).mul(glome_o.sub(ts_o,false)).mul(ts_r[1].conj(false));
	var gRR_R1R1 = (glome.R+R1)*(glome.R+R1);
	var Oc = new Vec4(gOlocal.x,gOlocal.y,gOlocal.z,0);
	var lenRc = Oc.len();
	if(lenRc<0.000001){
		Oc = new Vec4(ts.R2,0,0,0);
	}else{
		Oc.mul(ts.R2/lenRc);
	}
	var n = Oc.sub(gOlocal,false);
	var lenN = n.len(false);
	if(lenN>gRR_R1R1)return 0;
	var d = glome.R + R1 - Math.sqrt(lenN);
	n = ts_r[0].mul(n,false).mul(ts_r[1]).norm();
	return new Phy4d.Collision(this,glomeO, tsO, n, d, glome_o.add(n.mul(-d/2 + glome.R,false),false));
}
Phy4d.prototype.detectCollision_Glome_Tiger = function(glomeO, tigerO){
	var glome = glomeO.phyGeom;
	var tiger = tigerO.phyGeom;
	var tiger_o = tigerO.getPosition(true);
	var tiger_r = tigerO.getRotation(true);
	var glome_o = glomeO.getPosition(true);
	var R = tiger.R;
	var R1 = tiger.R1;
	var R2 = tiger.R2;
	//convert glome_o to tiger's coordinate
	var gOlocal = tiger_r[0].conj(false).mul(glome_o.sub(tiger_o,false)).mul(tiger_r[1].conj(false));
	var gRR_R1R1 = (glome.R+R)*(glome.R+R);
	var Rc1 = new Vec4(gOlocal.x,gOlocal.y,0,0);
	var lenRc1 = Rc1.len();
	if(lenRc1 < 0.5){
		Rc1 = new Vec4(0,0,gOlocal.z,gOlocal.t);
		lenRc1 = Rc1.len();
		Rc1.mul(tiger.R2/lenRc1);
		var Rc2 = new Vec4(gOlocal.x,gOlocal.y,0,0);
		var lenRc2 = Rc2.len();
		Rc2.mul(tiger.R1/lenRc2);
	}else{
		Rc1.mul(tiger.R1/lenRc1);
		var Rc2 = new Vec4(0,0,gOlocal.z,gOlocal.t);
		var lenRc2 = Rc2.len();
		Rc2.mul(tiger.R2/lenRc2);
	}
	var Rc = Rc1.add(Rc2,false);
	var n = Rc.sub(gOlocal,false);
	var lenN = n.len(false);
	if(lenN>gRR_R1R1)return 0;
	var d = glome.R + R - Math.sqrt(lenN);
	n = tiger_r[0].mul(n,false).mul(tiger_r[1]).norm();
	return new Phy4d.Collision(this,glomeO, tigerO, n, d, glome_o.add(n.mul(-d/2 + glome.R,false),false));
}
Phy4d.prototype.detectCollision_Spheritorus_Spheritorus = function(stO1, stO2){
	var st1 = stO1.phyGeom;
	var st2 = stO2.phyGeom;
	var st1_o = stO1.getPosition(true);
	var st1_r = stO1.getRotation(true);
	var st2_o = stO2.getPosition(true);
	var st2_r = stO2.getRotation(true);
	var list = [];
	var s = Math.random()*Math.PI*2, t = Math.random()*Math.PI*2;
	//convert st1 to st2's coordinate
	var O1local = st2_r[0].conj(false).mul(st1_o.sub(st2_o,false)).mul(st2_r[1].conj(false));
	var convertL2 = st2_r[0].conj(false).mul(st1_r[0]);
	var convertR2 = st1_r[1].mul(st2_r[1].conj(false),false);
	//convert st2 to st1's coordinate
	var O2local = st1_r[0].conj(false).mul(st2_o.sub(st1_o,false)).mul(st1_r[1].conj(false));
	var convertL1 = st1_r[0].conj(false).mul(st2_r[0]);
	var convertR1 = st2_r[1].mul(st1_r[1].conj(false),false);
	var maxIterations = 50;
	var Rmax = st2.R1+st2.R1+st2.R2+st1.R2;//随机选点，反正都能收敛
	var P = new Vec4(Math.sin(s)*Rmax,Math.cos(s)*Rmax,Math.sin(t)*Rmax,0);
	var coord = st2;
	var n;
	var Rc = new Vec4();
	while (maxIterations--){
		var lenXT = P.x*P.x+P.t*P.t;
		if(lenXT==0){
			Rc.x = coord.R2;
			Rc.t = 0;
		}else{
			lenXT = coord.R2/Math.sqrt(lenXT);
			Rc.x = P.x*lenXT;
			Rc.t = P.t*lenXT;
		}
		Rc.y = 0;
		Rc.z = 0;
		n = Rc.sub(P,false);
		if(coord == st2){
			P = convertL1.mul(Rc,false).mul(convertR1).add(O2local);
			coord = st1;
		}else{
			P = convertL2.mul(Rc,false).mul(convertR2).add(O1local);
			coord = st2;
		}
	}
	coord = coord==st2?st1:st2;//循环结束时多倒了一次
	var coord_r = coord.Obj.getRotation(true);
	var coord_o = coord.Obj.getPosition(true);
	var lenN = n.len();
	var d = st2.R1 + st1.R1 - lenN;
	if(d<0) return 0;
	n.div(lenN);
	n = coord_r[0].mul(n,false).mul(coord_r[1]);
	return (new Phy4d.Collision(this, coord==st2?stO1:stO2, coord==st1?stO1:stO2, n, d, coord_r[0].mul(Rc,false).mul(coord_r[1]).add(coord_o).sub(n.mul(coord.R1-d/2,false),false)));
}
Phy4d.prototype.detectCollision_Spheritorus_Torisphere = function(stO, tsO){
	var st = stO.phyGeom;
	var ts = tsO.phyGeom;
	var st_o = stO.getPosition(true);
	var st_r = stO.getRotation(true);
	var ts_o = tsO.getPosition(true);
	var ts_r = tsO.getRotation(true);
	var list = [];
	var R11 = st.R1;
	var R12 = st.R2;
	var R21 = ts.R1;
	var R22 = ts.R2;
	//convert stO to tsO's coordinate
	var O1local = ts_r[0].conj(false).mul(st_o.sub(ts_o,false)).mul(ts_r[1].conj(false));
	var convertL = ts_r[0].conj(false).mul(st_r[0]);
	var convertR = st_r[1].mul(ts_r[1].conj(false),false);
	var X = convertL.mul(new Vec4(R12,0,0,0),false).mul(convertR);
	var T = convertL.mul(new Vec4(0,0,0,R12),false).mul(convertR);
	//equation for st in ts's coord:  |O1local + X cos s + T sin s|<st.R1
	var s = 0;
	var phase = 0;
	var cos;
	var found = false;
	var first = true;
	while (s<Math.PI*2){
		var P = O1local.add(X.mul(Math.cos(s),false),false).add(T.mul(Math.sin(s),false));
		
		var Oc = new Vec4(P.x,P.y,P.z,0);
		var lenRc = Oc.len();
		if(lenRc<0.000001){
			Oc = new Vec4(R22,0,0,0);
		}else{
			Oc.mul(R22/lenRc);
		}
		var n = Oc.sub(P,false);
		var lenN = n.len();
		var d = R21 + R11 - lenN;
		n.div(lenN);
		if(phase == 0){
			if(d>-0.001){
				if(s==0 && first){
					s -= Math.PI/2;
					first = false;
				}else{
					phase = 1;
					cos = -X.mul(Math.sin(s),false).sub(T.mul(Math.cos(s),false)).dot(n);
				}
			}else{
				s+= -d/R12;
			}
		}else if(phase == 1){
			var ncos = -X.mul(Math.sin(s),false).sub(T.mul(Math.cos(s),false)).dot(n);
			if(!(ncos>0 ^ cos>0) && Math.abs(ncos)>0.01) {
				s += Math.PI/360;
				cos = ncos;
				continue;
			}
			n = ts_r[0].mul(n,false).mul(ts_r[1]);
			list.push(new Phy4d.Collision(this, stO, tsO, n, d+0.002, ts_r[0].mul(Oc,false).mul(ts_r[1]).add(ts_o).sub(n.mul(R21-d/2,false),false)));
			found = true;
			break;
		}
	}
	if(!found)return 0;
	var t = 0;
	var phase = 0;
	var cos;
	first = true;
	while (t>-Math.PI*2){
		var P = O1local.add(X.mul(Math.cos(t),false),false).add(T.mul(Math.sin(t),false));
		
		var Oc = new Vec4(R22,0,0,0);
		var lenRc = Oc.len();
		if(lenRc<0.000001){
			Oc = new Vec4(R22,0,0,0);
		}else{
			Oc.mul(R22/lenRc);
		}
		var n = Oc.sub(P,false);
		var lenN = n.len();
		var d = R21 + R11 - lenN;
		n.div(lenN);
		if(phase == 0){
			if(d>-0.001){
				if(t==0 && first){
					t += Math.PI/2;
					first = false;
				}else{
					phase = 1;
					cos = -X.mul(Math.sin(t),false).sub(T.mul(Math.cos(t),false)).dot(n);
				}
			}else{
				t+= d/R12;
			}
		}else if(phase == 1){
			var ncos = -X.mul(Math.sin(t),false).sub(T.mul(Math.cos(t),false)).dot(n);
			if(!(ncos>0 ^ cos>0)&&Math.abs(ncos)>0.01) {
				t -= Math.PI/360;
				cos = ncos;
				continue;
			}
			n = ts_r[0].mul(n,false).mul(ts_r[1]);
			list.push(new Phy4d.Collision(this, stO, tsO, n, d+0.002, ts_r[0].mul(Oc,false).mul(ts_r[1]).add(ts_o).sub(n.mul(R21-d/2,false),false)));
			found = true;
			break;
		}
	}
	if(!found){
		return 0;
	}
	if (list.length){
		return list;
	}
}
Phy4d.prototype.detectCollision_Spheritorus_Tiger = function(stO, tigerO){
	var st = stO.phyGeom;
	var tiger = tigerO.phyGeom;
	var st_o = stO.getPosition(true);
	var st_r = stO.getRotation(true);
	var tiger_o = tigerO.getPosition(true);
	var tiger_r = tigerO.getRotation(true);
	var list = [];
	var R11 = st.R1;
	var R12 = st.R2;
	var R1 = tiger.R1;
	var R2 = tiger.R2;
	var R = tiger.R;
	//convert stO to tsO's coordinate
	var O1local = tiger_r[0].conj(false).mul(st_o.sub(tiger_o,false)).mul(tiger_r[1].conj(false));
	var convertL = tiger_r[0].conj(false).mul(st_r[0]);
	var convertR = st_r[1].mul(tiger_r[1].conj(false),false);
	var X = convertL.mul(new Vec4(R12,0,0,0),false).mul(convertR);
	var T = convertL.mul(new Vec4(0,0,0,R12),false).mul(convertR);
	//equation for st in tiger's coord:  |O1local + X cos s + T sin s|<st.R1
	var s = 0;
	var phase = 0;
	var cos;
	var found = false;
	var first = true;
	while (s<Math.PI*2){
		var P = O1local.add(X.mul(Math.cos(s),false),false).add(T.mul(Math.sin(s),false));
		
		var Rc1 = new Vec4(P.x,P.y,0,0);
		var lenRc1 = Rc1.len();
		if(lenRc1 < 0.5){
			Rc1 = new Vec4(0,0,P.z,P.t);
			lenRc1 = Rc1.len();
			Rc1.mul(tiger.R2/lenRc1);
			var Rc2 = new Vec4(P.x,P.y,0,0);
			var lenRc2 = Rc2.len();
			Rc2.mul(tiger.R1/lenRc2);
		}else{
			Rc1.mul(tiger.R1/lenRc1);
			var Rc2 = new Vec4(0,0,P.z,P.t);
			var lenRc2 = Rc2.len();
			Rc2.mul(tiger.R2/lenRc2);
		}
		var Rc = Rc1.add(Rc2,false);
		var n = Rc.sub(P,false);
		var lenN = n.len();
		var d = R + R11 - lenN;
		n.div(lenN);
		if(phase == 0){
			if(d>-0.001){
				if(s==0 && first){
					s -= Math.PI/2;
					first = false;
				}else{
					phase = 1;
					cos = -X.mul(Math.sin(s),false).sub(T.mul(Math.cos(s),false)).dot(n);
				}
			}else{
				s+= -d/R12;
			}
		}else if(phase == 1){
			var ncos = -X.mul(Math.sin(s),false).sub(T.mul(Math.cos(s),false)).dot(n);
			if(!(ncos>0 ^ cos>0) && Math.abs(ncos)>0.01) {
				s += Math.PI/360;
				cos = ncos;
				continue;
			}
			n = tiger_r[0].mul(n,false).mul(tiger_r[1]);
			list.push(new Phy4d.Collision(this, stO, tigerO, n, d+0.002, tiger_r[0].mul(Rc,false).mul(tiger_r[1]).add(tiger_o).sub(n.mul(R-d/2,false),false)));
			found = true;
			break;
		}
	}
	if(!found)return 0;
	var t = 0;
	var phase = 0;
	var cos;
	first = true;
	while (t>-Math.PI*2){
		var P = O1local.add(X.mul(Math.cos(t),false),false).add(T.mul(Math.sin(t),false));
		
		var Rc1 = new Vec4(P.x,P.y,0,0);
		var lenRc1 = Rc1.len();
		if(lenRc1 < 0.5){
			Rc1 = new Vec4(0,0,P.z,P.t);
			lenRc1 = Rc1.len();
			Rc1.mul(tiger.R2/lenRc1);
			var Rc2 = new Vec4(P.x,P.y,0,0);
			var lenRc2 = Rc2.len();
			Rc2.mul(tiger.R1/lenRc2);
		}else{
			Rc1.mul(tiger.R1/lenRc1);
			var Rc2 = new Vec4(0,0,P.z,P.t);
			var lenRc2 = Rc2.len();
			Rc2.mul(tiger.R2/lenRc2);
		}
		var Rc = Rc1.add(Rc2,false);
		var n = Rc.sub(P,false);
		var lenN = n.len();
		var d = R + R11 - lenN;
		n.div(lenN);
		if(phase == 0){
			if(d>-0.001){
				if(t==0 && first){
					t += Math.PI/2;
					first = false;
				}else{
					phase = 1;
					cos = -X.mul(Math.sin(t),false).sub(T.mul(Math.cos(t),false)).dot(n);
				}
			}else{
				t+= d/R12;
			}
		}else if(phase == 1){
			var ncos = -X.mul(Math.sin(t),false).sub(T.mul(Math.cos(t),false)).dot(n);
			if(!(ncos>0 ^ cos>0)&&Math.abs(ncos)>0.01) {
				t -= Math.PI/360;
				cos = ncos;
				continue;
			}
			n = tiger_r[0].mul(n,false).mul(tiger_r[1]);
			list.push(new Phy4d.Collision(this, stO, tigerO, n, d+0.002, tiger_r[0].mul(Rc,false).mul(tiger_r[1]).add(tiger_o).sub(n.mul(R-d/2,false),false)));
			found = true;
			break;
		}
	}
	if(!found){
		return 0;
	}
	if (list.length){
		return list;
	}
}
Phy4d.prototype.detectCollision_Torisphere_Tiger = function(tsO, tigerO){
	var ts = tsO.phyGeom;
	var ti = tigerO.phyGeom;
	var ts_o = tsO.getPosition(true);
	var ts_r = tsO.getRotation(true);
	var ti_o = tigerO.getPosition(true);
	var ti_r = tigerO.getRotation(true);
	var list = [];
	var s = Math.random()*Math.PI*2, t = Math.random()*Math.PI*2;
	//convert ts to ti's coordinate
	var O1local = ti_r[0].conj(false).mul(ts_o.sub(ti_o,false)).mul(ti_r[1].conj(false));
	var convertL2 = ti_r[0].conj(false).mul(ts_r[0]);
	var convertR2 = ts_r[1].mul(ti_r[1].conj(false),false);
	//convert ti to ts's coordinate
	var O2local = ts_r[0].conj(false).mul(ti_o.sub(ts_o,false)).mul(ts_r[1].conj(false));
	var convertL1 = ts_r[0].conj(false).mul(ti_r[0]);
	var convertR1 = ti_r[1].mul(ts_r[1].conj(false),false);
	var maxIterations = 20;
	var Rmax = ti.R1+ti.R+ti.R2+ts.R1;//随机选点，反正都能收敛
	var P = new Vec4(Math.sin(s)*Rmax,Math.cos(s)*Rmax,Math.sin(t)*Rmax,Math.cos(t)*Rmax);
	var coord = ti;
	var n;
	var Rc = new Vec4();
	while (maxIterations--){
		if(coord == ti){
			var lenXY = P.x*P.x+P.y*P.y;
			var lenZT = P.z*P.z+P.t*P.t;
			if(lenXY==0){
				Rc.x = coord.R1;
				Rc.y = 0;
			}else{
				lenXY = coord.R1/Math.sqrt(lenXY);
				Rc.x = P.x*lenXY;
				Rc.y = P.y*lenXY;
			}
			if(lenZT==0){
				Rc.z = coord.R2;
				Rc.t = 0;
			}else{
				lenZT = coord.R2/Math.sqrt(lenZT);
				Rc.z = P.z*lenZT;
				Rc.t = P.t*lenZT;
			}
		}else{
			var lenXYZ = P.x*P.x+P.y*P.y+P.z*P.z;
			if(lenXYZ==0){
				Rc.x = coord.R2;
				Rc.y = 0;
				Rc.z = 0;
			}else{
				lenXYZ = coord.R2/Math.sqrt(lenXYZ);
				Rc.x = P.x*lenXYZ;
				Rc.y = P.y*lenXYZ;
				Rc.z = P.z*lenXYZ;
			}
			Rc.t = 0;
		}
		n = Rc.sub(P,false);
		if(coord == ti){
			P = convertL1.mul(Rc,false).mul(convertR1).add(O2local);
			coord = ts;
		}else{
			P = convertL2.mul(Rc,false).mul(convertR2).add(O1local);
			coord = ti;
		}
	}
	coord = coord==ti?ts:ti;//循环结束时多倒了一次
	var coord_r = coord.Obj.getRotation(true);
	var coord_o = coord.Obj.getPosition(true);
	var lenN = n.len();
	var d = ti.R + ts.R1 - lenN;
	if(d<0) return 0;
	n.div(lenN);
	n = coord_r[0].mul(n,false).mul(coord_r[1]);
	return (new Phy4d.Collision(this, coord==ti?tsO:tigerO, coord==ts?tsO:tigerO, n, d+0.01, coord_r[0].mul(Rc,false).mul(coord_r[1]).add(coord_o).sub(n.mul((coord.R||coord.R1)-d/2,false),false)));
}
Phy4d.prototype.detectCollision_Tiger_Tiger = function(t1O, t2O){
	var t1 = t1O.phyGeom;
	var t2 = t2O.phyGeom;
	var t1_o = t1O.getPosition(true);
	var t1_r = t1O.getRotation(true);
	var t2_o = t2O.getPosition(true);
	var t2_r = t2O.getRotation(true);

	var list = [];
	var s = Math.random()*Math.PI*2, t = Math.random()*Math.PI*2;
	//convert t1 to t2's coordinate
	var O1local = t2_r[0].conj(false).mul(t1_o.sub(t2_o,false)).mul(t2_r[1].conj(false));
	var convertL2 = t2_r[0].conj(false).mul(t1_r[0]);
	var convertR2 = t1_r[1].mul(t2_r[1].conj(false),false);
	//convert t2 to t1's coordinate
	var O2local = t1_r[0].conj(false).mul(t2_o.sub(t1_o,false)).mul(t1_r[1].conj(false));
	var convertL1 = t1_r[0].conj(false).mul(t2_r[0]);
	var convertR1 = t2_r[1].mul(t1_r[1].conj(false),false);
	var maxIterations = 20;
	var Rmax = t2.R1+t2.R+t2.R2+t1.R;//随机选点，反正都能收敛
	var P = new Vec4(Math.sin(s)*Rmax,Math.cos(s)*Rmax,Math.sin(t)*Rmax,Math.cos(t)*Rmax);
	var coord = t2;
	var n;
	var Rc = new Vec4();
	while (maxIterations--){
		var lenXY = P.x*P.x+P.y*P.y;
		var lenZT = P.z*P.z+P.t*P.t;
		if(lenXY==0){
			Rc.x = coord.R1;
			Rc.y = 0;
		}else{
			lenXY = coord.R1/Math.sqrt(lenXY);
			Rc.x = P.x*lenXY;
			Rc.y = P.y*lenXY;
		}
		if(lenZT==0){
			Rc.z = coord.R2;
			Rc.t = 0;
		}else{
			lenZT = coord.R2/Math.sqrt(lenZT);
			Rc.z = P.z*lenZT;
			Rc.t = P.t*lenZT;
		}
		n = Rc.sub(P,false);
		if(coord == t2){
			P = convertL1.mul(Rc,false).mul(convertR1).add(O2local);
			coord = t1;
		}else{
			P = convertL2.mul(Rc,false).mul(convertR2).add(O1local);
			coord = t2;
		}
	}
	coord = coord==t2?t1:t2;//循环结束时多倒了一次
	var coord_r = coord.Obj.getRotation(true);
	var coord_o = coord.Obj.getPosition(true);
	var lenN = n.len();
	var d = t2.R + t1.R - lenN;
	if(d<0) return 0;
	n.div(lenN);
	n = coord_r[0].mul(n,false).mul(coord_r[1]);
	return (new Phy4d.Collision(this, coord==t2?t1O:t2O, coord==t1?t1O:t2O, n, d+0.01, coord_r[0].mul(Rc,false).mul(coord_r[1]).add(coord_o).sub(n.mul(coord.R-d/2,false),false)));
}

Phy4d.prototype.detectCollision_Torisphere_Torisphere = function(t1O, t2O){
	var t1 = t1O.phyGeom;
	var t2 = t2O.phyGeom;
	var t1_o = t1O.getPosition(true);
	var t1_r = t1O.getRotation(true);
	var t2_o = t2O.getPosition(true);
	var t2_r = t2O.getRotation(true);
	var list = [];
	var s = Math.random()*Math.PI*2, t = Math.random()*Math.PI*2;
	//convert t1 to t2's coordinate
	var O1local = t2_r[0].conj(false).mul(t1_o.sub(t2_o,false)).mul(t2_r[1].conj(false));
	var convertL2 = t2_r[0].conj(false).mul(t1_r[0]);
	var convertR2 = t1_r[1].mul(t2_r[1].conj(false),false);
	//convert t2 to t1's coordinate
	var O2local = t1_r[0].conj(false).mul(t2_o.sub(t1_o,false)).mul(t1_r[1].conj(false));
	var convertL1 = t1_r[0].conj(false).mul(t2_r[0]);
	var convertR1 = t2_r[1].mul(t1_r[1].conj(false),false);
	var maxIterations = 50;
	var Rmax = t2.R1+t2.R1+t2.R2+t1.R2;//随机选点，反正都能收敛
	var P = new Vec4(Math.sin(s)*Rmax,Math.cos(s)*Rmax,Math.sin(t)*Rmax,0);
	var coord = t2;
	var n;
	var Rc = new Vec4();
	while (maxIterations--){
		var lenXYZ = P.x*P.x+P.y*P.y+P.z*P.z;
		if(lenXYZ==0){
			Rc.x = coord.R2;
			Rc.y = 0;
			Rc.z = 0;
		}else{
			lenXYZ = coord.R2/Math.sqrt(lenXYZ);
			Rc.x = P.x*lenXYZ;
			Rc.y = P.y*lenXYZ;
			Rc.z = P.z*lenXYZ;
		}
		Rc.t = 0;
		n = Rc.sub(P,false);
		if(coord == t2){
			P = convertL1.mul(Rc,false).mul(convertR1).add(O2local);
			coord = t1;
		}else{
			P = convertL2.mul(Rc,false).mul(convertR2).add(O1local);
			coord = t2;
		}
	}
	coord = coord==t2?t1:t2;//循环结束时多倒了一次
	var coord_r = coord.Obj.getRotation(true);
	var coord_o = coord.Obj.getPosition(true);
	var lenN = n.len();
	var d = t2.R1 + t1.R1 - lenN;
	if(d<0) return 0;
	n.div(lenN);
	n = coord_r[0].mul(n,false).mul(coord_r[1]);
	return (new Phy4d.Collision(this, coord==t2?t1O:t2O, coord==t1?t1O:t2O, n, d, coord_r[0].mul(Rc,false).mul(coord_r[1]).add(coord_o).sub(n.mul(coord.R1-d/2,false),false)));
}
	
Phy4d.prototype._projectConvex = function(cOwV,axis,flag){
	if(typeof flag=="object"){
		if(flag.sups){
			return flag.sups.minmax;
		}
	}
	var min = Infinity;
	var max = -Infinity;
	
	for(var v of cOwV){
		var d = v.dot(axis);
		if(d<min) min = d;
		if(d>max) max = d;
	}
	if(typeof flag=="object"){
		if(!flag.sups){
			flag.sups = [];
		}
		flag.sups = {n:axis, minmax:[min,max]};
	}
	return [min,max];
}
Phy4d.PointConstrain = function(obj1, point1, obj2, point2, maxDistance ,breakable){
	this.obj1 = obj1;
	this.point1 = point1;
	this.obj2 = obj2;
	this.point2 = point2;
	this.breakable = breakable;
	this.maxDistance = maxDistance || 0;
	this.restitution = 0.5; //for maxDistance > 0
	this.enable = true;
}

Phy4d.PointConstrain.prototype._detect = function(){
	var p1,p2,r1,r2;
	var obj1 = this.obj1;
	var obj2 = this.obj2;
	if(obj1){
		p1 = obj1.getPosition();
		r1 = obj1.getRotation();
	}
	if(obj2){
		p2 = obj2.getPosition();
		r2 = obj2.getRotation();
	}
	
	var worldP1 = (obj1) ? r1[0].mul(this.point1,false).mul(r1[1]).add(p1) : this.point1;
	var worldP2 = (obj2) ? r2[0].mul(this.point2,false).mul(r2[1]).add(p2) : this.point2;
	var p1p2 = worldP1.sub(worldP2,false);
	var d = p1p2.len(false);
	this.n = p1p2;
	if(this.maxDistance){
		if(d<this.maxDistance*this.maxDistance){
			this.d = null;
			this.n = null;
			return 0;
		}
	}
	this.Vsep = 0;
	this.Vrel = new Vec4();
	p1p2.norm();
	if(obj2){
		this.Vrel.add(obj2.getlinearVelocity(worldP2));
	}
	if(obj1){
		this.Vrel.sub(obj1.getlinearVelocity(worldP1));
	}
	this.Vsep = this.Vrel.dot(p1p2);
	
	this.d = Math.sqrt(d) - this.maxDistance;
	this.worldP1 = worldP1;
	this.worldP2 = worldP2;
	return this;
}

Phy4d.PointConstrain.prototype._solve = function(){
	var obj1 = this.obj1;
	var obj2 = this.obj2;
	
	var deltaV4 = this.Vrel.sub(false);
	var totalInvMass = ((obj1)?obj1.invMass:0) + ((obj2)?obj2.invMass:0);
	if(totalInvMass>0){

		var angularComponent_x = new Vec4();
		var angularComponent_y = new Vec4();
		var angularComponent_z = new Vec4();
		var angularComponent_t = new Vec4();
		
		var r1 = obj1&&obj1.getRotation();
		var r2 = obj2&&obj2.getRotation();
		if(r1){
			var relContactP1 = this.worldP1.sub(this.obj1.getPosition(true),false);
			var M1 = r1[0].toMatL().mul(r1[1].toMatR());
			var MW1 = M1.toMatBivec();
			var MW1t = MW1.t(false);
			
			var W1_x = MW1t.mul(
				obj1.inertie.invMul(
					MW1.mul(relContactP1.cross(new Vec4(1,0,0,0)),false)
				),false
			);
			angularComponent_x.add(W1_x.dual(false).cross(relContactP1));
			var W1_y = MW1t.mul(
				obj1.inertie.invMul(
					MW1.mul(relContactP1.cross(new Vec4(0,1,0,0)),false)
				),false
			);
			angularComponent_y.add(W1_y.dual(false).cross(relContactP1));
			var W1_z = MW1t.mul(
				obj1.inertie.invMul(
					MW1.mul(relContactP1.cross(new Vec4(0,0,1,0)),false)
				),false
			);
			angularComponent_z.add(W1_z.dual(false).cross(relContactP1));
			var W1_t = MW1t.mul(
				obj1.inertie.invMul(
					MW1.mul(relContactP1.cross(new Vec4(0,0,0,1)),false)
				),false
			);
			angularComponent_t.add(W1_t.dual(false).cross(relContactP1));
			
		}
		if(r2){
			var relContactP2 = this.worldP2.sub(this.obj2.getPosition(true),false);
			var M2 = r2[0].toMatL().mul(r2[1].toMatR());
			var MW2 = M2.toMatBivec();
			var MW2t = MW2.t(false);
			
			var W2_x = MW2t.mul(
				obj2.inertie.invMul(
					MW2.mul(relContactP2.cross(new Vec4(1,0,0,0)),false)
				),false
			);
			angularComponent_x.add(W2_x.dual(false).cross(relContactP2));
			var W2_y = MW2t.mul(
				obj2.inertie.invMul(
					MW2.mul(relContactP2.cross(new Vec4(0,1,0,0)),false)
				),false
			);
			angularComponent_y.add(W2_y.dual(false).cross(relContactP2));
			var W2_z = MW2t.mul(
				obj2.inertie.invMul(
					MW2.mul(relContactP2.cross(new Vec4(0,0,1,0)),false)
				),false
			);
			angularComponent_z.add(W2_z.dual(false).cross(relContactP2));
			var W2_t = MW2t.mul(
				obj2.inertie.invMul(
					MW2.mul(relContactP2.cross(new Vec4(0,0,0,1)),false)
				),false
			);
			angularComponent_t.add(W2_t.dual(false).cross(relContactP2));
			
		}
		var velocityPerUnitImpulse = new Mat4(
			totalInvMass + angularComponent_x.x, angularComponent_x.y, angularComponent_x.z, angularComponent_x.t,
			angularComponent_y.x, totalInvMass + angularComponent_y.y, angularComponent_y.z, angularComponent_y.t,
			angularComponent_z.x, angularComponent_z.y, totalInvMass + angularComponent_z.z, angularComponent_z.t,
			angularComponent_t.x, angularComponent_t.y, angularComponent_t.z, totalInvMass + angularComponent_t.t
		);
		var impulse = velocityPerUnitImpulse.inv().mul(deltaV4);
		
		if(obj1)obj1.v.sub(impulse.mul(obj1.invMass,false));
		if(obj2)obj2.v.add(impulse.mul(obj2.invMass,false));
		
		if(r1){
			obj1.w.add(
				W1_x.mul(impulse.x).add(W1_y.mul(impulse.y)).add(W1_z.mul(impulse.z)).add(W1_t.mul(impulse.t))
			);
		}
		if(r2){
			obj2.w.sub(
				W2_x.mul(impulse.x).add(W2_y.mul(impulse.y)).add(W2_z.mul(impulse.z)).add(W2_t.mul(impulse.t))
			);
		}
		//penetration solve
		var totalInvInertie = totalInvMass;
		if(obj1)var r1 = obj1.getRotation();
		if(obj2)var r2 = obj2.getRotation();
		if(obj1 && obj1.inertie){
			if(!MW1) {
				var MW1 = r1[0].toMatL().mul(r1[1].toMatR()).toMatBivec();
				var MW1t = MW1.t(false);
			}
			var W1 = MW1t.mul(
				obj1.inertie.invMul(
					MW1.mul(relContactP1.cross(this.n),false)
				),false
			);
			var angularInertie1 = W1.dual(false).cross(relContactP1).dot(this.n);
			totalInvInertie += Math.abs(angularInertie1);
		}
		if(obj2 && obj2.inertie){
			if(!MW2) {
				var MW2 = r2[0].toMatL().mul(r2[1].toMatR()).toMatBivec();
				var MW2t = MW2.t(false);
			}
			var W2 = MW2t.mul(
				obj2.inertie.invMul(
					MW2.mul(relContactP2.cross(this.n),false)
				),false
			);
			var angularInertie2 = W2.dual(false).cross(relContactP2).dot(this.n);
			totalInvInertie += Math.abs(angularInertie2);
		}
		
		var dPerIMass = this.n.mul(this.d/totalInvInertie,false);
		if(obj1 && obj1.inertie){
			W1.mul(this.d/totalInvInertie);
			var l = W1.len();
			var dr = W1.mul(Math.min(1,0.1/l)).expQ();
			r1[0].set(dr[0].mul(r1[0],false).norm());
			r1[1].set(r1[1].mul(dr[1]).norm());
		}
		if(obj2 && obj2.inertie){
			W2.mul(this.d/totalInvInertie);
			var l = W2.len();
			var dr = W2.mul(-Math.min(1,0.1/l)).expQ();
			r2[0].set(dr[0].mul(r2[0],false).norm());
			r2[1].set(r2[1].mul(dr[1]).norm());
		}
		var p1 = obj1?obj1.getPosition():null;
		var p2 = obj2?obj2.getPosition():null;
		if(p1) p1.sub(dPerIMass.mul(obj1.invMass,false));
		if(p2) p2.add(dPerIMass.mul(obj2.invMass));
	}
}
Phy4d.RotationPlaneConstrain = function(obj1, plane1, obj2, plane2){
	this.obj1 = obj1;
	this.plane1 = plane1.norm();
	this.obj2 = obj2;
	this.plane2 = plane2.norm();
	this.enable = true;
}
Phy4d.RotationPlaneConstrain.prototype._detect = function(){
	var r1,r2;
	var obj1 = this.obj1;
	var obj2 = this.obj2;
	var wrel = new Bivec();
	if(obj1){
		r1 = obj1.getRotation();
		this.M1 = r1[0].toMatL().mul(r1[1].toMatR()).toMatBivec();
		wrel.add(obj1.w);
	}
	if(obj2){
		r2 = obj2.getRotation();
		this.M2 = r2[0].toMatL().mul(r2[1].toMatR()).toMatBivec();
		wrel.sub(obj2.w);
	}
	
	var worldP1 = (obj1) ? this.M1.mul(this.plane1) : this.plane1;
	var worldP2 = (obj2) ? this.M2.mul(this.plane2) : this.plane2;
	var p1p2 = worldP1.commutate(worldP2,false);
	this.worldP1 = worldP1;
	this.worldP2 = worldP2;
	this.p1p2 = p1p2;
	this.d = p1p2.len(1);
	this.wrel = wrel;
	return this;
}
Phy4d.RotationPlaneConstrain.prototype._solve = function(){
	var totalInvInertie = 0;
	var obj1 = this.obj1;
	var obj2 = this.obj2;
	var worldP1 = this.worldP1;
	var worldP2 = this.worldP2;
	if(obj1){
		var r1 = obj1.getRotation();
		totalInvInertie += obj1.invMass;
	}
	if(obj2){
		var r2 = obj2.getRotation();
		totalInvInertie += obj2.invMass;
	}
	if(obj1){
		var worldP2d = worldP2.dual(false);
		var newW = worldP2.mul(worldP2.dot(this.wrel),false).add(worldP2d.mul(worldP2d.dot(this.wrel),false));
		var deltaW = newW.sub(this.wrel);
		
		obj1.w.add(deltaW.mul(this.obj1.invMass/totalInvInertie,false));
	}
	if(obj2){
		var worldP1d = worldP1.dual(false);
		var newW = worldP1.mul(worldP1.dot(this.wrel),false).add(worldP1d.mul(this.worldP1d.dot(this.wrel),false));
		var deltaW = newW.sub(this.wrel);
		obj2.w.sub(deltaW.mul(this.obj2.invMass/totalInvInertie,false));
	}
	
	if(obj1){
		var p1 = this.M1.t().mul(this.p1p2).mul(this.obj1.invMass/totalInvInertie);
		var dr = p1.expQ();
		r1[0].set(dr[0].mul(r1[0],false).norm());
		r1[1].set(r1[1].mul(dr[1]).norm());
	}
	if(obj2){
		var p2 = this.M2.t().mul(this.p1p2).mul(-this.obj2.invMass/totalInvInertie);;
		var dr = p2.expQ();
		r2[0].set(dr[0].mul(r2[0],false).norm());
		r2[1].set(r2[1].mul(dr[1]).norm());
	}
}

Phy4d.Motor = function(obj,torque,damp,coordObj){
	this.obj = obj;
	this.torque = torque;
	this.damp = damp || 0;
	this.coordObj = coordObj;
	this.enable = true;
}
Phy4d.Motor.prototype._apply = function(){
	var torque = this.torque.clone();
	var MW;
	if(this.coordObj){
		var r = this.coordObj.getRotation(true);
		var M = r[0].toMatL().mul(r[1].toMatR());
		MW = M.toMatBivec().t();
		torque = MW.mul(torque);
	}
	if(this.damp){
		if(typeof this.damp=="number"){
			torque.sub(this.obj.w.mul(this.damp,false));
		}else{//MatBivec
			var damp = this.damp;
			if(MW){
				damp = MW.mul(this.damp,false).mul(MW.t(false));
			}
			torque.sub(damp.mul(this.obj.w));
		}
	}
	this.obj.wake();
	this.obj.b.add(this.obj.inertie.invMul(torque));
}
Phy4d.Spring = function(obj1, point1, obj2, point2, k, d,breakable){
	this.obj1 = obj1;
	this.point1 = point1;
	this.obj2 = obj2;
	this.point2 = point2;
	this.breakable = breakable;
	this.k = k;
	this.d = d||0;
	this.enable = true;
}
Phy4d.Spring.prototype._apply = function(){
	var p1,p2,r1,r2;
	var d = this.d;
	var obj1 = this.obj1;
	var obj2 = this.obj2;
	if(obj1){
		p1 = obj1.getPosition(true);
		r1 = obj1.getRotation(true);
	}
	if(obj2){
		p2 = obj2.getPosition(true);
		r2 = obj2.getRotation(true);
	}
	
	var worldP1 = (obj1) ? r1[0].mul(this.point1,false).mul(r1[1]).add(p1) : this.point1;
	var worldP2 = (obj2) ? r2[0].mul(this.point2,false).mul(r2[1]).add(p2) : this.point2;
	var p1p2 = worldP1.sub(worldP2,false);
	var F = p1p2.mul(-this.k);
	if(d){
		var Vrel = new Vec4();
		if(obj2){
			Vrel.add(obj2.getlinearVelocity(worldP2));
		}
		if(obj1){
			Vrel.sub(obj1.getlinearVelocity(worldP1));
		}
		F.add(Vrel.mul(d));
	}
	if(obj1){
		obj1.a.add(F.mul(obj1.invMass,false));
		var torque1 = F.cross(worldP1.sub(p1,false));
		obj1.wake();
		obj1.b.add(obj1.inertie.invMul(torque1));
	}
	if(obj2){
		obj2.a.sub(F.mul(obj2.invMass,false));
		var torque2 = F.cross(worldP2.sub(p2,false));
		obj2.wake();
		obj2.b.sub(obj2.inertie.invMul(torque2));
	}
}
Phy4d.Damp = function(obj, linear, angular){
	this.obj = obj;
	this.linear = linear;
	this.angular = angular;
	this.enable = true;
}
Phy4d.Damp.prototype._apply = function(){
	var force = this.obj.v.mul(-this.linear,false);
	var torque = this.obj.w.mul(-this.angular,false);
	this.obj.applyForce(force,null,torque);
}

Phy4d.ElectricCharge = function(obj, point, q){//q:Number
	this.obj = obj;
	this.point = point;//rel to obj if obj is not null
	this.q = q;
	this.updateWorldCoord();//needless
}
Phy4d.ElectricCharge.prototype.updateWorldCoord = function(){//p in world coord
	var obj = this.obj;
	if(!obj){
		this.p0 = this.point;
	}else{
		var r = obj.getRotation(true);
		var x = obj.getPosition(true);
		this.p0 = r[0].mul(this.point,false).mul(r[1]).add(x);
	}
}

Phy4d.ElectricCharge.prototype._Field = function(p){//p in world coord
	var obj = this.obj;
	var k = p.sub(this.p0,false);
	var rr = 1/k.len(false);
	if(rr>1e20) return [0,0];
	var rr2 = rr*rr;
	var qr2 = this.q*rr2;
	var qr34 = -4*qr2*rr;
	var qrk = k.mul(qr34,false);
	var xy = qrk.x*k.y, xz = qrk.x*k.z, xt = qrk.x*k.t, yz = qrk.y*k.z, yt = qrk.y*k.t, zt = qrk.z*k.t;
	return [
		k.mul(qr2,false),//E
		new Mat4(
			qr2+qrk.x*k.x, xy, xz, xt,
			xy, qr2+qrk.y*k.y, yz, yt,
			xz, yz, qr2+qrk.z*k.z, zt,
			xt, yt, zt, qr2+qrk.t*k.t
		)//dE
	];
}
Phy4d.ElectricCharge.prototype._apply = function(E,B){
	var obj = this.obj;
	var force = E.mul(this.q,false);
	obj.applyForce(force,this.p0);
}

Phy4d.ElectricDipole = function(obj, point, q){//q:Vec4
	this.obj = obj;
	this.point = point;//rel to obj if obj is not null
	this.q = q;
}
Phy4d.ElectricDipole.prototype.updateWorldCoord = function(){//p in world coord
	var obj = this.obj;
	if(!obj){
		this.p0 = this.point;
		this.q0 = this.q;
	}else{
		var r = obj.getRotation(true);
		var x = obj.getPosition(true);
		this.p0 = r[0].mul(this.point,false).mul(r[1]).add(x);
		this.q0 = r[0].mul(this.q,false).mul(r[1]);
	}
}
Phy4d.ElectricDipole.prototype._Field = function(p){//p in world coord
	var obj = this.obj;
	var p0 = this.p0;
	var q = this.q0;
	var k = p.sub(p0,false);
	var xx = k.x*k.x, yy = k.y*k.y, zz = k.z*k.z, tt = k.t*k.t;
	var r2 = xx+yy+zz+tt;
	if(r2<1e-20) return [0,0];
	var rr = 1/r2;
	var rr2 = rr*rr;
	var pxx = q.x*k.x, pyy = q.y*k.y, pzz = q.z*k.z, ptt = q.t*k.t;
	var pk = pxx+pyy+pzz+ptt;
	var pr4rr = 4*pk*rr;
	var rr4m4 = -4*rr2*rr2;
	var pk6 = pk*6;

	var xy = rr4m4*((q.x*k.y+q.y*k.x)*r2-pk6*k.x*k.y),
		xz = rr4m4*((q.x*k.z+q.z*k.x)*r2-pk6*k.x*k.z),
		xt = rr4m4*((q.x*k.t+q.t*k.x)*r2-pk6*k.x*k.t),
		yz = rr4m4*((q.y*k.z+q.z*k.y)*r2-pk6*k.y*k.z),
		yt = rr4m4*((q.y*k.t+q.t*k.y)*r2-pk6*k.y*k.t),
		zt = rr4m4*((q.z*k.t+q.t*k.z)*r2-pk6*k.z*k.t);
	return [
		new Vec4(
			rr2*(q.x - pr4rr*k.x),
			rr2*(q.y - pr4rr*k.y),
			rr2*(q.z - pr4rr*k.z),
			rr2*(q.t - pr4rr*k.t)
		),
		new Mat4(
			(pk*(r2-6*xx)+2*pxx*r2)*rr4m4, xy, xz, xt,
			xy, (pk*(r2-6*yy)+2*pyy*r2)*rr4m4, yz, yt,
			xz, yz, (pk*(r2-6*zz)+2*pzz*r2)*rr4m4, zt,
			xt, yt, zt, (pk*(r2-6*tt)+2*ptt*r2)*rr4m4
		)
	];
}
Phy4d.ElectricDipole.prototype._apply = function(E,B,dE){
	var obj = this.obj;
	var force = dE.mul(this.q0,false);
	obj.applyForce(force.sub(),this.p0,this.q0.cross(E));
}

Phy4d.MagneticDipole = function(obj, point, q){//q:Bivec
	this.obj = obj;
	this.point = point;//rel to obj if obj is not null
	this.q = q;
}
Phy4d.MagneticDipole.prototype.updateWorldCoord = function(){//p in world coord
	var obj = this.obj;
	if(!obj){
		this.p0 = this.point;
		this.q0 = this.q;
	}else{
		var r = obj.getRotation(true);
		var x = obj.getPosition(true);
		this.p0 = r[0].mul(this.point,false).mul(r[1]).add(x);
		var M1 = r[0].toMatL().mul(r[1].toMatR());
		var MW1 = M1.toMatBivec();
		this.q0 = MW1.mul(this.q);
	}
}
Phy4d.MagneticDipole.prototype._Field = function(p){//p in world coord
	var obj = this.obj;
	var p0 = this.p0;
	var q = this.q0;
	var k = p.sub(p0,false);
	var x = k.x, y = k.y, z = k.z, t = k.t;
	var xx = x*x, yy = y*y, zz = z*z, tt = t*t;
	var kxy = q.xy, kxz = q.xz, kxt = q.xt, kyz = q.yz, kyt = q.yt, kzt = q.zt;
	var kyx =-q.xy, kzx =-q.xz, ktx =-q.xt, kzy =-q.yz, kty =-q.yt, ktz =-q.zt;
	var r2 = xx+yy+zz+tt;
	var kxy2 = kzt*(-xx-yy+zz+tt);
	var kxz2 = kyt*(-xx+yy-zz+tt);
	var kxt2 = kyz*(-xx+yy+zz-tt);
	var kyz2 = kxt*( xx-yy-zz+tt);
	var kyt2 = kxz*( xx-yy+zz-tt);
	var kzt2 = kxy*( xx+yy-zz-tt);

	var rr = 1/r2;
	var rr2 = rr*rr;
	var rr34 = 4*rr2*rr;
	var rr4 = rr34*rr;
	var xy = x*y,
		xz = x*z,
		xt = x*t,
		yz = y*z,
		yt = y*t,
		zt = z*t;
	
	return [
		new Bivec(
			rr34*((-kxz*xt-kyz*yt+kxt*xz+kyt*yz)+0.5*kxy2),
			-rr34*((-kxy*xt-kzy*zt+kxt*xy+kzt*yz)+0.5*kxz2),
			-rr34*((-kxz*xy-ktz*yt+kxy*xz+kty*zt)-0.5*kxt2),
			rr34*((kxy*yt-kzx*zt+kyt*xy+kzt*xz)+0.5*kyz2),
			-rr34*((kxy*yz-ktx*zt+kyz*xy-kzt*xt)+0.5*kyt2),
			rr34*((kxz*yz-ktx*yt-kyz*xz-kyt*xt)+0.5*kzt2)
		),
		new Mat46([
			[rr4*(6*xy*(kyz*t-kyt*z)+2*kzt*x*(xx+yy-2*(zz+tt))+(kxt*z-kxz*t)*(r2-6*xx)),
			rr4*(6*xy*(kxz*t-kxt*z)+2*kzt*y*(xx+yy-2*(zz+tt))+(kyt*z-kyz*t)*(r2-6*yy)),
			rr4*(6*zt*(kxz*x+kyz*y)-2*kzt*z*(zz+tt-2*(xx+yy))+(kxt*x+kyt*y)*(r2-6*zz)),
			-rr4*(6*zt*(kxt*x+kyt*y)+2*kzt*t*(zz+tt-2*(xx+yy))+(kxz*x+kyz*y)*(r2-6*tt))],

			[-rr4*(6*xz*(-kyz*t-kzt*y)+2*kyt*x*(xx+zz-2*(yy+tt))+(kxt*y-kxy*t)*(r2-6*xx)),
			-rr4*(6*yt*(kxy*x+kzy*z)-2*kyt*y*(yy+tt-2*(xx+zz))+(kxt*x+kzt*z)*(r2-6*yy)),
			-rr4*(6*xz*(kxy*t-kxt*y)+2*kyt*z*(xx+zz-2*(yy+tt))+(kzt*y-kzy*t)*(r2-6*zz)),
			rr4*(6*yt*(kxt*x+kzt*z)+2*kyt*t*(yy+tt-2*(xx+zz))+(kxy*x+kzy*z)*(r2-6*tt))],

			[-rr4*(6*xt*(ktz*y-kty*z)+2*kzy*x*(xx+tt-2*(zz+yy))+(kxy*z-kxz*y)*(r2-6*xx)),
			rr4*(6*yz*(kxy*x+kty*t)+2*kzy*y*(zz+yy-2*(xx+tt))+(kxz*x+ktz*t)*(r2-6*yy)),
			-rr4*(6*yz*(kxz*x+ktz*t)-2*kzy*z*(zz+yy-2*(xx+tt))+(kxy*x+kty*t)*(r2-6*zz)),
			-rr4*(6*xt*(kxz*y-kxy*z)+2*kzy*t*(xx+tt-2*(zz+yy))+(kty*z-ktz*y)*(r2-6*tt))],

			[rr4*(6*xt*(kyx*y+kzx*z)-2*kxt*x*(xx+tt-2*(yy+zz))+(kyt*y+kzt*z)*(r2-6*xx)),
			rr4*(6*yz*(-kxz*t-kzt*x)+2*kxt*y*(yy+zz-2*(xx+tt))+(kyt*x-kyx*t)*(r2-6*yy)),
			rr4*(6*yz*(kyx*t-kyt*x)+2*kxt*z*(yy+zz-2*(xx+tt))+(kzt*x-kzx*t)*(r2-6*zz)),
			-rr4*(6*xt*(kyt*y+kzt*z)+2*kxt*t*(xx+tt-2*(yy+zz))+(kyx*y+kzx*z)*(r2-6*tt))],
			
			[-rr4*(6*xz*(kyx*y+ktx*t)-2*kxz*x*(xx+zz-2*(yy+tt))+(kyz*y+ktz*t)*(r2-6*xx)),
			-rr4*(6*yt*(-kxt*z-ktz*x)+2*kxz*y*(yy+tt-2*(xx+zz))+(kyz*x-kyx*z)*(r2-6*yy)),
			rr4*(6*xz*(kyz*y+ktz*t)+2*kxz*z*(xx+zz-2*(yy+tt))+(kyx*y+ktx*t)*(r2-6*zz)),
			-rr4*(6*yt*(kyx*z-kyz*x)+2*kxz*t*(yy+tt-2*(xx+zz))+(ktz*x-ktx*z)*(r2-6*tt))],

			[rr4*(6*xy*(kzx*z+ktx*t)-2*kxy*x*(xx+yy-2*(zz+tt))+(kzy*z+kty*t)*(r2-6*xx)),
			-rr4*(6*xy*(kzy*z+kty*t)+2*kxy*y*(xx+yy-2*(zz+tt))+(kzx*z+ktx*t)*(r2-6*yy)),
			rr4*(6*zt*(-kxt*y-kty*x)+2*kxy*z*(zz+tt-2*(xx+yy))+(kzy*x-kzx*y)*(r2-6*zz)),
			rr4*(6*zt*(kzx*y-kzy*x)+2*kxy*t*(zz+tt-2*(xx+yy))+(kty*x-ktx*y)*(r2-6*tt))]
		])
	];
}
Phy4d.MagneticDipole.prototype._apply = function(E,B,dE,dB){
	var obj = this.obj;
	var force = dB.mul(this.q0.dual(false));
	obj.applyForce(force.sub(),this.p0,this.q0.commutate(B).dual());
}

Phy4d.LorentzForce = function(source){
	this.enable = true;
	this.sources = source || [];
}
Phy4d.LorentzForce.prototype.addSource = function(s){
	if(s instanceof Phy4d.ElectricCharge || s instanceof Phy4d.ElectricDipole || s instanceof Phy4d.MagneticDipole){
		this.sources.push(s);
	}else{
		console.error("unsupported lorentz force source type");
	}
}
Phy4d.LorentzForce.prototype._apply = function(){
	for(var obj of this.sources){
		obj.updateWorldCoord();
	}
	for(var obj of this.sources){
		if(!obj.obj) continue;
		var E = new Vec4(0);
		var dE = new Mat4(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);
		var B = new Bivec();
		var dB = new Mat46();
		var r = obj.obj.getRotation();
		var x = obj.obj.getPosition();
		var p0 = r[0].mul(obj.point,false).mul(r[1]).add(x);
		for(var source of this.sources){
			if(obj == source) continue;
			var F = source._Field(p0);
			if(F[0] instanceof Vec4) E.add(F[0]);
			if(F[0] instanceof Bivec) B.add(F[0]);
			if(F[1] instanceof Mat4) dE.add(F[1]);
			if(F[1] instanceof Mat46) dB.add(F[1]);
		}
		obj._apply(E,B,dE,dB);
	}
}