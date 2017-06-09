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
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox","0 0 " + vis.width + " " + vis.height)
        .attr("class", "svg-content")
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.projection = d3.geo.albersUsa()
        .scale(850)
        .translate([vis.width / 2, vis.height / 2]);

    vis.path = d3.geo.path()
        .projection(vis.projection);

    vis.div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    vis.selection = "enr2015";

    // State boundaries

    vis.statesGroup = vis.svg.append("g")
        .attr("class", "statesFill")
        .selectAll("path")
        .data(vis.states)
        .enter().append("path")
        .attr("d", vis.path);

    // Legend

    // Edit zoom so that legend doesn't zoom

    vis.legend = vis.svg.selectAll('g.legend')
        .data(legendColor)
        .enter().append('g')
        .attr('class', 'legend')
        .attr("transform", function(d, i) { return "translate(" + (vis.width - 125) + "," + (350 + (i * 20)) + ")"; });

    vis.legend.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("class", "legendRect")
        .style("fill", function(d) {return d;});

    vis.legend.append("text")
        .attr("dy", "0.8em");

    vis.legend.select("text")
        .data(legendText)
        .attr("x", 35)
        .text(function(d) { return d });

    vis.updateChoropleth();

};

Choropleth.prototype.updateChoropleth = function() {
    var vis = this;

    vis.selectGroup = vis.svg.append("g")
        .attr("class", "select")
        .selectAll("path")
        .data(vis.msa);

    vis.selectGroup.enter().append("path");

    vis.selectGroup
        .attr("d", vis.path)
        .attr("class", "select")
        .attr("id", function(d) { return "msa" + d.properties.geoid; })
        .style("fill", function(d) {
            return choroColor(d.properties[vis.selection]);
        })
        .style("opacity", 0.8)
        .on("mouseover", function(d) {
            d3.select(this)
                .transition()
                .duration(300)
                .style('fill', highlight)
                .style("stroke", "white")
                .style("opacity", 1);
            vis.div.transition().duration(300)
                .style("opacity", 1);
            vis.div.text(function () { return (d.properties.name); })
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY -30) + "px");

            vis.s = d.properties.geoid;
            d3.select("#dot" + vis.s)
                .moveToFront()
                .attr("r", 5)
                .style('fill', highlight)
                .style("stroke", "black")
                .style("opacity", 1);
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition().duration(300)
                .style("opacity", 0.8)
                .style("stroke","525252")
                .style('fill', function (d) {
                    return choroColor(d.properties[vis.selection]);
                });
            vis.div.transition().duration(300)
                .style("opacity", 0);
            d3.select("#dot" + vis.s)
                .style("opacity", 0.8)
                .attr("r", 3.5)
                .style("stroke", "none")
                .style('fill', function (d) {
                    return regionColor(d.region);
                });
        });

    vis.statesGroup = vis.svg.append("g")
        .attr("class", "statesLine")
        .selectAll("path")
        .data(vis.states)
        .enter().append("path")
        .attr("d", vis.path);

    vis.selectGroup.exit().remove();

};

Choropleth.prototype.highlight = function(market) {
    var vis = this;



};