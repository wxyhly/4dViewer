/**Todd-Coxeter algorithm below from https://github.com/Syntopia/Polytopia**/
Mesh4._util.Table = function (name, genList) {
    this.name = name;
    this.genList = genList;
    this.rows = [];
    this.rowCosets = [];
    this.firstEmpty = [];
    this.lastEmpty = [];
    this.rowForCoset = new Map();
    this.firstNonClosed = 0;
}

Mesh4._util.Table.prototype = {
    constructor: Mesh4._util.Relations,
    getFirstNonClosed: function () {
        while (this.firstEmpty[this.firstNonClosed] == -1) {
            this.firstNonClosed++;
        }
        return this.firstNonClosed;
    },

    setAsCosetTable: function () {
        this.generatorCosetLookup = new Map();
    },

    setCosetEntry: function (cosetRow, g, newCoset) {
        this.rows[cosetRow][g] = newCoset;
        this.generatorCosetLookup.set((g << 20) + newCoset, cosetRow);
    },

    // Check whether the coset table has an entry for generator 'g', which points to 'coset'.
    findRowPointingToCoset: function (g, coset) {
        return this.generatorCosetLookup.get((g << 20) + coset);
    },


    addRow: function (coset) {
        this.rowCosets.push(coset);
        this.rowForCoset.set(coset, this.rowCosets.length - 1);
        this.rows.push(new Array(this.genList.length));

    },

    addRelationRow: function (coset) {
        if (this.isSubgroup) return;
        this.addRow(coset);
        var r = this.rows[this.rows.length - 1];
        r[r.length - 1] = coset;
        this.firstEmpty.push(0);
        this.lastEmpty.push(r.length - 2);
    },

    getCosetRow: function (coset) {
        return this.rowForCoset.get(coset);
    },

    set: function (row, col, value) {
        this.rows[row][col] = value;
        var closed = false;
        if (this.firstEmpty[row] == col) {
            if (this.rows[row][col + 1] == undefined) {
                this.firstEmpty[row] = col + 1;
            } else {
                this.firstEmpty[row] = -1;
                this.lastEmpty[row] = -1;
                closed = true;
            }
        }
        if (this.lastEmpty[row] == col) {
            if (col == 0) {
                throw "Unexpected";
            }
            if (this.rows[row][col - 1] == undefined) {
                this.lastEmpty[row] = col - 1;
            } else {
                this.firstEmpty[row] = -1;
                this.lastEmpty[row] = -1;
                closed = true;
            }
        }

        return closed;
    }
}

Mesh4._util.parseString = function(generatorMap, string) {
    var rules = string.split(",");
    var list = [];
    rules.forEach(function (r) {
        var rel = [];
        for (var i = 0; i < r.length; i++) {
            var genIndex = generatorMap.get(r[i]);
            rel.push(genIndex);
        }
        list.push(rel);
    });
    return list;
}

Mesh4._util.Relations = function (relationString) {
    relationString = relationString.replace(/\s/g, ''); // strip whitespace
    // console.log("Relations:", relationString);

    this.generators = [];
    var self = this;

    var set = new Set();
    var stripped = relationString.replace(/,/g, '');
    for (var i = 0; i < stripped.length; i++) set.add(stripped[i]);
    set.forEach(function (v) { self.generators.push(v) });


    this.genMap = new Map();
    for (var i = 0; i < this.generators.length; i++) {
        this.genMap.set(this.generators[i], i);
    }

    //	console.log("Generators:", this.generators);

    this.list = Mesh4._util.parseString(this.genMap, relationString);
    //this.printRelations();
}

