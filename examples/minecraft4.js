var MCWorld = function(seed){
	this.seed = seed || Math.floor(Math.random()*1000000);
	this.chunks = {};
	this.autoGenerate = true;
	this.perlinTerrain0 = new Perlin3(seed);
	this.perlinTerrain1 = new Perlin3(seed+13579);
	this.perlinHill = new Perlin3(seed+47474);
	this.perlinForest = new Perlin3(seed+64553);
}
MCWorld.prototype.addChunk = function(mcChunk){
	this.chunks[mcChunk.x+","+mcChunk.z+","+mcChunk.t] = mcChunk;
}
MCWorld.prototype.loadChunk = function(distance,cx,cz,ct){
	var X = Math.floor(cx/MCChunk.SIZE);
	var Z = Math.floor(cz/MCChunk.SIZE);
	var T = Math.floor(ct/MCChunk.SIZE);
	for(var x = -distance-1; x<= distance+1; x++){
	for(var z = -distance-1; z<= distance+1; z++){
	for(var t = -distance-1; t<= distance+1; t++){
		var xX = x+X;
		var zZ = z+Z;
		var tT = t+T;
		if(Math.abs(xX - cx/MCChunk.SIZE)<distance && Math.abs(zZ - cz/MCChunk.SIZE)<distance && Math.abs(tT - ct/MCChunk.SIZE)<distance &&
			(!this.chunks[(xX)+","+(zZ)+","+(tT)])
		){
			this.generateChunk(xX,zZ,tT);
		}
	}
	}
	}
}
MCWorld.renderDistance = 4;
MCWorld.prototype.generateGeom = function(cx,cz,ct){
	var GeomList = [];
	var distance = Math.floor(MCWorld.renderDistance);
	this.loadChunk(distance,cx,cz,ct);
	//distance += 0.1;
	for(var i in this.chunks){
		var c = this.chunks[i];
		if(Math.abs(c.x - cx/MCChunk.SIZE)>distance || Math.abs(c.z - cz/MCChunk.SIZE)>distance || Math.abs(c.t - ct/MCChunk.SIZE)>distance){
			if(!c.modified){
				delete this.chunks[i];
			}else{
				continue;
			}
		}
			
		if(!c.updated){
			c.generateGeom(this);
			c.updated = true;
		}
		GeomList.push(c.geom);
	}
	return GeomList;
}



