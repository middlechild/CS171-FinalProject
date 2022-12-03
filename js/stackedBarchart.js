/* * * * * * * * * * * * * *
*     StackedBarchart      *
* * * * * * * * * * * * * */


class StackedBarchart {

    constructor(parentElement, geoData, data) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.data = data;
        this.selectedClimateValue = "subtropical";

        // get colors
        this.colors = utils.COLORS;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width)
            .attr("height", vis.height)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // append tooltip
        vis.tooltip = d3.select("#" + vis.parentElement).append('div')
            .attr('class', "tooltip tooltip-small");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Filter data
        let filteredData = [];
        vis.data.forEach(row => {
            // push rows with proper climate into filteredData
            if (row['Climate'] === vis.selectedClimateValue) {
                filteredData.push(row);
            }
        });

        // Reset data structure with extinction information for the countries
        vis.climateInfo = {};

        // Prepare country data by grouping all rows
        let dataByClimate = Array.from(d3.group(filteredData, d => d.Climate), ([key, value]) => ({key, value}));

        // set up the final data structure
        vis.climateInfo = {
            families: []
        };

        let familiesArray = [];

        // Populate the final data structure
        let riskByFamily = d3.group(dataByClimate[0].value, d => d.Family);

        riskByFamily.forEach(family => {
            let familyData = {
                name: "",
                risk: utils.getRisk()
            }

            family.forEach(species => {
                familyData.name = species.Family;
                let risk = species["Extinction.Risk"];
                if (risk != undefined && familyData.risk[risk] != NaN) {
                    familyData.risk[risk] ++;
                }
            });

            familiesArray.push(familyData);
        });

        // Sort by Critically endangered and only keep top 10
        let sortedFamilies = familiesArray.sort((a, b) => {
            return b.risk["Critically endangered"] - a.risk["Critically endangered"];
        }).filter((d, i) => { return i < 10 });

        vis.climateInfo.families = sortedFamilies;

        console.log(vis.climateInfo);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // List of subgroups
        let subgroups = vis.climateInfo.families;

        console.log(">>>>>>>> ");
        console.log(subgroups);

        //Set up stack method
        let stack = d3.stack()
            .keys(utils.getRiskKeys())
            .order(d3.stackOrderNone);

        //Data, stacked
        let series = stack(d3.map(vis.climateInfo.families, function(d) {return(d.risk)}));
        console.log("-------- ");
        console.log(series);

        //Set up scales
        let xScale = d3.scaleBand()
            .domain(d3.range(vis.climateInfo.families.length))
            .range([0, vis.width])
            .paddingInner(0.05);

        let yScale = d3.scaleLinear()
            .domain([0,
                d3.max(vis.climateInfo.families, function(d) {
                    let value = 1;
                     utils.getRiskKeys().forEach(risk => {
                         console.log("$$$$$$$$$$ ");
                         // console.log(d.risk[risk]);
                         value += d.risk[risk];
                     })
                    console.log(value);
                    return value;
                })
            ])
            .range([vis.height, 0]);  // <-- Flipped vertical scale

        //Easy colors accessible via a 10-step ordinal scale
        let colors = d3.scaleOrdinal()
            .domain(subgroups)
            .range(utils.getRiskColorsArray());

        // Add a group for each row of data
        vis.groups = vis.svg.selectAll(".bar-group")
            .data(series);

        vis.groups.enter()
            .append("g")
            .attr('class', 'bar-group')
            .style("fill", function(d, i) {
                return colors(i);
            })
            .merge(vis.groups);

        vis.groups.exit().remove();

        // Add a rect for each data value
        vis.rects = vis.groups.selectAll(".bar-section")
            .data(function(d) { return d; })

        vis.rects.enter()
            .append("rect")
            .attr('class', 'bar-section')
            .merge(vis.rects)
            .attr("x", function(d, i) {
                return xScale(i);
            })
            .attr("y", function(d) {
                return yScale(d[1]);  // <-- Changed y value
            })
            .attr("height", function(d) {
                return yScale(d[0]) - yScale(d[1]);  // <-- Changed height value
            })
            .attr("width", xScale.bandwidth())
            .on('mouseover', function(event, d) {
                try {
                    //console.log(d);
                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 20 + "px")
                        .style("top", event.pageY + "px")
                        // .html(`
                        //  <div class="tooltip-box">
                        //      <h3 class="country-name">${d.properties.LEVEL3_NAM}</h3>
                        //      <h4 class="abs-value">${vis.countryInfo[d.properties.LEVEL3_COD].total} ${vis.selectedRiskValue} species</h4>
                        //  </div>`);
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

        vis.rects.exit().remove();
    }

    climateChange(event) {
        this.selectedClimateValue = document.getElementById("climate-selector").value;
        console.log(this.selectedClimateValue);

        this.wrangleData();
    }
}