Mesh4.ToddCoxeter = function (relationString, subgroupString) {
    relationString = relationString.replace(/;/g, ',');

    this.rels = new Mesh4._util.Relations(relationString);
    var gs = [];
    for (var i = 0; i < this.rels.generators.length; i++) gs.push(i);
    this.cosetTable = new Mesh4._util.Table("Coset", gs);
    this.cosetTable.setAsCosetTable();
    this.cosetTable.addRow(0);

    this.newInformation = [];

    this.relationTables = [];

    for (var i = 0; i < this.rels.list.length; i++) {
        var t = new Mesh4._util.Table("R" + i, this.rels.list[i]);
        t.addRelationRow(0);
        this.relationTables.push(t);
    }

    if (subgroupString != undefined) {
        subgroupString = subgroupString.replace(/;/g, ',');
        var subgroupList = Mesh4._util.parseString(this.rels.genMap, subgroupString);

        for (var i = 0; i < subgroupList.length; i++) {

            var subgroup = subgroupList[i];
            if (subgroup.length == 1) {
                // No need to create a subgroup table - we will just fill in the coset table to begin with
                this.cosetTable.rows[0][subgroup[0]] = 0;
            } else {
                var t = new Mesh4._util.Table("Subgroup " + i, subgroup);
                t.addRelationRow(0);
                t.isSubgroup = true;
                this.relationTables.push(t);
            }
        }
    }
}