MCWorld.ColorTable = [
	null,	//air
	0xAAAAAA,//stone (gray)
	0x00FF00,//grass (green)
	0x996600,//dirt, log(brown)
	0xFFFFFF,//white
	0x00CC00,//leave (dark green)
	0xFFAA00,//orange
	0xFFFF00,//yellow
	0xAAFF00,//yellow - green
	0x00FFFF,//cyan
	0x0000FF,//blue
	0xBB00FF,//purple
	0xFFFFFF,//glow white
	0x000000,//pure black
];
MCWorld.prototype._findChunk = function(x,y,z,t){
	var cx = Math.floor(x/MCChunk.SIZE);
	var cz = Math.floor(z/MCChunk.SIZE);
	var ct = Math.floor(t/MCChunk.SIZE);
	var chunk = this.chunks[cx+","+cz+","+ct];
	return chunk;
}
MCWorld.prototype.getBlockId = function(x,y,z,t){
	var chunk = this._findChunk(x,y,z,t);
	if(chunk){
		var dx = ((x % MCChunk.SIZE) + MCChunk.SIZE) % MCChunk.SIZE;
		var dy = y;
		if(y<0 || y>MCChunk.SIZE_Y)return -Infinity;
		var dz = ((z % MCChunk.SIZE) + MCChunk.SIZE) % MCChunk.SIZE;
		var dt = ((t % MCChunk.SIZE) + MCChunk.SIZE) % MCChunk.SIZE;
		return chunk.data[dx][dy][dz][dt];
	}else{
		return -Infinity; //not loaded yet
	}
}
MCWorld.prototype.setBlockId = function(id,x,y,z,t){
	var chunk = this._findChunk(x,y,z,t);
	if(chunk){
		chunk.modified = true;
		chunk.updated = false;
		var dx = ((x % MCChunk.SIZE) + MCChunk.SIZE) % MCChunk.SIZE;
		var dy = y;
		var dz = ((z % MCChunk.SIZE) + MCChunk.SIZE) % MCChunk.SIZE;
		var dt = ((t % MCChunk.SIZE) + MCChunk.SIZE) % MCChunk.SIZE;
		chunk.data[dx][dy][dz][dt] = id;
		if(dx == 0){
			var nc = this._findChunk(x-1,y,z,t);
			if(nc) nc.updated = false;
		}else if(dx == MCChunk.SIZE - 1){
			var nc = this._findChunk(x+1,y,z,t);
			if(nc) nc.updated = false;
		}
		if(dz == 0){
			var nc = this._findChunk(x,y,z-1,t);
			if(nc) nc.updated = false;
		}else if(dz == MCChunk.SIZE - 1){
			var nc = this._findChunk(x,y,z+1,t);
			if(nc) nc.updated = false;
		}
		if(dt == 0){
			var nc = this._findChunk(x,y,z,t-1);
			if(nc) nc.updated = false;
		}else if(dt == MCChunk.SIZE - 1){
			var nc = this._findChunk(x,y,z,t+1);
			if(nc) nc.updated = false;
		}
		return true;
	}else{
		return -Infinity; //not loaded yet
	}
}
MCWorld.prototype.setCuboid = function(id,x1,y1,z1,t1,x2,y2,z2,t2){//id can be int or function
	var xm = Math.min(x1,x2), xp = Math.max(x1,x2);
	var ym = Math.min(y1,y2), yp = Math.max(y1,y2);
	var zm = Math.min(z1,z2), zp = Math.max(z1,z2);
	var tm = Math.min(t1,t2), tp = Math.max(t1,t2);
	for(var x = xm; x<=xp; x++){
		for(var y = ym; y<=yp; y++){
			for(var z = zm; z<=zp; z++){
				for(var t = tm; t<=tp; t++){
					if(typeof id == "number"){
						this.setBlockId(id, x,y,z,t);
					}else{
						this.setBlockId(id(x,y,z,t), x,y,z,t);
					}
				}
			}
		}
	}
}

var MCChunk = function(x,z,t,data){
	this.modified = false;
	this.updated = false;
	this.x = x;
	this.z = z;
	this.t = t;
	this.data = data;
}
MCChunk.SlopeColor = 0xFFFFFF;
MCChunk.Cellx = Mesh3.cube(1).embed(true, new Vec4(0,1,0,0),new Vec4(0,0,1,0),new Vec4(0,0,0,1));
MCChunk.Celly = Mesh3.cube(1).embed(true, new Vec4(1,0,0,0),new Vec4(0,0,1,0),new Vec4(0,0,0,1));
MCChunk.Cellz = Mesh3.cube(1).embed(true, new Vec4(0,1,0,0),new Vec4(1,0,0,0),new Vec4(0,0,0,1));
MCChunk.Cellt = Mesh3.cube(1).embed(true, new Vec4(0,1,0,0),new Vec4(0,0,1,0),new Vec4(1,0,0,0));
MCChunk.SlopeXp = Mesh2.points([new Vec2(0,0),new Vec2(0,1),new Vec2(1,0)]).embed(3,true).extrude(new Vec3(0,0,1)).embed(true).extrude(new Vec4(0,0,0,1)).move(new Vec4(-0.5,-0.5,-0.5,-0.5));
MCChunk.SlopeXp.getNormal();
MCChunk.SlopeXm = MCChunk.SlopeXp.clone().rotate(new Bivec(0,1,0,0,0,0),Math.PI);
MCChunk.SlopeXm.getNormal();
MCChunk.SlopeYp = MCChunk.SlopeXp.clone().rotate(new Bivec(0,1,0,0,0,0),-Math.PI/2);
MCChunk.SlopeYp.getNormal();
MCChunk.SlopeYm = MCChunk.SlopeXp.clone().rotate(new Bivec(0,1,0,0,0,0),Math.PI/2);
MCChunk.SlopeYm.getNormal();
MCChunk.SlopeZp = MCChunk.SlopeXp.clone().rotate(new Bivec(0,0,1,0,0,0),-Math.PI/2);
MCChunk.SlopeZp.getNormal();                                 
MCChunk.SlopeZm = MCChunk.SlopeXp.clone().rotate(new Bivec(0,0,1,0,0,0),Math.PI/2);
MCChunk.SlopeZm.getNormal();

