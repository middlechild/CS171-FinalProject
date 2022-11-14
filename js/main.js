/* * * * * * * * * * *  * *
 *          Main          *
 * * * * * * * * * * * ** */

// init global variables & switches
let rootBarchart;

// load data using promises
let promises = [
    d3.csv("data/extinction-drivers.csv", d => {
        // convert
        d.driver = d.driver
        d.percentage = +d.percentage
        return d})
    // d3.csv("data/census_usa.csv")
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

    rootBarchart = new TopDownBarchart('root-barchart', data[0]);
}
