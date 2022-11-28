
/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// Initialize global variables
let comparisonChart,
    sec06_barchart_vis,
    map3d,
    mapFlat,
    rootBarchart,
    sec06_button_value;

// Get selection for comparison visualization
let selectedComparison = document.getElementById("comparison-selector").value;

// Function for changing comparison visualization
function changeComparisonVis() {
    selectedComparison = document.getElementById("comparison-selector").value;
    comparisonChart.updateVis();
}

function sec_06_get_button(value) {
    sec06_button_value = value
    console.log('button value: ', sec06_button_value)
    sec06_barchart_vis.wrangleData();
}

// Load data using promises
let promises = [
    d3.csv("data/plantae-redlist-categories.csv", (d) => {
        for (let k in d) {
            if (k !== "Name") {
                d[k] = +d[k];
            }
        }
        return d;
    }),
    d3.csv("data/animalia-redlist-categories.csv", (d) => {
        for (let k in d) {
            if (k !== "Name" && k !== "Type") {
                d[k] = +d[k];
            }
        }
        return d;
    }),
    d3.csv("data/extinctionRates.csv"),
    d3.csv("data/extinction-drivers.csv", d => {
        d.percentage = +d.percentage;
        return d;
    }),
    d3.json("data/map/world-110m.json")
];

Promise.all(promises)
    .then(function(data) {
        initPage(data);
    })
    .catch(function(err) {
        console.log(err);
    });

// Initialize the page
function initPage(data) {

    // Log data
    // console.log(dataArray);

    // Initialize visualizations
    comparisonChart = new ComparisonVis("comparisonChart", "comparison-chart-legend", data[0], data[1]);

    sec06_barchart_vis = new sec06_barchart("sec06-vis", data[2])
    console.log(data[2])

    map3d = new Map3D('map-3d-chart', data[4]);
    mapFlat = new MapFlat('map-flat-chart', data[4]);
    rootBarchart = new TopDownBarchart('root-barchart', data[3]);
}
