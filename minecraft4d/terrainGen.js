var TerrainGen = function(seed,world){
	this.seed = seed;//typeof seed=="number" ? seed : Math.floor(Math.random()*1000000);
	this.world = world;
	this.initPerlins(this.seed);
}
MCWorld.nameList = [
	"air",
	"stone",
	"grass",
	"dirt",
	"oak_log",
	"leaves",
	"brick",
	"sand",
	"water",
	"smooth_stone",
	"stone_slabs",
	"stone_brick",
	"planks",
	"white_concrete",
	"red_concrete",
	"yellow_concrete",
	"green_concrete",
	"cyan_concrete",
	"blue_concrete",
	"purple_concrete",
	"gray_concrete",
	"black_concrete",
	"catcus",
	"creeper_head",
	"enderman_head",
	"steve_head"
];
MCWorld.idList = {};
for(var i in MCWorld.nameList){
	MCWorld.idList[MCWorld.nameList[i]] = i;
}
//World generation:
TerrainGen.currentChunkInfo = {
	biome: null,
	building: false,
	tree: false,
	flat: false
};//当前区块群系、建筑、树等
TerrainGen.currentBlocInfo = {
	biome: null,
	flat: false
};//当前一块群系等

TerrainGen.prototype.generateChunk = function(cx,cz,ct,data){
	this.generateTerrain(data,cx,cz,ct);
	this.generateRoad(data,cx,cz,ct);
	this.generateBuilding(data,cx,cz,ct);
	this.generateForest(data,cx,cz,ct);
	this.replaceBloc(data);
}
TerrainGen.prototype.replaceBloc = function(data){
	var size = 4*4*4*32
	for(var i = 0; i<size; i++){
		if(data[i]==255)data[i] = 0;
	}
}
TerrainGen.TerrainConfig = {
	scale0 : 0.1,
	height0 : 2,
	scale1 : 0.25,
	height1 : 1,
	scale2 : 0.005,
	height2 : 10,
	scaleHill: 0.05,
	heightHill: 20,
	scaleSand: 0.005,
	riverLevel: 4,
	roadSize: 25
};
TerrainGen.prototype.initPerlins = function(seed){
	this.perlinTerrain0 = new Perlin3(seed);
	this.perlinTerrain1 = new Perlin3(seed+13579);
	this.perlinTerrain2 = new Perlin3(seed+89421);
	this.perlinHill = new Perlin3(seed+47474);
	this.perlinForest = new Perlin3(seed+64553);
	this.perlinSand = new Perlin3(seed+23453);
	this.perlinRiver = new Perlin3(seed+12);
	this.perlinRiver2 = new Perlin3(seed+242455);
}
TerrainGen.prototype.generateTerrain = function(data,cx,cz,ct){
	var dx = cx*MCChunk.SIZE;
	var dz = cz*MCChunk.SIZE;
	var dt = ct*MCChunk.SIZE;
	var Info = TerrainGen.currentBlocInfo;
	Info.building = false;
	for(var x = 0; x<MCChunk.SIZE; x++){
		for(var z = 0; z<MCChunk.SIZE; z++){
			for(var t = 0; t<MCChunk.SIZE; t++){
				var X = x+dx;
				var Z = z+dz;
				var T = t+dt;
				var h = this.getTerrain_Y(X,Z,T);
				
				var level = Math.min(h,MCChunk.SIZE_Y);
				var river = Info.river;
				if(level<=TerrainGen.TerrainConfig.riverLevel){
					if(Info.riverDistance<0.4){
						level = TerrainGen.TerrainConfig.riverLevel;
						Info.riverLevel = true;
					}else if(Info.riverDistance<0.45){//河堤
						level += (Info.riverDistance-0.4)*10;
						level = Math.max(level, TerrainGen.TerrainConfig.riverLevel);
					}else if(Info.riverDistance<0.5){
						level += (0.5-Info.riverDistance)*10;
					}
				}
				for(var y = 0; y<level; y++){
					data[x+4*y+32*4*z+32*4*4*t] = (river<0.5||Info.riverLevel)?(
						(level<=TerrainGen.TerrainConfig.riverLevel)?8:7
					):(Info.sand>0)?(
						(level-y==1)?7:(level-y==2)?7:1
					):(
						(level-y==1)?2:(level-y==2)?3:1
					);
				}
			}
		}
	}
}


