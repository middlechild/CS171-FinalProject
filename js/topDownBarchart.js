/* * * * * * * * * * * * * * * * * *
 *      class TopDownBarchart      *
 * * * * * * * * * * * * * * * * * */


class TopDownBarchart {

    constructor(parentElement, infoElement, data) {
        this.parentElement = parentElement;
        this.infoElement = infoElement;
        this.data = data;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 0, right: 0, bottom: 0, left: 0};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Initialize drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Create tooltip
        vis.tooltip = d3.select("body").append("div")
            .attr("class", "tooltip")
            .attr("id", "root-tooltip");

        // Define scales
        vis.x = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.1);
        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;
        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Update scales
        vis.x.domain(vis.data.map((d) => d.driver));

        let yMax = d3.max(vis.data, (d) => d.percentage);
        vis.y.domain([0, yMax]);

        // Create bars
        vis.svg.selectAll("rect")
            .data(vis.data)
            .enter()
            .append("rect")
            .classed("bar", true)
            .on("mouseover", function(event, d) {
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
            .on("mouseout", function(event, d) {
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            })
            .on("click", function(event, d) {
                vis.updateSlideText(d);
            })
            .style("fill", (d, i) => d3.schemeSet3[i])
            .attr("x", (d) => vis.x(d.driver))
            .attr("y", 0)
            .attr("width", vis.x.bandwidth())
            .attr("height", (d) => vis.height - vis.y(d.percentage));
    }

    updateSlideText(driver) {
        let vis = this;

        // Get info section and clear contents
        let infoSection = document.getElementById(vis.infoElement);
        infoSection.innerHTML = "";

        // Create sub-title elements for driver name
        let driverTitle = document.createElement("h3");
        driverTitle.innerText = driver.driver;
        infoSection.append(driverTitle);

        // Append paragraph for each piece of info
        driver.info.forEach((i) => {
            let infoParagraph = document.createElement("p");
            infoParagraph.className = "section-text";
            infoParagraph.innerText = i;
            infoSection.append(infoParagraph);
        });
    }
}