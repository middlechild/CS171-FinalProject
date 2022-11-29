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

        vis.margin = {top: 0, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // Create a projection
        vis.projection = d3.geoEqualEarth()
            .scale(190)
            .translate([vis.width / 2, vis.height / 2])

        // Define a geo generator and pass projection
        vis.path = d3.geoPath()
            .projection(vis.projection);

        // Append tooltip
        vis.tooltip = d3.select("#" + vis.parentElement).append('div')
            .attr('class', "tooltip tooltip-small");

        // Add legend to map
        vis.legend = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(0, ${vis.height - 20})`);

        // Add event listener to toggle
        let toggleValues = document.getElementsByClassName('btn-rediscovered-toggle');
        Array.from(toggleValues).forEach(function(o) {
            o.addEventListener('click', function(e) {
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
        vis.data.forEach(row => {
            // push rows with proper dates into filteredData
            if (row.List === vis.selectedListValue) {
                filteredData.push(row);
            }
        });

        // Reset data structure with extinction information for the countries
        vis.countryInfo = {};

        // Prepare country data by grouping all rows
        let dataByCountry = Array.from(d3.group(filteredData, d => d.Locality), ([key, value]) => ({key, value}))

        //console.log(dataByCountry);

        vis.maxValue  = 0;

        // Merge
        dataByCountry.forEach(country => {
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

        // Update color scale
        vis.colorScale = d3.scaleLinear()
            .range(vis.colors[vis.selectedListValue.toLowerCase()])
            .domain([0, vis.maxValue]);

        vis.countries = vis.svg.selectAll(".country")
            .data(vis.world);

        vis.countries.enter()
            .append("path")
            .attr('class', 'country')
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

        // Update legend
        let gradientSteps = [
            {
                "color": vis.colors[vis.selectedListValue.toLowerCase()][0],
                "value": 0
            },
            {
                "color": vis.colors[vis.selectedListValue.toLowerCase()][1],
                "value": 100
            }
        ];
        let extent = d3.extent(gradientSteps, d => d.value);
        let linearGradient = vis.legend.append("linearGradient")
            .attr("id", "gradient");

        linearGradient.selectAll("stop")
            .data(gradientSteps)
            .enter()
            .append("stop")
            .attr("offset", d => ((d.value - extent[0]) / (extent[1] - extent[0]) * 100) + "%")
            .attr("stop-color", d => d.color);

        vis.legend.append("rect")
            .attr("width", vis.width / 5)
            .attr("height", 20)
            .style("fill", "url(#gradient)");
    }

    selectedListValueChange(event) {
        let vis = this;

        vis.selectedListValue = event.currentTarget.getAttribute("data-value");

        let active = document.querySelector('button.btn-rediscovered-toggle.active');
        if (active) {
            active.classList.remove('active');
        }
        event.currentTarget.classList.add('active');

        vis.wrangleData();
    }
}