TerrainGen.prototype._getRiver = function(X,Z,T,Info){
	var scaleRiver = 0.001;
	var scaleRiver2 = 0.05;
	var riverDistance = Math.abs(
		this.perlinRiver.value(
			(X+this.seed)*scaleRiver,
			(Z+this.seed%18)*scaleRiver,
			(T+this.seed*5)*scaleRiver
		)*5+this.perlinRiver2.value(X*scaleRiver2,Z*scaleRiver2,T*scaleRiver2)*0.2
	);
	var river = Math.min(0.1,riverDistance)*6+0.2;
	Info = Info || TerrainGen.currentBlocInfo;
	Info.riverDistance = riverDistance;
	return river;
}
TerrainGen.prototype.getRiver = function(X,Z,T,Info){
	var scaleRiver = 0.005;
	var scaleRiver2 = 0.05;
	
	var riverDistance1 = Math.abs(
		this.perlinRiver.value(
			(X+this.seed)*scaleRiver,
			(Z+this.seed%18)*scaleRiver,
			(T+this.seed*5)*scaleRiver
		)*0.8+this.perlinRiver2.value(X*scaleRiver2,Z*scaleRiver2,T*scaleRiver2)*0.04
	);
	
	var riverDistance2 = Math.abs(
		this.perlinRiver2.value(
			(X+this.seed%18)*scaleRiver,
			(Z+this.seed*0.71428)*scaleRiver,
			(T+this.seed*1.41428)*scaleRiver
		)*0.8+this.perlinRiver.value(X*scaleRiver2+this.seed*3.7,Z*scaleRiver2+this.seed*7.7,T*scaleRiver2+this.seed*5.7)*0.04
	);
	
	var rd1 = Math.sqrt(riverDistance1*riverDistance1 + riverDistance2*riverDistance2);
	var rr1 = Math.min(0.1,rd1)*6+0.2;
	
	
	
	riverDistance1 = Math.abs(
		this.perlinRiver.value(
			(X+this.seed*12.35307)*scaleRiver,
			(Z+this.seed*15.35307)*scaleRiver,
			(T+this.seed%18)*scaleRiver
		)*0.8+this.perlinRiver2.value(X*scaleRiver2+0.5,Z*scaleRiver2+0.5,T*scaleRiver2+0.5)*0.04
	);
	
	riverDistance2 = Math.abs(
		this.perlinRiver2.value(
			(X+this.seed%23)*scaleRiver,
			(Z+this.seed%31)*scaleRiver,
			(T+this.seed*4.41428)*scaleRiver
		)*0.8+this.perlinRiver.value(X*scaleRiver2+this.seed*3.7,Z*scaleRiver2+this.seed*7.7,T*scaleRiver2+this.seed*5.7)*0.04
	);
	
	var rd2 = Math.sqrt(riverDistance1*riverDistance1 + riverDistance2*riverDistance2);
	var rr2 = Math.min(0.1,rd1)*6+0.2;
	
	
	
	Info = Info || TerrainGen.currentBlocInfo;
	Info.riverDistance = Math.min(rd1,rd2);//Math.max(riverDistance1,riverDistance2);
	return Math.min(rr1,rr2);//Math.max(river1,river2);
}