Mesh4.ToddCoxeter.prototype = {
    constructor: Mesh4.ToddCoxeter,

    addRow: function (coset) {
        this.rowCosets.push(coset);
        this.rows.push(new Array(this.genList.length));
    },

    solve: function () {
        var startTime = Date.now();

        var doIteration = this.initSolver();
        while (doIteration()) { };

        console.log("Elapsed: " + (Date.now() - startTime) + " ms. Cosets: " + this.cosetTable.rows.length);
        this.cosetCounts = this.cosetTable.rows.length;
        return this.cosetCounts;
    },

    initSolver: function () {
        var cosetCounter = 1; // Initially we have one coset.
        var self = this;

        var firstEmptyCosetEntryX = 0;

        function firstEmptyCosetEntry() {
            for (var row = firstEmptyCosetEntryX; row < self.cosetTable.rows.length; row++) {
                var coset = self.cosetTable.rowCosets[row];
                for (var col = 0; col < self.cosetTable.rows[row].length; col++) {
                    if (self.cosetTable.rows[row][col] == undefined) {
                        firstEmptyCosetEntryX = row;

                        return [row, coset, col];
                    }
                }
            }
            return undefined;
        }

        function updateRelationTable2() {
            for (var rt of self.relationTables) {
				var l = rt.rows.length;
                for (var row = rt.getFirstNonClosed(); row < l; row++) {

                    var changes = true;

                    while (changes) {
                        changes = false;

                        // Check from left
                        var firstEmpty = rt.firstEmpty[row];
                        if (firstEmpty == -1) continue;

                        //if (rt.rows[row][firstEmpty] !== undefined) throw "Inconsistent state";
						var rtrow = rt.rows[row];
                        var coset = (firstEmpty == 0 ? rt.rowCosets[row] : rtrow[firstEmpty - 1]);
                        var gen = rt.genList[firstEmpty];

                        var cTableRow = self.cosetTable.getCosetRow(coset);
                        var newCoset = self.cosetTable.rows[cTableRow][gen];
                        if (newCoset != undefined) {
                            var closed = rt.set(row, firstEmpty, newCoset);
                            if (closed) {
                                // New information: newCoset * rt.genList[firstEmpty+1] = rt.rows[row][firstEmpty+1]
                                self.newInformation.push([newCoset, rt.genList[firstEmpty + 1], rtrow[firstEmpty + 1]]);
                            } else {
                                changes = true;
                            }
                        }

                        // Check from right
                        if (rt.lastEmpty[row] == -1) continue;
                        var lastEmpty = rt.lastEmpty[row];

                        var newCoset = rtrow[lastEmpty + 1];
                        var gen = rt.genList[lastEmpty + 1];


                        var ctRow = self.cosetTable.findRowPointingToCoset(gen, newCoset);
                        if (ctRow != undefined) {
                            var closed = rt.set(row, lastEmpty, self.cosetTable.rowCosets[ctRow]);
                            if (closed) {
                                var coset = (lastEmpty > 0 ? rtrow[lastEmpty - 1] : rt.rowCosets[row]);
                                self.newInformation.push(
                                    [coset, rt.genList[lastEmpty], self.cosetTable.rowCosets[ctRow]]);

                            } else {
                                changes = true;
                            }
                        }

                    }
                }
            }
        }

        function addCoset(newCoset) {
            for (var i = 0; i < self.relationTables.length; i++) {
                var rt = self.relationTables[i];
                rt.addRelationRow(newCoset);
            }
            self.cosetTable.addRow(newCoset);
        }

        var f = function doIteration() {
            if (cosetCounter > 15000) {
                return false;
            }
            if (self.newInformation.length == 0) {
                // Find first empty entry in coset table.
                var entry = firstEmptyCosetEntry();
                if (entry == undefined) return false;

                var newCoset = cosetCounter++;
                var row = entry[0];
                var coset = entry[1];
                var g = entry[2];
                self.cosetTable.setCosetEntry(row, g, newCoset);
                //this.cosetTable.rows[row][g] = newCoset;

                addCoset(newCoset);

                // The reverse relation must be present as well.
                var newCosetRow = self.cosetTable.getCosetRow(newCoset);

                //this.cosetTable.rows[newCosetRow][g] = coset;
                self.cosetTable.setCosetEntry(newCosetRow, g, coset);

            } else {
                while (self.newInformation.length > 0) {
                    var i = self.newInformation.pop();

                    // coset*g = newCoset
                    var coset = i[0];
                    var g = i[1];
                    var newCoset = i[2];

                    var cosetRow = self.cosetTable.getCosetRow(coset);
                    var val = self.cosetTable.rows[cosetRow][g];

                    if (val == undefined) {
                        //this.cosetTable.rows[cosetRow][g] = newCoset;
                        self.cosetTable.setCosetEntry(cosetRow, g, newCoset);

                    }

                    // per symmetry: newCoset*g = coset
                    var cosetRow = self.cosetTable.getCosetRow(newCoset);
                    var val = self.cosetTable.rows[cosetRow][g];
                    if (val == undefined) {
                        //this.cosetTable.rows[cosetRow][g] = coset;
                        self.cosetTable.setCosetEntry(cosetRow, g, coset);

                    }
                }
            }

            updateRelationTable2();

            return true;
        }
        return f;
    },
	getIterationForCoset: function (cosetIndex) {
        // Note: representatives are stored in reverse order, e.g. for generators r,g,b, the list [0,1,2,2] means bbrgH
        if (this.cosetTable.itReps == undefined) {
            this.cosetTable.itReps = new Array(this.cosetTable.rows.length);
            this.cosetTable.itReps[0] = [];

            for (var i = 0; i < this.cosetTable.rows.length; i++) {
                if (this.cosetTable.itReps[i] == undefined) { throw "unexpected"; }

                for (var j = 0; j < this.cosetTable.rows[i].length; j++) {
                    var coset = this.cosetTable.rows[i][j];
                    if (this.cosetTable.itReps[coset] == undefined) {
                        this.cosetTable.itReps[coset] = [i,this.rels.generators[j]];
                    }
                }
            };
        };
        return this.cosetTable.itReps[cosetIndex];
    },
    // Return first element in each coset.
    getRepresentiveForCoset: function (cosetIndex) {
        // Note: representatives are stored in reverse order, e.g. for generators r,g,b, the list [0,1,2,2] means bbrgH
        if (this.cosetTable.reps == undefined) {
            this.cosetTable.reps = new Array(this.cosetTable.rows.length);
            this.cosetTable.reps[0] = [];

            for (var i = 0; i < this.cosetTable.rows.length; i++) {
                if (this.cosetTable.reps[i] == undefined) { throw "unexpected"; }

                for (var j = 0; j < this.cosetTable.rows[i].length; j++) {
                    var coset = this.cosetTable.rows[i][j];
                    if (this.cosetTable.reps[coset] == undefined) {
                        var newRep = this.cosetTable.reps[i].slice(0);
                        newRep.push(j);

                        this.cosetTable.reps[coset] = newRep;
                    }
                }
            };
        };
        return this.cosetTable.reps[cosetIndex];
    },

    getRepresentivesForCosets: function () {
        var l = [];
        for (var i = 0; i < this.cosetTable.rows.length; i++) {
            l.push(this.getRepresentiveForCoset(i));
        }
        return l;
    },


    // Note: representatives are stored in reverse order, e.g. for generators r,g,b, the list [0,1,2,2] means bbrgH
    getCosetForRepresentive: function (list, initial) {
        var coset = (initial == undefined ? 0 : initial);
        for (var i = 0; i < list.length; i++) {
            coset = this.cosetTable.rows[coset][list[i]];
        }
        return coset;
    },

    getCosetsForRepresentives: function (list) {
        var cosetList = [];
        for (var i = 0; i < list.length; i++) {
            cosetList.push(this.getCosetForRepresentive(list[i]));
        }
        return cosetList;
    }
    ,

    getCosetCounts: function () {
        return this.cosetCounts;
    },

    // If this instance use subset of symbols, get a map from subset to containing set.
    translate: function (listOfWords, newToddCoxeter) {
        var mapping = new Array(this.rels.generators.length);
        for (var i = 0; i < this.rels.generators.length; i++) {
            var newIndex = newToddCoxeter.rels.genMap.get(this.rels.generators[i]);
            if (newIndex == undefined) throw "Failed to find symbol " + this.rels.generators[i] + " in larger set";
            mapping[i] = newIndex;
        }

        var out = new Array(listOfWords.length);
        for (var i = 0; i < listOfWords.length; i++) {
            var newWord = new Array(listOfWords[i].length);
            for (var j = 0; j < listOfWords[i].length; j++)
                newWord[j] = mapping[listOfWords[i][j]];
            out[i] = newWord;
        }
        return out;
    },

    apply: function (wordList, cosetList) {
        var out = new Array(wordList.length);
        for (var i = 0; i < wordList.length; i++) {
            var transformedCosetList = new Array(cosetList.length);
            for (var j = 0; j < cosetList.length; j++) {
                transformedCosetList[j] = this.getCosetForRepresentive(wordList[i], cosetList[j]);
            }
            out[i] = transformedCosetList;
        }
        return out;
    },

    // Find vertices
    getStructure: function () {

        var vertices = 0;
        var edges = 0;
        var faces = 0;
        var cells = 0;
		var is4D = this.cosetTable.extraColumns.length == 4;

        for (var i = 0; i < this.cosetTable.extraColumns[0].length; i++) {
            vertices = Math.max(this.cosetTable.extraColumns[0][i] + 1, vertices);
            edges = Math.max(this.cosetTable.extraColumns[1][i] + 1, edges);
            faces = Math.max(this.cosetTable.extraColumns[2][i] + 1, faces);
            if(is4D){
				cells = Math.max(this.cosetTable.extraColumns[3][i] + 1, cells);
			}
        }

        var vxs = new Array(vertices);

        // Vertices and reflection matrices
        var current = 0;
        for (var i = 0; i < this.cosetTable.extraColumns[0].length; i++) {
            var vertex = this.cosetTable.extraColumns[0][i];
            if (vxs[vertex] == undefined) {
                vxs[vertex] = this.VGroup.getIterationForCoset(vertex);
                // console.log("Setting vertex " + vertex + " to " + vxs[vertex]);
            }
        }

        var edgeList = new Array(edges);
        var faceList = new Array(faces);
		var cellList = null;
        if(is4D) cellList = new Array(cells);

        // Edges and faces
        for (var i = 0; i < this.cosetTable.extraColumns[1].length; i++) {
            var v = this.cosetTable.extraColumns[0][i];
            var e = this.cosetTable.extraColumns[1][i];
            var f = this.cosetTable.extraColumns[2][i];
            if(is4D)  var c = this.cosetTable.extraColumns[3][i];
            if (edgeList[e] == undefined) edgeList[e] = [];
            if (edgeList[e].indexOf(v) == -1) edgeList[e].push(v);

            if (faceList[f] == undefined) faceList[f] = [];
            if (faceList[f].indexOf(e) == -1) faceList[f].push(e);
			
            if(is4D){
				if (cellList[c] == undefined) cellList[c] = [];
				if (cellList[c].indexOf(f) == -1) cellList[c].push(f);
			}
        }
        return { vertexOperators: vxs, edgeList: edgeList, faceList: faceList, cellList: cellList};
    }
}

