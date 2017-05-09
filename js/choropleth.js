/*
 *  Choropleth - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Data
 */

Choropleth = function(_parentElement, _geoJson, _states, _nation) {

    this.parentElement = _parentElement;
    this.msa = _geoJson;
    this.states = _states;
    this.nation = _nation;

    this.initVis();
};


/*
 *  Initialize area chart
 */

Choropleth.prototype.initVis = function() {

    var vis = this;

    vis.margin = {top: 0, right: 0, bottom: 0, left: 0};

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 500- vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
    ;

    vis.projection = d3.geo.albers()
        .scale(1000)
        .translate([vis.width / 2, vis.height / 2]);

    vis.path = d3.geo.path()
        .projection(vis.projection);

    vis.color = d3.scale.threshold()
        .domain([-2, -1, .1, 2])
        .range(['#d7191c','#fdae61','#ffffbf','#a6d96a','#1a9641']);

    vis.div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    vis.selection = "enr2015";

    // National boundaries

    vis.nationGroup = vis.svg.append("g")
        .attr("class", "nation")
        .selectAll('.nation')
        .data(vis.nation)
        .enter().append("path")
        .attr("d", vis.path);

    // State boundaries

    vis.statesGroup = vis.svg.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(vis.states)
        .enter().append("path")
        .attr("d", vis.path)
        .on("click", vis.clicked);

    // Legend

    vis.legendText = ["High","Above Average","Average","Below Average","Low","No Data"];
    vis.legendColor = ['#1a9641','#a6d96a','#ffffbf','#fdae61','#d7191c','Gray'];

    vis.legend = vis.svg.selectAll('g.legend')
        .data(vis.legendColor)
        .enter().append('g')
        .attr('class', 'legend')
        .attr("transform", function(d, i) { return "translate(20," + (400 + (i * 20)) + ")"; });

    vis.legend.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("class", "legendRect")
        .style("fill", function(d) {return d;});

    vis.legend.append("text")
        .attr("dy", "0.8em");

    vis.legend.select("text")
        .data(vis.legendText)
        .attr("x", 35)
        .text(function(d) { return d });

    vis.updateChoropleth(vis.selection);

};

Choropleth.prototype.updateChoropleth = function() {
    var vis = this;

    vis.selectGroup = vis.svg.append("g")
        .selectAll("path")
        .data(vis.msa);

    vis.selectGroup.enter().append("path");

    vis.selectGroup
        .attr("d", vis.path)
        .attr("class", "select")
        .attr("id", function(d) { return "msa" + d.properties.GEOID; })
        .style("fill", function(d) {
            return vis.color(d.properties[vis.selection]);
        })
        .style("opacity", 0.8)
        .on("mouseover", function(d) {
            d3.select(this).transition().duration(300).style("opacity", 1);
            vis.div.transition().duration(300)
                .style("opacity", 1);
            vis.div.text(function() {
                if (d.properties[vis.selection]) {
                    return (d.properties.NAME + ": " + d.properties[vis.selection]);
                }
                else {
                    return (d.properties.NAME + ": No Data")
                }
            })
            .style("left", (d3.event.pageX) + "px")
            .style("top", (d3.event.pageY -30) + "px");

            vis.s = d.properties.GEOID;
            d3.select("#dot" + vis.s)
                .moveToFront()
                .attr("r", 5)
                .style('fill', "#ff0000")
                .style("stroke", "black")
                .style("opacity", 1);
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition().duration(300)
                .style("opacity", 0.8);
            vis.div.transition().duration(300)
                .style("opacity", 0);

            d3.select("#dot" + vis.s)
                .attr("r", 3.5)
                .style("stroke", "none")
                .style('fill', function (d) {
                    return vis.color(d.region);
                });
        });

    vis.selectGroup.exit().remove();

};

Choropleth.prototype.highlight = function(market) {
    var vis = this;



};

// Choropleth.prototype.onChange = function() {
//     var vis = this;
//
//     vis.selection = d3.select("#options").property("value");
//
//     console.log(selection);
//
//     vis.updateChoropleth(selection);
// };


// TO DO

// Handle N/As
// Add N/A color to legend
// Background map - state lines
// Static categories for legend
// Switch to counties