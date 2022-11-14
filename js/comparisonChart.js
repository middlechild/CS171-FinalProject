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

        // Create object for display data
        vis.summaryStats = {};
        vis.summaryStats = {
            extinct: {plants: 0},
            threatened: {plants: 0},
            both: {plants: 0}
        };
        vis.animalTypes.forEach((t) => {
            vis.summaryStats.extinct[t] = 0;
            vis.summaryStats.threatened[t] = 0;
            vis.summaryStats.both[t] = 0;
        })

        // Tabulate display data for every
        for (let status in vis.statusLevels) {
            for (let k in vis.plantData) {
                if (vis.statusLevels[status].includes(k)) {
                    vis.summaryStats[status].plants += vis.plantData[k];
                }
            }
            vis.animalTypes.forEach((t) => {
                let allOfType = vis.animalData.filter((d) => d.Type === t);
                // Might be multiple species, loop through
                for (let i = 0; i < allOfType.length; i++) {
                    let species = allOfType[i];
                    for (let k in species) {
                        if (vis.statusLevels[status].includes(k)) {
                            vis.summaryStats[status][t] += species[k];
                        }
                    }
                }
            });
        }

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.displayData = vis.summaryStats[selectedComparison];

        let animalCount = 0;
        vis.animalTypes.forEach((t) => {
            animalCount += vis.displayData[t];
        });
        let maxCount = vis.displayData.plants > animalCount ? vis.displayData.plants : animalCount;

        // Calculate how many boxes are needed
        let boxesNeeded = Math.ceil(maxCount / vis.boxWorth);

        // Calculate number of rows/columns
        let numRows = boxesNeeded > 100 ? boxesNeeded / vis.boxWorth: vis.boxWorth;
        let numCols = boxesNeeded > 100 ? vis.boxWorth: boxesNeeded / vis.boxWorth;

        // Calculate box dimensions
        let maxBoxWidth = (4 * vis.groupWidth)/(5 * numCols - 1);
        let maxBoxHeight = (4 * vis.height)/(5 * numRows - 1);
        let boxDim = maxBoxWidth < maxBoxHeight ? maxBoxWidth : maxBoxHeight;
        let gap = boxDim / 4;

        // Transform display data to align with d3 better
        // TODO: move this to wrangle data
        let plantDisplayData = [];
        for (let i = 0; i < numRows; i++) {
            plantDisplayData.push({row: `plant-row${i + 1}`, data: []});
        }
        for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numCols; j++) {
                let cellID = `plant-row${i + 1}-col${j + 1}`;
                let cellFill = vis.displayData.plants > 0 ? "Plant": "none";
                plantDisplayData[i].data.push({
                    "id": cellID,
                    "fill": cellFill
                });
                vis.displayData.plants -= 10;
            }
        }
        delete vis.displayData.plants;
        let animalCounts = [];
        for (let k in vis.displayData) {
            animalCounts.push({"animal": k, "count": vis.displayData[k]});
        }
        animalCounts.sort((a, b) => a.count - b.count);
        let animalDisplayData = [];
        for (let i = 0; i < numRows; i++) {
            animalDisplayData.push({row: `animal-row${i + 1}`, data: []});
        }
        for (let i = 0; i < numRows; i++) {
            for (let j = 0; j < numCols; j++) {
                let cellID = `animal-row${i + 1}-col${j + 1}`;
                let cellFill = (animalCounts.length > 0) ? animalCounts[0].animal : "none";
                animalDisplayData[i].data.push({
                    "id": cellID,
                    "fill": cellFill
                });
                animalCounts[0].count -= 10;
                if (animalCounts[0].count < 0) {
                    animalCounts.shift();
                }
            }
        }

        // Create groups for each row
        vis.plantRows = vis.plantGroup.selectAll(".plant-row")
            .data(plantDisplayData);
        vis.plantRowGroups = vis.plantRows.enter()
            .append("g")
            .merge(vis.plantRows)
            .classed("plant-row", true)
            .attr("id", (d) => d.row)
            .attr("transform", (d, i) => `translate(0, ${vis.height - ((i + 1) * boxDim)  - (i * gap)})`);

        vis.animalRows = vis.animalGroup.selectAll(".animal-row")
            .data(animalDisplayData);
        vis.animalRowGroups = vis.animalRows.enter()
            .append("g")
            .merge(vis.animalRows)
            .classed("animal-row", true)
            .attr("id", (d) => d.row)
            .attr("transform", (d, i) => `translate(0, ${vis.height - ((i + 1) * boxDim)  - (i * gap)})`);


        // Draw squares for each row
        vis.plantCells = vis.plantRowGroups.selectAll(".plant-cell")
            .data(d => d.data);
        vis.plantCells.enter()
            .append("rect")
            .merge(vis.plantCells)
            .classed("plant-cell", true)
            .attr("id", (d) => d.id)
            .attr("x", (d, i) => i * (boxDim + gap))
            .attr("y", 0)
            .attr("width", boxDim)
            .attr("height", boxDim)
            .style("fill", d => vis.colorMap[d.fill]);
        vis.plantCells.exit().remove();

        vis.animalCells = vis.animalRowGroups.selectAll(".animal-cell")
            .data(d => d.data);
        vis.animalCells.enter()
            .append("rect")
            .merge(vis.animalCells)
            .classed("animal-cell", true)
            .attr("id", (d) => d.id)
            .attr("x", (d, i) => i * (boxDim + gap))
            .attr("y", 0)
            .attr("width", boxDim)
            .attr("height", boxDim)
            .style("fill", d => vis.colorMap[d.fill]);
        vis.animalCells.exit().remove();
    }
}