Mesh4.regularPolychoron = function(n){
	var rg, gb, ba;
	switch(n){
		case 5: rg = gb = ba = 3;
		break;
		case 8: rg = 3; gb = 3; ba = 4;
		break;
		case 16: rg = 4; gb = 3; ba = 3;
		break;
		case 24: rg = 3; gb = 4; ba = 3;
		break;
		case 120: rg = 3; gb = 3; ba = 5;
		break;
		case 600: rg = 5; gb = 3; ba = 3;
		break;
		default:
		throw "regularPolychoron "+n+"-cell doesn't exist! Try 5, 8, 16, 24, 120, 600 instead.";
	}
	var structure = Mesh4._util.getCoxeterGroup4(rg,gb,ba).getStructure();
	var c1 = Math.cos(Math.PI/rg),
		c2 = Math.cos(Math.PI/gb),
		c3 = Math.cos(Math.PI/ba);
	var c = c1, s = Math.sin(Math.PI/rg);
	var y = c2/s, z = c3;
	var t = Math.sqrt(1-y*y-z*z);
	var r = new Vec4(1,0,0,0),
	 	g = new Vec4(c,s,0,0),
		b = new Vec4(0,y,z,t),
		a = new Vec4(0,0,1,0);
	var vxs = structure.vertexOperators;
	var V = new Array(vxs.length);
	V[0] = r.cross(g,false).cross(b).norm();
	var Rgxx = 1-2*c*c, Rgxy = -2*c*s, Rgyy = 1-2*s*s;
	var Rbyy = 1-2*y*y, Rbzz = 1-2*z*z, Rbtt = 1-2*t*t; 
	var Rbyz = -2*y*z, Rbzt = -2*z*t, Rbyt = -2*y*t; 
	for(var i=1; i<vxs.length; i++){//step by step reflections
		var v = V[vxs[i][0]];//prev vertex
		V[i] = v.clone();
		switch(vxs[i][1]){
			case "r":
				V[i].x = -V[i].x;
			break;
			case "g":
				V[i].x = Rgxx*v.x+Rgxy*v.y;
				V[i].y = Rgxy*v.x+Rgyy*v.y;
			break;
			case "b":
				V[i].y = Rbyy*v.y+Rbyz*v.z+Rbyt*v.t;
				V[i].z = Rbyz*v.y+Rbzz*v.z+Rbzt*v.t;
				V[i].t = Rbyt*v.y+Rbzt*v.z+Rbtt*v.t;
			break;
			case "a":
				V[i].z = -V[i].z;
			break;
		}
	}
	return new Mesh4({
		V: V,
		E: structure.edgeList,
		F: structure.faceList,
		C: structure.cellList
	});
}

