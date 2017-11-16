/*
To test the code, run the function shortest_path with 2 station codes.
Examples:
shortest_path("EW1", "CC13");
shortest_path("DT2", "NS24");
*/

// Constructor for object Station
function Station(code, num) {
    this.name = code+num;
    this.neighbours = [];
    this.dv = 1/0;
    this.prev = undefined;
}

//Resetting the properties of the object
Station.prototype.reset = function() {
    this.dv = 1/0;
    this.prev = undefined;
};

function prepare() {
    
    // Before finding route
    
    ew = setUpLine("EW", 33, 1, list([]));
    ns = setUpLine("NS", 28, 1, list([]));
    cc = setUpLine("CC", 29, 1, list([]));
    dt = setUpLine("DT", 35, 1, list([]));
    ne = setUpLine("NE", 17, 1, list([]));
    bp = setUpLine("BP", 14, 1, list([]));
    ce = setUpLine("CE", 2, 1, list([]));
    cg = setUpLine("CG", 2, 0, list([]));
    se = setUpLine("SE", 5, 1, list([]));
    sw = setUpLine("SW", 8, 1, list([]));
    pe = setUpLine("PE", 7, 1, list([]));
    pw = setUpLine("PW", 7, 1, list([]));
        
    lines = {"EW": ew, "NS": ns, "CC": cc, "DT": dt, "NE": ne, "BP": bp, "CE": ce, "CG": cg, "SE": se, "SW": sw, "PE": pe, "PW": pw};
    setUpInterchanges();
    setUpSomeWeirdStuff();
}

function setUpLine(code, num, ctr, prev) {
    if(ctr > num) {
        return [];
    } else {
        var station = new Station(code, ctr);
        if((code === "CC" && ctr === 17) || (code === "NE" && ctr === 1)) { //CC18 and NE2 dont exits in Singapore :|
            ctr = ctr + 1;
        } else {}
        var next = setUpLine(code, num, ctr + 1, list(station));
        station.neighbours = append(list(next), prev); //Linking the stations
        return station;
    }
}

function getStation(name) {
    if(name === "BP14") { //Weird case that BP14 does not follow BP13
        return filter(function(x) { return x.name === "BP14"; },
                      getStation("BP6").neighbours);
    } else {
        var line_code = name.substring(0,2);
        var first_station = lines[line_code];
        function helper(station, name) {
            if(station.name === name) {
                return station;
            } else {
                return helper(head(station.neighbours), name);
            }
        }
        return helper(first_station, name);
    }
}

// To set up all the interchange stations
function setInterchange(s1, s2) {
    function helper(station1, station2) {
        var interchange = getStation(station2);
        var station = getStation(station1);
        var prev = head(tail(station.neighbours));
        var next = head(station.neighbours);
        if(!is_empty_list(prev)) {
            prev.neighbours = append(prev.neighbours, list(interchange));
            interchange.neighbours = append(interchange.neighbours, list(prev));
        } else {}
        if(!is_empty_list(next)) {
            interchange.neighbours = append(interchange.neighbours, list(next));
            next.neighbours = append(next.neighbours, list(interchange));
        } else {}
    }
    helper(s1, s2);
    helper(s2, s1);
}

//Main function which finds shortest path using Dijkstra's algorithm
function shortest_path(station1, station2) {
    
    station2 = station2 === "CG" ? "CG0" : station2; //Another weird case
    
    //To return a nicely formatted string
    function printPath(s2) {
        if(s2.prev === undefined || is_empty_list(s2.prev)) {
            return s2.name;
        } else {
            //display(s2.name);
            s2.name = s2.name === "CG0" ? "CG" : s2.name;
            var sl = filter(function(x) { 
                                return x.name.substring(0,2) === s2.name.substring(0,2);
                            }, s2.prev);
            if(is_empty_list(sl)) {
                return printPath(head(s2.prev)) + "->" + s2.name;
            } else {
                return printPath(head(sl)) + "->" + s2.name;
            }
        }
    }
    
    //To remember the path
    function setPrev(x, path) {
        if(x.prev === undefined) { 
            //display(map(function(x) { return x.name; }, path));
            var pp = map(head, 
                         filter(function(x) { return !is_empty_list(x); },
                                map(function(x) { return member(x, path); },
                                    filter(function(x) { return !is_empty_list(x); },
                                           x.neighbours))));
            var min = head(pp).dv;
            function helper2(LIST, min, res) {
                if(is_empty_list(LIST)) {
                    return res;
                } else {
                    var val = head(LIST);
                    if(val.dv === min) {
                        return helper2(tail(LIST), min, pair(val, res));
                    } else if(val.dv < min) {
                        return helper2(tail(LIST), val.dv, list(val));
                    } else {
                        return helper2(tail(LIST), min, res);
                    }
                }
            }
            x.prev = helper2(tail(pp), min, list(head(pp)));
        } else {}
    }
                    
    prepare();
    station1 = getStation(station1);
    station1.dv = 0;
    station1.prev = [];
    //This function implements Dijkstra's algorithm 
    function helper(s, path, toConsider) {
        if(s.name === station2) { //Condition to stop when destination is reached at
            setPrev(s, path);
            return s;
        } else {
            path = pair(s, path);
            //Setting the values of vertices in a graph
            map(function(x) { 
                    var dv = s.dv + 1; //Note all edges have weight of 1
                    if(dv < x.dv) {
                        x.dv = dv;
                    } else {}
            }, filter(function(x) { return !is_empty_list(x) && is_empty_list(member(x, path)); }, 
                      s.neighbours));
            toConsider = filter(function(x) { return !is_empty_list(x); }, toConsider);
            toConsider = filter(function(x) { return is_empty_list(member(x, path)); }, toConsider);
            setPrev(s, path);
            //To find shortest path
            var next_s = accumulate(function(x, y) {
                                        return x.dv < y.dv ? x : y;
                                    }, {"dv": 1/0}, toConsider);
            toConsider = remove_all(next_s, toConsider);
            toConsider = append(toConsider, next_s.neighbours);
            toConsider = filter(function(x) { return !is_empty_list(x); }, toConsider);
            toConsider = filter(function(x) { return is_empty_list(member(x, path)); }, toConsider);
            return helper(next_s, path, toConsider);
        }
    }
    
    station2 = helper(station1, [],
                  filter(function(x) { return !is_empty_list(x); }, station1.neighbours));
    return printPath(station2);
    
}

