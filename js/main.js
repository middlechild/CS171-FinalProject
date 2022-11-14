let sec06_data;
let sec06_barchart_vis;

d3.csv("data/extinctionRates.csv").then(function(csv){
    sec06_data = csv
    console.log(sec06_data)
    console.log(sec06_data[0])
});

sec06_barchart_vis = new sec06_barchart("sec06-vis", sec06_data)
sec06_barchart_vis.initVis()