TerrainGen.prototype.getTerrain_Y = function(X,Z,T,dont){
	var scale0 = TerrainGen.TerrainConfig.scale0;
	var height0 = TerrainGen.TerrainConfig.height0;
	var scale1 = TerrainGen.TerrainConfig.scale1;
	var height1 = TerrainGen.TerrainConfig.height1;
	var scale2 = TerrainGen.TerrainConfig.scale2;
	var height2 = TerrainGen.TerrainConfig.height2;
	var scaleHill = TerrainGen.TerrainConfig.scaleHill;
	var heightHill = TerrainGen.TerrainConfig.heightHill;
	var scaleSand = TerrainGen.TerrainConfig.scaleSand;
	var Info;
	if(dont===false)Info = {};
	else Info = TerrainGen.currentBlocInfo;
	var Sand = this.perlinSand.value((X+this.seed)*scaleSand,Z*scaleSand,T*scaleSand);
	Info.sand = Sand;
	var hill = Math.max(0,this.perlinHill.value(X*scaleHill,Z*scaleHill,T*scaleHill));
	
	var river = this.getRiver(X,Z,T,Info);
	if(river<0.35){
		Info.riverLevel = true;
		Info.Terrain_Y = TerrainGen.TerrainConfig.riverLevel;
	}else{
		Info.riverLevel = false;
		var plateux = Math.sin(this.perlinTerrain2.value(X*scale2,Z*scale2,T*scale2)*1.5);
		if(Math.abs(plateux)>0.6){
			var decay = (1-Math.abs(plateux))/0.4;
			heightHill*= decay*decay;
		}
		hill *= hill*heightHill;
		
		Info.Terrain_Y = Math.round(this.perlinTerrain0.value(X*scale0,Z*scale0,T*scale0)*height0 + (1-river)*river + river* (
		this.perlinTerrain1.value(X*scale1,Z*scale1,T*scale1)*height1 + plateux * height2 +3 + height2 + hill));
		
		Info.hill = hill;
		Info.river = river;
		Info.plateux = plateux;
	}
	if(dont===false) return Info;
	return Info.Terrain_Y;
	
}
TerrainGen.prototype.generateBuilding = function(data,cx,cz,ct){
	var size = 29;
	var bx = Math.floor(cx/size)*size;
	var bz = Math.floor(cz/size)*size;
	var bt = Math.floor(ct/size)*size;
	var seed = Math.abs(this.seed+bx*132467+bz*45+(bt<<9));
	var building = false;
	if(seed%11<8){
		MCStruct.generate(MCStruct.city1.bind(null,seed,this),data, bx,bz,bt ,cx,cz,ct,MCStruct.list);
	}
	size = 11;
	var bx = Math.floor(cx/size)*size;
	var bz = Math.floor(cz/size)*size;
	var bt = Math.floor(ct/size)*size;
	seed = Math.abs(this.seed-bx*907301+bz*45+(bt<<9));
	var Info = this.getTerrain_Y((bx+5)*4,(bz+5)*4,(bt+5)*4,false);
	if(seed%50<Info.riverDistance*5+3){
		MCStruct.generate(MCStruct.observatoir.bind(null,seed,this),data, bx,bz,bt ,cx,cz,ct,null);
	}else if(seed%30>12 && Info.sand>0.2){
		MCStruct.generate(MCStruct.pyramid.bind(null,seed,this),data, bx,bz,bt ,cx,cz,ct,null);
	}else{
		if(Math.abs(seed/(this.seed+17)*29)%33<Info.sand*25 + 25){
			MCStruct.generate(MCStruct.well.bind(null,seed,this),data, bx,bz,bt ,cx,cz,ct,null);
		}
	}
	
}
TerrainGen.prototype.getTree = function(cx,cz,ct){
	var scaleF = 0.2;
	var Info = TerrainGen.currentBlocInfo;
	var scaleSand = TerrainGen.TerrainConfig.scaleSand;
	var forest = this.perlinForest.value(cx*scaleF,cz*scaleF,ct*scaleF);
	Info.forest = forest;
	var treeX = Math.sin(this.seed + forest*137)*6047003;
	var treeZ = Math.sin(this.seed + forest*139)*1324356;
	var treeT = Math.sin(this.seed + forest*135)*8433709;
	treeX -= Math.floor(treeX);
	treeZ -= Math.floor(treeZ);
	treeT -= Math.floor(treeT);
	treeX = Math.floor(treeX*MCChunk.SIZE);
	treeZ = Math.floor(treeZ*MCChunk.SIZE);
	treeT = Math.floor(treeT*MCChunk.SIZE);
	var X = cx*MCChunk.SIZE+treeX;
	var Z = cz*MCChunk.SIZE+treeZ;
	var T = ct*MCChunk.SIZE+treeT;
	var sand = this.perlinSand.value((X+this.seed)*scaleSand,Z*scaleSand,T*scaleSand);
	var P = Math.sin(this.seed + forest*65)*893134;
	var type = Math.floor(Math.abs(P)%3);//oak tree, sprunce tree, bald
	if (forest>0 && P-Math.floor(P)<0.3 && sand<0 && this.getRiver(X,Z,T)>=0.5){
		return [treeX,treeZ,treeT,
			Math.floor(this.getTerrain_Y(cx*MCChunk.SIZE+treeX,cz*MCChunk.SIZE+treeZ,ct*MCChunk.SIZE+treeT)),
			type
		];
	}
	return false; //no tree found in this chunk
}
TerrainGen.prototype.generateForest = function(data,cx,cz,ct){
	var Info = TerrainGen.currentBlocInfo;
	//catus:
	var catcus = this.seed+cx*241+cz*28+ct*14734;
	if(Info.sand>0.1 && Info.riverDistance>=0.12 && !Info.building && catcus%11>7){
		for(var i = 0; i < (catcus)%3; i++){
			var treeX = Math.sin(this.seed + Info.sand*137)*(6401+i*3112);
			var treeZ = Math.sin(this.seed + Info.sand*139)*(1523+i*8327);
			var treeT = Math.sin(this.seed + Info.sand*135)*(5612+i*2534);
			treeX -= Math.floor(treeX);
			treeZ -= Math.floor(treeZ);
			treeT -= Math.floor(treeT);
			treeX = Math.floor(treeX*MCChunk.SIZE);
			treeZ = Math.floor(treeZ*MCChunk.SIZE);
			treeT = Math.floor(treeT*MCChunk.SIZE);
			var X = cx*MCChunk.SIZE+treeX;
			var Z = cz*MCChunk.SIZE+treeZ;
			var T = ct*MCChunk.SIZE+treeT;
			var posY = this.getTerrain_Y(X,Z,T);
			var occupe = false;
			for(var y = posY; y <= Math.min(posY+treeX%3+1,MCChunk.SIZE_Y); y++){
				if(data[treeX+4*(y+32*(treeZ+4*treeT))] != 0) {occupe = true; break;}
			}
			if(occupe)continue;
			for(var y = posY; y <= Math.min(posY+treeX%3+1,MCChunk.SIZE_Y); y++){
				data[treeX+4*(y+32*(treeZ+4*treeT))] = 22;
			}
		}
	}
	for(var x = cx-1; x<=cx+1;x++){
	for(var z = cz-1; z<=cz+1;z++){
	for(var t = ct-1; t<=ct+1;t++){
		if(Info.sand>0.2 || Info.building) continue;
		var pos = this.getTree(x,z,t);
		if(pos){
			var posY = pos[3];
			var height = pos[4]==0?8:pos[4]==1?12:1;
			if(x == cx && z == cz && t == ct){//if in current chunk, generate log
				for(var y = posY; y<Math.min(posY+height,MCChunk.SIZE_Y); y++){
					data[pos[0]+4*y+32*4*pos[1]+32*4*4*pos[2]] = 4;
				}
				y  = posY - 1;
				data[pos[0]+4*y+32*4*pos[1]+32*4*4*pos[2]] = 3;//replace grass to dirt
			}
			pos[0] -= (cx - x)*MCChunk.SIZE;
			pos[1] -= (cz - z)*MCChunk.SIZE;
			pos[2] -= (ct - t)*MCChunk.SIZE;
			switch(pos[4]){
				case 0:
					for(var py = posY + 5; py <= posY + height; py++){
						var restHeight = py - (posY + height);
						var xztSize = Math.floor(1 - restHeight / 2);
					for(var px = Math.max(0,pos[0] - xztSize); px <= Math.min(pos[0] + xztSize,MCChunk.SIZE-1); px++){
						var xOffset = px - pos[0];
					for(var pz = Math.max(0,pos[1] - xztSize); pz <= Math.min(pos[1] + xztSize,MCChunk.SIZE-1); pz++){
						var zOffset = pz - pos[1];
					for(var pt = Math.max(0,pos[2] - xztSize); pt <= Math.min(pos[2] + xztSize,MCChunk.SIZE-1); pt++){
						var tOffset = pt - pos[2];
						if(Math.abs(xOffset) != xztSize || Math.abs(zOffset) != xztSize || Math.abs(tOffset) != xztSize && restHeight !=0 && data[px+4*py+4*32*pz+4*4*32*pt] == 0){
							data[px+4*py+4*32*pz+4*4*32*pt] = 5;//leave
						}
					}
					}
					}
					}
					break;
				case 1:
					for(var py = posY + 3; py <= posY + height; py++){
						var restHeight = py - (posY + height);
						var xztSize = [0,1,2,1,2,3,1,2,3,1,0,0,0,0,0,0,0][-restHeight];
					for(var px = Math.max(0,pos[0] - xztSize); px <= Math.min(pos[0] + xztSize,MCChunk.SIZE-1); px++){
						var xOffset = px - pos[0];
					for(var pz = Math.max(0,pos[1] - xztSize); pz <= Math.min(pos[1] + xztSize,MCChunk.SIZE-1); pz++){
						var zOffset = pz - pos[1];
					for(var pt = Math.max(0,pos[2] - xztSize); pt <= Math.min(pos[2] + xztSize,MCChunk.SIZE-1); pt++){
						var tOffset = pt - pos[2];
						if((Math.abs(xOffset) != xztSize || Math.abs(zOffset) != xztSize || Math.abs(tOffset) != xztSize) && restHeight !=0 && data[px+4*py+4*32*pz+4*4*32*pt] == 0){
							data[px+4*py+4*32*pz+4*4*32*pt] = 5;//leave
						}
					}
					}
					}
					}
					break;
			}
		}
	}
	}
	}
}
TerrainGen.prototype.generateRoad = function(data,cx,cz,ct){
	var size = TerrainGen.TerrainConfig.roadSize;
	var bx = Math.floor(cx/size)*size;
	var bz = Math.floor(cz/size)*size;
	var bt = Math.floor(ct/size)*size;
	var px = cx-bx;
	var pz = cz-bz;
	var pt = ct-bt;
	var road = false;
	var rc = this.getRndRoad(bx,bz,bt);
	var rx = this.getRndRoad(bx+size,bz,bt);
	if(Math.min(rc[0],rx[0])<=pt&&Math.max(rc[0],rx[0])>=pt && Math.min(rc[1],rx[1])<=pz && Math.max(rc[1],rx[1])>=pz){
		var rnd = this.getRndRoad(bx*this.seed,bz,bt);//just generer rnd
		if(rnd[0]>=px&&rc[0]==pt&&rc[1]==pz) road = 20;
		else if (rnd[0]<=px&&rx[0]==pt&&rx[1]==pz) road = 20;
		else if (rnd[0]==px&&Math.min(rc[0],rx[0])<=pt&&Math.max(rc[0],rx[0])>=pt&&rc[1]==pz) road = 20;
		else if (rnd[0]==px&&Math.min(rc[1],rx[1])<=pz&&Math.max(rc[1],rx[1])>=pz&&rx[0]==pt) road = 20;
	}
	var rz = this.getRndRoad(bx,bz+size,bt);
	if(Math.min(rc[5],rz[5])<=pt&&Math.max(rc[5],rz[5])>=pt && Math.min(rc[4],rz[4])<=px && Math.max(rc[4],rz[4])>=px){
		var rnd = this.getRndRoad(bx*this.seed-1,bz+1,bt);//just generer rnd
		if(rnd[0]>=pz&&rc[5]==pt&&rc[4]==px) road = 18;
		else if (rnd[0]<=pz&&rz[5]==pt&&rz[4]==px) road = 18;
		else if (rnd[0]==pz&&Math.min(rc[5],rz[5])<=pt&&Math.max(rc[5],rz[5])>=pt&&rc[4]==px) road = 18;
		else if (rnd[0]==pz&&Math.min(rc[4],rz[4])<=px&&Math.max(rc[4],rz[4])>=px&&rz[5]==pt) road = 18;
	}
	var rt = this.getRndRoad(bx,bz,bt+size);
	if(Math.min(rc[3],rt[3])<=pz&&Math.max(rc[3],rt[3])>=pz && Math.min(rc[2],rt[2])<=px && Math.max(rc[2],rt[2])>=px){
		var rnd = this.getRndRoad(bx*this.seed-3,bz,bt+1);//just generer rnd
		if(rnd[0]>=pt&&rc[3]==pz&&rc[2]==px) road = 16;
		else if (rnd[0]<=pt&&rt[3]==pz&&rt[2]==px) road = 16;
		else if (rnd[0]==pt&&Math.min(rc[3],rt[3])<=pz&&Math.max(rc[3],rt[3])>=pz&&rc[2]==px) road = 16;
		else if (rnd[0]==pt&&Math.min(rc[2],rt[2])<=px&&Math.max(rc[2],rt[2])>=px&&rt[3]==pz) road = 16;
	}
	
	if(!road)return 0;
	var Info = TerrainGen.currentBlocInfo;
	Info.building = true;
	var height2 = TerrainGen.TerrainConfig.height2;
	//Info.Terrain_Y;
	var y = Math.max(TerrainGen.TerrainConfig.riverLevel+3,Math.round(0.8* (Info.plateux * height2 +4 + height2 + Info.hill/4)));
		for(var x = 0; x<MCChunk.SIZE; x++){
		for(var z = 0; z<MCChunk.SIZE; z++){
		for(var t = 0; t<MCChunk.SIZE; t++){
				data[x+4*(y-1+32*(z+4*t))] = 20;
				data[x+4*(y  +32*(z+4*t))] = 20;
				data[x+4*(y+1+32*(z+4*t))] = 0;
				data[x+4*(y+2+32*(z+4*t))] = 0;
				data[x+4*(y+3+32*(z+4*t))] = 0;
				data[x+4*(y+3+32*(z+4*t))] = 0;
			
		}
		}
		}
}
TerrainGen.prototype.getRndRoad = function(bx,bz,bt){
	var size = TerrainGen.TerrainConfig.roadSize-4;
	var rnd = Math.abs(Math.round((bx/11+(bz*13.56)+(bt*5142.356)+this.seed)));
	var rxt = rnd%size + 2;
	rnd = (16807 * rnd ) % (2<<31-1);
	var rxz = rnd%size + 2;
	rnd = (11711 * rnd ) % (2<<15-1);
	var rtx = rnd%size + 2;
	rnd = (32123 * rnd ) % (2<<29-1);
	var rtz = rnd%size + 2;
	rnd = (16807 * rnd ) % (2<<11-1);
	var rzx = rnd%size + 2;
	rnd = (94531 * rnd ) % (2<<13-1);
	var rzt = rnd%size + 2;
	return [rxt, rxz, rtx, rtz, rzx, rzt];
}