MCChunk.prototype.generateGeom = function(mcWorld){
	
	var hyxelMesh = new Mesh4();
	var dx = this.x*MCChunk.SIZE;
	var dz = this.z*MCChunk.SIZE;
	var dt = this.t*MCChunk.SIZE;
	function join(m,x,y,z,t,color,a,b,c,d){
		var V = hyxelMesh.V,
		E = hyxelMesh.E,
		F = hyxelMesh.F,
		C = hyxelMesh.C,
		v = V.length,
		e = E.length,
		f = F.length;
		for(var A of m.V){
			V.push(new Vec4(A.x+x,A.y+y,A.z+z,A.t+t));
		}
		for(var A of m.E){
			E.push([A[0]+v,A[1]+v]);
		}
		for(var A of m.F){
			F.push([A[0]+e,A[1]+e,A[2]+e,A[3]+e]);
		}
		var cc = m.C[0];
		var newC = [cc[0]+f,cc[1]+f,cc[2]+f,cc[3]+f,cc[4]+f,cc[5]+f];
		newC.info = {color: color, normal: new Vec4(a,b,c,d)};
		C.push(newC);
	}
	for(var x = 0; x<MCChunk.SIZE; x++){
		for(var y = 0; y<MCChunk.SIZE_Y; y++){
			for(var z = 0; z<MCChunk.SIZE; z++){
				for(var t = 0; t<MCChunk.SIZE; t++){
					var datavalue = this.data[x][y][z][t];
					var n = datavalue == 12 ? 0 : 1;
					if(datavalue>0){
						var color = MCWorld.ColorTable[datavalue];
						if(mcWorld.getBlockId(x+dx,y,z+dz,t+1+dt)<=0) // air:0, -x:slope
							join(MCChunk.Cellt,x,y,z,t+0.5,color,0,0,0,n);
						if(mcWorld.getBlockId(x+dx,y,z+dz+1,t+dt)<=0)
							join(MCChunk.Cellz,x,y,z+0.5,t,color,0,0,n,0);
						if(mcWorld.getBlockId(x+dx,y+1,z+dz,t+dt)<=0)
							join(MCChunk.Celly,x,y+0.5,z,t,color,0,n,0,0);
						if(mcWorld.getBlockId(x+dx+1,y,z+dz,t+dt)<=0)
							join(MCChunk.Cellx,x+0.5,y,z,t,color,n,0,0,0);
						
						if(mcWorld.getBlockId(x+dx,y,z+dz,t-1+dt)<=0) // air:0, -x:slope
							join(MCChunk.Cellt,x,y,z,t-0.5,color,0,0,0,n);
						if(mcWorld.getBlockId(x+dx,y,z+dz-1,t+dt)<=0)
							join(MCChunk.Cellz,x,y,z-0.5,t,color,0,0,n,0);
						if(mcWorld.getBlockId(x+dx,y-1,z+dz,t+dt)<=0)
							join(MCChunk.Celly,x,y-0.5,z,t,color,0,n,0,0);
						if(mcWorld.getBlockId(x+dx-1,y,z+dz,t+dt)<=0)
							join(MCChunk.Cellx,x-0.5,y,z,t,color,n,0,0,0);
						
					}else if(datavalue <0){
						
						switch(datavalue){
							case -1:
								//from x+ to x-
								hyxelMesh.join(MCChunk.SlopeXp.clone().move(new Vec4(x,y,z,t)).setInfo({color: MCChunk.SlopeColor}));
							break;
							case -2:
								//from x- to x+
								hyxelMesh.join(MCChunk.SlopeXm.clone().move(new Vec4(x,y,z,t)).setInfo({color: MCChunk.SlopeColor}));
							break;
							case -3:
								//from y+ to y-
								hyxelMesh.join(MCChunk.SlopeYp.clone().move(new Vec4(x,y,z,t)).setInfo({color: MCChunk.SlopeColor}));
							break;
							case -4:
								//from y- to y+
								hyxelMesh.join(MCChunk.SlopeYm.clone().move(new Vec4(x,y,z,t)).setInfo({color: MCChunk.SlopeColor}));
							break;
							case -5:
								//from z+ to z-
								hyxelMesh.join(MCChunk.SlopeZp.clone().move(new Vec4(x,y,z,t)).setInfo({color: MCChunk.SlopeColor}));
							break;
							case -6:
								//from z- to z+
								hyxelMesh.join(MCChunk.SlopeZm.clone().move(new Vec4(x,y,z,t)).setInfo({color: MCChunk.SlopeColor}));
							break;
						}
					}
				}
			}
		}
	}
	hyxelMesh.getBoundingObjs();//no need to getNormal()
	this.geom = new Geom4(hyxelMesh).move(new Vec4(dx,0,dz,dt));
}
MCChunk.SIZE = 4;
MCChunk.SIZE_Y = 32;

