/* * * * * * * * * * * * * *
*         MapFlat          *
* * * * * * * * * * * * * */


class MapFlat {

    constructor(parentElement, geoData, data) {
        this.parentElement = parentElement;
        this.geoData = geoData;
        this.data = data;

        // define colors
        this.colors = ['#136a8a', '#458fc4', '#9ac7eb', '#baf3fd'];

        this.initVis();
    }

    initVis() {
        let vis = this;
        let m0,
            o0;

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

        // append tooltip
        // vis.tooltip = d3.select("body").append('div')
        //     .attr('class', "tooltip")
        //     .attr('id', 'pieTooltip');

        // add legend to map
        vis.legend = vis.svg.append("g")
            .attr('class', 'legend')
            .attr('transform', `translate(0, ${vis.height - 20})`);

        vis.colorScale = d3.scaleBand()
            .domain(vis.colors.map( (d, i) => ["Cat 1", "Cat 2", "Cat 3", "Cat 4"][i]))
            .range([0, 200]);

        vis.legend.selectAll("rect")
            .data(vis.colors)
            .enter()
            .append("rect")
            .attr("fill", (d, i) => vis.colors[i])
            .attr("height", 20)
            .attr("width", vis.colorScale.bandwidth())
            .attr("x", (d, i) => vis.colorScale.bandwidth() * i)
            .attr("y", 0);

        vis.legend.append("g")
            .attr("id", "legend-axis")
            .attr("class", "axis legend-axis")
            .call(d3.axisBottom().scale(vis.colorScale));

        vis.wrangleData();
    }

    wrangleData() {
        let vis = this;

        // Convert  TopoJSON data into GeoJSON data structure
        vis.world = topojson.feature(vis.geoData, vis.geoData.objects.countries).features;

        // create random data structure with information for each land
        vis.countryInfo = {};

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.countries = vis.svg.selectAll(".country")
            .data(vis.world);

        vis.countries.enter()
            .append("path")
            .attr('class', 'country')
            .attr("d", vis.path)
            .merge(vis.countries)
            .attr("fill", d => vis.colors[Math.floor(Math.random() * 4)])
            .attr("stroke", "#136A8A")
            .on('mouseover', function(event, d) { })
            .on('mouseout', function(event, d){ });

        vis.countries.exit().remove();

        // update legend
        vis.legend.selectAll().data(vis.colors)
            .enter();
    }
}