var HUD = {
	block: 6, //0 for wand
	wandPos1:null,
	wandPos2:null,
	drawLoadingInfo: function(str){
		var ctxt = ctxt$("hudCanvas");
		var h = $("hudCanvas").height;
		ctxt.clearRect(0,0,h*2,h);
		ctxt.font="50px Arial";
		ctxt.fillStyle="rgba(255,255,255,1)";
		ctxt.fillText(str,h-str.length/2*25,h/2-25);
	},
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
		Command.CMDListPointer = Command.CMDList.split("%%").length-1;
		HUD.controler.enableKey = true;
		document.body.requestPointerLock();
	},
	infoQueue : [],
	info: function(str){
		HUD.infoQueue.push([str,new Date().getTime()]);
		if(HUD.infoQueue>5)HUD.infoQueue.shift();
	},
	skipNight: null,
	draw: function(){
		var ctxt = ctxt$("hudCanvas");
		var h = $("hudCanvas").height;
		var barW = h/2;
		var barH = 40;
		ctxt.clearRect(0,0,h*2,h);
		ctxt.font="10px Arial";
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
		
		var angleSun = -Math.asin(HUD.sunToward.y)/Math.PI*180;
		fillText("Sun At:",w1,80);
		fillText(dealToward(HUD.sunToward.clone().sub()),w1,90);
		fillText("Sun angle: "+trunc(angleSun),w1,100);
		fillText("time1: "+trunc(HUD.planet.time.southernTime),w1,110);
		fillText("time2: "+trunc(HUD.planet.time.northernTime),w1,120);
		
		var chunkx = Math.floor(Math.round(HUD.position.x)/4);
		var chunkz = Math.floor(Math.round(HUD.position.z)/4);
		var chunkt = Math.floor(Math.round(HUD.position.t)/4);
		
		fillText((Math.round(HUD.position.x)-chunkx*4)+" chunkX: "+chunkx,w1,140);
		fillText((Math.round(HUD.position.z)-chunkz*4)+" chunkZ: "+chunkz,w1,150);
		fillText((Math.round(HUD.position.t)-chunkt*4)+" chunkT: "+chunkt,w1,160);
		
		
		
		fillText("Face Toward:",w2,20);
		fillText("Front: "+dealToward(HUD.faceToward.clone()),w2,30);
		fillText("Left: "+dealToward(HUD.leftToward.clone()),w2,40);
		fillText("Sidefront: "+dealToward(HUD.sideFrontToward),w2,50);
		if(HUD.controler.dTime) fillText("FPS: "+Math.round((1000/HUD.controler.dTime)),w2,70);
		if(HUD.infoQueue.length){
			var NOW = new Date().getTime();
			if(NOW - HUD.infoQueue[0][1]>10000){
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
		if(HUD.skipNight){
			HUD.planet.timeStep = 1e-4;
			if(angleSun>5){
				HUD.planet.timeStep = HUD.skipNight;
				HUD.skipNight = null;
			}
		}
	},
	togglePause: function(pause){
		if(typeof pause=="undefined"){
			HUD.pause = !HUD.pause;
		}else{
			HUD.pause = pause;
		}
		if(HUD.pause){
			document.exitPointerLock();
		}else{
			HUD.controler.prevTime = new Date().getTime();
			HUD.loop();
		}
	},
	setWandPos1: function(p){
		HUD.wandPos1 = p.clone();
		HUD.info("Position 1 set: "+p.x+" ,"+p.y+", "+p.z+", "+p.t);
	},
	setWandPos2: function(p){
		HUD.wandPos2 = p.clone();
		HUD.info("Position 2 set: "+p.x+" ,"+p.y+", "+p.z+", "+p.t);
	},
	getSelInfo: function(){
		if(HUD.wandPos1)
			HUD.info("Position 1: "+HUD.wandPos1.x+" ,"+HUD.wandPos1.y+", "+HUD.wandPos1.z+", "+HUD.wandPos1.t);
		else
			HUD.info("No Position 1 yet");
		if(HUD.wandPos2)
			HUD.info("Position 2: "+HUD.wandPos2.x+" ,"+HUD.wandPos2.y+", "+HUD.wandPos2.z+", "+HUD.wandPos2.t);
		else
			HUD.info("No Position 2 yet");
		if(HUD.wandPos1&&HUD.wandPos2){
			var p1 = HUD.wandPos1;
			var p2 = HUD.wandPos2;
			HUD.info("size: "+
				(Math.abs(p1.x-p2.x)+1)+" x "+
				(Math.abs(p1.y-p2.y)+1)+" x "+
				(Math.abs(p1.z-p2.z)+1)+" x "+
				(Math.abs(p1.t-p2.t)+1)
			);
			if(!HUD.checkSelSize()){
				HUD.info("Selection size too big!");
			}
		}
	},
	checkSelSize:function(){
		var maxSize = 35;
		if(!(HUD.wandPos1&&HUD.wandPos2))return false;
		var p1 = HUD.wandPos1;
		var p2 = HUD.wandPos2;
		return (
			(Math.abs(p1.x-p2.x)+1 <= maxSize)&&
			(Math.abs(p1.y-p2.y)+1 <= maxSize)&&
			(Math.abs(p1.z-p2.z)+1 <= maxSize)&&
			(Math.abs(p1.t-p2.t)+1 <= maxSize)
		);
	},
	expandSel: function(a,b,dir){
		var p1 = HUD.wandPos1;
		var p2 = HUD.wandPos2;
		var xm = Math.min(p1.x,p2.x), xp = Math.max(p1.x,p2.x);
		var ym = Math.min(p1.y,p2.y), yp = Math.max(p1.y,p2.y);
		var zm = Math.min(p1.z,p2.z), zp = Math.max(p1.z,p2.z);
		var tm = Math.min(p1.t,p2.t), tp = Math.max(p1.t,p2.t);
		switch(dir){
			case "x+":
				xp += a;
				xm -= b;
				break;
			case "x-":
				xp += b;
				xm -= a;
				break;
			case "y+":
				yp += a;
				ym -= b;
				break;
			case "y-":
				yp += b;
				ym -= a;
				break;
			case "z+":
				zp += a;
				zm -= b;
				break;
			case "z-":
				zp += b;
				zm -= a;
				break;
			case "t+":
				tp += a;
				tm -= b;
				break;
			case "t-":
				tp += b;
				tm -= a;
				break;
		}
		p1.x = xm;
		p1.y = ym;
		p1.z = zm;
		p1.t = tm;
		p2.x = xp;
		p2.y = yp;
		p2.z = zp;
		p2.t = tp;
		HUD.getSelInfo();
	},
	shiftSel: function(a,dir){
		var p1 = HUD.wandPos1;
		var p2 = HUD.wandPos2;
		switch(dir){
			case "x+":
				p1.x += a;
				p2.x += a;
				break;
			case "x-":
				p1.x -= a;
				p2.x -= a;
				break;
			case "y+":
				p1.y += a;
				p2.y += a;
				break;
			case "y-":
				p1.y -= a;
				p2.y -= a;
				break;
			case "z+":
				p1.z += a;
				p2.z += a;
				break;
			case "z-":
				p1.z -= a;
				p2.z -= a;
				break;
			case "t+":
				p1.t += a;
				p2.t += a;
				break;
			case "t-":
				p1.t -= a;
				p2.t -= a;
				break;			
		}
	}
}
