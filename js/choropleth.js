/*
 *  Choropleth - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Data
 */

Choropleth = function(_parentElement, _geoJson) {

    this.parentElement = _parentElement;
    this.msa = _geoJson;

    this.initVis();
};


/*
 *  Initialize area chart
 */

Choropleth.prototype.initVis = function() {

    var vis = this;

    vis.margin = {top: 50, right: 20, bottom: 40, left: 60};

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 600- vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
    ;

    vis.projection = d3.geo.albersUsa()
        .translate([vis.width / 2, vis.height / 2]);

    vis.path = d3.geo.path()
        .projection(vis.projection);

    vis.color = d3.scale.quantize()
        .range(['#b2182b', '#ef8a62', '#fddbc7', '#f7f7f7', '#d1e5f0', '#67a9cf', '#2166ac']);

    vis.div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    vis.selection = "enr2015";

    vis.updateChoropleth(vis.selection);

};

Choropleth.prototype.updateChoropleth = function() {
    var vis = this;

    vis.color.domain([
        d3.min(vis.msa, function(d) { return d.properties[vis.selection]; }),
        d3.max(vis.msa, function(d) { return d.properties[vis.selection]; })
    ]);

    vis.choro = vis.svg.selectAll("path")
        .data(vis.msa);

    vis.choro.enter().append("path");

    vis.choro
        .attr("d", vis.path)
        .style("fill", function(d) {
            return vis.color(d.properties[vis.selection]);
        })
        .style("opacity", 0.8)
        .on("mouseover", function(d) {
            d3.select(this).transition().duration(300).style("opacity", 1);
            vis.div.transition().duration(300)
                .style("opacity", 1);
            vis.div.text(d.properties.NAME + ": " + d.properties[vis.selection])
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY -30) + "px")
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition().duration(300)
                .style("opacity", 0.8);
            vis.div.transition().duration(300)
                .style("opacity", 0);
        });

    vis.choro.exit().remove();

    vis.legend = vis.svg.selectAll('g.legend')
        .data(vis.color.range());

    vis.legend.enter().append('g')
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
        .attr("x", 35)
        .text(function(d) {
            var extent = vis.color.invertExtent(d);
            return extent[0].toLocaleString() + " - " + extent[1].toLocaleString();

        });

    vis.legend.exit().remove();

};

Choropleth.prototype.onChange = function() {
    var vis = this;

    vis.selection = d3.select("#options").property("value");

    console.log(selection);

    vis.updateChoropleth(selection);
};


// TO DO

// Handle N/As
// Add N/A color to legend
// Background map - state lines
// Static categories for legend
// Switch to counties