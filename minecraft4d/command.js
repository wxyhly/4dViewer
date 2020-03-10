Command = {
	init: function(){
		$("CMD").addEventListener('keydown',function(ev){
			if(ev.keyCode == 13){
				Command.parse($("CMD").value);
			}
			if(ev.keyCode == 38){
				ev.preventDefault();
				Command.prev();
			}
			if(ev.keyCode == 40){
				ev.preventDefault();
				Command.next();
			}
			if(ev.keyCode == 27){
				ev.preventDefault();
				HUD.blur2Game();
			}
		})
	},
	CMDList: document.cookie || "",
	CMDListPointer: document.cookie.split("%%").length-1,
	addToCMDList: function(cmd){
		if((!cmd) || cmd=="/")return 0;
		var arr = Command.CMDList.split("%%");
		if(arr[arr.length-2] != cmd){//不记录重复的操作 
			if(arr.length>50){
				arr = arr.slice(arr.length - 49);
				Command.CMDList = "";
				for(var c of arr){
					if(c){
						Command.CMDList += c+"%%";
					}
				}
			}
			Command.CMDList += cmd+"%%";
			document.cookie = Command.CMDList;
		}
	},
	prev: function(){
		if(Command.CMDListPointer){
			Command.CMDListPointer--;
			$("CMD").value = Command.CMDList.split("%%")[Command.CMDListPointer];
			$("CMD").selectionStart = $("CMD").value.length;
			$("CMD").selectionEnd = $("CMD").value.length;
		}
	},
	next: function(){
		var arr = Command.CMDList.split("%%");
		if(arr[Command.CMDListPointer+1]){
			Command.CMDListPointer++;
			$("CMD").value = arr[Command.CMDListPointer];
			$("CMD").selectionStart = $("CMD").value.length;
			$("CMD").selectionEnd = $("CMD").value.length;
		}
	},
	parse: function(str,byMacro){
		//wa ozilek macro? nanj: soor 套娃
		if(!byMacro){
			Command.addToCMDList(str);
			Command.CMDListPointer = Command.CMDList.split("%%").length-1;
		}
		var command = str.match(/[a-z|0-9]+/)[0];
		switch(command){
			case "tp":
				var result = str.match(/tp\s+(~\-?[\.|0-9]*|-?[\.|0-9]+)\s+(~\-?[\.|0-9]*|-?[\.|0-9]+)\s+(~\-?[\.|0-9]*|-?[\.|0-9]+)\s+(~\-?[\.|0-9]*|-?[\.|0-9]+)/);
				if(!result){
					HUD.info("Syntax Error: tp <x> <y> <z> <t>");
					HUD.blur2Game();
					return 0;
				}
				var player = HUD.controler.camera4;
				var x = player.position.x;
				var y = player.position.y;
				var z = player.position.z;
				var t = player.position.t;
				if(result[1][0]!="~") player.position.x = result[1]-0.001;
				else player.position.x += Number(result[1].substr(1));
				if(result[2][0]!="~") player.position.y = result[2]-0.001;
				else player.position.y += Number(result[2].substr(1));
				if(result[3][0]!="~") player.position.z = result[3]-0.001;
				else player.position.z += Number(result[3].substr(1));
				if(result[4][0]!="~") player.position.t = result[4]-0.001;
				else player.position.t += Number(result[4].substr(1));
				//防下陷：
				HUD.controler.renderer.scene4.generateGeom(player.position.x,player.position.z,player.position.t,false);
				HUD.info("Tp: There you go!");
				
				break;
			case "seed":
				HUD.info("Seed: "+HUD.controler.renderer.scene4.terrain.seed);
				break;
			case "fly":
				HUD.controler.gravity = !HUD.controler.gravity;
				HUD.controler.moveStep = HUD.controler.gravity?0.2:0.4;
				HUD.info("Fly mode: "+(HUD.controler.gravity?"OFF":"ON"));
				break;
			case "speed":
				var result = str.match(/speed\s+([\d\.]+)/);
				if(!result){
					result = str.match(/speed\s*$/);
					if(!result){
						HUD.info("Syntax Error: speed <speed>");
						HUD.blur2Game();
						return 0;
					}
					HUD.info("Speed of player: "+(HUD.controler.moveStep*10));
					HUD.blur2Game();
					return 0;
				}
				var step = Number(result[1]);
				if(!step || step>10) {
					HUD.info("Error: exceeded maximum speed of 10");
					HUD.blur2Game();
					return 0;
				}
				HUD.controler.moveStep = step/10;
				HUD.info("Speed of player set: "+(step));
				break;
			case "dayspeed":
				var result = str.match(/dayspeed\s+([\-\d\.]+)/);
				if(!result){
					result = str.match(/dayspeed\s*$/);
					if(!result){
						HUD.info("Syntax Error: dayspeed <speed>");
						HUD.blur2Game();
						return 0;
					}
					HUD.info("Speed of day: "+(HUD.planet.timeStep*1e7));
					HUD.blur2Game();
					return 0;
				}
				var step = Number(result[1]);
				HUD.planet.timeStep = step*1e-7;
				HUD.info("Speed of day set: "+(step));
				break;
			case "regen":
				var result = str.match(/regen\s+(me|all)/);
				if(!result){
					HUD.info("Syntax Error: regen <me|all>");
					HUD.blur2Game();
					return 0;
				}
				var p = HUD.controler.camera4.position;
				switch(result[1]){
					case "me":
						var cx = Math.floor(p.x/MCChunk.SIZE);
						var cz = Math.floor(p.z/MCChunk.SIZE);
						var ct = Math.floor(p.t/MCChunk.SIZE);
						HUD.controler.renderer.scene4.chunks[cx+","+cz+","+ct] = undefined;
						break;
					case "all":
						HUD.controler.renderer.scene4.chunks = {};
				}
				//防下陷：
				HUD.controler.renderer.scene4.generateGeom(p.x,p.z,p.t,false);
				break;
			case "skipnight":case "skip":
				var angle = Math.asin(-HUD.sunToward.y)/Math.PI*180;
				if(angle>5){
					HUD.info("You can only use /skipnight at night");
					HUD.blur2Game();
					return 0;
				}
				HUD.skipNight = HUD.planet.timeStep;
				HUD.info("There time goes");
				HUD.blur2Game();
				break;
			case "glome":
				var result = str.match(/glome\s+([^\s]+)\s+([\d\.]+)(\s+(\-?[\d]+)\s+(\-?[\d]+)\s+(\-?[\d]+)\s+(\-?[\d]+))?\s*$/);
				if(!result){
					HUD.info("Syntax Error: glome <id> <radius> [<x> <y> <z> <t>]");
					HUD.blur2Game();
					return 0;
				}
				var id = Command.parseId(result[1]);
				if(!(id>=0)) return 0;
				var player = HUD.controler.camera4.position;
				if(result[3]){
					var x = Math.round(result[4]);
					var y = Math.round(result[5]);
					var z = Math.round(result[6]);
					var t = Math.round(result[7]);
				}else{
					var x = Math.round(player.x);
					var y = Math.round(player.y);
					var z = Math.round(player.z);
					var t = Math.round(player.t);
				}
				HUD.controler.renderer.scene4.WEGlome(Number(id),Number(result[2]),x,y,z,t);
				break;
			case "hglome":
				var result = str.match(/hglome\s+([^\s]+)\s+([\d\.]+)(\s+(\-?[\d]+)\s+(\-?[\d]+)\s+(\-?[\d]+)\s+(\-?[\d]+))?\s*$/);
				if(!result){
					HUD.info("Syntax Error: hglome <id> <radius> [<x> <y> <z> <t>]");
					HUD.blur2Game();
					return 0;
				}
				var id = Command.parseId(result[1]);
				if(!(id>=0)) return 0;
				var player = HUD.controler.camera4.position;
				if(result[3]){
					var x = Math.round(result[4]);
					var y = Math.round(result[5]);
					var z = Math.round(result[6]);
					var t = Math.round(result[7]);
				}else{
					var x = Math.round(player.x);
					var y = Math.round(player.y);
					var z = Math.round(player.z);
					var t = Math.round(player.t);
				}
				HUD.controler.renderer.scene4.WEHglome(Number(id),Number(result[2]),x,y,z,t);
				break;
			case "spherinder":
				var result = str.match(/spherinder\s+([^\s]+)\s+([\d\.]+)\s+([\d\.]+)(\s+([^\s]+)(\s+(\-?[\d]+)\s+(\-?[\d]+)\s+(\-?[\d]+)\s+(\-?[\d]+))?)?\s*$/);
				if(!result){
					HUD.info("Syntax Error: spherinder <id> <radius> <length> [<direction> [<x> <y> <z> <t>]]");
					HUD.blur2Game();
					return 0;
				}
				var id = Command.parseId(result[1]);
				if(!(id>=0)) return 0;
				var dir = Command.parseDir(result[5],HUD.faceToward);
				if(!dir) return 0;
				var player = HUD.controler.camera4.position;
				if(result[6]){
					var x = Math.round(result[7]);
					var y = Math.round(result[8]);
					var z = Math.round(result[9]);
					var t = Math.round(result[10]);
				}else{
					var x = Math.round(player.x);
					var y = Math.round(player.y);
					var z = Math.round(player.z);
					var t = Math.round(player.t);
				}
				HUD.controler.renderer.scene4.WESpherinder(Number(id),Number(result[2]),Number(result[3]),dir,x,y,z,t);
				break;
				
			case "hspherinder":
				var result = str.match(/hspherinder\s+([^\s]+)\s+([\d\.]+)\s+([\d\.]+)(\s+([^\s]+)(\s+(\-?[\d]+)\s+(\-?[\d]+)\s+(\-?[\d]+)\s+(\-?[\d]+))?)?\s*$/);
				if(!result){
					HUD.info("Syntax Error: hspherinder <id> <radius> <length> [<direction> [<x> <y> <z> <t>]]");
					HUD.blur2Game();
					return 0;
				}
				var id = Command.parseId(result[1]);
				if(!(id>=0)) return 0;
				var dir = Command.parseDir(result[5],HUD.faceToward);
				if(!dir) return 0;
				var player = HUD.controler.camera4.position;
				if(result[6]){
					var x = Math.round(result[7]);
					var y = Math.round(result[8]);
					var z = Math.round(result[9]);
					var t = Math.round(result[10]);
				}else{
					var x = Math.round(player.x);
					var y = Math.round(player.y);
					var z = Math.round(player.z);
					var t = Math.round(player.t);
				}
				HUD.controler.renderer.scene4.WEHspherinder(Number(id),Number(result[2]),Number(result[3]),dir,x,y,z,t);
				break;
				
			case "duocylinder":
				var result = str.match(/duocylinder\s+([^\s]+)\s+([\d\.]+)\s+([\d\.]+)(\s+([^\s]+)\s+([^\s]+)(\s+(\-?[\d]+)\s+(\-?[\d]+)\s+(\-?[\d]+)\s+(\-?[\d]+))?)?\s*$/);
				if(!result){
					HUD.info("Syntax Error: duocylinder <id> <radius1> <radius2> [<direction> [<x> <y> <z> <t>]]");
					HUD.blur2Game();
					return 0;
				}
				var id = Command.parseId(result[1]);
				if(!(id>=0)) return 0;
				var dir = Command.parseDir2(result[5],HUD.faceToward,HUD.leftToward);
				if(!dir) return 0;
				var player = HUD.controler.camera4.position;
				if(result[6]){
					var x = Math.round(result[7]);
					var y = Math.round(result[8]);
					var z = Math.round(result[9]);
					var t = Math.round(result[10]);
				}else{
					var x = Math.round(player.x);
					var y = Math.round(player.y);
					var z = Math.round(player.z);
					var t = Math.round(player.t);
				}
				HUD.controler.renderer.scene4.WEDuocylinder(Number(id),Number(result[2]),Number(result[3]),dir,x,y,z,t);
				break;
			case "tiger":
				var result = str.match(/tiger\s+([^\s]+)\s+([\d\.]+)\s+([\d\.]+)\s+([\d\.]+)(\s+([^\s]+)(\s+(\-?[\d]+)\s+(\-?[\d]+)\s+(\-?[\d]+)\s+(\-?[\d]+))?)?\s*$/);
				if(!result){
					HUD.info("Syntax Error: tiger <id> <radius1> <radius2> <radius3> [<direction> [<x> <y> <z> <t>]]");
					HUD.blur2Game();
					return 0;
				}
				var id = Command.parseId(result[1]);
				if(!(id>=0)) return 0;
				var dir = Command.parseDir2(result[6],HUD.faceToward,HUD.leftToward);
				if(!dir) return 0;
				var player = HUD.controler.camera4.position;
				if(result[7]){
					var x = Math.round(result[8]);
					var y = Math.round(result[9]);
					var z = Math.round(result[10]);
					var t = Math.round(result[11]);
				}else{
					var x = Math.round(player.x);
					var y = Math.round(player.y);
					var z = Math.round(player.z);
					var t = Math.round(player.t);
				}
				HUD.controler.renderer.scene4.WETiger(Number(id),Number(result[2]),Number(result[3]),Number(result[4]),dir,x,y,z,t);
				break;
			case "wand":
			case "w":
				if(HUD.block!=0){
					HUD.prevBlock = HUD.block;
					HUD.block = 0;
					HUD.info("wand mode ON");
				}else if(HUD.prevBlock){
					HUD.block = HUD.prevBlock;
					HUD.info("wand mode OFF");
				}
				break;
			case "set":
				var result = str.match(/set\s+([^\s]+)\s*$/);
				if(!result){
					HUD.info("Syntax Error: set <id>");
					HUD.blur2Game();
					return 0;
				}
				if(!HUD.checkSelSize()){
					HUD.info("Error: invalide Selection! see /sel for details");
					HUD.blur2Game();
					return 0;
				}
				var id = Command.parseId(result[1]);
				if(!(id>=0)) return 0;
				var p1 = HUD.wandPos1;
				var p2 = HUD.wandPos2;
				HUD.controler.renderer.scene4.setCuboid(Number(id),p1.x,p1.y,p1.z,p1.t,p2.x,p2.y,p2.z,p2.t);
				break;
			case "hset":
				var result = str.match(/hset\s+([^\s]+)\s*$/);
				if(!result){
					HUD.info("Syntax Error: hset <id>");
					HUD.blur2Game();
					return 0;
				}
				if(!HUD.checkSelSize()){
					HUD.info("Error: invalide Selection! see /sel for details");
					HUD.blur2Game();
					return 0;
				}
				var id = Command.parseId(result[1]);
				if(!(id>=0)) return 0;
				var p1 = HUD.wandPos1;
				var p2 = HUD.wandPos2;
				HUD.controler.renderer.scene4.WEHset(Number(id),p1.x,p1.y,p1.z,p1.t,p2.x,p2.y,p2.z,p2.t);
				break;
			case "wall":
				var result = str.match(/wall\s+([^\s]+)\s*$/);
				if(!result){
					HUD.info("Syntax Error: wall <id>");
					HUD.blur2Game();
					return 0;
				}
				if(!HUD.checkSelSize()){
					HUD.info("Error: invalide Selection! see /sel for details");
					HUD.blur2Game();
					return 0;
				}
				var id = Command.parseId(result[1]);
				if(!(id>=0)) return 0;
				var p1 = HUD.wandPos1;
				var p2 = HUD.wandPos2;
				HUD.controler.renderer.scene4.WEWall(Number(id),p1.x,p1.y,p1.z,p1.t,p2.x,p2.y,p2.z,p2.t);
				break;
			case "hwall":
				var result = str.match(/hwall\s+([^\s]+)\s*$/);
				if(!result){
					HUD.info("Syntax Error: hwall <id>");
					HUD.blur2Game();
					return 0;
				}
				if(!HUD.checkSelSize()){
					HUD.info("Error: invalide Selection! see /sel for details");
					HUD.blur2Game();
					return 0;
				}
				var id = Command.parseId(result[1]);
				if(!(id>=0)) return 0;
				var p1 = HUD.wandPos1;
				var p2 = HUD.wandPos2;
				HUD.controler.renderer.scene4.WEHwall(Number(id),p1.x,p1.y,p1.z,p1.t,p2.x,p2.y,p2.z,p2.t);
				break;
			case "expand":
				var result = str.match(/expand\s+([0-9]+)(\s+([0-9]+))?(\s+([^\s]+))?\s*$/);
				if(!result){
					HUD.info("Syntax Error: expand <num> [dir]   or   expand <num> <num> [dir]");
					HUD.blur2Game();
					return 0;
				}
				if(!HUD.checkSelSize()){
					HUD.info("Error: invalide Selection! see /sel for details");
					HUD.blur2Game();
					return 0;
				}
				var dir = Command.parseDir(result[5],HUD.faceToward);
				if(!dir) return 0;
				HUD.expandSel(Number(result[1]),Number(result[3])||0,dir);
				break;
			case "shift":
				var result = str.match(/shift\s+([0-9]+)(\s+([^\s]+))?\s*$/);
				if(!result){
					HUD.info("Syntax Error: shift <num> [dir]");
					HUD.blur2Game();
					return 0;
				}
				if(!HUD.checkSelSize()){
					HUD.info("Error: invalide Selection! see /sel for details");
					HUD.blur2Game();
					return 0;
				}
				var dir = Command.parseDir(result[3],HUD.faceToward);
				if(!dir) return 0;
				HUD.shiftSel(Number(result[1]),dir);
				break;
			case "move":
				var result = str.match(/move\s+([0-9]+)(\s+([^\s]+))?(\s+([^\s]+))?\s*$/);
				if(!result){
					HUD.info("Syntax Error: move <num> [dir] [replaceId]");
					HUD.blur2Game();
					return 0;
				}
				if(!HUD.checkSelSize()){
					HUD.info("Error: invalide Selection! see /sel for details");
					HUD.blur2Game();
					return 0;
				}
				var dir = Command.parseDir(result[3],HUD.faceToward);
				if(!dir) return 0;
				var p1 = HUD.wandPos1;
				var p2 = HUD.wandPos2;
				var id = Command.parseId(result[5],false);
				if(!(id>=0))id = 0;
				HUD.controler.renderer.scene4.WEMove(p1.x,p1.y,p1.z,p1.t,p2.x,p2.y,p2.z,p2.t,Number(result[1]),dir,Number(id));
				HUD.info("Region moved toward "+dir);
				break;
			case "stack":
				var result = str.match(/stack\s+([0-9]+)(\s+([^\s]+))?\s*$/);
				if(!result){
					HUD.info("Syntax Error: stack <num> [dir]");
					HUD.blur2Game();
					return 0;
				}
				if(!HUD.checkSelSize()){
					HUD.info("Error: invalide Selection! see /sel for details");
					HUD.blur2Game();
					return 0;
				}
				var dir = Command.parseDir(result[3],HUD.faceToward);
				if(!dir) return 0;
				var p1 = HUD.wandPos1;
				var p2 = HUD.wandPos2;
				HUD.controler.renderer.scene4.WEStack(p1.x,p1.y,p1.z,p1.t,p2.x,p2.y,p2.z,p2.t,Number(result[1])||1,dir);
				HUD.info("Region stacked toward "+dir);
				break;
			case "sel":
				HUD.getSelInfo();
				break;
			case "chunks":
				var ch = HUD.controler.renderer.scene4.chunks;
				var chunkQuantity = 0;
				var chunkMQuantity = 0;
				for(var i in ch){
					var chunk = ch[i];
					chunkQuantity++;
					if(!chunk.modified) continue;
					chunkMQuantity++;
				}
				HUD.info("Total chunks loaded: "+chunkQuantity);
				HUD.info("Chunks modified: "+chunkMQuantity);
				break;	
			case "copy":
				if(!HUD.checkSelSize()){
					HUD.info("Error: invalide Selection! see /sel for details");
					HUD.blur2Game();
					return 0;
				}
				var p1 = HUD.wandPos1;
				var p2 = HUD.wandPos2;
				var world = HUD.controler.renderer.scene4;
				var p = HUD.controler.camera4.position;
				Command.schemaClipboard = new MCWorld.Schema(
					world, 
					p1.x,p1.y,p1.z,p1.t,
					p2.x,p2.y,p2.z,p2.t,
					Math.round(p.x),Math.round(p.y),Math.round(p.z),Math.round(p.t)
				);
				HUD.info("Region copied");
				break;	
			case "paste":
				if(!Command.schemaClipboard){
					HUD.info("Error: Empty clipboard");
					HUD.blur2Game();
					return 0;
				}
				var world = HUD.controler.renderer.scene4;
				var p = HUD.controler.camera4.position;
				world.loadSchema(
					Command.schemaClipboard,
					Math.round(p.x),Math.round(p.y),Math.round(p.z),Math.round(p.t)
				);
				HUD.info("Region pasted");
				break;
			case "flip":
				var result = str.match(/flip(\s+([^\s]+))?\s*$/);
				if(!result){
					HUD.info("Syntax Error: flip [dir]");
					HUD.blur2Game();
					return 0;
				}
				if(!Command.schemaClipboard){
					HUD.info("Error: Empty clipboard");
					HUD.blur2Game();
					return 0;
				}
				if(result[2].length==1 && result[2]!='f'){
					result[2] += "+";
				}
				var dir = Command.parseDir(result[2],HUD.faceToward);
				if(!dir) return 0;
				Command.schemaClipboard.flip(dir);
				HUD.info("Region flipped");
				break;
			case "save":
				if(byMacro)return 0;
				var result = str.match(/save(\s+(clipboard|clip|sel|selection))?\s*$/);
				HUD.pause = true;
				if(result[2]){
					var p1 = HUD.wandPos1;
					var p2 = HUD.wandPos2;
					var world = HUD.controler.renderer.scene4;
					var p = HUD.controler.camera4.position;
					var schema;
					if(result[2][0]=='s'){
						schema = new MCWorld.Schema(
							world, 
							p1.x,p1.y,p1.z,p1.t,
							p2.x,p2.y,p2.z,p2.t,
							Math.round(p.x),Math.round(p.y),Math.round(p.z),Math.round(p.t)
						);
					}else{
						if(!Command.schemaClipboard){
							HUD.info("Error: Empty clipboard");
							HUD.blur2Game();
							return 0;
						}
						schema = Command.schemaClipboard;
					}
					schema.save();
				}else{
					HUD.Saver.save(HUD.controler.camera4);
				}
				break;
			case "load":
				if(byMacro)return 0;
				var result = str.match(/load(\s+(-c|clip|clipboard))?\s*$/);
				MCWorld.Schema.onload = function(schema){
					if(result[2]){
						Command.schemaClipboard = schema;
						HUD.togglePause(false);
						HUD.info("Region loaded to clipboard ("+schema.sizeX+" * "+schema.sizeY+" * "+schema.sizeZ+" * "+schema.sizeT+")");
						return 0;
					}
					var world = HUD.controler.renderer.scene4;
					var p = HUD.controler.camera4.position;
					world.loadSchema(
						schema,
						Math.round(p.x),Math.round(p.y),Math.round(p.z),Math.round(p.t)
					);
					HUD.togglePause(false);
					HUD.info("Region loaded ("+schema.sizeX+" * "+schema.sizeY+" * "+schema.sizeZ+" * "+schema.sizeT+")");
				}
				$("schemaLoader").click();
				break;
			case "loadmacro": case"macro":
				if(byMacro)return 0;
				var result = str.match(/(loadmacro|macro)\s*(prev)?\s*$/);
				if(result && result[2]=="prev"){
					MCWorld.Macro.execute();
				}else{
					$("macroLoader").click();
				}
				break;
			case "open":
				if(byMacro)return 0;
				$("loader").click();
				break;
			case "pos1":
				var result = str.match(/pos1\s+(~\-?[\.|0-9]*|-?[\.|0-9]+)\s+(~\-?[\.|0-9]*|-?[\.|0-9]+)\s+(~\-?[\.|0-9]*|-?[\.|0-9]+)\s+(~\-?[\.|0-9]*|-?[\.|0-9]+)/);
				if(!result){
					HUD.info("Syntax Error: pos1 <x> <y> <z> <t>");
					HUD.blur2Game();
					return 0;
				}
				var player = HUD.controler.camera4;
				var x = player.position.x;
				var y = player.position.y;
				var z = player.position.z;
				var t = player.position.t;
				var p = new Vec4();
				if(result[1][0]!="~") p.x = Number(result[1]);
				else p.x = player.position.x + Number(result[1].substr(1));
				if(result[2][0]!="~") p.y = Number(result[2]);
				else p.y = player.position.y + Number(result[2].substr(1));
				if(result[3][0]!="~") p.z = Number(result[3]);
				else p.z = player.position.z + Number(result[3].substr(1));
				if(result[4][0]!="~") p.t = Number(result[4]);
				else p.t = player.position.t + Number(result[4].substr(1));
				HUD.setWandPos1(p);
				break;
			case "pos2":
				var result = str.match(/pos2\s+(~\-?[\.|0-9]*|-?[\.|0-9]+)\s+(~\-?[\.|0-9]*|-?[\.|0-9]+)\s+(~\-?[\.|0-9]*|-?[\.|0-9]+)\s+(~\-?[\.|0-9]*|-?[\.|0-9]+)/);
				if(!result){
					HUD.info("Syntax Error: pos2 <x> <y> <z> <t>");
					HUD.blur2Game();
					return 0;
				}
				var player = HUD.controler.camera4;
				var x = player.position.x;
				var y = player.position.y;
				var z = player.position.z;
				var t = player.position.t;
				var p = new Vec4();
				if(result[1][0]!="~") p.x = Number(result[1]);
				else p.x = player.position.x + Number(result[1].substr(1));
				if(result[2][0]!="~") p.y = Number(result[2]);
				else p.y = player.position.y + Number(result[2].substr(1));
				if(result[3][0]!="~") p.z = Number(result[3]);
				else p.z = player.position.z + Number(result[3].substr(1));
				if(result[4][0]!="~") p.t = Number(result[4]);
				else p.t = player.position.t + Number(result[4].substr(1));
				HUD.setWandPos2(p);
				break;
			default:
				if(command.length){
					HUD.info("Syntax Error: Command inconnu \"/"+command+"\"");
				}
		}
		HUD.blur2Game();
	},
	parseId: function(ID,mute){
		var id;
		if(!(Number(ID)>=0)){
			id = MCWorld.idList[ID];
		}else{
			id = ID;
		}
		if(!MCWorld.nameList[id]){
			if(mute!==false){
				HUD.info("Error: Block ID "+ID+" dosen't exist");
				HUD.blur2Game();
			}
			return NaN;
		}
		return id;
	},
	parseDir: function(DIR,faceToward){
		var dir;
		if(!DIR||DIR=="f"){
			var thr = 0.85*5;
			if(faceToward.x > thr)dir = "x+";
			if(faceToward.x <-thr)dir = "x-";
			if(faceToward.y > thr)dir = "y+";
			if(faceToward.y <-thr)dir = "y-";
			if(faceToward.z > thr)dir = "z+";
			if(faceToward.z <-thr)dir = "z-";
			if(faceToward.t > thr)dir = "t+";
			if(faceToward.t <-thr)dir = "t-";
		}else{
			dir = DIR;
			dir = dir=="u"?"y+":dir=="d"?"y-":dir;
		}
		if(!dir||!dir.match(/^[xyzt][\+\-]$/)){
			HUD.info("Error: direction must be [xyzt]+, [xyzt]-, u(y+), d(y-) or f(front)");
			HUD.blur2Game();
			return null;
		}
		return dir;
	},
	parseDir2: function(DIR,faceToward,leftToward){
		var dir, dir1, dir2;
		if(!DIR||DIR=="f"){
			var thr = 0.8;
			if(faceToward.x > thr)dir1 = "x";
			if(faceToward.x <-thr)dir1 = "x";
			if(faceToward.y > thr)dir1 = "y";
			if(faceToward.y <-thr)dir1 = "y";
			if(faceToward.z > thr)dir1 = "z";
			if(faceToward.z <-thr)dir1 = "z";
			if(faceToward.t > thr)dir1 = "t";
			if(faceToward.t <-thr)dir1 = "t";
			
			if(leftToward.x > thr)dir2 = "x";
			if(leftToward.x <-thr)dir2 = "x";
			if(leftToward.y > thr)dir2 = "y";
			if(leftToward.y <-thr)dir2 = "y";
			if(leftToward.z > thr)dir2 = "z";
			if(leftToward.z <-thr)dir2 = "z";
			if(leftToward.t > thr)dir2 = "t";
			if(leftToward.t <-thr)dir2 = "t";
			dir = dir1+dir2;
			dir = dir=="yx"?"xy":dir=="zx"?"xz":dir=="tx"?"xt":(dir=="yz"||dir=="zy")?"xt":(dir=="yt"||dir=="ty")?"xz":(dir=="zt"||dir=="tz")?"xy":"xy";
		}else{
			dir = DIR;
		}
		if(!dir||!dir.match(/^x[yzt]$/)){
			HUD.info("Error: direction must be xy, xz or xt");
			HUD.blur2Game();
			return null;
		}
		return dir;
	},
	schemaClipboard: null
}