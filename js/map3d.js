/* * * * * * * * * * * * * *
*          Map3D           *
* * * * * * * * * * * * * */


class Map3D {

    constructor(parentElement, geoData, data) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.data = data;
        this.selectedRiskValue = "Extinct";

        // define colors
        this.colors = {
            "Extinct": ["#c9aef8", "#5c03b0"],
            "Extinct in the wild": ["#edc4f1", "#9f03b0"],
            "Critically endangered": ["#f6bfd0", "#86012a"],
            "Endangered": ["#f5cdc2", "#964112"],
            "Vulnerable": ["#ebf5cf", "#8c9a11"],
            "Least concern": ["#b5f5d8", "#048370"],
            "Data deficient": ["#c6c8c9", "#626565"]
        }

        this.initVis();
    }

    initVis() {
        let vis = this;
        let m0, o0;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;
        vis.mapDims = {width: vis.width, height: 0.9 * vis.height};
        vis.legendDims = {width: vis.width, height: 0.1 * vis.height};

        // Initialize drawing area
        vis.svg = d3.select(`#${vis.parentElement}`).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        // Make separate drawing spaces for map and legend
        vis.mapGroup = vis.svg.append("g");
        vis.legendGroup = vis.svg.append("g")
            .attr("transform", `translate(${0.1 * vis.legendDims.width}, ${vis.mapDims.height})`)
            .classed("legend", true);

        // Create a projection
        vis.projection = d3.geoOrthographic()
            .scale(165)
            .translate([vis.width / 2, vis.height / 2]);

        // Define a geo generator and pass projection
        vis.path = d3.geoPath()
            .projection(vis.projection);

        // add sphere for oceans
        vis.mapGroup.append("path")
            .datum({type: "Sphere"})
            .attr("class", "graticule")
            .attr("fill", "#ADDEFF")
            .attr("stroke","rgba(129,129,129,0.35)")
            .attr("d", vis.path);

        // Create tooltip
        vis.tooltip = d3.select("body").append("div")
            .classed("tooltip tooltip-small", true)
            .attr("id", "map-3d-tooltip");

        // Create color scale
        vis.colorScale = d3.scaleLinear();

        // Add definition of gradient
        vis.linearGradient = d3.select(`#${vis.parentElement} > svg`)
            .append("defs")
            .append("linearGradient")
            .attr("id", "map-3d-linear-gradient");

        // Add legend rectangle
        vis.legendGroup.append("rect")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", 0.8 * vis.legendDims.width)
            .attr("height", 0.75 * vis.legendDims.height);

        // Create legend axis and group
        vis.legendAxisGroup = vis.legendGroup.append("g")
            .classed("legend-axis", true)
            .attr("transform", `translate(0, ${0.75 * vis.legendDims.height})`);
        vis.legendScale = d3.scaleLinear()
            .range([0, 0.8 * vis.legendDims.width]);
        vis.legendAxis = d3.axisBottom();

        // Rotate globe on click and drag
        vis.mapGroup.call(
            d3.drag()
                .on("start", function(event) {
                    let lastRotationParams = vis.projection.rotate();
                    m0 = [event.x, event.y];
                    o0 = [-lastRotationParams[0], -lastRotationParams[1]];
                })
                .on("drag", function(event) {
                    if (m0) {
                        let m1 = [event.x, event.y],
                            o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
                        vis.projection.rotate([-o1[0], -o1[1]]);
                    }

                    // Update the map
                    vis.path = d3.geoPath().projection(vis.projection);
                    d3.selectAll(".country3d").attr("d", vis.path);
                    d3.selectAll(".graticule").attr("d", vis.path);
                })
        );

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
            if (row["Extinction.Risk"] === vis.selectedRiskValue) {
                filteredData.push(row);
            }
        });

        // Reset data structure with extinction information for the countries
        vis.countryInfo = {};

        // Prepare country data by grouping all rows
        let dataByCountry = Array.from(d3.group(filteredData, (d) => d.Locality), ([key, value]) => ({key, value}));
        vis.maxValue = 0;
        vis.totalSpecies = 0;

        // Merge
        dataByCountry.forEach((country) => {
            let countryTotalSpecies = country.value.length;
            vis.totalSpecies += countryTotalSpecies;

            // Populate final data structure
            vis.countryInfo[country.key] = {
                code: country.key,
                total: countryTotalSpecies // Get number of species based on selection
            };

            // Update max value for selection
            vis.maxValue = countryTotalSpecies > vis.maxValue ? countryTotalSpecies : vis.maxValue;
        });

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Update color scale and legend scale
        vis.colorScale.range(vis.colors[vis.selectedRiskValue])
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
        vis.legendGroup.select("rect").style("fill", "url(#map-3d-linear-gradient)");

        // Add legend axis
        vis.legendAxis.scale(vis.legendScale);
        vis.legendAxisGroup.transition()
            .duration(750)
            .call(vis.legendAxis);

        // Draw the countries
        vis.countries = vis.mapGroup.selectAll(".country3d")
            .data(vis.world);
        vis.countries.enter()
            .append("path")
            .classed("country3d", true)
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
            .attr("fill", (d) => {
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
                             <h4 class="abs-value">${vis.countryInfo[d.properties.LEVEL3_COD].total} ${vis.selectedRiskValue} Species</h4>
                         </div>`);
                    }
                } catch(e) {}
            })
            .on("mouseout", function(event, d) {
                try {
                    vis.tooltip
                        .style("opacity", 0)
                        .style("left", 0)
                        .style("top", 0)
                        .html(``);
                } catch(e) {}
            });
        vis.countries.exit().remove();

        // Update count label
        document.getElementById("risk-total-species").innerText = `${vis.totalSpecies} Species`;
    }

    riskChange(event) {
        let vis = this;
        vis.selectedRiskValue = document.getElementById("risk-selector").value;
        vis.wrangleData();
    }
}