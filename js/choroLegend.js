// Legend

// Label
// Line up with selectors

ChoroLegend = function(_parentElement) {

    this.parentElement = _parentElement;

    this.initVis();
};

ChoroLegend.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 0, right: 0, bottom: 0, left: 0};

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 200 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");

    vis.legendText = ["High","Above Average","Average","Below Average","Low","No Data"];
    vis.legendColor = ['#1a9641','#a6d96a','#ffffbf','#fdae61','#d7191c','Gray'];

    vis.legend = vis.svg.selectAll('g.legend')
        .data(vis.legendColor)
        .enter().append('g')
        .attr('class', 'legend')
        .attr("transform", function(d, i) { return "translate(15," + (30 + (i * 20)) + ")"; });

    vis.label = vis.svg.append("text")
        .text("Relative RNS")
        .attr("x", 15)
        .attr("y", 15)
        .style("font-weight","bold");

    vis.legend.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("class", "legendRect")
        .style("fill", function(d) {return d;})
        .attr("stroke", "#424242");

    vis.legend.append("text")
        .attr("dy", "0.8em");

    vis.legend.select("text")
        .data(vis.legendText)
        .attr("x", 35)
        .text(function(d) { return d });

};