Mesh4._util.getCoxeterGroup4 = function(rgPower, gbPower, baPower) {
	rbPower = raPower = gaPower = 2;
    function copyString(string, copies) {
        var s = "";
        for (var i = 0; i < copies; i++) {
            s += string;
        }
        return s;
    }

    function findSub(subgroupRelation, subgroupGenerators, name) {
        var tc = new Mesh4.ToddCoxeter(subgroupRelation);
        var total = tc.solve();
        var subgroupMembers = freeGroup.getCosetsForRepresentives(tc.translate(tc.getRepresentivesForCosets(), freeGroup));

        var tc = new Mesh4.ToddCoxeter(relations, subgroupGenerators);
        var total = tc.solve();

        var cosetActions = tc.translate(tc.getRepresentivesForCosets(), freeGroup);

        var subsets = freeGroup.apply(cosetActions, subgroupMembers);

        var vLabel = new Array(tc.getCosetCounts());
        for (var i = 0; i < subsets.length; i++) {
            for (var j = 0; j < subsets[i].length; j++) {
                vLabel[subsets[i][j]] = i;
            }
        }
		if(name == "V") freeGroup.VGroup = tc;
        return vLabel;
    }
	var ra = copyString("ra", raPower),
		rg = copyString("rg", rgPower),
		rb = copyString("rb", rbPower),
		gb = copyString("gb", gbPower),
		ga = copyString("ga", gaPower),
		ba = copyString("ba", baPower);

    var relations = ra + "," + rb + "," + rg + "," + gb + "," + ga + "," + ba;
    var freeGroup = new Mesh4.ToddCoxeter(relations);
	var total = freeGroup.solve();
	freeGroup.cosetTable.extraColumns = [];
	freeGroup.cosetTable.extraColumns.push(findSub(rb + "," + rg + "," + gb, "r,g,b", "V"));
	freeGroup.cosetTable.extraColumns.push(findSub(ra + "," + rg + "," + ga, "r,g,a", "E"));
	freeGroup.cosetTable.extraColumns.push(findSub(rb + "," + ba + "," + ra, "r,b,a", "F"));
	freeGroup.cosetTable.extraColumns.push(findSub(ba + "," + ga + "," + gb, "g,b,a", "C"));

    return freeGroup;
}

