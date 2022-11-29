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

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Create a projection
        vis.projection = d3.geoOrthographic()
        // vis.projection = d3.geoAzimuthalEqualArea()
        // vis.projection = d3.geoStereographic()
            .scale(190)
            .translate([vis.width / 2, vis.height / 2])

        // Define a geo generator and pass projection
        vis.path = d3.geoPath()
            .projection(vis.projection);

        // add sphere for oceans
        vis.svg.append("path")
            .datum({type: "Sphere"})
            .attr("class", "graticule")
            .attr('fill', '#ADDEFF')
            .attr("stroke","rgba(129,129,129,0.35)")
            .attr("d", vis.path);

        // append tooltip
        vis.tooltip = d3.select("#" + vis.parentElement).append('div')
            .attr('class', "tooltip tooltip-small");

        // add legend to map
        // vis.legend = vis.svg.append("g")
        //     .attr('class', 'legend')
        //     .attr('transform', `translate(0, ${vis.height - 20})`);
        //
        // vis.colorScale = d3.scaleBand()
        //     .domain(vis.colors.map( (d, i) => ["Cat 1", "Cat 2", "Cat 3", "Cat 4"][i]))
        //     .range([0, 200]);
        //
        // vis.legend.selectAll("rect")
        //     .data(vis.colors)
        //     .enter()
        //     .append("rect")
        //     .attr("fill", (d, i) => vis.colors[i])
        //     .attr("height", 20)
        //     .attr("width", vis.colorScale.bandwidth())
        //     .attr("x", (d, i) => vis.colorScale.bandwidth() * i)
        //     .attr("y", 0);
        //
        // vis.legend.append("g")
        //     .attr("id", "legend-axis")
        //     .attr("class", "axis legend-axis")
        //     .call(d3.axisBottom().scale(vis.colorScale));

        // globe rotation
        vis.svg.call(
            d3.drag()
                .on("start", function (event) {

                    let lastRotationParams = vis.projection.rotate();
                    m0 = [event.x, event.y];
                    o0 = [-lastRotationParams[0], -lastRotationParams[1]];
                })
                .on("drag", function (event) {
                    if (m0) {
                        let m1 = [event.x, event.y],
                            o1 = [o0[0] + (m0[0] - m1[0]) / 4, o0[1] + (m1[1] - m0[1]) / 4];
                        vis.projection.rotate([-o1[0], -o1[1]]);
                    }

                    // Update the map
                    vis.path = d3.geoPath().projection(vis.projection);
                    d3.selectAll(".country3d").attr("d", vis.path)
                    d3.selectAll(".graticule").attr("d", vis.path)
                })
        )

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Get GeoJSON data structure
        vis.world = vis.geoData.features;

        // Filter data
        let filteredData = [];
        // Iterate over all rows in the data csv
        vis.data.forEach(row => {
            // push rows with proper dates into filteredData
            if (row['Extinction.Risk'] === vis.selectedRiskValue) {
                filteredData.push(row);
            }
        });

        // Reset data structure with extinction information for the countries
        vis.countryInfo = {};

        // Prepare country data by grouping all rows
        let dataByCountry = Array.from(d3.group(filteredData, d => d.Locality), ([key, value]) => ({key, value}));
        vis.maxValue  = 0;
        vis.totalSpeciels = 0;

        // Merge
        dataByCountry.forEach(country => {
            let countryTotalSpecies = country.value.length;
            vis.totalSpeciels += countryTotalSpecies;

            // populate the final data structure
            vis.countryInfo[country.key] = {
                code: country.key,
                total: countryTotalSpecies // Get number of species based on selection
            };

            // update max value for selection
            vis.maxValue = countryTotalSpecies > vis.maxValue ? countryTotalSpecies : vis.maxValue;
        });

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Update color scale
        vis.colorScale = d3.scaleLinear()
            .range(vis.colors[vis.selectedRiskValue])
            .domain([0, vis.maxValue]);

        vis.countries = vis.svg.selectAll(".country3d")
            .data(vis.world);

        vis.countries.enter()
            .append("path")
            .attr('class', 'country3d')
            .attr("d", vis.path)
            .merge(vis.countries)
            .style("cursor", d => {
                try {
                    if (vis.countryInfo[d.properties.LEVEL3_COD].total != undefined) {
                        return 'pointer';
                    }
                } catch(e) {
                    return 'default';
                }
            })
            .attr("fill", d => {
                try {
                    return vis.colorScale(vis.countryInfo[d.properties.LEVEL3_COD].total);
                } catch(e) {
                    return '#FFFFFF';
                }
            })
            .on('mouseover', function(event, d) {
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

        // Update count label
        document.getElementById("risk-total-species").innerText = `${vis.totalSpeciels} Species`

        // Update legend
        // let gradientSteps = [
        //     {
        //         "color": vis.colors[vis.selectedRiskValue.toLowerCase()][0],
        //         "value": 0
        //     },
        //     {
        //         "color": vis.colors[vis.selectedRiskValue.toLowerCase()][1],
        //         "value": 100
        //     }
        // ];
        // let extent = d3.extent(gradientSteps, d => d.value);
        // let linearGradient = vis.legend.append("linearGradient")
        //     .attr("id", "gradient");
        //
        // linearGradient.selectAll("stop")
        //     .data(gradientSteps)
        //     .enter()
        //     .append("stop")
        //     .attr("offset", d => ((d.value - extent[0]) / (extent[1] - extent[0]) * 100) + "%")
        //     .attr("stop-color", d => d.color);
        //
        // vis.legend.append("rect")
        //     .attr("width", vis.width / 5)
        //     .attr("height", 20)
        //     .style("fill", "url(#gradient)");
    }

    riskChange(event) {
        this.selectedRiskValue = document.getElementById("risk-selector").value;
        console.log(this.selectedRiskValue);

        this.wrangleData();
    }
}