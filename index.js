var svg = d3.select("svg");

function parseSchools(line) {
    return { State: line["State"], Public: parseInt(line["Public"]), Private: parseInt(line["Private"]) };
}
function parseStudents(line) {
    return { State: line["State"], Public: parseInt(line["public"]), Private: parseInt(line["private"]) };
}

function findLeave(arr, state) {
    for (i = 0; i < arr.length; i++) {
        data = arr[i]
        if (data.State == state) {
            return data.pLeaving;
        }
    }
    return 0;
}

d3.queue()
    .defer(d3.csv, "num_ap_schools.csv", parseSchools)
    .defer(d3.csv, "hs_grads.csv", parseStudents)
    .defer(d3.json, "us.json")
    .defer(d3.tsv, "us-state-names.tsv")
    .await(callback);

function callback(
    error,
    school_data,
    student_data,
    unitedState,
    tsv) {

    var publicPercents = new Array(school_data.length);
    var privatePercents = new Array(school_data.length);

    for (var i = 0; i < school_data.length; i++) {
        var numAPpublic = school_data[i].Public;
        var numStudentpublic = student_data[i].Public;
        publicPercents[i] = numAPpublic / numStudentpublic;

        var numAPprivate = school_data[i].Private;
        var numStudentprivate = student_data[i].Private;
        privatePercents[i] = numAPprivate / numStudentprivate;

        console.log(publicPercents[i]);
    }
    if (error) console.log(error);
    // console.log(school_data);
    // console.log(student_data);

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
    var codes = {};
    var fills = {};

    tsv.forEach(function (d, i) {
        names[d.id] = d.name;
        codes[d.id] = d.code;
    });

    svg.selectAll("state")
        .data(data)
        .enter().insert("path")
        .attr("class", "country")
        .attr("d", path)
        .style("fill", "red")
    // .style("fill-opacity", function (d) { return findLeave(collegeData, names[d.id]); });

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
        .text(function (d) { return codes[d.id]; })
        .attr("x", function (d) { return path.centroid(d)[0]; })
        .attr("y", function (d) { return path.centroid(d)[1]; })
        .attr("text-anchor", "middle")
        .attr('fill', 'black');
}
