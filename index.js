var svg = d3.select("svg");

// Create a text element to show country names
// svg.append("text")
//     .attr("id", "CountryName")
//     .attr("x", 0)
//     .attr("y", 300)
//     .style("font-size", "48pt");

var countryData;
var rawData, nestedData;

function parseLine(line) {
    // return { Country: line["Country Name"], Variable: line["Series Name"], value: Number(line["2015 [YR2015]"]) };
    console.log(line);
    return line;
}

// Some data from http://data.worldbank.org/data-catalog/country-profiles

d3.csv("college_data.csv", parseLine, function (error, data) {
    rawData = data;
    console.log("loaded data");


});

console.log("after callback");