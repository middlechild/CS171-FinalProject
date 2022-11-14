/* * * * * * * * * * * * * *
*   class ComparisonVis    *
* * * * * * * * * * * * * */

class ComparisonVis {

    constructor(parentElement, plantData, animalData) {
        this.parentElement = parentElement;
        this.plantData = plantData.filter((d) => d.Name === "Total")[0];
        this.animalData = animalData.filter((d) => d.Name !== "Total");

        this.animalTypes = [...new Set(this.animalData.map((d) => d.Type))];
        // TODO: verify these designations
        this.statusLevels = {
            extinct: ["EX", "EW", "CR(PE)", "CR(PEW)"],
            threatened: ["CR", "EN", "VU"]
        };
        this.statusLevels["both"] = this.statusLevels.extinct.concat(this.statusLevels.threatened);

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
            .attr("width", vis.groupWidth)
            .attr("height", vis.height)
            .attr("id", "plant-group");
        vis.animalGroup = vis.svg.append("g")
            .attr("width", vis.groupWidth)
            .attr("height", vis.height)
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
        console.log(vis.displayData);
    }
}