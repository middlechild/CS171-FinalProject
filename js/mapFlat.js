/* * * * * * * * * * * * * *
*         MapFlat          *
* * * * * * * * * * * * * */


class MapFlat {

    constructor(parentElement, geoData, data) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.data = data;
        this.selectedListValue = "Rediscovered";

        // define colors
        this.colors = {
            rediscovered: ["#6ba9c2", "#136A8A"],
            extinct: ["#de6388", "#9d0f3a"]
        }

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 0, right: 20, bottom: 10, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;
        vis.mapDims = {width: vis.width, height: 0.9 * vis.height};
        vis.legendDims = {width: vis.width, height: 0.1 * vis.height};

        // Initialize drawing area
        vis.svg = d3.select(`#${vis.parentElement}`).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        // Make separate drawing spaces for map and legend
        vis.mapGroup = vis.svg.append("g");
        vis.legendGroup = vis.svg.append("g")
            .attr("transform", `translate(${0.2 * vis.legendDims.width}, ${vis.mapDims.height})`)
            .classed("legend", true);

        // Create a projection
        vis.projection = d3.geoEqualEarth()
            .scale(150)
            .translate([vis.width / 2, vis.height / 2])

        // Define a geo generator and pass projection
        vis.path = d3.geoPath()
            .projection(vis.projection);

        // Create tooltip
        vis.tooltip = d3.select("body").append("div")
            .classed("tooltip tooltip-small", true)
            .attr("id", "map-flat-tooltip");

        // Create color scale
        vis.colorScale = d3.scaleLinear();

        // Add definition of gradient
        vis.linearGradient = d3.select(`#${vis.parentElement} > svg`)
            .append("defs")
            .append("linearGradient")
            .attr("id", "map-flat-linear-gradient");

        // Add legend rectangle
        vis.legendGroup.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 0.6 * vis.legendDims.width)
            .attr("height", 0.7 * vis.legendDims.height);

        // Create legend axis and group
        vis.legendAxisGroup = vis.legendGroup.append("g")
            .classed("legend-axis", true)
            .attr("transform", `translate(0, ${0.7 * vis.legendDims.height})`);
        vis.legendScale = d3.scaleLinear()
            .range([0, 0.6 * vis.legendDims.width]);
        vis.legendAxis = d3.axisBottom();

        // Add event listener to toggle
        let toggleValues = document.getElementsByClassName("btn-rediscovered-toggle");
        Array.from(toggleValues).forEach(function(o) {
            o.addEventListener("click", function(e) {
                vis.selectedListValueChange(e);
            });
        });

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Get GeoJSON data structure
        vis.world = vis.geoData.features;

        // Filter data
        let filteredData = [];

        // Iterate over all rows in the data csv
        vis.data.forEach((row) => {
            // push rows with proper dates into filteredData
            if (row.List === vis.selectedListValue) {
                filteredData.push(row);
            }
        });

        // Reset data structure with extinction information for the countries
        vis.countryInfo = {};

        // Prepare country data by grouping all rows
        let dataByCountry = Array.from(d3.group(filteredData, d => d.Locality), ([key, value]) => ({key, value}))

        vis.maxValue = 0;

        // Merge
        dataByCountry.forEach((country) => {
            let totalSpecies = country.value.length;

            // populate the final data structure
            vis.countryInfo[country.key] = {
                code: country.key,
                total: totalSpecies // Get number of species (extinct or rediscovered, based on selection)
            }

            // update max value for selection
            vis.maxValue = totalSpecies > vis.maxValue ? totalSpecies : vis.maxValue;
        });

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Update color scale and legend scale
        vis.colorScale.range(vis.colors[vis.selectedListValue.toLowerCase()])
            .domain([0, vis.maxValue]);
        vis.legendScale.domain([0, vis.maxValue]);

        // Update linear gradient for legend
        vis.linearGradient.selectAll("stop").remove();
        vis.linearGradient.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", vis.colorScale.range()[0]);
        vis.linearGradient.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", vis.colorScale.range()[1]);

        // Update legend rectangle fill gradient
        vis.legendGroup.select("rect").style("fill", "url(#map-flat-linear-gradient)");

        // Add legend axis
        vis.legendAxis.scale(vis.legendScale);
        vis.legendAxisGroup.transition()
            .duration(750)
            .call(vis.legendAxis);

        // Draw countries
        vis.countries = vis.mapGroup.selectAll(".country")
            .data(vis.world);
        vis.countries.enter()
            .append("path")
            .attr("class", "country")
            .attr("d", vis.path)
            .merge(vis.countries)
            .style("cursor", (d) => {
                try {
                    if (vis.countryInfo[d.properties.LEVEL3_COD].total != undefined) {
                        return "pointer";
                    }
                } catch(e) {
                    return "default";
                }
            })
            .style("fill", d => {
                try {
                    return vis.colorScale(vis.countryInfo[d.properties.LEVEL3_COD].total);
                } catch(e) {
                    return "#FFFFFF";
                }
            })
            .on("mouseover", function(event, d) {
                try {
                    if (vis.countryInfo[d.properties.LEVEL3_COD].total != undefined) {
                        vis.tooltip
                            .style("opacity", 1)
                            .style("left", event.pageX + 20 + "px")
                            .style("top", event.pageY + "px")
                            .html(`
                         <div class="tooltip-box">
                             <h3 class="country-name">${d.properties.LEVEL3_NAM}</h3>
                             <h4 class="abs-value">${vis.countryInfo[d.properties.LEVEL3_COD].total} ${vis.selectedListValue} Species</h4>
                         </div>`);
                    }
                } catch(e) {}
            })
            .on('mouseout', function(event, d) {
                try {
                    vis.tooltip
                        .style("opacity", 0)
                        .style("left", 0)
                        .style("top", 0)
                        .html(``);
                } catch(e) {}
            });
        vis.countries.exit().remove();
    }

    selectedListValueChange(event) {
        let vis = this;

        vis.selectedListValue = event.currentTarget.getAttribute("data-value");

        let active = document.querySelector("button.btn-rediscovered-toggle.active");
        if (active) {
            active.classList.remove("active");
        }
        event.currentTarget.classList.add("active");

        vis.wrangleData();
    }
}
