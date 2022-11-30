
class ExtinctionRateChart {

    // constructor method to initialize StackedAreaChart object
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.selectedTimeValue = "base";

        this.initVis();
    }

    initVis() {

        let vis = this;

        vis.margin = {top: 20, right: 100, bottom: 20, left: 100};

        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // SVG drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        // Scales and axes
        vis.x = d3.scaleLinear()
            .range([0, vis.width]);
        vis.y = d3.scaleBand()
            .range([0, vis.height])
            .padding(0.1);
        vis.xAxis = d3.axisBottom();
        vis.yAxis = d3.axisLeft();
        vis.xAxisGroup = vis.svg.append("g")
            .classed("x-axis axis", true)
            .attr("transform", `translate(0, ${vis.height})`);
        vis.yAxisGroup = vis.svg.append("g")
            .classed("y-axis axis", true);

        // Add event listener to toggle
        const toggleValues = document.getElementsByClassName("btn-extinction-toggle");
        Array.from(toggleValues).forEach((v) => v.addEventListener("click", (e) => vis.selectedTimeChange(e)));

        // (Filter, aggregate, modify data)
        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Truncate labels
        vis.data.forEach((d) => {
            if (d.labels.split(" ").includes("Base")) {
                d.labels = "Base rate";
            }
            else if (d.labels.split(" ").includes("Before")) {
                d.labels = "Before 1900";
            }
            else if (d.labels.split(" ").includes("After")) {
                d.labels = "After 1900"
            }
        });

        if (vis.selectedTimeValue === "base") {
            vis.bardata = [vis.data[0]]
        }
        else if (vis.selectedTimeValue === "before_1900") {
            vis.bardata = vis.data.slice(0,2);
        }
        else if (vis.selectedTimeValue === "after_1900") {
            vis.bardata = vis.data;
        }

        // Update the visualization
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Update scales domains
        vis.x.domain([0, d3.max(vis.bardata, (d) => d.values)]);
        vis.y.domain(vis.bardata.map((d) => d.labels));
        vis.xAxis.scale(vis.x);
        vis.yAxis.scale(vis.y);

        // Data join
        vis.bars = vis.svg.selectAll("rect")
            .data(vis.bardata);

        vis.bars.enter()
            .append("rect")
            .classed("bar", true)
            .attr("x", 0)
            .style("fill", "#69b3a2")          
            .merge(vis.bars)
            .transition()
            .duration(1500)
            .attr("x", 0)
            .attr("y", (d) => vis.y(d.labels))
            .attr("height", vis.y.bandwidth())
            .attr("width", (d) => vis.x(d.values));

        // Exit
        vis.bars.exit().remove();

        // Call axis functions with the new domain
        vis.xAxisGroup.transition()
            .duration(1500)
            .call(vis.xAxis);
        vis.yAxisGroup.transition()
            .duration(1500)
            .call(vis.yAxis);
    }

    selectedTimeChange(event) {
        let vis = this;

        // Get selected timeline value
        vis.selectedTimeValue = event.currentTarget.getAttribute("data-value");

        // Update which toggle button is active
        let active = document.querySelector("button.btn-extinction-toggle.active");
        if (active) {
            active.classList.remove("active");
        }
        event.currentTarget.classList.add("active");

        // Wrangle data and update chart
        vis.wrangleData();
    }
}

