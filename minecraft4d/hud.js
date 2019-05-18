var HUD = {
	block: 6,
	focusCMD: function(str){
		var txt = $("CMD");
		txt.style.display = "block";
		HUD.controler.enableKey = false;
		txt.focus();
		txt.value = "";
	},
	blur2Game: function(){
		var txt = $("CMD");
		txt.style.display = "none";
		HUD.controler.enableKey = true;
		document.body.requestPointerLock();
	},
	infoQueue : [],
	info: function(str){
		HUD.infoQueue.push([str,new Date().getTime()]);
		if(HUD.infoQueue>5)HUD.infoQueue.shift();
	},
	draw: function(){
		var ctxt = ctxt$("hudCanvas");
		var h = $("hudCanvas").height;
		var barW = h/2;
		var barH = 40;
		ctxt.clearRect(0,0,h*2,h);
		ctxt.fillStyle="rgba(0,0,0,0.5)";
		ctxt.fillRect(h/2-barW/2,h,barW,-barH);
		ctxt.fillRect(h+h/2-barW/2,h,barW,-barH);
		ctxt.drawImage(HUD.blocTxtImg, 136, 8*HUD.block-8, 8,8,  h/2-barW/2 + 4,h-barH + 4, 32,32);
		ctxt.drawImage(HUD.blocTxtImg, 136, 8*HUD.block-8, 8,8,h+h/2-barW/2 + 4,h-barH + 4, 32,32);
		ctxt.fillStyle="rgba(0,0,0,1)";
		function fillText(str,x,y){
			ctxt.fillText(str,x,y);
			ctxt.fillText(str,x+h,y);
		}
		var w1 = 20,
			w2 = 70,
			w3 = 150;
			
			
		function dealToward(toward){
			var thr1 = 0.5,thr2 = 0.9,face = '';
			toward.y = 0;
			toward.norm();
			face += toward.x>thr1 ? "x+ " : toward.x<-thr1?"x- ":"";
			
			face += toward.z>thr1 ? "z+ " : toward.z<-thr1?"z- ":"";
			face += toward.t>thr1 ? "t+ " : toward.t<-thr1?"t- ":"";
			return ((Math.abs(toward.x)>thr2||Math.abs(toward.z)>thr2||Math.abs(toward.t)>thr2)?"":"~") + face;
		}
		fillText("Player At:",w1,20);
		function trunc(num){
			return Math.round(num*1000)/1000;
		}
		
		fillText("x:"+trunc(HUD.position.x),w1,30);
		fillText("y:"+trunc(HUD.position.y),w1,40);
		fillText("z:"+trunc(HUD.position.z),w1,50);
		fillText("t:"+trunc(HUD.position.t),w1,60);
		
		var angleSun = Math.asin(HUD.sunToward.y)/Math.PI*180;
		fillText("Sun At:",w1,80);
		fillText(dealToward(HUD.sunToward.sub()),w1,90);
		fillText("Sun angle: "+trunc(-angleSun),w1,100);
		fillText("time1: "+trunc(HUD.planet.time.southernTime),w1,110);
		fillText("time2: "+trunc(HUD.planet.time.northernTime),w1,120);
		
		var chunkx = Math.floor(Math.round(HUD.position.x)/4);
		var chunkz = Math.floor(Math.round(HUD.position.z)/4);
		var chunkt = Math.floor(Math.round(HUD.position.t)/4);
		
		fillText((Math.round(HUD.position.x)-chunkx*4)+" chunkX: "+chunkx,w1,140);
		fillText((Math.round(HUD.position.z)-chunkz*4)+" chunkZ: "+chunkz,w1,150);
		fillText((Math.round(HUD.position.t)-chunkt*4)+" chunkT: "+chunkt,w1,160);
		
		
		
		fillText("Face Toward:",w2,20);
		fillText("Front: "+dealToward(HUD.faceToward),w2,30);
		fillText("Left: "+dealToward(HUD.leftToward),w2,40);
		fillText("Sidefront: "+dealToward(HUD.sideFrontToward),w2,50);
		if(HUD.infoQueue.length){
			var NOW = new Date().getTime();
			if(NOW - HUD.infoQueue[0][1]>5000){
				HUD.infoQueue.shift();
			}
			ctxt.fillStyle="rgba(0,0,0,0.5)";
			ctxt.fillRect(w1,450+(-1-HUD.infoQueue.length)*10-2,h*2,HUD.infoQueue.length*10+4);
			ctxt.fillStyle="#FFF";
			for(var i=0; i<HUD.infoQueue.length; i++){
				fillText(HUD.infoQueue[i][0],w1,450+(i-HUD.infoQueue.length)*10);
			}
		}
		if(HUD.focusPos){
			ctxt.fillStyle="rgba(0,0,0,1)";
			var d;
			switch(HUD.focusPos.direction){
				case 0: d="y-";break;
				case 1: d="y+";break;
				case 2: d="x-";break;
				case 3: d="x+";break;
				case 4: d="z-";break;
				case 5: d="z+";break;
				case 6: d="t-";break;
				case 7: d="t+";
			}
			
			fillText("Aimed at "+d+" face of Block: \"minecraft:"+MCWorld.nameList[HUD.focusPos.id]+'"',w3,20);
			
			fillText("x:"+HUD.focusPos.position.x,w3,30);
			fillText("y:"+HUD.focusPos.position.y,w3,40);
			fillText("z:"+HUD.focusPos.position.z,w3,50);
			fillText("t:"+HUD.focusPos.position.t,w3,60);
		
		}
	}
}
function keyDown(ev){
	if(!this.enableKey)return 0;
	if(ev.keyCode=="N".charCodeAt(0)){
		HUD.block--;
	}
	if(ev.keyCode=="M".charCodeAt(0)){
		HUD.block++;
	}
	//console.log(ev.keyCode)
	if(ev.keyCode==191){//"/"
		document.exitPointerLock();
		HUD.focusCMD("/");
	}
	HUD.block = HUD.block<1?1:HUD.block;
}

