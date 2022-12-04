/*
 * ComparisonVis - Object for visualization extinction/threatened
 *                 species counts for plants and animals.
 */

class ComparisonVis {

    constructor(_parentElement, _legendElement, _plantData, _animalData) {
        this.parentElement = _parentElement;
        this.legendElement = _legendElement;
        this.plantData = _plantData.filter((d) => d.Name === "Total")[0];
        this.animalData = _animalData.filter((d) => d.Name !== "Total");
        this.selectedStatus = "extinct";

        this.animalTypes = [...new Set(this.animalData.map((d) => d.Type))];
        this.colorMap = {
            "Plant": "#7fc97f",
            "Amphibian": "#bf5b17",
            "Bird": "#ffff99",
            "Mammal": "#fdc086",
            "Marine Life": "#386cb0",
            "Reptile": "#beaed4",
            "Other": "#f0027f",
            "none": "none"
        }
        this.statusLevels = {
            extinct: ["EX", "EW", "CR(PE)", "CR(PEW)"],
            threatened: ["CR", "EN", "VU"]
        };
        this.statusLevels["both"] = this.statusLevels.extinct.concat(this.statusLevels.threatened);

        // Set worth and opacity of box
        this.boxWorth = 10;
        this.boxOpacity = 0.85;

        this.drawLegend();
        this.initVis();
    }

    drawLegend() {
        let vis = this;
        const margin = {top: 0, right: 0, bottom: 20, left: 40};
        const width = document.getElementById(vis.legendElement).getBoundingClientRect().width - margin.left - margin.right,
            height = document.getElementById(vis.legendElement).getBoundingClientRect().height - margin.top - margin.bottom;

        // Create drawing space for legend
        const svg = d3.select("#" + vis.legendElement).append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .append("g")
            .attr("transform", `translate(${margin.left}, ${margin.top})`);

        // Calculate legend box dimension based on available space
        const boxDim = (3 / 4) * (4 * height / (5 * Object.keys(vis.colorMap).length - 1));
        const boxGap = boxDim / 4;

        // Add group, rect, and text for each legend element
        for (let i = 0; i < (Object.keys(vis.colorMap).length - 1); i++) {
            let type = Object.keys(vis.colorMap)[i];
            let legendGroup = svg.append("g")
                .classed("legend-row-group", true)
                .attr("transform", `translate(0, ${(i + 1) * (boxDim + boxGap)})`)
            legendGroup.append("rect")
                .classed("legend-box", true)
                .attr("width", boxDim)
                .attr("height", boxDim)
                .style("fill", vis.colorMap[type])
                .style("fill-opacity", vis.boxOpacity);
            legendGroup.append("text")
                .classed("legend-text", true)
                .attr("x", boxDim + boxGap)
                .attr("y", boxDim / 2)
                .attr("alignment-baseline", "middle")
                .text(type)
        }
    }

