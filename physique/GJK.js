Phy4d.prototype.GJK = {
	test : function (c1O,c2O){
		var offset = new Vec4(0.00014,-0.00022,0.00017,-0.00021);
		var list = [[],[]];
		var c1 = c1O.phyGeom;
		var c2 = c2O.phyGeom;
		for(var v1 of c1.mesh.V){
			list[0].push(c1.r[0].mul(v1,false).mul(c1.r[1]).add(c1.o));
		}
		for(var v2 of c2.mesh.V){
			list[1].push(c2.r[0].mul(v2,false).mul(c2.r[1]).add(c2.o).add(offset));
		}
		//var list = this._minkowskiDiff(c1O,c2O);
		var result = this._O2Convex(list);
		if(!result||!result.n) return 0;
		list[0].sort((a,b)=>(a.sub(b,false).dot(result.n)));
		list[1].sort((a,b)=>(-a.sub(b,false).dot(result.n)));
		if(list[0][0].sub(list[0][1],false).dot(result.n)> -list[1][0].sub(list[1][1],false).dot(result.n)){
			result.o = list[0][0];
		}else{
			result.o = list[1][0];
		}
		return result;
	},
	_minkowskiDiff : function (c1O,c2O){
		var c1 = c1O.phyGeom;
		var c2 = c2O.phyGeom;
		
		//var worldv1 = [];
		//var worldv2 = [];
		var list = [];
		for(var v1 of c1.mesh.V){
			var worldv1 = c1.r[0].mul(v1,false).mul(c1.r[1]).add(c1.o);
			for(var v2 of c2.mesh.V){
				var worldv2 = c2.r[0].mul(v2,false).mul(c2.r[1]).add(c2.o).add(offset);
				list.push(worldv1.sub(worldv2,false));
			}
		}
		return list;
	},
	_O2Convex : function (list){
		var supports = [new Vec4(1),new Vec4(-1),new Vec4(0,1),new Vec4(0,0,1)];
		var simplex = supports.map((s)=>this._support(list,s));
		if(simplex.indexOf(null)!=-1) return null;
		var norm = new Vec4(0,0,0,1);//supports[1].cross(supports[2]).cross(supports[3]);//.norm();
		if(simplex[0].dot(norm)>0){
			norm.sub();
		}
		var newV = this._support(list,norm);
		if(!newV)return null;
		simplex.push(newV);
		var iterations = 10;
		while(iterations--){
			var foundInside = true;
			var norms = new Array(5);
			for(var i=0; i<5; i++){//5 cells of Simplex
				var cv, cn;
				cv = null;
				cn = null;
				for(var j=0; j<5; j++){//4 vertices of that cell
					if(j==i)continue;
					if(!cv) {
						cv = simplex[j];
					}else if(!cn){
						cn = simplex[j].sub(cv,false);
					}else{
						cn = cn.cross(simplex[j].sub(cv,false));
					}
				}
				//C: (x - cv).cn == 0
				var ct = cv.dot(cn);
				if(simplex[i].sub(cv,false).dot(cn) > 0){//garante normal toward outside
					cn.sub();
					ct = -ct;
				}
				if(ct < 0){//no contain O
					foundInside = false;
					break;
				}
				norms[i] = {n:cn,t:ct};//for estimating the closest cell
			}
			if(foundInside){
				var dirs = [
					new Vec4(-1),new Vec4(1),new Vec4(0,-1),new Vec4(0,1),new Vec4(0,0,-1),new Vec4(0,0,1),new Vec4(0,0,0,-1),new Vec4(0,0,0,1),
					new Vec4(1,1,1,1),
					new Vec4(1,1,1,-1),
					new Vec4(1,1,-1,1),
					new Vec4(1,1,-1,-1),
					new Vec4(1,-1,1,1),
					new Vec4(1,-1,1,-1),
					new Vec4(1,-1,-1,1),
					new Vec4(1,-1,-1,-1),
					new Vec4(-1,1,1,1),
					new Vec4(-1,1,1,-1),
					new Vec4(-1,1,-1,1),
					new Vec4(-1,1,-1,-1),
					new Vec4(-1,-1,1,1),
					new Vec4(-1,-1,1,-1),
					new Vec4(-1,-1,-1,1),
					new Vec4(-1,-1,-1,-1),
				];
				var R = {t:Infinity};
				for(var d of dirs){
					var result = this._findNearestDistProxmately(list,simplex,norms,d);
					if(result.t<R.t){
						R = result;
					}
				}
				return R;
			}
			var newV = this._support(list,cn);
			if(!newV)return null;
			simplex[i] = newV;
		}
		return 0;
	},
	_findNearestDistProxmately : function(list,simplex,norms,direction){
		var prevI = 6;
		var iterations = 6;
		simplex = [simplex[0],simplex[1],simplex[2],simplex[3],simplex[4]];
		norms = [norms[0],norms[1],norms[2],norms[3],norms[4]];
		norms[0].n.norm();
		norms[1].n.norm();
		norms[2].n.norm();
		norms[3].n.norm();
		norms[4].n.norm();
		while(iterations--){
			var d = Infinity;
			var iMax = null;
			for(var i in norms){
				var nd = norms[i].n.dot(direction);
				if(nd<=d){
					d = nd;
					iMax = i;
				}
			}
			var NORM = norms[iMax];
			var newV = this._support(list,NORM.n,false);//false: dont check if(!newV)return null;
			//if(!newV)return null;
			simplex[iMax] = newV;
			//console.log("hkm "+iMax+", "+d);
			for(var i=0; i<5; i++){//5 cells of Simplex
				var cv, cn;
				cv = null;
				cn = null;
				for(var j=0; j<5; j++){//4 vertices of that cell
					if(j==i)continue;
					if(!cv) {
						cv = simplex[j];
					}else if(!cn){
						cn = simplex[j].sub(cv,false);
					}else{
						cn = cn.cross(simplex[j].sub(cv,false));
					}
				}
				if(cn.len(false)<1e-10){//on arrive the border, termier
					NORM.n.norm();
					console.log("trouvee:"+iterations);
					return NORM;
				}
				//C: (x - cv).cn == 0
				cn.norm();
				var ct = cv.dot(cn);
				if(simplex[i].sub(cv,false).dot(cn) > 0){//garante normal toward outside
					cn.sub();
					ct = -ct;
				}
				norms[i] = {n:cn,t:ct};
			}
		}
		console.log("zkle");//return this._convexhull(list,simplex,norms);//不管用的话就用凸包检测
		return {t:Infinity};
	},
	_findNearestDist : function(list,simplex,norms){
		var prevI = 6;
		var iterations = 10;
		while(iterations--){
			var d = Infinity;
			var iMax = null;
			for(var i in norms){
				//if(i==prevI)continue;
				norms[i].t/=norms[i].n.len();
				console.log(norms[i].t);
				if(norms[i].t<=d && norms[i].t>0){
					d = norms[i].t;
					iMax = i;
				}
			}
			var NORM = norms[iMax];
			var newV = this._support(list,NORM.n,false);//false: dont check if(!newV)return null;
			//if(!newV)return null;
			simplex[iMax] = newV;
			console.log("hkm "+iMax+", "+d);
			for(var i=0; i<5; i++){//5 cells of Simplex
				var cv, cn;
				cv = null;
				cn = null;
				for(var j=0; j<5; j++){//4 vertices of that cell
					if(j==i)continue;
					if(!cv) {
						cv = simplex[j];
					}else if(!cn){
						cn = simplex[j].sub(cv,false);
					}else{
						cn = cn.cross(simplex[j].sub(cv,false));
					}
				}
				if(cn.len(false)<1e-10){//on arrive the border, termier
					NORM.n.norm();
					console.log( iterations);
					return NORM;
				}
				/*if(i == iMax){
					prevI = i;
					continue;
				}*/
				//C: (x - cv).cn == 0
				var ct = cv.dot(cn);
				if(simplex[i].sub(cv,false).dot(cn) > 0){//garante normal toward outside
					cn.sub();
					ct = -ct;
				}
				norms[i] = {n:cn,t:ct};
			}
		}
		console.log("zkle");//return this._convexhull(list,simplex,norms);//不管用的话就用凸包检测
	},
	_support : function (list,support,check){
		var pa = null, pb = null;
		var sup = -Infinity;
		for(var P of list[0]){
			var nsup = P.dot(support);
			if(nsup>sup){
				pa = P;
				sup = nsup;
			}
		}
		var sub = Infinity;
		for(var P of list[1]){
			var nsub = P.dot(support);
			if(nsub<sub){
				pb = P;
				sub = nsub;
			}
		}
		if(check!==false && sup-sub<0){//O is outside
			return null;//terminer
		}
		return pa.sub(pb,false);
	},
	_convexhull : function(list,simplex,normals){
		var center = simplex.reduce((a,b)=>a.add(b,false)).div(simplex.length);
		var sie = false;
		var listConvexs = [];
		var sc = [
			[simplex[0],simplex[1],simplex[2],simplex[3], normals[4],[3,2,1,0]],
			[simplex[0],simplex[1],simplex[2],simplex[4], normals[3],[6,5,4,0]],
			[simplex[0],simplex[1],simplex[4],simplex[3], normals[2],[8,7,1,4]],
			[simplex[0],simplex[4],simplex[2],simplex[3], normals[1],[9,2,7,5]],
			[simplex[4],simplex[1],simplex[2],simplex[3], normals[0],[3,9,8,6]]
		];//tetrahedral cells
		var border = [];
		while(sc.length){
			sc.sort((a,b)=>(a[4].t-b[4].t));
			var c = sc.shift();
				
			
			var newV = this._support(list,c[4].n,false);
			var borderFlag = false;
			var dot = newV.sub(c[0],false).dot(c[4].n);
			console.log(dot);
			var toRemove = [c];
			if(dot<0.001){
				borderFlag = true;
				border.push({V:c,n:c[4].n,t:c[4].t});
			}
			listConvexs.push(newV);
			var faceSeenTime = [];
			for(var s=0; s<sc.length; s++){
				if(newV.sub(sc[s][0],false).dot(sc[s][4].n)>0){
					for(var f of sc[s][5]){
						faceSeenTime[f] = (++faceSeenTime[f]) || 1;
					}
					toRemove.push(sc.splice(s,1));
					s--;
				}
			}
			if(sie) return "sie";
			if(borderFlag) continue;
			var cellPyramidedByFace = [];
			
			for(var tR of toRemove){
				if(faceSeenTime[tR[5][3]]==1)
					this._insertCell([tR[0],tR[1],tR[2],newV],sc,center,tR));
				if(faceSeenTime[tR[5][2]]==1)
					this._calculateNormalForCell([tR[0],tR[1],newV,tR[3]],center,tR,faceSeenTime));
				if(faceSeenTime[tR[5][1]]==1)
					this._calculateNormalForCell([tR[0],newV,tR[2],tR[3]],center,tR,faceSeenTime));
				if(faceSeenTime[tR[5][0]]==1)
					sc.unshift(this._calculateNormalForCell([newV,tR[1],tR[2],tR[3]],center,tR,faceSeenTime));
			}
		}
	},
	_insertCell: function(c,sc,center,pc,ft){
		
		var cv = null, cn = null;
		for(var j=0; j<4; j++){//4 vertices of that cell
			if(!cv) {
				cv = c[j];
			}else if(!cn){
				cn = c[j].sub(cv,false);
			}else{
				cn = cn.cross(c[j].sub(cv,false));
			}
		}
		//if(cn.len(false)<1e-10)continue;
		var ct = cv.dot(cn);
		if(ct<0){
			cn.sub();
			ct = -ct;
		}
		if(ct==0){
			var temp = center.dot(cn);
			if(temp!=0){
				if(temp>0){
					cn.sub();
					ct = -ct;
				}
			}else{return "sooor"}
		}
		c[4] = {n:cn,t:ct};
		for(var s of sc){
			if(Math.abs(s[4].t-c[4].t)<0.0001){
				if(s[4].n.sub(c[4].n).len(Infinity)<0.0001){
					return 0;
				}
			}
		}
		sc.push(c);
		return c;
	}
}