function setUpInterchanges() {
    setInterchange("EW24", "NS1");
    setInterchange("EW21", "CC22");
    setInterchange("EW16", "NE3");
    setInterchange("EW14", "NS26");
    setInterchange("EW13", "NS25");
    setInterchange("EW12", "DT14");
    setInterchange("EW8", "CC9");
    setInterchange("EW4", "CG0");
    setInterchange("EW2", "DT32");
    setInterchange("NS24", "CC1");
    setInterchange("NS21", "DT11");
    setInterchange("NS17", "CC15");
    setInterchange("NS4", "BP1");
    setInterchange("CC29", "NE1");
    setInterchange("CC19", "DT9");
    setInterchange("CC13", "NE12");
    setInterchange("CC10", "DT26");
    setInterchange("CC4", "DT15");
    setInterchange("CC1", "NE6");
    setInterchange("DT35", "CG1");
    setInterchange("DT19", "NE4");
    setInterchange("DT16", "CE1");
    setInterchange("DT12", "NE7");
    setInterchange("DT1", "BP6");
}

//This function takes care of some weird stuff like the grey lines, changi airport line, etc.
function setUpSomeWeirdStuff() {
    
    getStation("BP14").neighbours = list(getStation("BP5"), getStation("BP6"));
    getStation("BP5").neighbours = append(getStation("BP5").neighbours, list(getStation("BP14")));
    getStation("BP6").neighbours = append(getStation("BP6").neighbours, list(getStation("BP14")));
    getStation("BP6").neighbours = append(getStation("BP6").neighbours, list(getStation("BP13")));
    getStation("BP7").neighbours = append(getStation("BP7").neighbours, list(getStation("BP13")));
    getStation("BP13").neighbours = append(getStation("BP13").neighbours, list(getStation("BP7")));
    getStation("BP13").neighbours = append(getStation("BP13").neighbours, list(getStation("BP6")));
    getStation("BP13").neighbours = pair([], tail(getStation("BP13").neighbours));
    
    getStation("NE16").neighbours =  append(getStation("NE16").neighbours, append(list(getStation("SW1")),
                                    append(list(getStation("SW8")), append(list(getStation("SE1")), list(getStation("SE5"))))));
    
    getStation("NE17").neighbours = append(getStation("NE17").neighbours, append(list(getStation("PW1")),
                                    append(list(getStation("PW7")), append(list(getStation("PE1")), list(getStation("PE7"))))));
                                           
    getStation("CC4").neighbours = append(getStation("CC4").neighbours, list(getStation("CE1")));
    getStation("CC3").neighbours = append(getStation("CC3").neighbours, list(getStation("CE1")));
    getStation("CE1").neighbours = append(getStation("CE1").neighbours, list(getStation("CC4")));
    getStation("CE1").neighbours = append(getStation("CE1").neighbours, list(getStation("CC3")));
    
    getStation("SE1").neighbours = append(getStation("SE1").neighbours, append(list(getStation("SE5")), list(getStation("NE16"))));
    getStation("SE5").neighbours = append(getStation("SE5").neighbours, append(list(getStation("SE1")), list(getStation("NE16"))));
    
    getStation("SW1").neighbours = append(getStation("SW1").neighbours, append(list(getStation("SW8")), list(getStation("NE16"))));
    getStation("SW8").neighbours = append(getStation("SW8").neighbours, append(list(getStation("SW1")), list(getStation("NE16"))));
    
    getStation("PE1").neighbours = append(getStation("PE1").neighbours, append(list(getStation("PE7")), list(getStation("NE17"))));
    getStation("PE7").neighbours = append(getStation("PE7").neighbours, append(list(getStation("PE1")), list(getStation("NE17"))));
    
    getStation("PW1").neighbours = append(getStation("PW1").neighbours, append(list(getStation("PW7")), list(getStation("NE17"))));
    getStation("PW7").neighbours = append(getStation("PW7").neighbours, append(list(getStation("PW1")), list(getStation("NE17"))));

}

//To initialize the graph or data
var ew = setUpLine("EW", 33, 1, list([]));
var ns = setUpLine("NS", 28, 1, list([]));
var cc = setUpLine("CC", 29, 1, list([]));
var dt = setUpLine("DT", 35, 1, list([]));
var ne = setUpLine("NE", 17, 1, list([]));
var bp = setUpLine("BP", 14, 1, list([]));
var ce = setUpLine("CE", 2, 1, list([]));
var cg = setUpLine("CG", 2, 0, list([]));
var se = setUpLine("SE", 5, 1, list([]));
var sw = setUpLine("SW", 8, 1, list([]));
var pe = setUpLine("PE", 7, 1, list([]));
var pw = setUpLine("PW", 7, 1, list([]));
    
var lines = {"EW": ew, "NS": ns, "CC": cc, "DT": dt, "NE": ne, "BP": bp, "CE": ce, "CG": cg, "SE": se, "SW": sw, "PE": pe, "PW": pw};
setUpInterchanges();
setUpSomeWeirdStuff();

    