MCWorld.prototype.rayCast = function(s, e){
	// 终点方块坐标
	var half = new Vec4(0.5,0.5,0.5,0.5);
	var start = s.add(half,false);
	var end = e.add(half,false);
	var intX2 = Math.floor(end.x);
	var intY2 = Math.floor(end.y);
	var intZ2 = Math.floor(end.z);
	var intT2 = Math.floor(end.t);
	// 起点(当前)方块坐标
	var intX1 = Math.floor(start.x);
	var intY1 = Math.floor(start.y);
	var intZ1 = Math.floor(start.z);
	var intT1 = Math.floor(start.t);

	// 检测起点方块
	var id = this.getBlockId(intX1, intY1, intZ1, intT1);
	if(id > 0) return null; //摄像机埋在了方块内，也忽略，但不继续算后面方块
	var count = 30; // 最多检测30个方块

	while (count-- >= 0) {
		
		// 检测了终点方块
		if (intX1 == intX2 && intY1 == intY2 && intZ1 == intZ2 && intT1 == intT2){
			return null;
		}

		// 起点(当前)方块和终点方块XYZ不同(向某方向选了候选方块)
		var Xchanged = true;
		var Ychanged = true;
		var Zchanged = true;
		var Tchanged = true;
		// 各方向候选方块坐标
		var newX;
		var newY;
		var newZ;
		var newT;

		// 尝试向X方向选候选方块
		if (intX2 > intX1)
			newX = intX1 + 1;
		else if (intX2 < intX1)
			newX = intX1;
		else
			Xchanged = false;

		if (intY2 > intY1)
			newY = intY1 + 1;
		else if (intY2 < intY1)
			newY = intY1;
		else
			Ychanged = false;
		
		if (intZ2 > intZ1)
			newZ = intZ1 + 1;
		else if (intZ2 < intZ1)
			newZ = intZ1;
		else
			Zchanged = false;

		if (intT2 > intT1)
			newT = intT1 + 1;
		else if (intT2 < intT1)
			newT = intT1;
		else
			Tchanged = false;

		// 各方向候选方块离起点(当前)有多近，初始化为很大的数
		var Xt = Infinity;
		var Yt = Infinity;
		var Zt = Infinity;
		var Tt = Infinity;
		var dX = end.x - start.x;
		var dY = end.y - start.y;
		var dZ = end.z - start.z;
		var dT = end.t - start.t;

		// 向X方向选了候选方块
		if (Xchanged)
			Xt = (newX - start.x) / dX;
		if (Ychanged)
			Yt = (newY - start.y) / dY;
		if (Zchanged)
			Zt = (newZ - start.z) / dZ;
		if (Tchanged)
			Tt = (newT - start.t) / dT;

		// 最终选了哪个方向的候选方块
		var direction;

		// 选出候选方块中离起点(当前)最近的，更新起点、要检测的方块坐标
		if (Xt < Yt && Xt < Zt && Xt < Tt){
			if (intX2 > intX1)
				direction = 4;
			else
				direction = 5;

			start.x = newX;
			start.y += dY * Xt;
			start.z += dZ * Xt;
			start.t += dT * Xt;
		}else if (Yt < Zt && Yt < Tt){
			if (intY2 > intY1)
				direction = 0;
			else
				direction = 1;

			start.x += dX * Yt;
			start.y = newY;
			start.z += dZ * Yt;
			start.t += dT * Yt;
		}else if (Zt < Tt){
			if (intZ2 > intZ1)
				direction = 2;
			else
				direction = 3;

			start.x += dX * Zt;
			start.y += dY * Zt;
			start.z = newZ;
			start.t += dT * Zt;
		}else{
			if (intT2 > intT1)
				direction = 6;
			else
				direction = 7;

			start.x += dX * Tt;
			start.y += dY * Tt;
			start.z += dZ * Tt;
			start.t = newT;
		}

		intX1 = Math.floor(start.x);

		if (direction == 5) // X-方向
		{
			// MC以方块内各轴最小坐标为方块坐标，这里得到的是X上最大坐标所以要-1
			--intX1;
		}

		intY1 = Math.floor(start.y);

		if (direction == 1) // Y-方向
		{
			--intY1;
		}

		intZ1 = Math.floor(start.z);

		if (direction == 3) // Z-方向
		{
			--intZ1;
		}
		intT1 = Math.floor(start.t);
		if (direction == 7) // T-方向
		{
			--intT1;
		}

		// 检测新起点方块
		id = this.getBlockId(intX1, intY1, intZ1, intT1);
		if(id >= -255 && id!=0) return {position: new Vec4(intX1, intY1, intZ1, intT1),direction:direction};
		//所有非空气方块
	}
}
MCWorld.prototype.hitTest = function(pos){
	var value = this.getBlockId(Math.round(pos.x),Math.round(pos.y),Math.round(pos.z),Math.round(pos.t));
	if(value > 0) return true; //block detected
	if(value == -7) return true; //transparent barrier detected
	if(value == 0) return false; //air detected
	//slopes below
	var dx = pos.x - Math.round(pos.x);
	var dy = pos.y - Math.round(pos.y);
	var dz = pos.z - Math.round(pos.z);
	var dt = pos.t - Math.round(pos.t);
	if(value == -1) return dy < -dx;
	if(value == -2) return dy < dx;
	if(value == -3) return dy < -dz;
	if(value == -4) return dy < dz;
	if(value == -5) return dy < -dt;
	if(value == -6) return dy < dt;
}

