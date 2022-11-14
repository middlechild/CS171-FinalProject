/* * * * * * * * * * *  * *
 *          Main          *
 * * * * * * * * * * * ** */

// init global variables & switches
let map3d,
    mapFlat,
    rootBarchart;

// load data using promises
let promises = [
    d3.csv("data/extinction-drivers.csv", d => {
        // convert
        d.driver = d.driver
        d.percentage = +d.percentage
        return d}),
    d3.json("data/map/world-110m.json")
];

Promise.all(promises)
    .then(function (data) {
        initMainPage(data)
    })
    .catch(function (err) {
        console.log(err)
    });

// initMainPage
function initMainPage(data) {

    console.log('check out the data', data);

    map3d = new Map3D('map-3d-chart', data[1]);
    mapFlat = new MapFlat('map-flat-chart', data[1]);
    rootBarchart = new TopDownBarchart('root-barchart', data[0]);

}
