/* * * * * * * * * * * * * *
*     StackedBarchart      *
* * * * * * * * * * * * * */


class StackedBarchart {

    constructor(parentElement, geoData, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.selectedClimateValue = "wet tropical";

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 0, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // append tooltip
        vis.tooltip = d3.select("#" + vis.parentElement).append('div')
            .attr('class', "tooltip tooltip-small");

        //Set up scales
        vis.x = d3.scaleBand()
            .range([0, vis.width])
            .paddingInner(0.1);

        vis.y = d3.scaleLinear()
            .range([vis.height - 90, 0]);

        // Get colors
        vis.solidColors = utils.getSolidColors();

        // Update color legends
        let riskLegend = document.getElementById("risk-labels");
        Object.keys(utils.getRisk()).forEach(key => {
            let li = document.createElement("li");
            li.textContent = key;

            let span = document.createElement("span");
            span.className = 'color-box';
            span.style.backgroundColor = this.solidColors[key];

            li.prepend(span);
            riskLegend.append(li);
        });

        // Set up stack method
        vis.stack = d3.stack()
            .keys(utils.getRiskKeys())
            .order(d3.stackOrderNone);

        // set up X axis
        vis.xAxis = vis.svg.append("g")
            .attr("id", "x-axis")
            .attr("class", "axis x-axis")
            .attr("transform", "translate(0," + (vis.height - 80) + ")");

        vis.wrangleData();
        vis.climateChange(null);
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
            return b.risk["Extinct"] - a.risk["Extinct"];
        }).filter((d, i) => { return i < 10 });

        vis.climateInfo.families = sortedFamilies;

        console.log(vis.climateInfo);

        vis.updateVis();
    }

    updateVis() {
        console.log('updateVis');
        let vis = this;

        // List of subgroups
        let subgroups = vis.climateInfo.families;

        console.log(">>>>>>>> ");
        console.log(subgroups);

        // Data stacked
        vis.series = vis.stack(d3.map(vis.climateInfo.families, function(d) { return(d.risk) }));
        console.log("-------- ****** ");
        console.log(vis.series);

        // Update scales
        vis.x = d3.scaleBand()
            .domain(d3.range(vis.climateInfo.families.length))
            .range([0, vis.width])
            .paddingInner(0.1);

        vis.y = d3.scaleLinear()
            .domain([0,
                d3.max(vis.climateInfo.families, function(d) {
                    let value = 1;
                     utils.getRiskKeys().forEach(risk => {
                         value += d.risk[risk];
                     })
                    return value;
                })
            ])
            .range([vis.height - 90, 0]);  // Flipped vertical scale

        // Add a group for each row of data
        vis.groups = vis.svg.selectAll(".bar-group")
            .data(vis.series);

        vis.groups.enter()
            .append("g")
            .merge(vis.groups)
            .attr("class", "bar-group")
            .style("fill", function(d) {
                return vis.solidColors[d.key];
            });

        vis.groups.exit().remove();

        // Add a rect for each data value
        vis.rects = vis.groups.selectAll(".bar-section")
            .data(function(d) { return d; })

        vis.rects.enter()
            .append("rect")
            .merge(vis.rects)
            .attr('class', 'bar-section')
            .on('mouseover', function(event, d) {
                try {
                    // console.log(d);
                    vis.tooltip
                        .style("opacity", 1)
                        .style("left", event.pageX + 20 + "px")
                        .style("top", event.pageY + "px")
                        .html(`
                         <div class="tooltip-box">
                             <h3 class="country-name">${d[1] - d[0]} species</h3>
                         </div>`);
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
            })
            .transition()
            .duration(600)
            .attr("x", function(d, i) {
                return vis.x(i);
            })
            .attr("y", function(d) {
                return vis.y(d[1]);
            })
            .attr("height", function(d) {
                return vis.y(d[0]) - vis.y(d[1]);
            })
            .attr("width", vis.x.bandwidth());

        vis.rects.exit().remove();

        // Update X axis
        vis.xAxis.call(d3.axisBottom().scale(vis.x))
            .selectAll("text")
            .text(function(d, i) {
                return subgroups[d].name;
            })
            .attr("y", 0)
            .attr("dy", 0)
            .attr("text-anchor", "end")
            .attr("transform", "rotate(-75)");
    }

    climateChange(event) {
        this.selectedClimateValue = document.getElementById("climate-selector").value;
        console.log(this.selectedClimateValue);

        this.wrangleData();
    }
}