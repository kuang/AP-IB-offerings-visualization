
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

function getStateCode(state, arr) {
    for(i = 0 ; i< arr.length; i++) {
        if(arr[i].name == state) {
            return arr[i].code
        }
    }
    return 0;
}

function convertStatesToJson(arr) {
    // This should map to an array of states, each with the amount of voters who voted for her. 
    clinton = {}
    trump = {}

    for (i = 0; i < arr.length; i++) {
        dp = arr[i];
        state = dp.st;
        candidate = dp.cand;
        total_votes_for_county = dp.total_votes;
        votes = dp.votes;

        if (candidate == "Hillary Clinton") {
            if (dp.st in clinton) {
                // The first index is the number of voters who went for her, second is total number of voters
                clinton[dp.st][0] += parseInt(votes)
                clinton[dp.st][1] += parseInt(total_votes_for_county)
            } else {
                clinton[dp.st] = [parseInt(votes), parseInt(total_votes_for_county), dp.st]
            }
        } else if(candidate == "Donald Trump") {
            if (dp.st in trump) {
                trump[dp.st][0] += parseInt(votes)
                trump[dp.st][1] += parseInt(total_votes_for_county)
            } else {
                trump[dp.st] = [parseInt(votes), parseInt(total_votes_for_county), dp.st]
            }
        }
    }
    return [clinton, trump]
}

function callback(
    error,
    AP_IB_data,
    total_public_schools,
    unitedState,
    tsv,
    presidentialResults) {

    if (error) console.log(error);

    var apPercents = [];
    var ibPercents = [];
    var bothPercents = [];

    for (var i = 0; i < total_public_schools.length; i++) {
        var numAP = AP_IB_data[i].AP;
        var numIB = AP_IB_data[i].IB;

        var numTotal = total_public_schools[i].Number;
        if(total_public_schools[i].State != "District of Columbia") {
            apPercents.push({
                State: total_public_schools[i].State,
                Percent: numAP / numTotal
            });
            ibPercents.push({
                State: total_public_schools[i].State,
                Percent: numIB / numTotal
            })

            bothPercents.push({
                State: total_public_schools[i].State,
                Percent: (numIB + numAP) / numTotal
            })
        }
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
        .attr("preserveAspectRatio", "xMinYMin meet")

    var svg2 = d3.select("div#ib").append("svg")
        .attr("viewBox", "0 0 " + width + " " + height)
        .attr("preserveAspectRatio", "xMinYMin meet")

    var g = svg.append("g");
    var g2 = svg2.append("g");

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
        .style("fill", "blue")
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

    var pres = convertStatesToJson(presidentialResults)
    var clinton = pres[0]
    var trump = pres[1]

    var margin = {
        top: 20, 
        right: 20,
        bottom: 80, 
        left: 60
    }, 
        width = 800 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom


    var presSVG = d3.select("#pres").append("svg")
        .attr("viewBox", "0 0 " + (width + margin.left + margin.right) + " " + (height + margin.top + margin.bottom))
        .attr("preserveAspectRatio", "xMinYMin meet")
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleLinear()
        .domain([0.15, 1.1])
        .range([0, width])

    var y = d3.scaleLinear() 
        .domain([0.3, 0.8])
        .range([height, 0])

    var xAxis = d3.axisBottom()
        .scale(x)

    var yAxis = d3.axisLeft()
        .scale(y)

    presSVG.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("Percentage of Schools Offering AP Curriculum")
        .style('fill', 'black')

    presSVG.append("g")
        .call(yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Percentage of State Voting for Trump")
        .style('fill', 'black')

    var color = d3.scaleOrdinal(d3.schemeCategory10);

    presSVG.selectAll(".point")
        .data(apPercents)
        .enter()
        .append("circle")
        .attr("class", "point")
        .attr("cy", function(d) {
            var abbrev = getStateCode(d.State, tsv);
            st = trump[abbrev];
            return y(st[0] / st[1]);
        })
        .attr("cx", function(d) {
            return x(d.Percent);
        } )
        .attr("r", 5)
        .style("fill", function(d) { return color(d.Percent); });

    var XaxisData = apPercents.map(function(d) { return d.Percent; });
    var YaxisData = apPercents.map(function(d) {             
        var abbrev = getStateCode(d.State, tsv);
        st = trump[abbrev];
        return (st[0] / st[1]);
    });
    var regression = leastSquaresequation(XaxisData,YaxisData);

    var line = d3.line()
        .x(function(d) { return x(d.Percent); })
        .y(function(d) { return y(regression(d.Percent)); });

    presSVG.append("path")
        .datum(apPercents)
        .attr("d", line)

}



function leastSquaresequation(XaxisData, Yaxisdata) {
    var ReduceAddition = function(prev, cur) { return prev + cur; };
    
    // finding the mean of Xaxis and Yaxis data
    var xBar = XaxisData.reduce(ReduceAddition) * 1.0 / XaxisData.length;
    var yBar = Yaxisdata.reduce(ReduceAddition) * 1.0 / Yaxisdata.length;

    var SquareXX = XaxisData.map(function(d) { return Math.pow(d - xBar, 2); })
      .reduce(ReduceAddition);
    
    var ssYY = Yaxisdata.map(function(d) { return Math.pow(d - yBar, 2); })
      .reduce(ReduceAddition);
      
    var MeanDiffXY = XaxisData.map(function(d, i) { return (d - xBar) * (Yaxisdata[i] - yBar); })
      .reduce(ReduceAddition);
      
    var slope = MeanDiffXY / SquareXX;
    var intercept = yBar - (xBar * slope);
    
// returning regression function
    return function(x){
      return x*slope+intercept
    }

  }

$(document).ready(function() {
    var svg = d3.select("svg");

    d3.queue()
        .defer(d3.csv, "num_ap_schools.csv", parseAP_IB)
        .defer(d3.csv, "num_publichs.csv", parseTotalSchools)
        .defer(d3.json, "us.json")
        .defer(d3.tsv, "us-state-names.tsv")
        .defer(d3.csv, "pres16results.csv")
        .await(callback);
});