//World generation:

MCWorld.prototype.generateChunk = function(cx,cz,ct,empty){
	var data = [];
	for(var x = 0; x<MCChunk.SIZE; x++){
		data.push([]);
		for(var y = 0; y<MCChunk.SIZE_Y; y++){
			data[x].push([]);
			for(var z = 0; z<MCChunk.SIZE; z++){
				data[x][y].push([]);
				for(var t = 0; t<MCChunk.SIZE; t++){
					data[x][y][z].push(0);
				}
			}
		}
	}
	if(this.autoGenerate == true){
		this.generateTerrain(data,cx,cz,ct);
		this.generateForest(data,cx,cz,ct);
	}
	this.addChunk(new MCChunk(cx,cz,ct,data));
}

MCWorld.TerrainConfig = {
	scale0 : 0.1,
	scale1 : 0.25,
	height0 : 2,
	height1 : 1,
	scaleHill: 0.05,
	heightHill: 10
};
MCWorld.prototype.generateTerrain = function(data,cx,cz,ct){
	for(var x = 0; x<MCChunk.SIZE; x++){
		for(var z = 0; z<MCChunk.SIZE; z++){
			for(var t = 0; t<MCChunk.SIZE; t++){
				var h = this.getTerrain_Y(cx,cz,ct,x,z,t);
				for(var y = 0; y<Math.min(h,MCChunk.SIZE_Y); y++){
					data[x][y][z][t] = 2;
				}
			}
		}
	}
}
MCWorld.prototype.getTerrain_Y = function(cx,cz,ct,x,z,t){
	var scale0 = MCWorld.TerrainConfig.scale0;
	var scale1 = MCWorld.TerrainConfig.scale1;
	var height0 = MCWorld.TerrainConfig.height0;
	var height1 = MCWorld.TerrainConfig.height1;
	var scaleHill = MCWorld.TerrainConfig.scaleHill;
	var heightHill = MCWorld.TerrainConfig.heightHill;
	var dx = cx*MCChunk.SIZE;
	var dz = cz*MCChunk.SIZE;
	var dt = ct*MCChunk.SIZE;
	var X = x+dx;
	var Z = z+dz;
	var T = t+dt;
	var hill = Math.max(0,this.perlinHill.value(X*scaleHill,Z*scaleHill,T*scaleHill));
	hill *= hill;
	return this.perlinTerrain0.value(X*scale0,Z*scale0,T*scale0)*height0 + 
	this.perlinTerrain1.value(X*scale1,Z*scale1,T*scale1)*height1 + 3 + hill*heightHill;
	;
}


