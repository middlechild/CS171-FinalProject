
/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// Initialize global variables
let comparisonChart,
    extinctionRateChart,
    map3d,
    mapFlat,
    rootBarchart,
    stackedBarchart,
    utils;

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
    d3.json("data/extinction-drivers.json"),
    d3.json("data/map/wgsrpd/level3.geojson"),
    d3.csv("data/extinction-and-rediscovery.csv")
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
    
    // Add event listener to leaf buttons on section #2
    let buttons = document.getElementsByClassName("big-leaf-btn");
    Array.from(buttons).forEach(function(o) {
        o.addEventListener("click", function(e) {
            e.target.classList.add("selected");

            let section3 = document.getElementById("section-3");
            section3.classList.add("expanded");
            section3.scrollIntoView({ behavior: 'smooth', block: 'center'});
        });
    });

    // Initialize Utils
    utils = new Utils();

    // Initialize visualizations
    comparisonChart = new ComparisonVis("comparisonChart", "comparison-chart-legend", data[0], data[1]);
    extinctionRateChart = new ExtinctionRateChart("sec06-vis", data[2])
    map3d = new Map3D('map-3d-chart', data[4], data[5]);
    mapFlat = new MapFlat('map-flat-chart', data[4], data[5]);
    rootBarchart = new TopDownBarchart("root-barchart", "root-cause-info", data[3].data);
    stackedBarchart = new StackedBarchart('stacked-chart', data[5]);
}
