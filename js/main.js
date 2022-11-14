
/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// Initialize global variables
let sec06_data;
let comparisonChart,
    sec06_barchart_vis;

// Get selection for comparison visualization
let selectedComparison = document.getElementById("comparison-selector").value;

// Function for changing comparison visualization
function changeComparisonVis() {
    selectedComparison = document.getElementById("comparison-selector").value;
    comparisonChart.updateVis();
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
    d3.csv("data/extinctionRates.csv").then(function(csv){
        sec06_data = csv;
        console.log(sec06_data);
        console.log(sec06_data[0]);
    })
];

Promise.all(promises)
    .then(function(data) {
        initPage(data);
    })
    .catch(function(err) {
        console.log(err);
    });

// Initialize the page
function initPage(dataArray) {

    // Log data
    // console.log(dataArray);

    // Initialize visualizations
    comparisonChart = new ComparisonVis("comparisonChart", dataArray[0], dataArray[1]);

    sec06_barchart_vis = new sec06_barchart("sec06-vis", sec06_data)
}
