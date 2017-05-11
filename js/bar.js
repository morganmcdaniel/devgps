/*
 *  Bar Graph - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Data
 */

Bar = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;

    this.initVis();
};

/*
 *  Initialize area chart
 */

Bar.prototype.initVis = function() {

    var vis = this;

    vis.margin = {top: 50, right: 20, bottom: 40, left: 60};

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 600 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
    ;

    vis.x = d3.scale.linear()
        .range([0, 20])
    ;

    vis.wrangleData();
};

Bar.prototype.wrangleData = function() {
    var vis = this;

    vis.dataShort = [];

    for (i = 0; i < 15; i++) {
        vis.dataShort[i] = vis.data[i];
    }

    vis.updateBar();
};

Bar.prototype.updateBar = function() {
    var vis = this;

    vis.x.domain([0, d3.max(vis.data, function(d) {return d.msaRa;  })]);

    vis.barChart = vis.svg.selectAll('g.bar')
        .data(vis.dataShort)
        .enter().append('g')
        .attr('class', 'bar')
        .attr("transform", function(d, i) { return "translate(0," + (15 + (i * 25)) + ")"; });

    vis.label = vis.svg.append("text")
        .text("Top 20 Industries")
        .attr("x", 0)
        .attr("y", 0)
        .style("font-weight","bold");

    vis.barChart.append("rect")
        .attr("x", 410)
        .attr("width", function(d) { return vis.x(d.msaRa) ;})
        .attr("height", 20)
        .style("fill", "#D3D3D3");

    vis.barChart.append("text")
        .attr("dy", "0.8em")
        .attr("x", 400)
        .text(function(d) { return d.key })
        .style("text-anchor","end");

    vis.barChart.append("text")
        .attr("dy", "0.8em")
        .attr("x", 415)
        .text(function(d) { return d.msaRa });

};