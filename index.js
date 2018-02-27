var svg = d3.select("svg");


var countryData;
var rawData, nestedData;

function parseLine(line) {
    var remain, enter, leave, fromState, pLeaving;
    remain = parseInt(line["remaining"]); //not sure why the csv values aren't being parsed as integers directly
    enter = parseInt(line["entering"]);
    leave = parseInt(line["leaving"]);

    fromState = remain + leave;
    console.log(fromState);
    pLeaving = leave / fromState;

    // var percentLeaving = parseInt(line["remaining"]) + parseInt(line["leaving"]);
    console.log(line["State"] + "  " + remain + " " + enter + " " + leave + " " + pLeaving);
    return { State: line["State"] };
    // , Variable: line["Series Name"], value: Number(line["2015 [YR2015]"]) };
}

// Some data from http://data.worldbank.org/data-catalog/country-profiles

d3.csv("college_data.csv", parseLine, function (error, data) {
    rawData = data;
    // console.log(data);


});

console.log("after callback");