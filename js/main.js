/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// Initialize global variables
let comparisonChart;

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
}