    initVis() {
        let vis = this;

        // Calculate drawing space attributes
        vis.margin = {top: 0, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Calculate dimensions based off of window size and data
        vis.groupWidth = vis.width * 0.47;

        // Initialize drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append("g")
            .attr("transform", `translate(${vis.margin.left}, ${vis.margin.top})`);

        // Add a group to each side for plants vs animals
        vis.plantGroup = vis.svg.append("g")
            .attr("id", "plant-group");
        vis.animalGroup = vis.svg.append("g")
            .attr("transform", `translate(${vis.width * 0.51}, 0)`)
            .attr("id", "animal-group");

        // Create tooltip
        vis.tooltip = d3.select("body")
            .append("div")
            .classed("tooltip", true)
            .attr("id", "comparison-chart-tooltip");

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Create object for summary data
        vis.summaryStats = {};
        vis.summaryStats = {
            extinct: {Plant: 0},
            threatened: {Plant: 0},
            both: {Plant: 0}
        };
        vis.animalTypes.forEach((t) => {
            vis.summaryStats.extinct[t] = 0;
            vis.summaryStats.threatened[t] = 0;
            vis.summaryStats.both[t] = 0;
        })

        // Tabulate display data for every threat level
        vis.finalData = {};
        for (let status in vis.statusLevels) {
            // Count and round number of plants at level
            for (let k in vis.plantData) {
                if (vis.statusLevels[status].includes(k)) {
                    vis.summaryStats[status].Plant += vis.boxWorth * Math.round(vis.plantData[k] / vis.boxWorth);
                }
            }
            // Count and round number of plants at level
            vis.animalTypes.forEach((t) => {
                let allOfType = vis.animalData.filter((d) => d.Type === t);
                // Might be multiple species, loop through
                for (let i = 0; i < allOfType.length; i++) {
                    let species = allOfType[i];
                    for (let k in species) {
                        if (vis.statusLevels[status].includes(k)) {
                            vis.summaryStats[status][t] += vis.boxWorth * Math.round(species[k] / vis.boxWorth);
                        }
                    }
                }
            });
            // Grab counts for threat level
            let levelData = vis.summaryStats[status];

            // Calculate whether there are more plants or animals
            let animalCount = 0;
            vis.animalTypes.forEach((t) => animalCount += levelData[t]);
            let maxCount = levelData.Plant > animalCount ? levelData.Plant : animalCount;

            // Calculate how many boxes total are needed
            let boxesNeeded = Math.ceil(maxCount / vis.boxWorth);

            // Calculate number of rows and columns
            // Start with ten columns, then check to see if row space will be filled
            vis.numCols = 10;
            let rowSpaceFull = false;
            let boxDim;
            while (!rowSpaceFull) {
                vis.numRows = Math.ceil(boxesNeeded / vis.numCols);
                let maxCellHeight = (4 * vis.height) / (5 * vis.numRows - 1);
                let maxCellWidth = (4 * vis.groupWidth) / (5 * vis.numCols - 1);
                if (maxCellWidth >= maxCellHeight) {
                    vis.numCols += 1;
                }
                else {
                    boxDim = maxCellWidth;
                    rowSpaceFull = true;
                }
            }

            // Transform plant summary stats into d3-friendly data structure
            let plantCount = levelData.Plant;
            let plantDisplayData = [];
            for (let i = 0; i < vis.numRows; i++) {
                plantDisplayData.push({row: `plant-row${i + 1}`, data: []});
                for (let j = 0; j < vis.numCols; j++) {
                    let cellID = `plant-row${i + 1}-col${j + 1}`;
                    // let cellFill = levelData.Plant > 0 ? "Plant": "none";
                    let cellFill = plantCount > 0 ? "Plant": "none";
                    plantDisplayData[i].data.push({
                        "id": cellID,
                        "fill": cellFill
                    });
                    // levelData.Plant -= vis.boxWorth;
                    plantCount -= vis.boxWorth;
                }
            }

            // Transform animal summary stats into d3-friendly data structure
            let animalCounts = [];
            for (let k in levelData) {
                if (k !== "Plant") {
                    animalCounts.push({"animal": k, "count": levelData[k]});
                }
            }
            animalCounts.sort((a, b) => a.count - b.count);

            let animalDisplayData = [];
            for (let i = 0; i < vis.numRows; i++) {
                animalDisplayData.push({row: `animal-row${i + 1}`, data: []});
                for (let j = 0; j < vis.numCols; j++) {
                    // If animal counts is empty, fill in empty squares
                    if (animalCounts.length == 0) {
                        let cellID = `animal-row${i + 1}-col${j + 1}`;
                        let cellFill = "none";
                        animalDisplayData[i].data.push({
                            "id": cellID,
                            "fill": cellFill
                        });
                    }
                    else {
                        // Get data for cell
                        let cellID = `animal-row${i + 1}-col${j + 1}`;
                        let cellFill = (animalCounts.length > 0) ? animalCounts[0].animal : "none";
                        animalDisplayData[i].data.push({
                            "id": cellID,
                            "fill": cellFill
                        });
                        // Subtract how much the box is worth from number of species
                        animalCounts[0].count -= vis.boxWorth;

                        // If number of species less than zero, move to next species
                        if (animalCounts[0].count < 0) {
                            animalCounts.shift();
                        }
                    }
                }
            }

            // Add to display data
            vis.finalData[status] = {"boxDim": boxDim,  "plants": plantDisplayData, "animals": animalDisplayData};
        }

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Get display data based off of selected threat level
        vis.displayData = vis.finalData[vis.selectedStatus];
        vis.displaySummaryStats = vis.summaryStats[vis.selectedStatus];

        // Update the chart message
        const selectionText = (vis.selectedStatus !== "both") ? vis.selectedStatus : "extinct + threatened";
        d3.select("#section-5-message__category")
            .html(selectionText);
        const animalTypeText = (vis.selectedStatus === "extinct") ? "amphibians, birds, mammals, reptiles, and other non-marine species" : "all animal species";
        d3.select("#section-5-message__animals")
            .html(animalTypeText);        

        // Create groups for each row
        vis.plantRows = vis.plantGroup.selectAll(".plant-row")
            .data(vis.displayData.plants);
        vis.plantRowGroups = vis.plantRows.enter()
            .append("g")
            .merge(vis.plantRows)
            .classed("plant-row", true)
            .attr("id", (d) => d.row)
            .attr("transform", (d, i) => `translate(0, ${vis.height - ((i + 1) * vis.displayData.boxDim)  - (i * vis.displayData.boxDim / 4)})`);
        vis.plantRows.exit().remove();

        vis.animalRows = vis.animalGroup.selectAll(".animal-row")
            .data(vis.displayData.animals);
        vis.animalRowGroups = vis.animalRows.enter()
            .append("g")
            .merge(vis.animalRows)
            .classed("animal-row", true)
            .attr("id", (d) => d.row)
            .attr("transform", (d, i) => `translate(0, ${vis.height - ((i + 1) * vis.displayData.boxDim)  - (i * vis.displayData.boxDim / 4)})`);
        vis.animalRows.exit().remove();

        // Draw squares for each row
        vis.plantCells = vis.plantRowGroups.selectAll(".plant-cell")
            .data(d => d.data);
        vis.plantCells.enter()
            .append("rect")
            .merge(vis.plantCells)
            .classed("comparison-cell plant-cell", true)
            .attr("id", (d) => d.id)
            .transition()
            .delay((d, i) => 1000 * i / vis.displayData.plants[0].data.length)
            .duration(1000)
            .ease(d3.easeLinear)
            .attr("x", (d, i) => i * (5 * vis.displayData.boxDim / 4))
            .attr("y", 0)
            .attr("width", vis.displayData.boxDim)
            .attr("height", vis.displayData.boxDim)
            .style("fill", (d) => vis.colorMap[d.fill])
            .style("fill-opacity",vis.boxOpacity);
        vis.plantCells.exit().remove();

        vis.animalCells = vis.animalRowGroups.selectAll(".animal-cell")
            .data(d => d.data);
        vis.animalCells.enter()
            .append("rect")
            .merge(vis.animalCells)
            .attr("class", (d) => `comparison-cell animal-cell ${d.fill.toLowerCase().replaceAll(" ", "-")}-cell`)
            .attr("id", (d) => d.id)
            .transition()
            .delay((d, i) => 1000 * i / vis.displayData.animals[0].data.length)
            .duration(1000)
            .ease(d3.easeLinear)
            .attr("x", (d, i) => i * (5 * vis.displayData.boxDim / 4))
            .attr("y", 0)
            .attr("width", vis.displayData.boxDim)
            .attr("height", vis.displayData.boxDim)
            .style("fill", d => vis.colorMap[d.fill])
            .style("fill-opacity", vis.boxOpacity);
        vis.animalCells.exit().remove();

        // TODO: look into more sophisticated event handler
        // Show tooltip on mouse over
        vis.svg.selectAll(".comparison-cell")
            .on("mouseover", function(event, d) {
                let className = `.${d.fill.toLowerCase().replaceAll(" ", "-")}-cell`;

                // Update tooltip
                const selectionStr = (vis.selectedStatus !== "both") ? vis.selectedStatus : "extinct + threatened";
                vis.tooltip.style("opacity", 0.95)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                        <div class="tooltip-box">
                          <h3>${d.fill}</h3>
                          <h4>
                            <span>${vis.displaySummaryStats[d.fill].toLocaleString()}</span> ${selectionStr} species
                          </h4>
                        </div>
                    `);
                // Ensure tooltip is within chart area
                let tooltipRect = document.getElementById("comparison-chart-tooltip").getBoundingClientRect();
                if (tooltipRect.right > window.innerWidth) {
                    vis.tooltip.style("left", window.innerWidth - (tooltipRect.width + 30) + "px");
                }
                if (tooltipRect.bottom > window.innerHeight) {
                    vis.tooltip.style("top", event.pageY - tooltipRect.height + "px");
                }

            })
            .on("mouseout", function(event, d) {
                let className = `.${d.fill.toLowerCase().replaceAll(" ", "-")}-cell`;

                // Remove tooltip
                vis.tooltip.style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html("");
            });
    }

    changeStatus() {
        let vis = this;
        vis.selectedStatus = document.getElementById("comparison-selector").value;
        vis.updateVis();
    }
}
