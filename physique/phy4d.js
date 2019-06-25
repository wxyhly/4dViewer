//4d physical engine
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
Phy4d.Union = function(Objs,o,r){
	this.o = o || new Vec4();
	this.r = r || [new Vec4(1,0,0,0), new Vec4(1,0,0,0)];
	this.objs = Objs;
	this.objsInWorld = [];
	for(var O of this.objs){
		this.objsInWorld.push(this.toWorld(O));
	}
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
		o.o = o.o.add(this.o,false);//注意引用的原对象，必须new
	}
	//if(o)
}

//Obj4
Phy4d.Obj = function(phyGeom,mass){
	this.phyGeom = phyGeom;
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
Phy4d.Obj.prototype.getlinearVelocity = function(worldP){
	var localP = worldP.sub(this.getPosition(),false);
	return this.w.dual(false).cross(localP).sub().add(this.v);
}
Phy4d.Obj.prototype.setMass = function(mass){
	this.mass = mass;
	this.invMass = 1/mass;
	if(this.invMass>0) this.getInertie();
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
	}else{
		return 0;
	}
	this.inertie = new MatBivec(I);
	//this.invInertie = Phy4d.LUDecomp(I);
}

Phy4d.Collision = function(engine,obj1,obj2,n,d,p){
	//obj1,obj2,Vseparation,depth,normal(from 1 to 2),point
	this.engine = engine;
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
Phy4d.prototype._detectCollision = function(obj1,obj2){
	var t1 = obj1.phyGeom.constructor;
	var t2 = obj2.phyGeom.constructor;
	
	//Union: iteratively solve
	
	if(t1 == Phy4d.Union && t2 == !Phy4d.Union){
		var list = [];
		for(var o of t1.obj){
			list.push(this._detectCollision(t1.toWorld(o),t2));
		}
		if (list.length) return list;
	}
	if(t2 == Phy4d.Union && t1 == !Phy4d.Union){
		var list = [];
		for(var o of t2.obj){
			list.push(this._detectCollision(t2.toWorld(o),t1));
		}
		if (list.length) return list;
	}
	if(t1 == Phy4d.Union && t2 == Phy4d.Union){
		var list = [];
		for(var o1 of t1.obj){
			for(var o2 of t2.obj){
				list.push(this._detectCollision(t1.toWorld(o1),t2.toWorld(o2)));
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
	
}
Phy4d.prototype._detectCollisionsAndConstrains = function(){
	var list = [];
	//todo: octTree
	for(var i = 0; i < this.obj.length; i++){
		var obj1 = this.obj[i];
		for(var j = 0; j < this.obj.length; j++){
			if(i >= j) continue;
			var obj2 = this.obj[j];
			var totalInvMass = obj1.invMass + obj2.invMass;
			if(!totalInvMass)continue;
			var c = this._detectCollision(obj1,obj2);
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
			r[0] = dr[0].mul(r[0],false).norm();
			r[1] = r[1].mul(dr[1]).norm();
		}
		
	}
	
	//solve collisions and constrains:
	
	var coList = this._detectCollisionsAndConstrains();
	for(var i = 0; i < this.iterations && coList.length; i++){
		coList.sort(function(a,b){
			return b.d - a.d;
		});
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
	if(Math.abs(g1.o.x-g2.o.x)>R || Math.abs(g1.o.y-g2.o.y)>R ||Math.abs(g1.o.z-g2.o.z)>R ||Math.abs(g1.o.t-g2.o.t)>R) return 0;
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
	return 0;
	var c1 = c1O.phyGeom;
	var c2 = c2O.phyGeom;
	var list = [];
	//c1.V vs c2.C: convert c1.v into c2's local coordinate to reduce sre
	var c2V1 = [];//后面还要用c1.V在c2下的坐标，所以先存起
	for(var v1 of c1.mesh.V){
		var worldv1 = c1.r[0].mul(v1,false).mul(c1.r[1]).add(c1.o);
		var c2v1 = c2.r[0].conj(false).mul(worldv1.sub(c2.o,false),false).mul(c2.r[1].conj(false));
		c2V1.push(c2v1);
		
		var faceContacted = null;
		var minD = Infinity;
		for(var c2c of c2.mesh.C){
			var d = -(c2v1.dot(c2c.info.normal) - c2c.info.t);
			if(d < 0) {
				faceContacted = null;
				break;
			}
			if(d < minD){
				minD = d;
				faceContacted = c2c;
			}
		}
		if(faceContacted){//找到了与给定顶点相交距离深度最浅的面，结束！
			var n = c2.r[0].mul(faceContacted.info.normal,false).mul(c2.r[1]).norm().sub();
			list.push(
				new Phy4d.Collision(this,c1O, c2O, n, minD, worldv1.sub(n.mul(d/2,false),false))
			);
		}
	}
	//c2.V vs c1.C: convert c1.v into c2's local coordinate to reduce sre
	var c1V2 = [];//后面还要用，所以先存起
	for(var v2 of c2.mesh.V){
		var worldv2 = c2.r[0].mul(v2,false).mul(c2.r[1]).add(c2.o);
		var c1v2 = c1.r[0].conj(false).mul(worldv2.sub(c1.o,false),false).mul(c1.r[1].conj(false));
		c1V2.push(c1v2);
		var faceContacted = null;
		var minD = Infinity;
		for(var c1c of c1.mesh.C){
			var d = -(c1v2.dot(c1c.info.normal) - c1c.info.t);
			if(d < 0) {
				faceContacted = null;
				break;
			}
			if(d < minD){
				minD = d;
				faceContacted = c1c;
			}
		}
		if(faceContacted){
			var n = c1.r[0].mul(faceContacted.info.normal,false).mul(c1.r[1]).norm().sub();
			list.push(
				new Phy4d.Collision(this,c2O, c1O, n, minD, worldv2.sub(n.mul(d/2,false),false))
			);
		}
	}
	//c1.E vs c2.F: convert c1.e into c2's local coordinate to reduce sre
	for(var ee of c1.mesh.E){
		var P1 = c2V1[ee[0]];
		var P2 = c2V1[ee[1]];
		var P1P2 = P2.sub(P1,false);
		var minD = Infinity;
		var faceContacted = null;
		//c1.E: P1P2,  c2.F: ABC, projection on c1: Q1, projection on c2: Q2
		//todo: c1.E与c2.F在c2坐标系下做AABB
		for(var c2f of c2.mesh.F){
			var e1 = c2.mesh.E[c2f[0]];
			var e2 = c2.mesh.E[c2f[1]];
			
			var A = c2.mesh.V[e1[0]];
			var B = c2.mesh.V[e1[1]];
			var C = (e2[0] != e1[0] && e2[0] != e1[1])?c2.mesh.V[e2[0]]:c2.mesh.V[e2[1]];
			
			var P1A = A.sub(P1,false);
			var AB = B.sub(A,false);
			var AC = C.sub(A,false);
			
			//Q1Q2 = P1A + u AB + v AC - s P1P2;
			//P1P2.(P1A + u AB + v AC - s P1P2)==0
			//AB  .(P1A + u AB + v AC - s P1P2)==0
			//AC  .(P1A + u AB + v AC - s P1P2)==0
			
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
			var isClip = true;
			var minDepth = Infinity;
			//看交点陷入2没有
			for(var cell of c2.mesh.C){
				var depth = - (Q1.dot(cell.info.normal) - cell.info.t);
				if(depth < 0) {
					isClip = false;
					break;
				}
				minDepth = Math.min(minDepth,depth);
			}
			if(!isClip) continue;
			
			//看F上投影点是否在F中：
			var N = AB.cross(AC).dual();
			isClip = true;
			for(var ef of c2f){
				var eA = c2.mesh.V[c2.mesh.E[ef][0]];
				var eB = c2.mesh.V[c2.mesh.E[ef][1]];
				var eAB = eB.sub(eA,false);
				var eN = eAB.cross(N);
				var eOA = eA.sub(c2f.center,false);
				if(eN.dot(eOA)<0){
					eN.sub();
				}
				var et = eA.dot(eN);
				var depth = - (Q2.dot(eN) - et);
				if(depth < 0) {
					isClip = false;
					break;
				}
			}
			if(!isClip) continue;
			
			var Q1Q2 = Q1.sub(Q2,false);
			var AA = Q1Q2.dot(AB);
			var BB = Q1Q2.dot(AC);
			var CC = Q1Q2.dot(P1P2);
			var d = Q1Q2.len();
			if(d>minDepth*5) continue;
			if(d < minD){
				var P = Q1.add(Q2,false).div(2);
				var n = c2.r[0].mul(Q1Q2.div(d),false).mul(c2.r[1]);
				minD = d;
				faceContacted = new Phy4d.Collision(this,c2O, c1O, n, d, c2.r[0].mul(P,false).mul(c2.r[1]).add(c2.o),false);
				
			}
			continue;
		}
		if(faceContacted) list.push(faceContacted);
	}
	
	
	//c2.E vs c1.F: convert c2.e into c1's local coordinate to reduce sre
	for(var ee of c2.mesh.E){
		var P1 = c1V2[ee[0]];
		var P2 = c1V2[ee[1]];
		var P1P2 = P2.sub(P1,false);
		var minD = Infinity;
		var faceContacted = null;
		//c2.E: P1P2,  c1.F: ABC, projection on c2: Q1, projection on c1: Q2
		for(var c1f of c1.mesh.F){
			var e1 = c1.mesh.E[c1f[0]];
			var e2 = c1.mesh.E[c1f[1]];
			
			var A = c1.mesh.V[e1[0]];
			var B = c1.mesh.V[e1[1]];
			var C = (e2[0] != e1[0] && e2[0] != e1[1])?c1.mesh.V[e2[0]]:c1.mesh.V[e2[1]];
			
			var P1A = A.sub(P1,false);
			var AB = B.sub(A,false);
			var AC = C.sub(A,false);
			
			//Q1Q2 = P1A + u AB + v AC - s P1P2;
			//P1P2.(P1A + u AB + v AC - s P1P2)==0
			//AB  .(P1A + u AB + v AC - s P1P2)==0
			//AC  .(P1A + u AB + v AC - s P1P2)==0
			
			var _a1 = P1P2.dot(P1A), _b1 = P1P2.dot(AB), _c1 = P1P2.dot(AC), _d1 = P1P2.dot(P1P2);
			var _a2 =   AB.dot(P1A), _b2 =   AB.dot(AB), _c2 =   AB.dot(AC), _d2 =   _b1;
			var _a3 =   AC.dot(P1A), _b3 =   _c2       , _c3 =   AC.dot(AC), _d3 =   _c1;

			var det = _b3*_c2*_d1 - _b2*_c3*_d1 - _b3*_c1*_d2 + _b1*_c3*_d2 + _b2*_c1*_d3 - _b1*_c2*_d3;
			if(Math.abs(det)<0.001) continue;
			var detInv = 1/det;

			var s = (_a3*_b2*_c1 - _a2*_b3*_c1 - _a3*_b1*_c2 + _a1*_b3*_c2 + _a2*_b1*_c3 - _a1*_b2*_c3)*detInv;
			if(s<0||s>1)continue;
			var u = -(_a3*_c2*_d1 - _a2*_c3*_d1 - _a3*_c1*_d2 + _a1*_c3*_d2 + _a2*_c1*_d3 - _a1*_c2*_d3)*detInv;
			var v = -(-_a3*_b2*_d1 + _a2*_b3*_d1 + _a3*_b1*_d2 - _a1*_b3*_d2 - _a2*_b1*_d3 + _a1*_b2*_d3)*detInv;
			
			var Q1 = P1.add(P1P2.mul(s,false),false);
			var Q2 = A.add(AB.mul(u,false),false).add(AC.mul(v,false));
			var QQ = Q1.add(Q2,false).div(2);
			var isClip = true;
			//看交点陷入1没有
			var minDepth = Infinity;
			for(var cell of c1.mesh.C){
				var depth = - (Q1.dot(cell.info.normal) - cell.info.t);
				if(depth < 0) {
					isClip = false;
					break;
				}
				minDepth = Math.min(minDepth,depth);
			}
			
			if(!isClip) continue;
			
			//看F上投影点是否在F中：
			var N = AB.cross(AC).dual();
			var Q2 = A.add(AB.mul(u,false),false).add(AC.mul(v,false));
			isClip = true;
			for(var ef of c1f){
				var eA = c1.mesh.V[c1.mesh.E[ef][0]];
				var eB = c1.mesh.V[c1.mesh.E[ef][1]];
				var eAB = eB.sub(eA,false);
				var eN = eAB.cross(N);
				var eOA = eA.sub(c1f.center,false);
				if(eN.dot(eOA)<0){
					eN.sub();
				}
				var et = eA.dot(eN);
				var depth = - (Q2.dot(eN) - et);
				if(depth < 0) {
					isClip = false;
					break;
				}
			}
			if(!isClip) continue;
			
			var Q1Q2 = Q1.sub(Q2,false);
			var d = Q1Q2.len();
			if(d>minDepth*5) continue;
			if(d < minD){
				var P = Q1.add(Q2,false).div(2);
				var n = c1.r[0].mul(Q1Q2.div(d),false).mul(c1.r[1]);
				minD = d;
				faceContacted = new Phy4d.Collision(this,c2O, c1O, n, d, c1.r[0].mul(P,false).mul(c1.r[1]).add(c1.o),false);
				
			}
			continue;
		}
		if(faceContacted) list.push(faceContacted);
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
	var Rc = new Vec4(n.x,0,0,n.t)
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
	Rc.mul(st.R2/lenRc);
	//var maxN = Rc.add(n.mul(R2,false));
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
	//coordinate of st: (rx+o).n-t==0   =>  x.(r'n) + o.n - t == 0
	//todo:
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
Phy4d.prototype.detectCollision_Spheritorus_Spheritorus = function(stO1, stO2){
	var st1 = stO1.phyGeom;
	var st2 = stO2.phyGeom;
	var list = [];
	var R11 = st1.R1;
	var R12 = st1.R2;
	var R21 = st2.R1;
	var R22 = st2.R2;
	//convert stO1 to stO2's coordinate
	var O1local = st2.r[0].conj(false).mul(st1.o.sub(st2.o,false)).mul(st2.r[1].conj(false));
	var convertL = st2.r[0].conj(false).mul(st1.r[0]);
	var convertR = st1.r[1].mul(st2.r[1].conj(false),false);
	var X = convertL.mul(new Vec4(R12,0,0,0),false).mul(convertR);
	var T = convertL.mul(new Vec4(0,0,R12,0),false).mul(convertR);
	//equation for st1 in st2's coord:  |O1local + X cos s + T sin s|<st1.R1
	var s = 0; var t = Math.PI*2; 
	while(true){
		var array = [];
		var c = (s+t)/2;
	
		var P = O1local.add(X.mul(Math.cos(s),false),false).add(T.mul(Math.sin(s),false));
		var Oc = new Vec4(P.x,0,0,P.t);
		var lenRc = Oc.len();
		if(lenRc<0.000001) Oc = new Vec4(R22,0,0,0);
		else Oc.mul(R22/lenRc);
		var n = Oc.sub(P,false);
		var lenN = n.len();
		var d = R21 + R11 - lenN;
		array[0] = [n,d,s];
		
		var P = O1local.add(X.mul(Math.cos(t),false),false).add(T.mul(Math.sin(t),false));
		var Oc = new Vec4(P.x,0,0,P.t);
		var lenRc = Oc.len();
		if(lenRc<0.000001) Oc = new Vec4(R22,0,0,0);
		else Oc.mul(R22/lenRc);
		var n = Oc.sub(P,false);
		var lenN = n.len();
		var d = R21 + R11 - lenN;
		array[1] = [n,d,t];
		
		var P = O1local.add(X.mul(Math.cos(c),false),false).add(T.mul(Math.sin(c),false));
		var Oc = new Vec4(P.x,0,0,P.t);
		var lenRc = Oc.len();
		if(lenRc<0.000001) Oc = new Vec4(R22,0,0,0);
		else Oc.mul(R22/lenRc);
		var n = Oc.sub(P,false);
		var lenN = n.len();
		var d = R21 + R11 - lenN;
		array[2] = [n,d,c];
		array.sort(function(d1,d2){
			return d2[1]-d1[1];
		});
		if( Math.abs(array[0][2] - array[1][2])<0.001){
			var n = st2.r[0].mul(array[0][0],false).mul(st2.r[1]).norm();
			var d = array[0][1];
			list.push(new Phy4d.Collision(this, stO1, stO2, n, d+0.001, st2.r[0].mul(Oc,false).mul(st2.r[1]).add(st2.o).sub(n.mul(R21-d/2,false),false)));
			break;
		}else{
			s = array[0][2];
			t = array[1][2];
			if(c == (s+t)/2){
				t = array[2][2];
			}
		}
	}
	
	/*while (s<Math.PI*2){
		var P = O1local.add(X.mul(Math.cos(s),false),false).add(T.mul(Math.sin(s),false));
		
		var Oc = new Vec4(P.x,0,0,P.t);
		var lenRc = Oc.len();
		if(lenRc<0.000001){
			Oc = new Vec4(R22,0,0,0);
		}else{
			Oc.mul(R22/lenRc);
		}
		var n = Oc.sub(P,false);
		var lenN = n.len();
		var d = R21 + R11 - lenN;
		if(-d<0.001){
			n.div(lenN);
			n = st2.r[0].mul(n,false).mul(st2.r[1]);
			list.push(new Phy4d.Collision(this, stO1, stO2, n, d+0.001, st2.r[0].mul(Oc,false).mul(st2.r[1]).add(st2.o).sub(n.mul(R21-d/2,false),false)));
			break;
		}else{
			s+= -d/R12;
		}
	}
	s = 0;
	while (s>-Math.PI*2){
		var P = O1local.add(X.mul(Math.cos(s),false),false).add(T.mul(Math.sin(s),false));
		
		var Oc = new Vec4(P.x,0,0,P.t);
		var lenRc = Oc.len();
		if(lenRc<0.000001){
			Oc = new Vec4(R22,0,0,0);
		}else{
			Oc.mul(R22/lenRc);
		}
		var n = Oc.sub(P,false);
		var lenN = n.len();
		var d = R21 + R11 - lenN;
		if(-d<0.001){
			n.div(lenN);
			n = st2.r[0].mul(n,false).mul(st2.r[1]);
			list.push(new Phy4d.Collision(this, stO1, stO2, n, d+0.001, st2.r[0].mul(Oc,false).mul(st2.r[1]).add(st2.o).sub(n.mul(R21-d/2,false),false)));
			break;
		}else{
			s+= d/R12;
		}
	}*/
	if (list.length){
		return list;
	}
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
