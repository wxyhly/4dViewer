Phy4d.prototype.GJK = {
	test : function (c1O,c2O){
		var offset = new Vec4(0.00014,-0.00022,0.00017,-0.00021);
		var list = [[],[]];
		var c1 = c1O.phyGeom;
		var c2 = c2O.phyGeom;
		var c1r = c1O.getRotation(true);
		var c2r = c2O.getRotation(true);
		var c1o = c1O.getPosition(true);
		var c2o = c2O.getPosition(true);
		for(var v1 of c1.mesh.V){
			list[0].push(c1r[0].mul(v1,false).mul(c1r[1]).add(c1o));
		}
		for(var v2 of c2.mesh.V){
			list[1].push(c2r[0].mul(v2,false).mul(c2r[1]).add(c2o).add(offset));
		}
		var result = this._O2Convex(list);
		return result;
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
				return this._convexhull(list,simplex);
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
		var Pa = null, Pb = null;
		var sup = -Infinity;
		for(var p in list[0]){
			var P = list[0][p];
			var nsup = P.dot(support);
			if(nsup>sup){
				pa = P;
				Pa = p;
				sup = nsup;
			}
		}
		var sub = Infinity;
		for(var p in list[1]){
			var P = list[1][p];
			var nsub = P.dot(support);
			if(nsub<sub){
				pb = P;
				Pb = p;
				sub = nsub;
			}
		}
		if(check!==false && sup-sub<0){//O is outside
			return null;//terminer
		}
		var sV = pa.sub(pb,false);
		//record infomation to be used in finding contact point
		sV.a = Pa;
		sV.b = Pb;
		return sV;
	},
	_convexhull : function(list,simplex,normals){
		var hull = new Mesh4({
			V:simplex,
			E:[[0,1],[0,2],[1,2],[0,3],[1,3],[0,4],[1,4],[2,3],[2,4],[3,4]],
			F:[[0,1,2],[0,3,4],[0,5,6],[1,3,7],[1,5,8],[2,4,7],[2,6,8],[3,5,9],[4,6,9],[7,8,9]],
			C:[[0,1,3,5],[0,2,4,6],[1,2,7,8],[3,4,7,9],[5,6,8,9]]
		});
		var N;
		var foo = false;
		var threshold = 0.0000000000001;
		var center = hull.V.reduce((a,b)=>a.add(b,false)).div(5);
		hull.C.forEach((c)=>calculeInfo(hull,c));
		for(var f of hull.F){
			f.seenTime = 0;
		}
		for(var e of hull.E){
			e.seenTime = 0;
		}
		for(var v of hull.V){
			v.seenTime = 0;
		}
		var minC = null;
		var minT = Infinity;
		for(var c of hull.C){
			if(c.info.t<minT){
				minC = c;
				minT = c.info.t;
			}
		}
		while(true){
			var nv = this._support(list,minC.info.normal,false);
			if(!nv) continue;
			var inside = true;
			//check whether v is inside
			for(var c of hull.C){
				var cn = c.info.normal;
				var ct = c.info.t;
				if(nv.dot(cn)>=ct){
					inside = false;
					c.remove = true;
					for(var F of c){
						var f = hull.F[F];
						f.seenTime++;
					}
				}
			}
			if(inside) return minC;
			for(var f of hull.F){
				if(f.seenTime!=1) continue;
				for(var E of f){
					var e = hull.E[E];
					e.seenTime = 1;
					for(var V of e){
						var v = hull.V[V];
						v.seenTime = 1;
					}
				}
			}
			var Iv = hull.V.length;
			var Ie = hull.E.length;
			var If = hull.F.length;
			hull.V.push(nv);
			var ecount = Ie;
			var fcount = If;
			for(var V in hull.V){
				var v = hull.V[V];
				V = Number(V);
				if(v.seenTime != 1) continue;
				var ne = [Iv,V];
				v.E = ecount++;
				hull.E.push(ne);
			}
			for(var E in hull.E){
				var e = hull.E[E];
				E = Number(E);
				if(e.seenTime != 1) continue;
				var nf = [E,hull.V[e[0]].E, hull.V[e[1]].E];
				e.F = fcount++;
				hull.F.push(nf);
			}
			
			for(var F in hull.F){
				var f = hull.F[F];
				if(f.seenTime != 1) continue;
				F = Number(F);
				var nc = [F,hull.E[f[0]].F, hull.E[f[1]].F,hull.E[f[2]].F];
				if(calculeInfo(hull,nc)){
					hull.C.push(nc);
				}
			}
			for(var C=0; C<hull.C.length; C++){
				var c = hull.C[C];
				if(c.remove){
					hull.C.splice(C,1);
					C--;
				}else{
					for(var F of c){
						hull.F[F].seenTime = -1;
					}
				}
			}
			for(var f of hull.F){
				if(f.seenTime != -1) continue;
				for(var E of f){
					hull.E[E].seenTime = -1;
				}
			}
			for(var e of hull.E){
				if(e.seenTime != -1) continue;
				for(var V of e){
					hull.V[V].seenTime = -1;
				}
			}
			var mapreduce = Mesh4._util.mapreduce;
			var mapV = [];
			for(var V in hull.V){
				V = Number(V);
				var v = hull.V[V];
				mapV.push((v.seenTime==-1)?V:-1);
				v.seenTime = 0;
				delete v.E;
			}
			mapreduce(hull.V,mapV,hull.E);
			var mapE = [];
			for(var E in hull.E){
				E = Number(E);
				var e = hull.E[E];
				mapE.push((e.seenTime==-1)?E:-1);
				e.seenTime = 0;
				delete e.F;
			}
			mapreduce(hull.E,mapE,hull.F);
			var mapF = [];
			for(var F in hull.F){
				F = Number(F);
				var f = hull.F[F];
				mapF.push((f.seenTime==-1)?F:-1);
				f.seenTime = 0;
			}
			mapreduce(hull.F,mapF,hull.C);
			nminC = null;
			nminT = Infinity;
			for(var c of hull.C){
				if(c.info.t<nminT){
					nminC = c;
					nminT = c.info.t;
				}
			}
			if(nminT>=minT) return minC;
			minT = nminT;
			minC = nminC;
		}
		function calculeInfo(hull,c){
			var cv = null, cn = null;
			if(!c.info) c.info = {};
			if(!c.info.V){
				c.info.V = new Set();
				for(var F of c){
					var f = hull.F[F];
					for(var E of f){
						var e = hull.E[E];
						var v1 = hull.V[e[0]];
						var v2 = hull.V[e[1]];
						c.info.V.add(v1);
						c.info.V.add(v2);
					}
				}
				c.info.V = [...c.info.V];
			}
			if(c.info.normal) return 0;
			for(var j=0; j<4; j++){//4 vertices of that cell
				if(!cv) {
					cv = c.info.V[j];
				}else if(!cn){
					cn = c.info.V[j].sub(cv,false);
				}else{
					cn = cn.cross(c.info.V[j].sub(cv,false));
				}
			}
			cn.norm();
			var ct = cv.dot(cn);
			var temp = cv.sub(center,false).dot(cn);
			if(temp!=0){
				if(temp<0){
					cn.sub();
					ct = -ct;
				}
			}else{
				return false;//this face is degraded, it will be aborted later
			}
			c.info.normal = cn;
			c.info.t = ct;
			return true;
		}
	}
}