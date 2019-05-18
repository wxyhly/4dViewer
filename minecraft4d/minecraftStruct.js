var MCStruct = {
	generate: function(fn,data, uuid, bx,bz,bt, cx,cz,ct){
		//fn: generateFn, data:currentChunkData, uuid: structName, bxzt: structPos(ch), cxzt:currentChunk(relative to bxzt)
		if(!MCStruct.list[uuid]){
			MCStruct.list[uuid] = {};
			fn(MCStruct.list[uuid],bx,bz,bt);
			console.log("struct "+uuid);
		}
		/*for(var L in MCStruct.list[uuid]){
			
		}*/
		if(!MCStruct.chunkList[(cx-bx)+","+(cz-bz)+","+(ct-bt)]) return false;
		var L = MCStruct.list[uuid];
		cx*=MCChunk.SIZE;
		cz*=MCChunk.SIZE;
		ct*=MCChunk.SIZE;
		bx*=MCChunk.SIZE;
		bz*=MCChunk.SIZE;
		bt*=MCChunk.SIZE;
		for(var x = 0; x<MCChunk.SIZE; x++){
		for(var Y = 0; Y<MCChunk.SIZE_Y; Y++){
		for(var z = 0; z<MCChunk.SIZE; z++){
		for(var t = 0; t<MCChunk.SIZE; t++){
			var X = cx+x;
			var Z = cz+z;
			var T = ct+t;
			var Ldata = L[(X-bx)+","+(Y)+","+(Z-bz)+","+(T-bt)];
			if(typeof Ldata=="number"){
				data[x+4*(Y+32*(z+4*t))] = Ldata;
			}
		}
		}
		}
		}
		return true;
	},
	list:{},
	chunkList:{},
	setBlock: function(id, x,y,z,t,lock){
		if(lock===false && typeof MCStruct.currentL[x+","+y+","+z+","+t]!="number"){
			return 0;
		}
		MCStruct.currentL[x+","+y+","+z+","+t] = id;
		var chl = Math.floor(x/4)+","+Math.floor(z/4)+","+Math.floor(t/4);
		MCStruct.chunkList[chl] = true;
	},
	get: function(x,y,z,t){
		return MCStruct.currentL[x+","+y+","+z+","+t];
	},
	set: function(id,x1,y1,z1,t1,x2,y2,z2,t2,lock){//id can be int or function
		var L = MCStruct.currentL;
		var xm = Math.min(x1,x2), xp = Math.max(x1,x2);
		var ym = Math.min(y1,y2), yp = Math.max(y1,y2);
		var zm = Math.min(z1,z2), zp = Math.max(z1,z2);
		var tm = Math.min(t1,t2), tp = Math.max(t1,t2);
		for(var x = xm; x<=xp; x++){
			for(var y = ym; y<=yp; y++){
				for(var z = zm; z<=zp; z++){
					for(var t = tm; t<=tp; t++){
						if(typeof id == "number" || !id){
							MCStruct.setBlock(id, x,y,z,t,lock);
						}else{
							MCStruct.setBlock(id(x,y,z,t), x,y,z,t,lock);
						}
					}
				}
			}
		}
	},
	hset: function(id,x1,y1,z1,t1,x2,y2,z2,t2,lock){//hollow set(to save time)
		var L = MCStruct.currentL;
		var xm = Math.min(x1,x2), xp = Math.max(x1,x2);
		var ym = Math.min(y1,y2), yp = Math.max(y1,y2);
		var zm = Math.min(z1,z2), zp = Math.max(z1,z2);
		var tm = Math.min(t1,t2), tp = Math.max(t1,t2);
		var hid = typeof lock=="number";
		for(var x = xm; x<=xp; x++){
			var hx = x==xm||x==xp;
			for(var y = ym; y<=yp; y++){
				var hy = y==ym||y==yp;
				for(var z = zm; z<=zp; z++){
					var hz = z==zm||z==zp;
					for(var t = tm; t<=tp; t++){
						var ht = t==tm||t==tp;
						if(hx||hy||hz||ht){
							if(typeof id == "number" || !id){
								MCStruct.setBlock(id, x,y,z,t,lock);
							}else{
								MCStruct.setBlock(id(x,y,z,t), x,y,z,t,lock);
							}
						}else if(hid){
							MCStruct.setBlock(lock, x,y,z,t);
						}
					}
				}
			}
		}
	},
	h2set: function(id,x1,y1,z1,t1,x2,y2,z2,t2,lock){//hollow set(to save time)
		var L = MCStruct.currentL;
		var xm = Math.min(x1,x2), xp = Math.max(x1,x2);
		var ym = Math.min(y1,y2), yp = Math.max(y1,y2);
		var zm = Math.min(z1,z2), zp = Math.max(z1,z2);
		var tm = Math.min(t1,t2), tp = Math.max(t1,t2);
		var hid = typeof lock=="number";
		for(var x = xm; x<=xp; x++){
			var hx = x==xm||x==xp;
			for(var y = ym; y<=yp; y++){
				var hy = y==ym||y==yp;
				for(var z = zm; z<=zp; z++){
					var hz = z==zm||z==zp;
					for(var t = tm; t<=tp; t++){
						var ht = t==tm||t==tp;
						if((hx&&hy)||(hx&&hz)||(hx&&ht)||(hy&&hz)||(yx&&ht)||(ht&&hz)){
							if(typeof id == "number" || !id){
								MCStruct.setBlock(id, x,y,z,t,lock);
							}else{
								MCStruct.setBlock(id(x,y,z,t), x,y,z,t,lock);
							}
						}else if(hid){
							MCStruct.setBlock(lock, x,y,z,t);
						}
					}
				}
			}
		}
	},
	repl: function(id,x1,y1,z1,t1,x2,y2,z2,t2,lock){//id can be int or function
		var L = MCStruct.currentL;
		var xm = Math.min(x1,x2), xp = Math.max(x1,x2);
		var ym = Math.min(y1,y2), yp = Math.max(y1,y2);
		var zm = Math.min(z1,z2), zp = Math.max(z1,z2);
		var tm = Math.min(t1,t2), tp = Math.max(t1,t2);
		for(var x = xm; x<=xp; x++){
			for(var y = ym; y<=yp; y++){
				for(var z = zm; z<=zp; z++){
					for(var t = tm; t<=tp; t++){
						if(typeof id == "number" || !id){
							MCStruct.setBlock(id, x,y,z,t,lock);
						}else{
							MCStruct.setBlock(id(MCStruct.get(x,y,z,t)), x,y,z,t,lock);
						}
					}
				}
			}
		}
	},
}
MCStruct.city1 = function(seed,terrain,L,bx,bz,bt){
	var seed1 = Math.floor(Math.sin((seed+(bx<<2)+(bz<<6)+(bt<<11))*1352.3)*75264224);
	for(var x = -1; x<=1; x++){
	for(var z = -1; z<=1; z++){
	for(var t = -1; t<=1; t++){
		var _seed = Math.floor(Math.sin((seed1/1332+(x<<2)+(z<<6)+(t<<11))*1352.3)*85264224);
		if(_seed%37<27-(x*x+z*z+t*t)){
			var px = (x+1)*18+12+(seed1%4)*6;
			var pz = (z+1)*18+18+(seed1%4)*6;
			var pt = (t+1)*18+18+(seed1%4)*6;
				MCStruct.building1(bx,bz,bt, px,pz,pt, _seed,terrain,L);
		}
	}
	}
	}
}
MCStruct.building1 = function(bx,bz,bt, px,pz,pt, seed,terrain,L){
	MCStruct.currentL = L;
	var s = 6, h = 5;//size and height of room
	var rnd = Math.floor(seed*Math.PI*234624);
	var rx = px;
	var rz = pz;
	var rt = pt;
	function chambre(x,z,t){
		//console.log("chamber "+x+" "+z+" "+t+" of "+rx+" "+rz+" "+rt);
		x=x*s+rx;
		z=z*s+rz;
		t=t*s+rt;
		var Info = terrain.getTerrain_Y(bx*MCChunk.SIZE+x+s/2,bz*MCChunk.SIZE+z+s/2,bt*MCChunk.SIZE+t+s/2,false);
		if(Info.hill>1 || Info.riverDistance<0.11)return 0;
		var brickId = (Info.sand>0)?6:12;
		var terrainY = Info.Terrain_Y;
		//check whether already have chambre ici:
		var empty = true;
		var xn=Infinity;
		var xp=Infinity;
		var zn=Infinity;
		var zp=Infinity;
		var tn=Infinity;
		var tp=Infinity;
		//whether chamber lin:(detect bedRock bloc)
		for(var dh = -2; dh<=2; dh++){
			if (MCStruct.get(x+3,terrainY+dh-1,z+3,t+3)==11) {
				empty = false;
				return 0;//ici est occupied
			}
			if (MCStruct.get(x  ,terrainY+dh-1,z+3,t+3)==11) {
				xn = dh;
			}
			if (MCStruct.get(x+s,terrainY+dh-1,z+3,t+3)==11) {
				xp = dh;
			}
			if (MCStruct.get(x+3,terrainY+dh-1,z  ,t+3)==11) {
				zn = dh;
			}
			if (MCStruct.get(x+3,terrainY+dh-1,z+s,t+3)==11) {
				zp = dh;
			}
			if (MCStruct.get(x+3,terrainY+dh-1,z+3,t  )==11) {
				tn = dh;
			}
			if (MCStruct.get(x+3,terrainY+dh-1,z+3,t+s)==11) {
				tp = dh;
			}
		}
		//wall, floor and roof edge:
		var edgeH = terrainY+h+1;
		MCStruct.hset(brickId, x,terrainY,z,t, x+s,terrainY+h,z+s,t+s, 0);//chambre wall
		MCStruct.repl((id)=>(!id)?10:id, x,edgeH,z,t, x+s,edgeH,z+s,t+s);//edge fill
		MCStruct.repl((id)=>(typeof id=="number")?id:11, x-1,terrainY-1,z-1,t-1, x+s+1,terrainY-1,z+s+1,t+s+1);//bedRock
		s-=1;
		MCStruct.set( 0, x+1,edgeH,z+1,t+1, x+s,edgeH,z+s,t+s);//edge hollow
		MCStruct.set( 9, x+1,terrainY,z+1,t+1, x+s,terrainY,z+s,t+s);//floor
		//MCStruct.set( 0, x+1,terrainY+1,z+1,t+1, x+s,terrainY+h-1,z+s,t+s);//chambre hollow
		s+=1;
		//cancel roof edge if connected:
		if(Math.abs(xp)<2) MCStruct.set(0, x+s,edgeH,z+1,t+1, x+s,edgeH,z+s-1,t+s-1);
		if(Math.abs(xn)<2) MCStruct.set(0, x  ,edgeH,z+1,t+1, x  ,edgeH,z+s-1,t+s-1);
		if(Math.abs(zp)<2) MCStruct.set(0, x+1,edgeH,z+s,t+1, x+s-1,edgeH,z+s,t+s-1);
		if(Math.abs(zn)<2) MCStruct.set(0, x+1,edgeH,z  ,t+1, x+s-1,edgeH,z  ,t+s-1);
		if(Math.abs(tp)<2) MCStruct.set(0, x+1,edgeH,z+1,t+s, x+s-1,edgeH,z+s-1,t+s);
		if(Math.abs(tn)<2) MCStruct.set(0, x+1,edgeH,z+1,t  , x+s-1,edgeH,z+s-1,t  );
		//stair:
		var dir;
		dir = (xp>9)?0:(zn>9)?3:(xn>9)?1:(tp>9)?4:(tn>9)?5:(zp>9)?1:-1;
		if(dir>=0 && (rnd*3.323436)%4==0){
			function rotSet(id,x0,y0,z0,t0, x1,y1,z1,t1, dir){
				switch(dir){
					case 0: MCStruct.set(id,x+s-x0,y0+terrainY,z+z0  ,t+t0  ,  x+s-x1,y1+terrainY,z+z1  ,t+t1  );break;
					case 1: MCStruct.set(id,x+x0  ,y0+terrainY,z+z0  ,t+t0  ,  x+x1  ,y1+terrainY,z+z1  ,t+t1  );break;
					case 2: MCStruct.set(id,x+z0  ,y0+terrainY,z+s-x0,t+t0  ,  x+z1  ,y1+terrainY,z+s-x1,t+t1  );break;
					case 3: MCStruct.set(id,x+z0  ,y0+terrainY,z+x0  ,t+t0  ,  x+z1  ,y1+terrainY,z+x1  ,t+t1  );break;
					case 4: MCStruct.set(id,x+t0  ,y0+terrainY,z+z0  ,t+s-x0,  x+t1  ,y1+terrainY,z+z1  ,t+s-x1);break;
					case 5: MCStruct.set(id,x+t0  ,y0+terrainY,z+z0  ,t+x0  ,  x+t1  ,y1+terrainY,z+z1  ,t+x1  );break;
				}
			}
			rotSet(9, 1,1,1,3, 2,1,2,3, dir);
			rotSet(9, 1,2,1,4, 2,2,2,5, dir);
			rotSet(9, 1,3,3,4, 2,3,3,5, dir);
			rotSet(9, 1,4,4,4, 2,4,5,5, dir);
			rotSet(0, 1,5,1,4, 2,5,5,5, dir);
			
		}
		
		//window:
		var fenetre = (rnd%2)?1:0;
		rnd = Math.floor(rnd/2);
		var xph = (xp==0)?0:(xp==1)?0:(xp==-1)?-1:(xp==2)?1:(xp==-2)?-1:0;
		var xnh = (xn==0)?0:(xn==1)?0:(xn==-1)?-1:(xn==2)?1:(xn==-2)?-1:0;
		var zph = (zp==0)?0:(zp==1)?0:(zp==-1)?-1:(zp==2)?1:(zp==-2)?-1:0;
		var znh = (zn==0)?0:(zn==1)?0:(zn==-1)?-1:(zn==2)?1:(zn==-2)?-1:0;
		var tph = (tp==0)?0:(tp==1)?0:(tp==-1)?-1:(tp==2)?1:(tp==-2)?-1:0;
		var tnh = (tn==0)?0:(tn==1)?0:(tn==-1)?-1:(tn==2)?1:(tn==-2)?-1:0;
		
		if(rnd%3!=0||Math.abs(xp)<3) MCStruct.set(0, x+s,terrainY+1+(xp!=0&&xp<5?xph:fenetre),z+3,t+3, x+s,terrainY+3+xph,z+4,t+4);
		rnd = Math.floor(rnd/2);                                                                                   
		if(rnd%3!=0||Math.abs(xn)<3) MCStruct.set(0, x  ,terrainY+1+(xn!=0&&xn<5?xnh:fenetre),z+3,t+3, x  ,terrainY+3+xnh,z+4,t+4);
		rnd = Math.floor(rnd/2);                                                                                   
		                                                                                                           
		if(rnd%3!=0||Math.abs(zp)<3) MCStruct.set(0, x+3,terrainY+1+(zp!=0&&zp<5?zph:fenetre),z+s,t+3, x+4,terrainY+3+zph,z+s,t+4);
		rnd = Math.floor(rnd/2);                                                                                   
		if(rnd%3!=0||Math.abs(zn)<3) MCStruct.set(0, x+3,terrainY+1+(zn!=0&&zn<5?znh:fenetre),z  ,t+3, x+4,terrainY+3+znh,z  ,t+4);
		rnd = Math.floor(rnd/2);                                                                                   
		                                                                                                           
		if(rnd%3!=0||Math.abs(tp)<3) MCStruct.set(0, x+3,terrainY+1+(tp!=0&&tp<5?tph:fenetre),z+3,t+s, x+4,terrainY+3+tph,z+4,t+s);
		rnd = Math.floor(rnd/2);                                                                                   
		if(rnd%3!=0||Math.abs(tn)<3) MCStruct.set(0, x+3,terrainY+1+(tn!=0&&tn<5?tnh:fenetre),z+3,t  , x+4,terrainY+3+tnh,z+4,t  );
		
		rnd = Math.floor(rnd*seed*Math.PI);  
	}
	chambre(0 ,-2,0);
	chambre(0 ,-1,0);
	chambre(0,0,0);
	chambre(0,1,0);
	chambre(0 ,1,0);
	chambre(0 ,rnd%2?-1:1,Math.floor(rnd/2)%2?-1:1);
	rnd = Math.floor((seed+(rnd<<6))*Math.PI);
	chambre(rnd%2?-1:1,0,Math.floor(rnd/2)%2?-1:1);
	rnd = Math.floor((rnd<<2)/Math.PI);
	chambre(rnd%2?-1:1,1,Math.floor(rnd/2)%2?-1:1);
	chambre(rnd%2?-1:1,2,Math.floor(rnd/2)%2?-1:1);
	chambre(0 ,2,0);
	chambre(0 ,3,0);
	chambre(-2,0 ,0);
	chambre(-1,0 ,0);
	chambre(1,0 ,0);
}
MCStruct.observatoir = function(seed,terrain,L,bx,bz,bt){
	var seed1 = Math.floor(Math.sin((seed*1.414+(bx<<6)+(bz<<1)+(bt<<12))*452.3)*2655242);
	var ox = (seed1%20)+28;
	var oz = ((seed*seed1)%20)+28;
	var ot = (seed%20)+28;
	MCStruct.currentL = L;
	function hall(x0,z0,t0){
		var Info = terrain.getTerrain_Y(
			bx*MCChunk.SIZE+ox,
			bz*MCChunk.SIZE+oz,
			bt*MCChunk.SIZE+ot,
			false //临时的info
		);
		if(Info.hill>2||Info.riverDistance<1.2)return 0;
		var y0 = Info.Terrain_Y;
		var r = Math.min(MCChunk.SIZE_Y - y0,(seed1>>2)%5+5);
		for(var x = -r; x<=r; x++){
			var X = x*x;
			for(var y = -3; y<=r; y++){
				var Y = y*y;
				for(var z = -r; z<=r; z++){
					var Z = z*z;
					for(var t = -r; t<=r; t++){
						var T = t*t;
						if(X+Y+Z+T<=r*r && X+Y+Z+T>=(r-1)*(r-1))
							MCStruct.setBlock(Info.sand>0?13:9, x0+x,y0+y,z0+z,t0+t);
					}
				}
			}
		}
		MCStruct.set(0, x0-r,y0-1,z0-1,t0-1, x0+r,y0+1,z0+1,t0+1,false);
		MCStruct.set(0, x0-1,y0-r,z0-1,t0-1, x0+1,y0+r,z0+1,t0+1,false);
		MCStruct.set(0, x0-1,y0-1,z0-r,t0-1, x0+1,y0+1,z0+r,t0+1,false);
		MCStruct.set(0, x0-1,y0-1,z0-1,t0-r, x0+1,y0+1,z0+1,t0+r,false);
	}
	hall(ox,oz,ot);
	
}