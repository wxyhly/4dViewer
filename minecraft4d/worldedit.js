MCWorld.prototype.WEGlome = function(id,radius,xc,yc,zc,tc){
	var xn = xc-radius;
	var xp = xc+radius;
	var yn = yc-radius;
	var yp = yc+radius;
	var zn = zc-radius;
	var zp = zc+radius;
	var tn = tc-radius;
	var tp = tc+radius;
	for(var x = xn; x<=xp; x++){
		var X = (x-xc)*(x-xc);
		for(var y = yn; y<=yp; y++){
			var Y = (y-yc)*(y-yc);
			for(var z = zn; z<=zp; z++){
				var Z = (z-zc)*(z-zc);
				for(var t = tn; t<=tp; t++){
					var T = (t-tc)*(t-tc);
					if(X+Y+Z+T<=radius*radius){
						this.setBlockId(id, x,y,z,t);
					}
				}
			}
		}
	}
}
MCWorld.prototype.WEHglome = function(id,radius,xc,yc,zc,tc){
	var xn = xc-radius;
	var xp = xc+radius;
	var yn = yc-radius;
	var yp = yc+radius;
	var zn = zc-radius;
	var zp = zc+radius;
	var tn = tc-radius;
	var tp = tc+radius;
	for(var x = xn; x<=xp; x++){
		var X = (x-xc)*(x-xc);
		for(var y = yn; y<=yp; y++){
			var Y = (y-yc)*(y-yc);
			for(var z = zn; z<=zp; z++){
				var Z = (z-zc)*(z-zc);
				for(var t = tn; t<=tp; t++){
					var T = (t-tc)*(t-tc);
					if(X+Y+Z+T<=radius*radius && X+Y+Z+T>=(radius-1)*(radius-1)){
						this.setBlockId(id, x,y,z,t);
					}
				}
			}
		}
	}
}
MCWorld.prototype.WESpherinder = function(id,radius,length,dir,xc,yc,zc,tc){
	var xn = -radius;
	var xp = radius;
	var yn = 0;
	var yp = length-1;
	var zn = -radius;
	var zp = radius;
	var tn = -radius;
	var tp = radius;
	for(var x = xn; x<=xp; x++){
		var X = x*x;
		for(var y = yn; y<=yp; y++){
			for(var z = zn; z<=zp; z++){
				var Z = z*z;
				for(var t = tn; t<=tp; t++){
					var T = t*t;
					if(X+Z+T<=radius*radius){
						var x0 = x,y0 = y,z0 = z,t0 = t;
						switch(dir){
							case "x+":
								x0 = y;
								y0 = x;
								break;
							case "x-":
								x0 = -y;
								y0 = x;
								break;
							case "y+":
								break;
							case "y-":
								y0 = -y;
								break;
							case "z+":
								z0 = y;
								y0 = z;
								break;
							case "z-":
								z0 = -y;
								y0 = z;
								break;
							case "w+":
								t0 = y;
								y0 = t;
								break;
							case "w-":
								t0 = -y;
								y0 = t;
								break;
						}
						this.setBlockId(id, x0+xc,y0+yc,z0+zc,t0+tc);
					}
				}
			}
		}
	}
}
MCWorld.prototype.WEHspherinder = function(id,radius,length,dir,xc,yc,zc,tc){
	var xn = -radius;
	var xp = radius;
	var yn = 0;
	var yp = length-1;
	var zn = -radius;
	var zp = radius;
	var tn = -radius;
	var tp = radius;
	for(var x = xn; x<=xp; x++){
		var X = x*x;
		for(var y = yn; y<=yp; y++){
			for(var z = zn; z<=zp; z++){
				var Z = z*z;
				for(var t = tn; t<=tp; t++){
					var T = t*t;
					if(X+Z+T<=radius*radius && X+Z+T>=(radius-1)*(radius-1)){
						var x0 = x,y0 = y,z0 = z,t0 = t;
						switch(dir){
							case "x+":
								x0 = y;
								y0 = x;
								break;
							case "x-":
								x0 = -y;
								y0 = x;
								break;
							case "y+":
								break;
							case "y-":
								y0 = -y;
								break;
							case "z+":
								z0 = y;
								y0 = z;
								break;
							case "z-":
								z0 = -y;
								y0 = z;
								break;
							case "w+":
								t0 = y;
								y0 = t;
								break;
							case "w-":
								t0 = -y;
								y0 = t;
								break;
						}
						this.setBlockId(id, x0+xc,y0+yc,z0+zc,t0+tc);
					}
				}
			}
		}
	}
}
MCWorld.prototype.WEDuocylinder = function(id,r1,r2,dir,xc,yc,zc,tc){
	var xn = -r1;
	var xp = r1;
	var yn = -r1;
	var yp = r1;
	var zn = -r2;
	var zp = r2;
	var tn = -r2;
	var tp = r2;
	for(var x = xn; x<=xp; x++){
		var X = x*x;
		for(var y = yn; y<=yp; y++){
			var Y = y*y;
			for(var z = zn; z<=zp; z++){
				var Z = z*z;
				for(var t = tn; t<=tp; t++){
					var T = t*t;
					if(X+Y<=r1*r1 && Z+T<=r2*r2){
						var x0 = x,y0 = y,z0 = z,t0 = t;
						switch(dir){
							case "xy":
								break;
							case "xz":
								z0 = y;
								y0 = z;
								break;
							case "xw":
								t0 = y;
								y0 = t;
						}
						this.setBlockId(id, x0+xc,y0+yc,z0+zc,t0+tc);
					}
				}
			}
		}
	}
}
MCWorld.prototype.WETiger = function(id,r1,r2,r3,dir,xc,yc,zc,tc){
	var xn = -r1;
	var xp = r1;
	var yn = -r1;
	var yp = r1;
	var zn = -r2;
	var zp = r2;
	var tn = -r2;
	var tp = r2;
	for(var x = xn; x<=xp; x++){
		var X = x*x;
		for(var y = yn; y<=yp; y++){
			var Y = y*y;
			var xy = (Math.sqrt(X+Y)-r1);
			xy *= xy;
			for(var z = zn; z<=zp; z++){
				var Z = z*z;
				for(var t = tn; t<=tp; t++){
					var T = t*t;
					var zt = (Math.sqrt(Z+T)-r2);
					zt *= zt;
					if(xy+zt<=r3*r3){
						var x0 = x,y0 = y,z0 = z,t0 = t;
						switch(dir){
							case "xy":
								break;
							case "xz":
								z0 = y;
								y0 = z;
								break;
							case "xw":
								t0 = y;
								y0 = t;
						}
						this.setBlockId(id, x0+xc,y0+yc,z0+zc,t0+tc);
					}
				}
			}
		}
	}
}

