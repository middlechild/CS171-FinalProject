
class sec06_barchart {

    // constructor method to initialize StackedAreaChart object
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

    }
    initVis() {

        let vis = this;

        vis.margin = {top: 40, right: 40, bottom: 40, left: 40};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;


        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


        // Scales and axes
        vis.x = d3.scaleLinear()
            .range([vis.width, 0]);

        vis.y = d3.scaleBand()
            .range([0, vis.height])
            .paddingInner(0.1);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.xAxisGroup = vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.width + ")")

        vis.yAxisGroup = vis.svg.append("g")
            .attr("class", "y-axis axis")


        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }

    /*
     * Data wrangling
     */
    wrangleData() {
        let vis = this

        vis.data

        vis.data.forEach( function(d){
            d.values = +d.values;
            d.labels = +d.labels;
        })
        vis.bardata = vis.data
        console.log(vis.bardata)
        // Update the visualization
        vis.updateVis();
    }

    /*
     * The drawing function - should use the D3 update sequence (enter, update, exit)
     * Function parameters only needed if different kinds of updates are needed
     */
    updateVis() {
        let vis = this;

        // Update scales domains
        vis.y.domain(vis.data.map( function(d) { d.labels;}));
        vis.x.domain([0, d3.max(vis.data, function(d) { return d.values; })]);


        // Data join
        vis.bars = vis.svg.selectAll(".bar")
            .data(vis.data, function(d){ return d.values; });

        // Enter
        vis.bars.enter().append("rect")
            .attr("height", 0)
            .attr("y", vis.width)
            .attr("class", "bar")

            // Update
            .merge(vis.bars)
            .style("opacity", 0.5)
            .transition()
            .duration(1000)
            .style("opacity", 1)
            .attr("x", function(d) { return vis.x(d.values); })
            .attr("y", function(d) { return vis.y(d.labels); })
            .attr("height", vis.y.bandwidth())
            .attr("width", function(d) { return vis.width - vis.x(d.values); })

        // Exit
        vis.bars.exit().remove();


        //categories.exit().remove();

        // Call axis functions with the new domain
        //vis.svg.select(".x-axis").call(vis.xAxis);
        //vis.svg.select(".y-axis").call(vis.yAxis);
    }
}