Mesh3.regularPolyhedron = function(n){
	var rg, gb;
	switch(n){
		case 4: rg = gb = 3;
		break;
		case 6: rg = 3; gb = 4;
		break;
		case 8: rg = 4; gb = 3;
		break;
		case 12: rg = 3; gb = 5;
		break;
		case 20: rg = 5; gb = 3;
		break;
		default:
		throw "regularPolyhedron "+n+"-face doesn't exist! Try 4, 6, 8, 12, 20 instead.";
	}
	var structure = Mesh4._util.getCoxeterGroup3(rg,gb).getStructure();
	var c1 = Math.cos(Math.PI/rg),
		c2 = Math.cos(Math.PI/gb);
	var c = c1, s = Math.sin(Math.PI/rg);
	var y = c2/s;
	var z = Math.sqrt(1-y*y);
	var r = new Vec3(1,0,0),
	 	g = new Vec3(c,s,0),
		b = new Vec3(0,y,z);
	var vxs = structure.vertexOperators;
	var V = new Array(vxs.length);
	V[0] = r.cross(g,false).norm();
	var Rgxx = 1-2*c*c, Rgxy = -2*c*s, Rgyy = 1-2*s*s;
	var Rbyy = 1-2*y*y, Rbzz = 1-2*z*z, Rbyz = -2*y*z;
	for(var i=1; i<vxs.length; i++){//step by step reflections
		var v = V[vxs[i][0]];//prev vertex
		V[i] = v.clone();
		switch(vxs[i][1]){
			case "r":
				V[i].x = -V[i].x;
			break;
			case "g":
				V[i].x = Rgxx*v.x+Rgxy*v.y;
				V[i].y = Rgxy*v.x+Rgyy*v.y;
			break;
			case "b":
				V[i].y = Rbyy*v.y+Rbyz*v.z;
				V[i].z = Rbyz*v.y+Rbzz*v.z;
			break;
		}
	}
	return new Mesh3({
		V: V,
		E: structure.edgeList,
		F: structure.faceList
	});
}
Mesh4._util.getCoxeterGroup3 = function(rgPower, gbPower) {
	var gaPower = 2;
    function copyString(string, copies) {
        var s = "";
        for (var i = 0; i < copies; i++) {
            s += string;
        }
        return s;
    }

    function findSub(subgroupRelation, subgroupGenerators, name) {
        var tc = new Mesh4.ToddCoxeter(subgroupRelation);
        var total = tc.solve();
        var subgroupMembers = freeGroup.getCosetsForRepresentives(tc.translate(tc.getRepresentivesForCosets(), freeGroup));

        var tc = new Mesh4.ToddCoxeter(relations, subgroupGenerators);
        var total = tc.solve();

        var cosetActions = tc.translate(tc.getRepresentivesForCosets(), freeGroup);

        var subsets = freeGroup.apply(cosetActions, subgroupMembers);

        var vLabel = new Array(tc.getCosetCounts());
        for (var i = 0; i < subsets.length; i++) {
            for (var j = 0; j < subsets[i].length; j++) {
                vLabel[subsets[i][j]] = i;
            }
        }
		if(name == "V") freeGroup.VGroup = tc;
        return vLabel;
    }
	var rg = copyString("rg", rgPower),
		rb = copyString("rb", rbPower),
		gb = copyString("gb", gbPower);

    var relations = rb + "," + rg + "," + gb;
    var freeGroup = new Mesh4.ToddCoxeter(relations);
	var total = freeGroup.solve();
	freeGroup.cosetTable.extraColumns = [];
	freeGroup.cosetTable.extraColumns.push(findSub(rg, "r,g", "V"));
	freeGroup.cosetTable.extraColumns.push(findSub(rb, "r,b", "E"));
	freeGroup.cosetTable.extraColumns.push(findSub(gb, "g,b", "F"));

    return freeGroup;
}