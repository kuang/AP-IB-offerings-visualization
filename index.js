var svg = d3.select("svg");

function parseTotalSchools(line) {
    return { State: line["State"], Number: parseInt(line["Number"]) };
}
function parseAP_IB(line) {
    return { State: line["State"], AP: parseInt(line["AP"]), IB: parseInt(line["IB"]) };
}
function findLeave(arr, state) {
    for (i = 0; i < arr.length; i++) {
        var data = arr[i];
        if (data.State == state) {
            return data.Percent;
        }
    }
    return 0;
}

d3.queue()
    .defer(d3.csv, "num_ap_schools.csv", parseAP_IB)
    .defer(d3.csv, "num_publichs.csv", parseTotalSchools)
    .defer(d3.json, "us.json")
    .defer(d3.tsv, "us-state-names.tsv")
    .await(callback);

function callback(
    error,
    AP_IB_data,
    total_public_schools,
    unitedState,
    tsv) {

    if (error) console.log(error);

    var apPercents = new Array(total_public_schools.length);
    var ibPercents = new Array(total_public_schools.length);
    var bothPercents = new Array(total_public_schools.length);

    for (var i = 0; i < total_public_schools.length; i++) {
        var numAP = AP_IB_data[i].AP;
        var numIB = AP_IB_data[i].IB;

        var numTotal = total_public_schools[i].Number;
        apPercents[i] = {
            State: total_public_schools[i].State,
            Percent: numAP / numTotal
        };
        ibPercents[i] = {
            State: total_public_schools[i].State,
            Percent: numIB / numTotal
        };

        bothPercents[i] = {
            State: total_public_schools[i].State,
            Percent: (numIB + numAP) / numTotal
        };

        console.log(apPercents[i].State + "  " + apPercents[i].Percent);
    }

    var apExtent = d3.extent(apPercents, function (d) {
        return d.Percent;
    });
    var ibExtent = d3.extent(ibPercents, function (d) {
        return d.Percent;
    });
    var bothExtent = d3.extent(bothPercents, function (d) {
        return d.Percent;
    });


    var apScale = d3.scaleLinear().domain(apExtent).range([0.00, 1.00]);
    var ibScale = d3.scaleLinear().domain(ibExtent).range([0.00, 1.00]);
    var bothScale = d3.scaleLinear().domain(bothExtent).range([0.00, 1.00]);

    var width = 1200,
        height = 800,
        centered;

    var projection = d3.geoAlbersUsa()
        .scale(1400)
        .translate([630, height / 2]);

    var path = d3.geoPath()
        .projection(projection);

    var svg = d3.select("div#ap").append("svg")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMinYMin meet");

    var svg2 = d3.select("div#ib").append("svg")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMinYMin meet");

    var svg3 = d3.select("div#both").append("svg")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMinYMin meet");

    var g = svg.append("g");
    var g2 = svg2.append("g");
    var g3 = svg3.append("g");

    var data = topojson.feature(unitedState, unitedState.objects.states).features;

    var names = {};
    var codes = {};
    var fills = {};

    tsv.forEach(function (d, i) {
        names[d.id] = d.name;
        codes[d.id] = d.code;
    });
    svg.append("rect")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("fill", "white");

    svg.selectAll("state")
        .data(data)
        .enter().insert("path")
        .attr("class", "country")
        .attr("d", path)
        .style("fill", "red")
        .style("fill-opacity", function (d) {
            return apScale(findLeave(apPercents, names[d.id]));
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
        .text(function (d) { return codes[d.id]; })
        .attr("x", function (d) { return path.centroid(d)[0]; })
        .attr("y", function (d) { return path.centroid(d)[1]; })
        .attr("text-anchor", "middle")
        .attr('fill', 'black');

    // Second graph
    svg2.selectAll("state")
        .data(data)
        .enter().insert("path")
        .attr("class", "country")
        .attr("d", path)
        .style("fill", "red")
        .style("fill-opacity", function (d) {
            return ibScale(findLeave(ibPercents, names[d.id]));
        });

    g2.append("g")
        .attr("class", "states-bundle")
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "white")
        .attr("class", "states");

    g2.append("g")
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

    // Third graph
    svg3.selectAll("state")
        .data(data)
        .enter().insert("path")
        .attr("class", "country")
        .attr("d", path)
        .style("fill", "red")
        .style("fill-opacity", function (d) {
            return bothScale(findLeave(bothPercents, names[d.id]));
        });

    g3.append("g")
        .attr("class", "states-bundle")
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "white")
        .attr("class", "states");

    g3.append("g")
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
