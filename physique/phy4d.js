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
Phy4d.Plane.prototype.clone = function(){
	return new Phy4d.Plane(this.n, this.t);
}
Phy4d.Plane.prototype.getPosition = function(){
	return null;
}
Phy4d.Plane.prototype.getRotation = function(){
	return null;
}
Phy4d.Plane.prototype.generateGeom = function(data){
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
Phy4d.Glome = function(o,R,r){//|x - o| = r
	this.o = o;
	this.R = R;
	this.r = r || [new Vec4(1,0,0,0), new Vec4(1,0,0,0)];
}
Phy4d.Glome.prototype.clone = function(){
	return new Phy4d.Glome(this.o, this.R, this.r);
}
Phy4d.Glome.prototype.getPosition = function(){
	return this.o;
}
Phy4d.Glome.prototype.getRotation = function(){
	return this.r;
}
Phy4d.Glome.prototype.generateGeom = function(data){
	var m = Mesh4.glome(this.R,data.u||8,data.v||8,data.w||8);
	return new Geom4(m,this.getPosition(),this.getRotation(),data.color);
}
Phy4d.Glome.prototype.getAABB = function(){
	var RRRR = new Vec4(this.R,this.R,this.R,this.R);
	return new Phy4d.AABB(this.o.sub(RRRR,false),this.o.add(RRRR,false),this);
}
Phy4d.Spheritorus = function(o,R1,R2,r){//default orientation: xOt (same as shape Mesh4.spheritorus)
	this.o = o;
	this.R1 = R1;
	this.R2 = R2;
	this.r = r || [new Vec4(1,0,0,0), new Vec4(1,0,0,0)];
}
Phy4d.Spheritorus.prototype.clone = function(){
	return new Phy4d.Spheritorus(this.o, this.R1, this.R2, this.r);
}
Phy4d.Spheritorus.prototype.getPosition = function(){
	return this.o;
}
Phy4d.Spheritorus.prototype.getRotation = function(){
	return this.r;
}
Phy4d.Spheritorus.prototype.generateGeom = function(data){
	var m = Mesh4.spheritorus(this.R1,this.R2,data.u||8,data.v||8,data.w||16);
	return new Geom4(m,this.getPosition(),this.getRotation(),data.color);
}
Phy4d.Spheritorus.prototype.getAABB = function(){
	var RRRR = new Vec4(this.R1+this.R2,this.R1+this.R2,this.R1+this.R2,this.R1+this.R2);
	return new Phy4d.AABB(this.o.sub(RRRR,false),this.o.add(RRRR,false),this);
}
Phy4d.Torisphere = function(o,R1,R2,r){//default orientation: t (same as shape Mesh4.torisphere)
	this.o = o;
	this.R1 = R1;
	this.R2 = R2;
	this.r = r || [new Vec4(1,0,0,0), new Vec4(1,0,0,0)];
}
Phy4d.Torisphere.prototype.clone = function(){
	return new Phy4d.Torisphere(this.o, this.R1, this.R2, this.r);
}
Phy4d.Torisphere.prototype.getPosition = function(){
	return this.o;
}
Phy4d.Torisphere.prototype.getRotation = function(){
	return this.r;
}
Phy4d.Torisphere.prototype.generateGeom = function(data){
	var m = Mesh4.torisphere(this.R1,this.R2,data.u||8,data.v||16,data.w||16);
	return new Geom4(m,this.getPosition(),this.getRotation(),data.color);
}
Phy4d.Torisphere.prototype.getAABB = function(){
	var RRRR = new Vec4(this.R1+this.R2,this.R1+this.R2,this.R1+this.R2,this.R1+this.R2);
	return new Phy4d.AABB(this.o.sub(RRRR,false),this.o.add(RRRR,false));
}
Phy4d.Tiger = function(o,R,R1,R2,r){//default orientation: R1:xy R2:zt (same as shape Mesh4.tiger)
	this.o = o;
	this.R = R;
	this.R1 = R1;
	this.R2 = R2;
	this.r = r || [new Vec4(1,0,0,0), new Vec4(1,0,0,0)];
}
Phy4d.Tiger.prototype.clone = function(){
	return new Phy4d.Tiger(this.o, this.R, this.R1, this.R2, this.r);
}
Phy4d.Tiger.prototype.getPosition = function(){
	return this.o;
}
Phy4d.Tiger.prototype.getRotation = function(){
	return this.r;
}
Phy4d.Tiger.prototype.generateGeom = function(data){
	var m = Mesh4.tiger(this.R,this.R1,this.R2,data.u||8,data.v||16,data.w||16);
	return new Geom4(m,this.getPosition(),this.getRotation(),data.color);
}
Phy4d.Tiger.prototype.getAABB = function(){
	if(!this.R12)this.R12 = Math.sqrt(this.R1*this.R1+this.R2*this.R2);
	var R = this.R12+this.R;
	var RRRR = new Vec4(R,R,R,R);
	return new Phy4d.AABB(this.o.sub(RRRR,false),this.o.add(RRRR,false));
}
Phy4d.Convex = function(mesh4,o,r){//from mesh4 convex hull
	this.o = o || new Vec4();
	this.r = r || [new Vec4(1,0,0,0), new Vec4(1,0,0,0)];
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
	}
}
Phy4d.Convex.prototype.clone = function(){
	return new Phy4d.Convex(this.mesh, this.o, this.r);
}
Phy4d.Convex.prototype.getPosition = function(){
	return this.o;
}
Phy4d.Convex.prototype.getRotation = function(){
	return this.r;
}
Phy4d.Convex.prototype.generateGeom = function(data){
	var m = this.mesh;
	return new Geom4(m,this.getPosition(),this.getRotation(),data.color);
}
Phy4d.Convex.prototype.getAABB = function(){
	var m = this.r[0].toMatL().mul(this.r[1].toMatR());
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
	return new Phy4d.AABB(this.o.add(new Vec4(xmin,ymin,zmin,tmin),false),this.o.add(new Vec4(xmax,ymax,zmax,tmax),false),this);
}
//bug: Union inertie!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//add todo: AABB
Phy4d.Union = function(Objs,o,r){
	this.o = o || new Vec4();
	this.r = r || [new Vec4(1,0,0,0), new Vec4(1,0,0,0)];
	this.objs = Objs;
}
Phy4d.Union.prototype.clone = function(){
	return new Phy4d.Union(this.objs,this.o,this.r);
}
Phy4d.Union.prototype.getPosition = function(){
	return this.o;
}
Phy4d.Union.prototype.getRotation = function(){
	return this.r;
}
Phy4d.Union.prototype.toWorld = function(obj){//convert sub obj to world coordinate
	var o = obj.clone();
	if(o.o){
		o.o = this.r[0].mul(o.o,false).mul(this.r[1]).add(this.o,false);//注意引用的原对象，必须new
	}
	if(o.r){
		o.r = [this.r[0].mul(o.r[0],false), o.r[1].mul(this.r[1],false)];
	}
	return new Phy4d.Obj(o,this.Obj);
}
Phy4d.Union.prototype.generateGeom = function(data){
	//todo
	return 0;
}
//Obj4
Phy4d.Obj = function(phyGeom,mass){
	this.phyGeom = phyGeom;
	this.phyGeom.Obj = this;
	this.setDefault();
	this.setMass(mass);
}
Phy4d.Obj.prototype.setDefault = function(){
	this.invMass = 0;
	//linaire:
	this.v = new Vec4();
	this.a = new Vec4();
	//angulaire:
	this.w = new Bivec();
	this.b = new Bivec();
	//todo: friction
	this.restitution = 0.7;
	this.friction = 0.1;
}
Phy4d.Obj.prototype.getPosition = function(){
	return this.phyGeom.getPosition();
}
Phy4d.Obj.prototype.getRotation = function(){
	return this.phyGeom.getRotation();
}
Phy4d.Obj.prototype.generateGeom = function(data){
	var g = this.phyGeom.generateGeom(data);
	if(data.flow) g.flow = data.flow;
	if(data.glow) g.glow = data.glow;
	return g;
}
Phy4d.Obj.prototype.getlinearVelocity = function(worldP){
	var localP = worldP.sub(this.getPosition(),false);
	return this.w.dual(false).cross(localP).sub().add(this.v);
}
Phy4d.Obj.prototype.setMass = function(mass){
	if(mass === 0)mass = Infinity;
	if(mass.length && this.phyGeom.constructor == Phy4d.Union){
		
		var Is = [];
		for(var o in this.phyGeom.objs){
			var O = {mass:mass[o], phyGeom:this.phyGeom.objs[o]};
			Is.push(Phy4d.Obj.prototype.getInertie.call(O));
		}
		this.inertie = Is.reduce((a,b)=>a.add(b));
		mass = mass.reduce((a,b)=>a+b);
	}
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
	while(typeof obj1.mass=="object"){
		obj1 = obj1.mass;
	}
	while(typeof obj2.mass=="object"){
		obj2 = obj2.mass;
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
		var deltaV4 = this.n.mul(deltaVelocity,false).add(this.n.mul(this.Vsep,false).sub(this.Vrel));
		var totalInvMass = obj1.invMass + obj2.invMass;
		if(totalInvMass>0){
			var relContactP1 = this.p.sub(this.obj1.getPosition(),false);
			var relContactP2 = this.p.sub(this.obj2.getPosition(),false);
			//relContactP2.z = 0;
			//relContactP2.t = 0;
			var angularComponent_x = new Vec4();
			var angularComponent_y = new Vec4();
			var angularComponent_z = new Vec4();
			var angularComponent_t = new Vec4();
			
			//var angularComponent = new Vec4();
			var r1 = obj1.getRotation();
			var r2 = obj2.getRotation();
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
				obj1.w.add(
					W1_x.mul(impulse.x).add(W1_y.mul(impulse.y)).add(W1_z.mul(impulse.z)).add(W1_t.mul(impulse.t))
				);
			}
			if(r2 && obj2.invMass){
				obj2.w.sub(
					W2_x.mul(impulse.x).add(W2_y.mul(impulse.y)).add(W2_z.mul(impulse.z)).add(W2_t.mul(impulse.t))
				);
			}
		}
	}
	if(this.d > 0){//solve penetration (separate 2 objs)
		var totalInvMass = obj1.invMass + obj2.invMass;
		if(totalInvMass>0){
			var dPerIMass = this.n.mul(this.d/totalInvMass,false);
			var p1 = obj1.getPosition();
			var p2 = obj2.getPosition();
			if(p1) p1.sub(dPerIMass.mul(obj1.invMass,false));
			if(p2) p2.add(dPerIMass.mul(obj2.invMass));
		}
	}
}
Phy4d.prototype._detectCollisionBroadPhase = function(obj1,obj2){
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
			var c = this._detectCollision(obj1.phyGeom.toWorld(o),obj2);
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
			var c = this._detectCollision(obj2.phyGeom.toWorld(o),obj1);
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
				var c = this._detectCollision(obj1.phyGeom.toWorld(o1),obj2.phyGeom.toWorld(o2));
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
Phy4d.prototype.next = function (){
	this.clearState();
	
	//force accumulator:
	
	for(var f of this.force){
		if(f.enable) f._apply();
	}
	
	var dt2 = this.dt*this.dt/2;
	for(var obj of this.obj){
		//linaire:
		obj.v.add(obj.a.mul(this.dt,false));
		var p = obj.getPosition();
		if(p) p.add(obj.v.mul(this.dt,false).add(obj.a.mul(dt2,false)));
		//angulaire:
		var r = obj.getRotation();
		obj.w.add(obj.b.mul(this.dt,false));
		if(r){
			var dr = obj.w.mul(this.dt,false).add(obj.b.mul(dt2,false));
			dr = dr.expQ();
			r[0].set(dr[0].mul(r[0],false).norm());
			r[1].set(r[1].mul(dr[1]).norm());
		}
		obj.changed = true;
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
		coList[0]._solve();//solve the most serious collision.
		coList = this._detectCollisionsAndConstrains();
	}
	
	
	
}

Phy4d.prototype.detectCollision_Plane_Glome = function(planeO, glomeO){
	var plane = planeO.phyGeom;
	var glome = glomeO.phyGeom;
	var d = glome.R - (glome.o.dot(plane.n) - plane.t);
	if(d<0) return 0;
	return new Phy4d.Collision(this,planeO, glomeO, plane.n, d, glome.o.sub(plane.n.mul(d/2 + glome.R,false),false));
}
Phy4d.prototype.detectCollision_Glome_Glome = function(g1O, g2O){
	var g1 = g1O.phyGeom;
	var g2 = g2O.phyGeom;
	var R = g1.R + g2.R;
	var O1O2 = g2.o.sub(g1.o,false);
	var lO1O2 = O1O2.len(false);
	var d = R*R - lO1O2;
	if(d<0) return 0;
	lO1O2 = Math.sqrt(lO1O2);
	d = g1.R + g2.R - lO1O2;
	return new Phy4d.Collision(this,g1O, g2O, O1O2.div(lO1O2), d, g1.o.add(O1O2.mul(d/2 + g1.R,false),false));
}
Phy4d.prototype.detectCollision_Plane_Convex = function(planeO, convexO){
	var plane = planeO.phyGeom;
	var convex = convexO.phyGeom;
	var list = [];
	var offset = convex.o.dot(plane.n);
	//n'(Rv + o) - t
	//(R'n)'v + n'o - t
	var n = convex.r[0].conj(false).mul(plane.n).mul(convex.r[1].conj(false));
	for(var v of convex.mesh.V){
		var d = -(v.dot(n) + offset - plane.t);
		if(d<0) continue;
		list.push(new Phy4d.Collision(this,planeO, convexO, plane.n, d, 
			convex.r[0].mul(v,false).mul(convex.r[1]).add(convex.o).sub(plane.n.mul(d/2,false),false)));
	}
	if(list.length) return list;
}
Phy4d.prototype.detectCollision_Glome_Convex = function(glomeO, convexO){
	var glome = glomeO.phyGeom;
	var convex = convexO.phyGeom;
	var list = [];
	//convert glome.o into convex's local coordinate to reduce sre
	var gOlocal = convex.r[0].conj(false).mul(glome.o.sub(convex.o,false)).mul(convex.r[1].conj(false));
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
		var n = convex.r[0].mul(OV,false).mul(convex.r[1]).norm();
		list.push(new Phy4d.Collision(this,glomeO, convexO, n, d, 
			glome.o.add(n.mul(glome.R-d/2,false),false)));
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
		var n = convex.r[0].mul(N,false).mul(convex.r[1]).norm();
		edgeContact = new Phy4d.Collision(this,glomeO, convexO, n, d, 
		glome.o.add(n.mul(glome.R-d/2,false),false));
		//minD = d;
		list.push(edgeContact);
			
	}
	if(list.length==1){
		return list[0];
	}
	for(var f of convex.mesh.F){
		var e1 = convex.mesh.E[f[0]];
		var e2 = convex.mesh.E[f[1]];
		
		var A = convex.mesh.V[e1[0]];
		var B = convex.mesh.V[e1[1]];
		var C = (e2[0] != e1[0] && e2[0] != e1[1])?convex.mesh.V[e2[0]]:convex.mesh.V[e2[1]];
		
		var AB = B.sub(A,false);
		var AC = C.sub(A,false);
		
		var AB_AC = AB.cross(AC).norm();
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
		n = convex.r[0].mul(n,false).mul(convex.r[1]).norm();
		list.push(new Phy4d.Collision(this,glomeO, convexO, n, d, 
			glome.o.add(n.mul(glome.R-d/2,false),false))
		);
	}
	if(list.length==1){
		return list[0];
	}
	var N = cellContacted.info.normal;
	var n = convex.r[0].mul(N,false).mul(convex.r[1]).norm().sub();
	var Prel = N.mul(cellD/2 - glome.R,false);
	var P = Prel.add(gOlocal,false);
	for(var c of convex.mesh.C){
		var d = - (P.dot(c.info.normal) - c.info.t);
		if(d < 0) return 0;
	}
	return new Phy4d.Collision(this,glomeO, convexO, n, cellD, glome.o.add(n.mul(-cellD/2 + glome.R,false),false));
	
}
Phy4d.prototype.detectCollision_Convex_Convex = function(c1O, c2O){
	//return 0;
	var c1 = c1O.phyGeom;
	var c2 = c2O.phyGeom;
	var list = [];
	var wO1O2 = c2.o.sub(c1.o,false);
	//o1->o2 o2 in o1's coordinate
	var O1O2 = c1.r[0].conj(false).mul(wO1O2,false).mul(c1.r[1].conj(false));
	//o2->o1  o1 in o2's coordinate
	var O2O1 = c2.r[0].conj(false).mul(wO1O2,false).mul(c2.r[1].conj(false)).sub();
	//convert c1.v into c2's local coordinate to reduce sre
	var c2V1 = [];
	var c2v1L = c2.r[0].conj(false).mul(c1.r[0]);
	var c2v1R = c1.r[1].mul(c2.r[1].conj(false),false);
	
	//c2'(c1(v1)c1+o1-o2)c2' = Lv1R + O2O1
	
	for(var v1 of c1.mesh.V){
		c2V1.push(c2v1L.mul(v1,false).mul(c2v1R).add(O2O1));
	}
	//convert c2.v into c1's local coordinate to reduce sre
	var c1V2 = [];
	var c1v2L = c1.r[0].conj(false).mul(c2.r[0]);
	var c1v2R = c2.r[1].mul(c1.r[1].conj(false),false);
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
				var n = c1.r[0].mul(minCell1.info.normal,false).mul(c1.r[1]).norm().sub();
				var worldv2 = c2.r[0].mul(c2.mesh.V[v2],false).mul(c2.r[1]).add(c2.o);
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
				var n = c2.r[0].mul(minCell2.info.normal,false).mul(c2.r[1]).norm().sub();
				var worldv1 = c1.r[0].mul(c1.mesh.V[v1],false).mul(c1.r[1]).add(c1.o);
				list.push(
					new Phy4d.Collision(this,c1O, c2O, n, d, worldv1.sub(n.mul(d/2,false),false))
				);
			}
		}
	}
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
			var e1 = c2.mesh.E[c2f[0]];
			var e2 = c2.mesh.E[c2f[1]];
			
			var A = c2.mesh.V[e1[0]];
			var B = c2.mesh.V[e1[1]];
			var C = (e2[0] != e1[0] && e2[0] != e1[1])?c2.mesh.V[e2[0]]:c2.mesh.V[e2[1]];
							
			var AB = B.sub(A,false);
			var AC = C.sub(A,false);
			var ABAC = AB.cross(AC);
			for(var ee of c1.mesh.E){
				var P1 = c2V1[ee[0]];
				var P2 = c2V1[ee[1]];
				var P1P2 = P2.sub(P1,false);
				var n = P1P2.cross(ABAC,false).norm();
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
					n = c2.r[0].mul(n,false).mul(c2.r[1]);
					faceContacted = new Phy4d.Collision(this,c1O, c2O, n, d, c2.r[0].mul(P,false).mul(c2.r[1]).add(c2.o),false);
					
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
	var R1 = st.R1;
	var R2 = st.R2;
	//plane: x.n-t==0
	//coordinate of st: (rx+o).n-t==0   =>  x.(r'n) + o.n - t == 0
	var offset = st.o.dot(plane.n);
	var n = st.r[0].conj(false).mul(plane.n).mul(st.r[1].conj(false));
	var Rc = new Vec4(n.x,0,0,n.t);
	var lenRc = Rc.len();
	if(lenRc < 0.0001){
		if(offset-plane.t<R1){
			var d = R1 - offset + plane.t;
			return [
				new Phy4d.Collision(
					this, planeO, stO, plane.n, d, 
					st.r[0].mul(new Vec4(R2,0,0,0),false).mul(st.r[1]).add(st.o).sub(plane.n.mul(R1-d/2,false),false)
				),
				new Phy4d.Collision(
					this, planeO, stO, plane.n, d, 
					st.r[0].mul(new Vec4(-R2,0,0,0),false).mul(st.r[1]).add(st.o).sub(plane.n.mul(R1-d/2,false),false)
				),
				new Phy4d.Collision(
					this, planeO, stO, plane.n, d, 
					st.r[0].mul(new Vec4(0,0,-R2,0),false).mul(st.r[1]).add(st.o).sub(plane.n.mul(R1-d/2,false),false)
				),
				new Phy4d.Collision(
					this, planeO, stO, plane.n, d, 
					st.r[0].mul(new Vec4(0,0,R2,0),false).mul(st.r[1]).add(st.o).sub(plane.n.mul(R1-d/2,false),false)
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
	return new Phy4d.Collision(this,planeO, stO, plane.n, d, st.r[0].mul(minN,false).mul(st.r[1]).add(st.o).add(plane.n.mul(d/2,false),false));
}
Phy4d.prototype.detectCollision_Plane_Torisphere = function(planeO, tsO){
	var plane = planeO.phyGeom;
	var ts = tsO.phyGeom;
	var R1 = ts.R1;
	var R2 = ts.R2;
	//plane: x.n-t==0
	//coordinate of ts: (rx+o).n-t==0   =>  x.(r'n) + o.n - t == 0
	var offset = ts.o.dot(plane.n);
	var n = ts.r[0].conj(false).mul(plane.n).mul(ts.r[1].conj(false));
	var Rc = new Vec4(n.x,n.y,n.z,0);
	var lenRc = Rc.len();
	if(lenRc < 0.0001){
		if(offset-plane.t<R1){
			var d = R1 - offset + plane.t;
			return [
				new Phy4d.Collision(
					this, planeO, tsO, plane.n, d, 
					ts.r[0].mul(new Vec4(R2,0,0,0),false).mul(ts.r[1]).add(ts.o).sub(plane.n.mul(R1-d/2,false),false)
				),
				new Phy4d.Collision(
					this, planeO, tsO, plane.n, d, 
					ts.r[0].mul(new Vec4(-R2,0,0,0),false).mul(ts.r[1]).add(ts.o).sub(plane.n.mul(R1-d/2,false),false)
				),
				new Phy4d.Collision(
					this, planeO, tsO, plane.n, d, 
					ts.r[0].mul(new Vec4(0,0,-R2,0),false).mul(ts.r[1]).add(ts.o).sub(plane.n.mul(R1-d/2,false),false)
				),
				new Phy4d.Collision(
					this, planeO, tsO, plane.n, d, 
					ts.r[0].mul(new Vec4(0,0,R2,0),false).mul(ts.r[1]).add(ts.o).sub(plane.n.mul(R1-d/2,false),false)
				),
				new Phy4d.Collision(
					this, planeO, tsO, plane.n, d, 
					ts.r[0].mul(new Vec4(0,-R2,0,0),false).mul(ts.r[1]).add(ts.o).sub(plane.n.mul(R1-d/2,false),false)
				),
				new Phy4d.Collision(
					this, planeO, tsO, plane.n, d, 
					ts.r[0].mul(new Vec4(0,R2,0,0),false).mul(ts.r[1]).add(ts.o).sub(plane.n.mul(R1-d/2,false),false)
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
	
	return new Phy4d.Collision(this,planeO, tsO, plane.n, d, ts.r[0].mul(minN,false).mul(ts.r[1]).add(ts.o).add(plane.n.mul(d/2,false),false));
}
Phy4d.prototype.detectCollision_Plane_Tiger = function(planeO, tigerO){
	var plane = planeO.phyGeom;
	var tiger = tigerO.phyGeom;
	var R1 = tiger.R1;
	var R2 = tiger.R2;
	var R = tiger.R;
	//plane: x.n-t==0
	//coordinate of tiger: (rx+o).n-t==0   =>  x.(r'n) + o.n - t == 0
	var offset = tiger.o.dot(plane.n);
	var n = tiger.r[0].conj(false).mul(plane.n).mul(tiger.r[1].conj(false));
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
	
	return new Phy4d.Collision(this,planeO, tigerO, plane.n, d, tiger.r[0].mul(minN,false).mul(tiger.r[1]).add(tiger.o).add(plane.n.mul(d/2,false),false));
}
Phy4d.prototype.detectCollision_Glome_Spheritorus = function(glomeO, stO){
	var glome = glomeO.phyGeom;
	var st = stO.phyGeom;
	var R1 = st.R1;
	var R2 = st.R2;
	//convert glome.o to st's coordinate
	var gOlocal = st.r[0].conj(false).mul(glome.o.sub(st.o,false)).mul(st.r[1].conj(false));
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
	n = st.r[0].mul(n,false).mul(st.r[1]).norm();
	return new Phy4d.Collision(this,glomeO, stO, n, d, glome.o.add(n.mul(-d/2 + glome.R,false),false));
}
Phy4d.prototype.detectCollision_Glome_Torisphere = function(glomeO, tsO){
	var glome = glomeO.phyGeom;
	var ts = tsO.phyGeom;
	var R1 = ts.R1;
	var R2 = ts.R2;
	//convert glome.o to ts's coordinate
	var gOlocal = ts.r[0].conj(false).mul(glome.o.sub(ts.o,false)).mul(ts.r[1].conj(false));
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
	n = ts.r[0].mul(n,false).mul(ts.r[1]).norm();
	return new Phy4d.Collision(this,glomeO, tsO, n, d, glome.o.add(n.mul(-d/2 + glome.R,false),false));
}
Phy4d.prototype.detectCollision_Glome_Tiger = function(glomeO, tigerO){
	var glome = glomeO.phyGeom;
	var tiger = tigerO.phyGeom;
	var R = tiger.R;
	var R1 = tiger.R1;
	var R2 = tiger.R2;
	//convert glome.o to tiger's coordinate
	var gOlocal = tiger.r[0].conj(false).mul(glome.o.sub(tiger.o,false)).mul(tiger.r[1].conj(false));
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
	n = tiger.r[0].mul(n,false).mul(tiger.r[1]).norm();
	return new Phy4d.Collision(this,glomeO, tigerO, n, d, glome.o.add(n.mul(-d/2 + glome.R,false),false));
}
Phy4d.prototype.detectCollision_Spheritorus_Spheritorus = function(stO1, stO2){
	var st1 = stO1.phyGeom;
	var st2 = stO2.phyGeom;
	var list = [];
	var s = Math.random()*Math.PI*2, t = Math.random()*Math.PI*2;
	//convert st1 to st2's coordinate
	var O1local = st2.r[0].conj(false).mul(st1.o.sub(st2.o,false)).mul(st2.r[1].conj(false));
	var convertL2 = st2.r[0].conj(false).mul(st1.r[0]);
	var convertR2 = st1.r[1].mul(st2.r[1].conj(false),false);
	//convert st2 to st1's coordinate
	var O2local = st1.r[0].conj(false).mul(st2.o.sub(st1.o,false)).mul(st1.r[1].conj(false));
	var convertL1 = st1.r[0].conj(false).mul(st2.r[0]);
	var convertR1 = st2.r[1].mul(st1.r[1].conj(false),false);
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
	var lenN = n.len();
	var d = st2.R1 + st1.R1 - lenN;
	if(d<0) return 0;
	n.div(lenN);
	n = coord.r[0].mul(n,false).mul(coord.r[1]);
	return (new Phy4d.Collision(this, coord==st2?stO1:stO2, coord==st1?stO1:stO2, n, d, coord.r[0].mul(Rc,false).mul(coord.r[1]).add(coord.o).sub(n.mul(coord.R1-d/2,false),false)));
}
Phy4d.prototype.detectCollision_Spheritorus_Torisphere = function(stO, tsO){
	var st = stO.phyGeom;
	var ts = tsO.phyGeom;
	var list = [];
	var R11 = st.R1;
	var R12 = st.R2;
	var R21 = ts.R1;
	var R22 = ts.R2;
	//convert stO to tsO's coordinate
	var O1local = ts.r[0].conj(false).mul(st.o.sub(ts.o,false)).mul(ts.r[1].conj(false));
	var convertL = ts.r[0].conj(false).mul(st.r[0]);
	var convertR = st.r[1].mul(ts.r[1].conj(false),false);
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
			n = ts.r[0].mul(n,false).mul(ts.r[1]);
			list.push(new Phy4d.Collision(this, stO, tsO, n, d+0.002, ts.r[0].mul(Oc,false).mul(ts.r[1]).add(ts.o).sub(n.mul(R21-d/2,false),false)));
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
			n = ts.r[0].mul(n,false).mul(ts.r[1]);
			list.push(new Phy4d.Collision(this, stO, tsO, n, d+0.002, ts.r[0].mul(Oc,false).mul(ts.r[1]).add(ts.o).sub(n.mul(R21-d/2,false),false)));
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
	var list = [];
	var R11 = st.R1;
	var R12 = st.R2;
	var R1 = tiger.R1;
	var R2 = tiger.R2;
	var R = tiger.R;
	//convert stO to tsO's coordinate
	var O1local = tiger.r[0].conj(false).mul(st.o.sub(tiger.o,false)).mul(tiger.r[1].conj(false));
	var convertL = tiger.r[0].conj(false).mul(st.r[0]);
	var convertR = st.r[1].mul(tiger.r[1].conj(false),false);
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
			n = tiger.r[0].mul(n,false).mul(tiger.r[1]);
			list.push(new Phy4d.Collision(this, stO, tigerO, n, d+0.002, tiger.r[0].mul(Rc,false).mul(tiger.r[1]).add(tiger.o).sub(n.mul(R-d/2,false),false)));
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
			n = tiger.r[0].mul(n,false).mul(tiger.r[1]);
			list.push(new Phy4d.Collision(this, stO, tigerO, n, d+0.002, tiger.r[0].mul(Rc,false).mul(tiger.r[1]).add(tiger.o).sub(n.mul(R-d/2,false),false)));
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
	var list = [];
	var s = Math.random()*Math.PI*2, t = Math.random()*Math.PI*2;
	//convert ts to ti's coordinate
	var O1local = ti.r[0].conj(false).mul(ts.o.sub(ti.o,false)).mul(ti.r[1].conj(false));
	var convertL2 = ti.r[0].conj(false).mul(ts.r[0]);
	var convertR2 = ts.r[1].mul(ti.r[1].conj(false),false);
	//convert ti to ts's coordinate
	var O2local = ts.r[0].conj(false).mul(ti.o.sub(ts.o,false)).mul(ts.r[1].conj(false));
	var convertL1 = ts.r[0].conj(false).mul(ti.r[0]);
	var convertR1 = ti.r[1].mul(ts.r[1].conj(false),false);
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
	var lenN = n.len();
	var d = ti.R + ts.R1 - lenN;
	if(d<0) return 0;
	n.div(lenN);
	n = coord.r[0].mul(n,false).mul(coord.r[1]);
	return (new Phy4d.Collision(this, coord==ti?tsO:tigerO, coord==ts?tsO:tigerO, n, d+0.01, coord.r[0].mul(Rc,false).mul(coord.r[1]).add(coord.o).sub(n.mul((coord.R||coord.R1)-d/2,false),false)));
}
Phy4d.prototype.detectCollision_Tiger_Tiger = function(t1O, t2O){
	var t1 = t1O.phyGeom;
	var t2 = t2O.phyGeom;
	var list = [];
	var s = Math.random()*Math.PI*2, t = Math.random()*Math.PI*2;
	//convert t1 to t2's coordinate
	var O1local = t2.r[0].conj(false).mul(t1.o.sub(t2.o,false)).mul(t2.r[1].conj(false));
	var convertL2 = t2.r[0].conj(false).mul(t1.r[0]);
	var convertR2 = t1.r[1].mul(t2.r[1].conj(false),false);
	//convert t2 to t1's coordinate
	var O2local = t1.r[0].conj(false).mul(t2.o.sub(t1.o,false)).mul(t1.r[1].conj(false));
	var convertL1 = t1.r[0].conj(false).mul(t2.r[0]);
	var convertR1 = t2.r[1].mul(t1.r[1].conj(false),false);
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
	var lenN = n.len();
	var d = t2.R + t1.R - lenN;
	if(d<0) return 0;
	n.div(lenN);
	n = coord.r[0].mul(n,false).mul(coord.r[1]);
	return (new Phy4d.Collision(this, coord==t2?t1O:t2O, coord==t1?t1O:t2O, n, d+0.01, coord.r[0].mul(Rc,false).mul(coord.r[1]).add(coord.o).sub(n.mul(coord.R-d/2,false),false)));
}

Phy4d.prototype.detectCollision_Torisphere_Torisphere = function(t1O, t2O){
	var t1 = t1O.phyGeom;
	var t2 = t2O.phyGeom;
	var list = [];
	var s = Math.random()*Math.PI*2, t = Math.random()*Math.PI*2;
	//convert t1 to t2's coordinate
	var O1local = t2.r[0].conj(false).mul(t1.o.sub(t2.o,false)).mul(t2.r[1].conj(false));
	var convertL2 = t2.r[0].conj(false).mul(t1.r[0]);
	var convertR2 = t1.r[1].mul(t2.r[1].conj(false),false);
	//convert t2 to t1's coordinate
	var O2local = t1.r[0].conj(false).mul(t2.o.sub(t1.o,false)).mul(t1.r[1].conj(false));
	var convertL1 = t1.r[0].conj(false).mul(t2.r[0]);
	var convertR1 = t2.r[1].mul(t1.r[1].conj(false),false);
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
	var lenN = n.len();
	var d = t2.R1 + t1.R1 - lenN;
	if(d<0) return 0;
	n.div(lenN);
	n = coord.r[0].mul(n,false).mul(coord.r[1]);
	return (new Phy4d.Collision(this, coord==t2?t1O:t2O, coord==t1?t1O:t2O, n, d, coord.r[0].mul(Rc,false).mul(coord.r[1]).add(coord.o).sub(n.mul(coord.R1-d/2,false),false)));
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
			var relContactP1 = this.worldP1.sub(this.obj1.getPosition(),false);
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
			var relContactP2 = this.worldP2.sub(this.obj2.getPosition(),false);
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
		var dPerIMass = this.n.mul(this.d*0.3/totalInvMass,false);
		var p1 = obj1&&obj1.getPosition();
		var p2 = obj2&&obj2.getPosition();
		if(p1) p1.sub(dPerIMass.mul(obj1.invMass,false));
		if(p2) p2.add(dPerIMass.mul(obj2.invMass));
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
	var torque = this.torque;
	var MW;
	if(this.coordObj){
		var r = this.coordObj.getRotation();
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
		obj1.b.add(obj1.inertie.invMul(torque1));
	}
	if(obj2){
		obj2.a.sub(F.mul(obj2.invMass,false));
		var torque2 = F.cross(worldP2.sub(p2,false));
		
		obj2.b.sub(obj2.inertie.invMul(torque2));
	}
}
