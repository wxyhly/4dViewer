function Planet4(){
	this.location = {
		WE: 120, //latitude parallel to south
		MG: 60, //latitude parallel to north
		NS: 30 //longitude
	}
	this.sun = {
		northernTropic: 90,
		southernTropic: 5,
		WEPeriod: 60, //southern days in one year
		MGPeriod: 7 //northern days in one year
	}
	this.initialTime = {
		northernTime: 12,  //12h00
		southernTime: 9.5, //9h30
		season: 100 //sun orbit angle
	}
	this.time = {};
	this.setTime(0);
	this.guiData = {sunAngle:0, sunNS:0};
}
Planet4.prototype._toVec4 = function(loc){
	var c = Math.cos(loc.NS),
		s = Math.sin(loc.NS);
	return new Vec4(
		Math.cos(loc.WE)*c,
		Math.sin(loc.WE)*c,
		Math.cos(loc.MG)*s,
		Math.sin(loc.MG)*s
	);
}
Planet4.prototype._toLocation = function(v){
	var WE = Math.atan2(v.y,v.x);
	var MG = Math.atan2(v.t,v.z);
	var NS = Math.atan(Math.sqrt((v.z*v.z + v.t*v.t)/(v.x*v.x + v.y*v.y)));
	return {WE:WE,MG:MG,NS:NS};
}
Planet4.prototype.getSunPosition = function(){
	var refLoc = {
		WE: this.time.southernTime/24*2*Math.PI - Math.PI/2 ,
		MG: this.time.northernTime/24*2*Math.PI - Math.PI/2 , 
		NS: this.location.NS/180*Math.PI
	}
	var nT = this.sun.northernTropic/180*Math.PI;
	var sT = this.sun.southernTropic/180*Math.PI;
	var eclipticPlane = [
		new Vec4(Math.cos(sT),0,Math.sin(sT),0),
		new Vec4(0,Math.cos(nT),0,Math.sin(nT))
	];
	var season = this.time.season/180*Math.PI;
	var posSun = eclipticPlane[0].mul(Math.cos(season)).add(eclipticPlane[1].mul(Math.sin(season))).norm();
	var P = this._toVec4(refLoc);
	var WE = new Vec4(Math.sin(refLoc.WE),-Math.cos(refLoc.WE), 0, 0);
	var MG = new Vec4(0, 0, Math.sin(refLoc.MG),-Math.cos(refLoc.MG));
	var NS = P.cross(WE).cross(MG);
	var m = new Mat4(
		WE.x, P.x, MG.x, NS.x,
		WE.y, P.y, MG.y, NS.y,
		WE.z, P.z, MG.z, NS.z,
		WE.t, P.t, MG.t, NS.t
	).t();
	this.guiData.sunAngle = 90 - Math.acos(posSun.dot(P))/Math.PI*180;
	this.guiData.sunNS = this._toLocation(posSun).NS/Math.PI*180;
	this.guiData.sunAngle = 90 - Math.acos(posSun.dot(P))/Math.PI*180;
	return m.mul(posSun);
}
Planet4.prototype.setSunAndRenderer = function (renderer, sun, sundistance){
	sundistance = sundistance || 500;
	renderer.light4 = this.getSunPosition();
	var y = renderer.light4.y;
	renderer.ambientLight = Math.sin(y)*0.7 + 0.3;
	if(renderer.ambientLight<0.3)renderer.ambientLight = 0.3;
	renderer.ambientLight *= 0.4;
	var brightness = y*200+100;
	if(brightness<=0)brightness = 0;
	var white = brightness < 128 ? 0: Math.round((brightness - 128)*1.2);
	brightness = Math.round(brightness);
	if(brightness >= 255) brightness = 255;
	renderer.bgColor4 = brightness*0x000101 + white*0x010000;
	if(!sun){
		renderer.light4.mul(-renderer.ambientLight*1.2);
		//renderer.light4 = new Vec4(1,-1,0,0).norm().div(2);
		brightness = y*200+100;
		if(brightness<=0)brightness = 0;
		var green = 20 + brightness, blue = (brightness - 2.0) * (brightness - 2.0) / 256.0 + 10.0;
		renderer.sunColor = 0xFFFF00 + Math.round(green>255?255:green)*0x100 + Math.round(blue>255?255:blue);
		renderer.light4Density = new Vec3(1,green/255,blue/255).mul(renderer.ambientLight*1.2);
		return 0;
	};
	sun.position = renderer.light4.mul(sundistance,false);
	renderer.light4.mul(-renderer.ambientLight*1.2);
	sun.color = 0xFFFF00 + brightness*0x000001;
	sun.lookAt(new Vec4(0,0,0,0));
	sun.position.add(renderer.camera4.position)
}
Planet4.prototype.setTime = function(time){
	//unit of the time is year;
	this.time.southernTime = (this.initialTime.southernTime + 24*time*this.sun.WEPeriod) % 24;
	this.time.northernTime = (this.initialTime.northernTime + 24*time*this.sun.MGPeriod) % 24;
	this.time.season = (this.initialTime.season + time*360)%360;
}
Planet4.prototype.addGUI = function(gui){
	this.gui = gui;
	var tr = function(i){
		if(window.location.search.indexOf("en")!=-1)return i;
		return {
			"Sun":"太阳",
			"Latitude":"纬度",
			"southernTime":"南方时",
			"northernTime":"北方时",
			"Season":"季节",
			"SouthernTropic":"南回归线",
			"NorthernTropic":"北回归线",
			"M-G Period":"阴阳自转周期",
			"W-E Period":"东西自转周期",
			"sunAngle":"太阳高度角",
			"sunLatitude":"直射点纬度",
		}[i]||i;
	};
	var p = this.gui.addFolder(tr("Sun"));
	p.add(this.location,"NS",0,90).name(tr("Latitude"));
	p.add(this.time,"southernTime",0,24).name(tr("southernTime"));
	p.add(this.time,"northernTime",0,24).name(tr("northernTime"));
	p.add(this.time,"season",0,360).name(tr("Season"));
	p.add(this.sun,"southernTropic",0,90).name(tr("SouthernTropic"));
	p.add(this.sun,"northernTropic",0,90).name(tr("NorthernTropic"));
	p.add(this.sun,"MGPeriod",0).name(tr("M-G Period"));
	p.add(this.sun,"WEPeriod",0).name(tr("W-E Period"));
	p.add(this.guiData,"sunAngle",-90,90).name(tr("sunAngle"));
	p.add(this.guiData,"sunNS",0,90).name(tr("sunLatitude"));
	p.open();
}