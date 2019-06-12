//4d physical engine
var Phy4d = function(dt){
	this.dt = dt||0.001;
	this.obj = [];
	this.constrain = [];
	this.collision = [];
	this.iterations = 1000;
	this.gravity = new Vec4(0,-9.8,0,0);
}
Phy4d.prototype.addObj = function(c){
	this.obj.push(c);
}
Phy4d.prototype.addConstrain = function(c){
	this.constrain.push(c);
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
Phy4d.Glome = function(o,r){//|x - o| = r
	this.o = o;
	this.r = r;
}
Phy4d.Glome.prototype.getPosition = function(){
	return this.o;
}
Phy4d.Glome.prototype.getRotation = function(){
	return null;
}
Phy4d.Convex = function(mesh4,o,r){//from mesh4 convex hull
	this.o = o || new Vec4();
	this.r = r || [new Vec4(1,0,0,0), new Vec4(1,0,0,0)];
	this.mesh = mesh4;
}
Phy4d.Convex.prototype.getPosition = function(){
	return this.o;
}
Phy4d.Convex.prototype.getRotation = function(){
	return this.r;
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
	this.restitution = 0.8;
}
Phy4d.Obj.prototype.getPosition = function(){
	return this.phyGeom.getPosition();
}
Phy4d.Obj.prototype.getRotation = function(){
	return this.phyGeom.getRotation();
}
Phy4d.Obj.prototype.getlinearVelocity = function(worldP){
	var localP = worldP.sub(this.getPosition(),false);
	return this.w.cross(localP).add(this.v);
}
Phy4d.Obj.prototype.setMass = function(mass){
	this.mass = mass;
	this.invMass = 1/mass;
	if(this.invMass>0) this.getInertie();
}

Phy4d.Obj.prototype.getInertie = function(){
	//todo
}

Phy4d.Collision = function(engine,obj1,obj2,n,d,p){
	//obj1,obj2,Vseparation,depth,normal(from 1 to 2),point
	this.engine = engine;
	this.obj1 = obj1;
	this.obj2 = obj2;
	this.Vsep = this.obj2.getlinearVelocity(p).sub(this.obj1.getlinearVelocity(p),false).dot(n);
	this.d = d;
	this.n = n;
	this.p = p;
	this.restitution = obj1.restitution * obj2.restitution;
}
Phy4d.Collision.prototype._solve = function(){
	var obj1 = this.obj1;
	var obj2 = this.obj2;
	if(this.Vsep <= 0){//solve Collision (apply pulse)
		var newSepVelocity = -this.Vsep * this.restitution;
		var accCausedVelocity = obj2.a.sub(obj1.a,false);
		var accCausedSepVelocity = accCausedVelocity.dot(this.n) * this.engine.dt;
		/*if (accCausedSepVelocity <= 0){
			newSepVelocity += accCausedSepVelocity;
			// Make sure we haven’t removed more than was
			// there to remove.
			if (newSepVelocity < 0) newSepVelocity = 0;
		}*/
		var deltaVelocity = newSepVelocity - this.Vsep;//desired change in velocity [V]
		var totalInvMass = obj1.invMass + obj2.invMass;
		if(totalInvMass>0){
			//todo: calculer real inertie
			var inverseInertieTensor1 = obj1.invMass*0.2;
			var inverseInertieTensor2 = obj2.invMass*0.2;
			var relContactP1 = this.p.sub(this.obj1.getPosition(),false);
			var relContactP2 = this.p.sub(this.obj2.getPosition(),false);
			var angularComponent = relContactP1.cross(this.n).mul(inverseInertieTensor1).cross(relContactP1);
			angularComponent.add(relContactP2.cross(this.n).mul(inverseInertieTensor2).cross(relContactP2));
			
			var velocityPerUnitImpulse = totalInvMass + angularComponent.dot(this.n);
			var impulse = this.n.mul(deltaVelocity/velocityPerUnitImpulse,false);
			
			obj1.v.sub(impulse.mul(obj1.invMass,false));
			obj2.v.add(impulse.mul(obj2.invMass));

			obj1.w.sub(impulse.cross(relContactP1).mul(inverseInertieTensor1));
			obj2.w.add(impulse.cross(relContactP2).mul(inverseInertieTensor2));
		}
	}
	if(this.d > 0){//solve penetration (separate 2 objs)
		var totalInvMass = obj1.invMass + obj2.invMass;
		if(totalInvMass>0){
			var dPerIMass = this.n.mul(this.d,false);
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
	
	if(t2 == Phy4d.Glome && t1 == Phy4d.Glome){
		return this.detectCollision_Glome_Glome(obj2,obj1);
	}
}
Phy4d.prototype._detectCollisions = function(){
	var list = [];
	//todo: octTree
	for(var i = 0; i < this.obj.length; i++){
		var obj1 = this.obj[i];
		for(var j = 0; j < this.obj.length; j++){
			if(i >= j) continue;
			var obj2 = this.obj[j];
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
	
	//solve collisions:
	
	var collisionList = this._detectCollisions();
	for(var i = 0; i < this.iterations && collisionList.length; i++){
		collisionList.sort(function(a,b){
			return b.d - a.d;
		});
		collisionList[0]._solve();//solve the most serious collision.
		collisionList = this._detectCollisions();
	}
	
	
	
}

Phy4d.prototype.detectCollision_Plane_Glome = function(planeO, glomeO){
	var plane = planeO.phyGeom;
	var glome = glomeO.phyGeom;
	var d = glome.r - (glome.o.dot(plane.n) - plane.t);
	if(d<0) return 0;
	return new Phy4d.Collision(this,planeO, glomeO, plane.n, d, glome.o.sub(plane.n.mul(d/2 + glome.r,false),false));
}
Phy4d.prototype.detectCollision_Glome_Glome = function(g1O, g2O){
	var g1 = g1O.phyGeom;
	var g2 = g2O.phyGeom;
	var R = g1.r + g2.r;
	if(Math.abs(g1.o.x-g2.o.x)>R || Math.abs(g1.o.y-g2.o.y)>R ||Math.abs(g1.o.z-g2.o.z)>R ||Math.abs(g1.o.t-g2.o.t)>R) return 0;
	var O1O2 = g2.o.sub(g1.o,false);
	var lO1O2 = O1O2.len(false);
	var d = R*R - lO1O2;
	if(d<0) return 0;
	lO1O2 = Math.sqrt(lO1O2);
	d = g1.r + g2.r - lO1O2;
	return new Phy4d.Collision(this,g1O, g2O, O1O2.div(lO1O2), d, g1.o.add(O1O2.mul(d/2 + g1.r,false),false));
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