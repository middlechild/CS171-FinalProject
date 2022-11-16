/* * * * * * * * * * * * * *
*   class ComparisonVis    *
* * * * * * * * * * * * * */

class ComparisonVis {

    constructor(parentElement, plantData, animalData) {
        this.parentElement = parentElement;
        this.plantData = plantData.filter((d) => d.Name === "Total")[0];
        this.animalData = animalData.filter((d) => d.Name !== "Total");

        this.animalTypes = [...new Set(this.animalData.map((d) => d.Type))];
        this.colorMap = {
            "Plant": "#7fc97f",
            "Reptile": "#beaed4",
            "Mammal": "#fdc086",
            "Bird": "#ffff99",
            "Amphibian": "#bf5b17",
            "Other": "#f0027f",
            "Marine Life": "#386cb0",
            "none": "none"
        }
        // TODO: verify these designations
        this.statusLevels = {
            extinct: ["EX", "EW", "CR(PE)", "CR(PEW)"],
            threatened: ["CR", "EN", "VU"]
        };
        this.statusLevels["both"] = this.statusLevels.extinct.concat(this.statusLevels.threatened);

        // Set how much each box should be worth
        this.boxWorth = 10;

        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 20, right: 20, bottom: 20, left: 20};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // Calculate dimensions based off of window size and data
        vis.groupWidth = vis.width * 0.49;

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
            let plantDisplayData = [];
            for (let i = 0; i < vis.numRows; i++) {
                plantDisplayData.push({row: `plant-row${i + 1}`, data: []});
                for (let j = 0; j < vis.numCols; j++) {
                    let cellID = `plant-row${i + 1}-col${j + 1}`;
                    let cellFill = levelData.Plant > 0 ? "Plant": "none";
                    plantDisplayData[i].data.push({
                        "id": cellID,
                        "fill": cellFill
                    });
                    levelData.Plant -= vis.boxWorth;
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
        vis.displayData = vis.finalData[selectedComparison];

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
            .classed("plant-cell", true)
            .attr("id", (d) => d.id)
            .transition()
            .duration(750)
            .attr("x", (d, i) => i * (5 * vis.displayData.boxDim / 4))
            .attr("y", 0)
            .attr("width", vis.displayData.boxDim)
            .attr("height", vis.displayData.boxDim)
            .style("fill", d => vis.colorMap[d.fill]);
        vis.plantCells.exit().remove();

        vis.animalCells = vis.animalRowGroups.selectAll(".animal-cell")
            .data(d => d.data);
        vis.animalCells.enter()
            .append("rect")
            .merge(vis.animalCells)
            .classed("animal-cell", true)
            .attr("id", (d) => d.id)
            .transition()
            .duration(750)
            .attr("x", (d, i) => i * (5 * vis.displayData.boxDim / 4))
            .attr("y", 0)
            .attr("width", vis.displayData.boxDim)
            .attr("height", vis.displayData.boxDim)
            .style("fill", d => vis.colorMap[d.fill]);
        vis.animalCells.exit().remove();
    }
}