MCWorld.prototype.WEHset = function(id,x1,y1,z1,t1,x2,y2,z2,t2,hid){//id can be int or function
	var xm = Math.min(x1,x2), xp = Math.max(x1,x2);
	var ym = Math.min(y1,y2), yp = Math.max(y1,y2);
	var zm = Math.min(z1,z2), zp = Math.max(z1,z2);
	var tm = Math.min(t1,t2), tp = Math.max(t1,t2);
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
							this.setBlockId(id,x,y,z,t);
						}else{
							this.setBlockId(id(x,y,z,t),x,y,z,t);
						}
					}else if(hid){
						this.setBlockId(hid,x,y,z,t);
					}
				}
			}
		}
	}
}
MCWorld.prototype.WEWall = function(id,x1,y1,z1,t1,x2,y2,z2,t2,hid){//id can be int or function
	var xm = Math.min(x1,x2), xp = Math.max(x1,x2);
	var ym = Math.min(y1,y2), yp = Math.max(y1,y2);
	var zm = Math.min(z1,z2), zp = Math.max(z1,z2);
	var tm = Math.min(t1,t2), tp = Math.max(t1,t2);
	for(var x = xm; x<=xp; x++){
		var hx = x==xm||x==xp;
		for(var y = ym; y<=yp; y++){
			for(var z = zm; z<=zp; z++){
				var hz = z==zm||z==zp;
				for(var t = tm; t<=tp; t++){
					var ht = t==tm||t==tp;
					if(hx||hz||ht){
						if(typeof id == "number" || !id){
							this.setBlockId(id,x,y,z,t);
						}else{
							this.setBlockId(id(x,y,z,t),x,y,z,t);
						}
					}else if(hid){
						this.setBlockId(hid,x,y,z,t);
					}
				}
			}
		}
	}
}
MCWorld.prototype.WEH2set = function(id,x1,y1,z1,t1,x2,y2,z2,t2,hid){//id can be int or function
	var xm = Math.min(x1,x2), xp = Math.max(x1,x2);
	var ym = Math.min(y1,y2), yp = Math.max(y1,y2);
	var zm = Math.min(z1,z2), zp = Math.max(z1,z2);
	var tm = Math.min(t1,t2), tp = Math.max(t1,t2);
	for(var x = xm; x<=xp; x++){
		var hx = x==xm||x==xp;
		for(var y = ym; y<=yp; y++){
			var hy = y==ym||y==yp;
			for(var z = zm; z<=zp; z++){
				var hz = z==zm||z==zp;
				for(var t = tm; t<=tp; t++){
					var ht = t==tm||t==tp;
					if((hx&&hy)||(hx&&hz)||(hx&&ht)||(hy&&hz)||(hy&&ht)||(ht&&hz)){
						if(typeof id == "number" || !id){
							this.setBlockId(id,x,y,z,t);
						}else{
							this.setBlockId(id(x,y,z,t),x,y,z,t);
						}
					}else if(hid){
						this.setBlockId(hid,x,y,z,t);
					}
				}
			}
		}
	}
}
MCWorld.prototype.WEHwall = function(id,x1,y1,z1,t1,x2,y2,z2,t2,hid){//id can be int or function
	var xm = Math.min(x1,x2), xp = Math.max(x1,x2);
	var ym = Math.min(y1,y2), yp = Math.max(y1,y2);
	var zm = Math.min(z1,z2), zp = Math.max(z1,z2);
	var tm = Math.min(t1,t2), tp = Math.max(t1,t2);
	for(var x = xm; x<=xp; x++){
		var hx = x==xm||x==xp;
		for(var y = ym; y<=yp; y++){
			for(var z = zm; z<=zp; z++){
				var hz = z==zm||z==zp;
				for(var t = tm; t<=tp; t++){
					var ht = t==tm||t==tp;
					if((hx&&hz)||(hx&&ht)||(ht&&hz)){
						if(typeof id == "number" || !id){
							this.setBlockId(id,x,y,z,t);
						}else{
							this.setBlockId(id(x,y,z,t),x,y,z,t);
						}
					}else if(hid){
						this.setBlockId(hid,x,y,z,t);
					}
				}
			}
		}
	}
}
MCWorld.prototype.WEStack = function(x1,y1,z1,t1,x2,y2,z2,t2,num,dir){//id can be int or function
	var xm = Math.min(x1,x2), xp = Math.max(x1,x2), X = xp - xm + 1, dx = 0;
	var ym = Math.min(y1,y2), yp = Math.max(y1,y2), Y = yp - ym + 1, dy = 0;
	var zm = Math.min(z1,z2), zp = Math.max(z1,z2), Z = zp - zm + 1, dz = 0;
	var tm = Math.min(t1,t2), tp = Math.max(t1,t2), T = tp - tm + 1, dt = 0;
	switch(dir){
		case "x+":
			dx = X;
			break;
		case "x-":
			dx = -X;
			break;
		case "y+":
			dy = Y;
			break;
		case "y-":
			dy = -Y;
			break;
		case "z+":
			dz = Z;
			break;
		case "z-":
			dz = -Z;
			break;
		case "w+":
			dt = T;
			break;
		case "w-":
			dt = -T;
			break;			
	}
	for(var x = xm; x<=xp; x++){
		for(var y = ym; y<=yp; y++){
			for(var z = zm; z<=zp; z++){
				for(var t = tm; t<=tp; t++){
					var id = this.getBlockId(x,y,z,t);
					for(var n = 1; n<=num; n++){
						this.setBlockId(id,x+n*dx,y+n*dy,z+n*dz,t+n*dt);
					}
				}
			}
		}
	}
}
MCWorld.prototype.WEMove = function(x1,y1,z1,t1,x2,y2,z2,t2,num,dir,replId){//id can be int or function
	var xm = Math.min(x1,x2), xp = Math.max(x1,x2), dx = 0;
	var ym = Math.min(y1,y2), yp = Math.max(y1,y2), dy = 0;
	var zm = Math.min(z1,z2), zp = Math.max(z1,z2), dz = 0;
	var tm = Math.min(t1,t2), tp = Math.max(t1,t2), dt = 0;
	switch(dir){
		case "x+":
			for(var x = xp; x>=xm; x--){
				for(var y = ym; y<=yp; y++){
					for(var z = zm; z<=zp; z++){
						for(var t = tm; t<=tp; t++){
							this.setBlockId(this.getBlockId(x,y,z,t),x+num,y,z,t);
							this.setBlockId(replId,x,y,z,t);
						}
					}
				}
			}
			break;
		case "x-":
			for(var x = xm; x<=xp; x++){
				for(var y = ym; y<=yp; y++){
					for(var z = zm; z<=zp; z++){
						for(var t = tm; t<=tp; t++){
							this.setBlockId(this.getBlockId(x,y,z,t),x-num,y,z,t);
							this.setBlockId(replId,x,y,z,t);
						}
					}
				}
			}
			break;
		case "y+":
			for(var y = yp; y>=ym; y--){
				for(var x = xm; x<=xp; x++){
					for(var z = zm; z<=zp; z++){
						for(var t = tm; t<=tp; t++){
							this.setBlockId(this.getBlockId(x,y,z,t),x,y+num,z,t);
							this.setBlockId(replId,x,y,z,t);
						}
					}
				}
			}
			break;
		case "y-":
			for(var y = ym; y<=yp; y++){
				for(var x = xm; x<=xp; x++){
					for(var z = zm; z<=zp; z++){
						for(var t = tm; t<=tp; t++){
							this.setBlockId(this.getBlockId(x,y,z,t),x,y-num,z,t);
							this.setBlockId(replId,x,y,z,t);
						}
					}
				}
			}
			break;
		case "z+":
			for(var z = zp; z>=zm; z--){
				for(var x = xm; x<=xp; x++){
					for(var y = ym; y<=yp; y++){
						for(var t = tm; t<=tp; t++){
							this.setBlockId(this.getBlockId(x,z,y,t),x,z+num,y,t);
							this.setBlockId(replId,x,z,y,t);
						}
					}
				}
			}
			break;
		case "z-":
			for(var z = zm; z<=zp; z++){
				for(var x = xm; x<=xp; x++){
					for(var y = ym; y<=yp; y++){
						for(var t = tm; t<=tp; t++){
							this.setBlockId(this.getBlockId(x,z,y,t),x,z-num,y,t);
							this.setBlockId(replId,x,z,y,t);
						}
					}
				}
			}
			break;
		case "w+":
			for(var t = tp; t>=tm; t--){
				for(var x = xm; x<=xp; x++){
					for(var y = ym; y<=yp; y++){
						for(var z = zm; z<=zp; z++){
							this.setBlockId(this.getBlockId(x,t,y,z),x,t+num,y,z);
							this.setBlockId(replId,x,t,y,z);
						}
					}
				}
			}
			break;
		case "w-":
			for(var t = tm; t<=tp; t++){
				for(var x = xm; x<=xp; x++){
					for(var y = ym; y<=yp; y++){
						for(var z = zm; z<=zp; z++){
							this.setBlockId(this.getBlockId(x,t,y,z),x,t-num,y,z);
							this.setBlockId(replId,x,t,y,z);
						}
					}
				}
			}
			break;	
	}
	
}
MCWorld.Macro = function(world){
	this.world = world;
}
MCWorld.Macro.load = function(input){
	MCLoader.buffer = null;
	var file = input.files[0];
	if(!file) return 0;
	filename = file.name.split(".")[0];
	var reader = new FileReader();
	reader.onload = function() {
		var str = this.result;
		MCWorld.Macro.content = str;
		MCWorld.Macro.parse();
		MCWorld.Macro.execute();
	}
	reader.readAsText(file);
	MCLoader.msg("读取本地文件中");
	input.value = '';
}
MCWorld.Macro.execute = function(){
	for(var c of MCWorld.Macro.commands){
		Command.parse(c,true);
	}
	HUD.togglePause(false);
}
MCWorld.Macro.parse = function(){
	var str = MCWorld.Macro.content;
	str = str.replace(/\t|\r/g,"");
	var list = str.split("\n");
	MCWorld.Macro.defines = {};
	MCWorld.Macro.commands = [];
	var fnLoc = {};
	var fnStack = [];
	for(var i=0; i<list.length;i++){
		//remove note
		var l = list[i];
		l = l.replace(/#.*$/g,"");
		//parse inline function define
		var regRes = l.match(/^\s*fn ([a-z|A-Z|_]+)\s*:\s*$/);
		if(regRes){
			fnLoc[regRes[1]] = {
				begin: i+1,
				ctxt: []
			}
			fnStack.push(regRes[1]);
			list[i] = "";
		}else{
			var regRes = l.match(/^\s*endfn\s*$/);
			if(regRes){
				fnLoc[fnStack.pop()].end = i-1;
				list[i] = "";
			}else{
				if (fnStack.length){
					fnLoc[fnStack[fnStack.length-1]].ctxt.push(l);
					list[i] = "";
				}else{
					list[i] = l;
				}
			}
		}
		
	}
	do{
		//inline function replace
		var newList = [];
		for(var i=0; i<list.length;i++){
			var l = list[i];
			var isfn = false;
			for(var f in fnLoc){
				if(l.match(new RegExp("^\\s*"+f+"\\s*$","g"))){
					newList = newList.concat(fnLoc[f].ctxt);
					isfn = true;
					break;
				}
			}
			if(!(l.match(/^\s*$/)|| isfn)){
				newList.push(l);
			}
		}
		if(list.length == newList.length)break;
		list = newList;
	}while(true);

	for(var l of list){
		var regRes = l.match(/\s*def ([a-z|A-Z|_]+)\s+(\S+)\s*$/);
		//deal def
		if(regRes){
			MCWorld.Macro.defines[regRes[1]]=MCWorld.Macro.parseExpr(regRes[2]);
		}else{
			//parse def
			l = MCWorld.Macro.parseExpr(l);
			if(!l.match(/^\s*$/))
			//execute
			MCWorld.Macro.commands.push(l);
		}
	}
}
MCWorld.Macro.parseExpr = function(str){
	for(var d in MCWorld.Macro.defines){
		str = str.replace(new RegExp("\\b"+d+"\\b","g"),MCWorld.Macro.defines[d]);
	}
	var pieces = str.split(" ");
	var result = [];
	for(var piece of pieces){
		if(!piece.match(/^(\/|-|~)?[a-z|A-Z|_|0-9]*$/)){
			try{
				if(piece[0]=="~"){
					result.push("~"+eval(piece.substr(1)));
				}else{
						result.push(eval(piece));
				}
			}
			catch(e){
				MCLoader.msg(e);
			}
		}else{
			result.push(piece);
		}
	}
	return result.join(" ");
}
MCWorld.Schema = function(world, x1,y1,z1,t1, x2,y2,z2,t2, x0,y0,z0,t0){
	if(world) {
		var xm = Math.min(x1,x2), xp = Math.max(x1,x2); this.sizeX = xp - xm + 1;
		var ym = Math.min(y1,y2), yp = Math.max(y1,y2); this.sizeY = yp - ym + 1;
		var zm = Math.min(z1,z2), zp = Math.max(z1,z2); this.sizeZ = zp - zm + 1;
		var tm = Math.min(t1,t2), tp = Math.max(t1,t2); this.sizeT = tp - tm + 1;
		this.data = new Uint8Array(this.sizeX*this.sizeY*this.sizeZ*this.sizeT);
		var offset = 0;
		for(var x = xm; x<=xp; x++){
			for(var y = ym; y<=yp; y++){
				for(var z = zm; z<=zp; z++){
					for(var t = tm; t<=tp; t++){
						this.data[offset++] = world.getBlockId(x,y,z,t);
					}
				}
			}
		}
		this.ox = (x0 - xm)||0;
		this.oy = (y0 - ym)||0;
		this.oz = (z0 - zm)||0;
		this.ot = (t0 - tm)||0;
	}
}
MCWorld.Schema.version = 1;
MCWorld.Schema.prototype.save = function(){
	/*
	struct Sch4{
		char[4]: "Sch4",
		unsigned int32 version,
		unsigned int8 sizeX,
		unsigned int8 sizeY,
		unsigned int8 sizeZ,
		unsigned int8 sizeT,
		int8 ox,
		int8 oy,
		int8 oz,
		int8 ot,
		unsigned int32 dataLength,
		byte data[]
	}
	*/
	var header = [
		"S".charCodeAt(0),"c".charCodeAt(0),"h".charCodeAt(0),"4".charCodeAt(0)
	];
	var i = MCWorld.Schema.version;
	header.push(
		(i>>24)&0xFF,(i>>16)&0xFF,(i>>8)&0xFF,i&0xFF, //version
		this.sizeX,
		this.sizeY,
		this.sizeZ,
		this.sizeT,
		this.ox>=0?this.ox:256+this.ox,
		this.oy>=0?this.oy:256+this.oy,
		this.oz>=0?this.oz:256+this.oz,
		this.ot>=0?this.ot:256+this.ot,
		0,0,0,0
	);
	var dat = [];
	var next = this.data[0];
	var dataRawLength = this.data.length;
	var count = 0;
	for(var x=0; x<dataRawLength; x++){
		var d = next;//data[x];
		next = (x+1<dataRawLength)?this.data[x+1]:-1;
		if(count){
			if(d == next && count < 256){
				count++;
			}else{
				dat.push(count-1);//注意，1xxx 0000 == 0xxx 0xxx; 1xxx 0001 == 0xxx 0xxx 0xxx
				count = 0;
			}
		}else{
			if(d == next){
				dat.push(d+0x80);
				count = 1;
			}else{
				dat.push(d);
			}
		}		
	}
	var offset = header.length;
	var dl = dat.length;
	header[offset-4] = (dl>>24)&0xFF;
	header[offset-3] = (dl>>16)&0xFF;
	header[offset-2] = (dl>>8)&0xFF;
	header[offset-1] = dl&0xFF;
	var out = new Uint8Array(offset+dl);
	for(var i=0; i<header.length; i++){
		out[i] = header[i];
	}
	for(var i=0; i<dat.length; i++){
		out[i+offset] = dat[i];
	}
	MCSaver.saveBin(out,"Schema_"+new Date().toLocaleDateString().replace(/\//g,"/")+'.sch4');
}

MCWorld.Schema.load = function(input){
	MCLoader.buffer = null;
	var file = input.files[0];
	if(!file) return 0;
	filename = file.name.split(".")[0];
	var reader = new FileReader();
	reader.onload = function() {
		MCLoader.buffer = this.result;
		if(MCLoader.buffer && MCLoader.buffer.byteLength)
		MCLoader.msg("读取成功！["+MCLoader.buffer.byteLength+"B]");
		MCWorld.Schema.decode();
	}
	reader.readAsArrayBuffer(file);
	MCLoader.msg("读取本地文件中");
	input.value = '';
}
MCWorld.Schema.onload = function(){};
MCWorld.Schema.decode = function(){
	if(!MCLoader.buffer) MCLoader.msg("读取失败。。");
	MCLoader.msg("开始解码");
	MCLoader.data = new DataView(MCLoader.buffer);
	MCLoader.offset = 0;
	MCLoader.EOFStack.push(MCLoader.buffer.byteLength);
	var header = [0x53, 0x63, 0x68, 0x34, 0x00, 0x00, 0x00, 0x01];//Sch4 + version 1
	for(var i of header){
		if(i != MCLoader.next()){
			MCLoader.msg("意外文件头格式！");
			return 0;
		}
	}
	var out = new MCWorld.Schema();
	out.sizeX = MCLoader.next();
	out.sizeY = MCLoader.next();
	out.sizeZ = MCLoader.next();
	out.sizeT = MCLoader.next();
	var rawLen = out.sizeX*out.sizeY*out.sizeZ*out.sizeT;
	out.ox = MCLoader.nextInt8();
	out.oy = MCLoader.nextInt8();
	out.oz = MCLoader.nextInt8();
	out.ot = MCLoader.nextInt8();
	
	var dataLength = MCLoader.nextInt32();
	MCLoader.EOFStack.push(MCLoader.offset + dataLength);
	var bufferData = new Uint8Array(rawLen);
	var bufferOffset = 0;
	var prevID = 255;
	while (MCLoader.EOFPos() != MCLoader.offset){
		var d = MCLoader.next();
		if(prevID >= 128){//no prevID
			if(d>=0x80){
				prevID = d - 0x80;
			}else{
				bufferData[bufferOffset++] = d;
			}
		}else{
			for(var c = 0; c < d+2; c++){
				bufferData[bufferOffset++] = prevID;
			}
			prevID = 255;
		}
	}
	out.data = bufferData;
	if(bufferOffset!=rawLen){
		MCLoader.msg("意外Schematic内容格式！");
		return 0;
	}
	MCLoader.EOFStack.pop();
	if(MCLoader.EOFStack.pop() == MCLoader.offset){
		MCLoader.msg("解码完成！");
		MCWorld.Schema.onload(out);
	}else{
		MCLoader.msg("格式错误！");
	}
	
}


MCWorld.Schema.prototype.flip = function(dir){
	dir = dir[0];//projective
	var data = new Uint8Array(this.sizeX*this.sizeY*this.sizeZ*this.sizeT);
	var X,Y,Z,T;
	var offset = 0;
	for(var x = 0; x<this.sizeX; x++){
		X = dir=='x'? this.sizeX - x - 1 : x;
		for(var y = 0; y<this.sizeY; y++){
			Y = dir=='y'? this.sizeY - y - 1 : y;
			for(var z = 0; z<this.sizeZ; z++){
				Z = dir=='z'? this.sizeZ - z - 1 : z;
				for(var t = 0; t<this.sizeT; t++){
					T = dir=='w'? this.sizeT - t - 1 : t;
					data[offset++] = this.data[T+this.sizeT*(Z+this.sizeZ*(Y+this.sizeY*X))];
				}
			}
		}
	}
	this.data = data;
	this.ox = dir=='x'? this.sizeX - this.ox - 1 : this.ox;
	this.oy = dir=='y'? this.sizeY - this.oy - 1 : this.oy;
	this.oz = dir=='z'? this.sizeZ - this.oz - 1 : this.oz;
	this.ot = dir=='w'? this.sizeT - this.ot - 1 : this.ot;
}
MCWorld.Schema.prototype.rotate = function(dir){
	var data = new Uint8Array(this.sizeX*this.sizeY*this.sizeZ*this.sizeT);
	var X,Y,Z,T;
	var offset = 0;
	for(var x = 0; x<this.sizeX; x++){
		for(var y = 0; y<this.sizeY; y++){
			for(var z = 0; z<this.sizeZ; z++){
				for(var t = 0; t<this.sizeT; t++){
					data[offset++] = this.data[T+this.sizeT*(Z+this.sizeZ*(Y+this.sizeY*X))];
				}
			}
		}
	}
	this.data = data;
	this.ox = dir=='x'? this.sizeX - this.ox - 1 : this.ox;
	this.oy = dir=='y'? this.sizeY - this.oy - 1 : this.oy;
	this.oz = dir=='z'? this.sizeZ - this.oz - 1 : this.oz;
	this.ot = dir=='w'? this.sizeT - this.ot - 1 : this.ot;
}


MCWorld.prototype.loadSchema = function(schema,x0,y0,z0,t0){
	var xp = schema.sizeX;
	var yp = schema.sizeY;
	var zp = schema.sizeZ;
	var tp = schema.sizeT;
	x0 -= schema.ox;
	y0 -= schema.oy;
	z0 -= schema.oz;
	t0 -= schema.ot;
	var offset = 0;
	for(var x = 0; x<xp; x++){
		for(var y = 0; y<yp; y++){
			for(var z = 0; z<zp; z++){
				for(var t = 0; t<tp; t++){
					this.setBlockId(schema.data[offset++],x0+x,y0+y,z0+z,t0+t);
				}
			}
		}
	}
}