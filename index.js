var svg = d3.select("svg");

function parseLine(line) {
    var
        remain, //number of in state students staying in state
        enter, //number of out of state students entering
        leave, //number of in state students leaving
        fromState, //total number from state (remain+leave)
        pLeaving; //percentage in state students leaving

    remain = parseInt(line["remaining"]); //not sure why the csv values aren't being parsed as integers directly
    enter = parseInt(line["entering"]);
    leave = parseInt(line["leaving"]);

    fromState = remain + leave;
    pLeaving = leave / fromState;

    // var percentLeaving = parseInt(line["remaining"]) + parseInt(line["leaving"]);
    return { State: line["State"], remain: remain, enter: enter, leave: leave, fromState: fromState, pLeaving: pLeaving };
    // , Variable: line["Series Name"], value: Number(line["2015 [YR2015]"]) };
}

d3.queue()
    .defer(d3.csv, "college_data.csv", parseLine)
    .defer(d3.json, "us.json")
    .defer(d3.tsv, "us-state-names.tsv")
    .await(callback);

function callback(error, collegeData, unitedState, tsv) {
    if (error) console.log(error);

    var width = 1200,
        height = 800,
        centered;

    var projection = d3.geoAlbersUsa()
        .scale(1400)
        .translate([630, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    var svg = d3.select("div#main").append("svg")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMinYMin meet")

    var g = svg.append("g");

    var data = topojson.feature(unitedState, unitedState.objects.states).features;

    var names = {};
    var fills = {};

    tsv.forEach(function (d, i) {
        names[d.id] = d.name;
    });

    svg.selectAll("state")
         .data(data)
         .enter().insert("path", ".graticule")
         .attr("class", "country")
         .attr("d", path)
         .style("fill", "red")
         .data(collegeData)
         .style("fill-opacity", function (d) {
              return d.pLeaving;
          });

    g.append("g")
        .attr("class", "states-bundle")
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "white")
        .attr("class", "states");

    g.append("g")
        .attr("class", "states-names")
        .selectAll("text")
        .data(data)
        .enter()
        .append("svg:text")
        .text(function (d) {
            return names[d.id];
        })
        .attr("x", function (d) {
            return path.centroid(d)[0];
        })
        .attr("y", function (d) {
            return path.centroid(d)[1];
        })
        .attr("text-anchor", "middle")
        .attr('fill', 'black');
}