MCWorld.prototype.getTree = function(cx,cz,ct){
	var scaleF = 0.2;
	var forest = this.perlinForest.value(cx*scaleF,cz*scaleF,ct*scaleF);
	var treeX = Math.sin(this.seed + forest*137)*6047003;
	var treeZ = Math.sin(this.seed + forest*139)*1324356;
	var treeT = Math.sin(this.seed + forest*135)*8433709;
	treeX -= Math.floor(treeX);
	treeZ -= Math.floor(treeZ);
	treeT -= Math.floor(treeT);
	treeX = Math.floor(treeX*MCChunk.SIZE);
	treeZ = Math.floor(treeZ*MCChunk.SIZE);
	treeT = Math.floor(treeT*MCChunk.SIZE);
	var P = Math.sin(this.seed + forest*65)*893134;
	if (forest>0 && P-Math.floor(P)<0.3) return [treeX,treeZ,treeT];
	return false; //no tree found in this chunk
}
MCWorld.prototype.generateForest = function(data,cx,cz,ct){
	var height = 8;
	for(var x = cx-1; x<=cx+1;x++){
	for(var z = cz-1; z<=cz+1;z++){
	for(var t = ct-1; t<=ct+1;t++){
		var pos = this.getTree(x,z,t);
		/*if(x == 0 && z == 0 && t == 0){
			pos = [0,0,0];
		}else{pos = false;}*/
		if(pos){
			var posY = Math.floor(this.getTerrain_Y(x,z,t,pos[0],pos[1],pos[2]));
			if(x == cx && z == cz && t == ct){//if in current chunk, generate log
				for(var y = posY; y<Math.min(posY+height,MCChunk.SIZE_Y); y++){
					data[pos[0]][y][pos[1]][pos[2]] = 3;
				}
			}
			pos[0] -= (cx - x)*MCChunk.SIZE;
			pos[1] -= (cz - z)*MCChunk.SIZE;
			pos[2] -= (ct - t)*MCChunk.SIZE;
			for(var py = posY + height - 3; py <= posY + height; py++){
				var restHeight = py - (posY + height);
                var xztSize = Math.floor(1 - restHeight / 2);
			for(var px = Math.max(0,pos[0] - xztSize); px <= Math.min(pos[0] + xztSize,MCChunk.SIZE-1); px++){
				var xOffset = px - pos[0];
			for(var pz = Math.max(0,pos[1] - xztSize); pz <= Math.min(pos[1] + xztSize,MCChunk.SIZE-1); pz++){
				var zOffset = pz - pos[1];
			for(var pt = Math.max(0,pos[2] - xztSize); pt <= Math.min(pos[2] + xztSize,MCChunk.SIZE-1); pt++){
				var tOffset = pt - pos[2];
				if(Math.abs(xOffset) != xztSize || Math.abs(zOffset) != xztSize || Math.abs(tOffset) != xztSize && restHeight !=0 && data[px][py][pz][pt] == 0){
					data[px][py][pz][pt] = 5;
				}
			}
			}
			}
			}
		}
	}
	}
	}
}
	
	
	
	