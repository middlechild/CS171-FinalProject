/* * * * * * * * * * * * * * * * * *
 *      class TopDownBarchart      *
 * * * * * * * * * * * * * * * * * */


class TopDownBarchart {

    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 0, right: 0, bottom: 0, left: 0};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'rootTooltip');

        // set bar spam
        vis.barspan = vis.height * .6;

        // set up X & Y scales
        vis.x = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.1);

        vis.y = d3.scaleLinear()
            .range([vis.barspan, 0]);

        // set up X axis
        vis.xAxis = vis.svg.append("g")
            .attr("id", "x-axis")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + (vis.barspan + 10) + ")");

        this.wrangleData();
    }

    wrangleData() {
        let vis = this;
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Update scales
        vis.x.domain(vis.data.map( d => d.driver));

        let yMax = d3.max(vis.data, d => { return d.percentage; });
        vis.y.domain([0, yMax]);

        // Update bars
        let bars = vis.svg.selectAll("rect")
            .data(vis.data);

        bars.enter()
            .append("rect")
            .merge(bars)
            .attr("class", "bar")
            .on('mouseover', function(event, d) {
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                         <div class="tooltip-box">
                             <h3 class="driver-name">${d.driver}</h3>
                             <h4 class="percent-value">${d.percentage}%</h4>
                         </div>`);

            })
            .on('mouseout', function(event, d) {
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .attr("fill", (d, i) => d3.schemeSet3[i])
            .attr("x", d => vis.x(d.driver))
            .attr("y", 0)
            .attr("width", vis.x.bandwidth())
            .attr("height", d => vis.barspan - vis.y(d.percentage))

        bars.exit().remove();

        // Update percent labels
        // let percentLabels = vis.svg.selectAll("text")
        //     .data(vis.data);
        //
        // percentLabels.enter()
        //     .append("text")
        //     .merge(percentLabels)
        //     .text(d => {
        //         return d.percentage +"%";
        //     })
        //     .attr("class", "percent-label")
        //     .attr("x", d => {
        //         return vis.x(d.driver) + 22;
        //     })
        //     .attr("y", vis.barspan - 30)
        //
        // percentLabels.exit().remove();

        // Update X axis
        vis.xAxis.call(d3.axisBottom().scale(vis.x))
            .selectAll("text")
            .attr("y", 0)
            .attr("dy", 0)
            .attr("transform", "rotate(-90)");
    }
}