Command = {
	init: function(){
		$("CMD").addEventListener('keydown',function(ev){
			if(ev.keyCode == 13){
				Command.parse($("CMD").value);
			}
		})
	},
	parse: function(str){
		var command = str.match(/[a-z|0-9]+/)[0];
		switch(command){
			case "tp":
				var result = str.match(/tp\s+(~\-?[0-9]*|-?[0-9]+)\s+(~\-?[0-9]*|-?[0-9]+)\s+(~\-?[0-9]*|-?[0-9]+)\s+(~\-?[0-9]*|-?[0-9]+)/);
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
					HUD.info("Speed of day: "+(HUD.planet.timeStep*10));
					HUD.blur2Game();
					return 0;
				}
				var step = Number(result[1]);
				HUD.planet.timeStep = step/10;
				HUD.info("Speed of day set: "+(step));
				break;
			case "regen":
				var result = str.match(/regen\s+(me|all)/);
				if(!result){
					HUD.info("Syntax Error: regen <me|all>");
					HUD.blur2Game();
					return 0;
				}
				switch(result[1]){
					case "me":
						var p = HUD.controler.camera4.position;
						var cx = Math.floor(p.x/MCChunk.SIZE);
						var cz = Math.floor(p.z/MCChunk.SIZE);
						var ct = Math.floor(p.t/MCChunk.SIZE);
						HUD.controler.renderer.scene4.chunks[cx+","+cz+","+ct] = undefined;
						break;
					case "all":
						HUD.controler.renderer.scene4.chunks = {};
				}
				break;
				
			default:
				if(command.length){
					HUD.info("Syntax Error: Command inconnu \"/"+command+"\"");
				}
		}
		//HUD.addToCMDList(command); todo up down toggle cmd
		HUD.blur2Game();
	}
}