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

    vis.margin = {top: 5, right: 20, bottom: 20, left: 20};

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 600 - vis.margin.top - vis.margin.bottom;

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
    ;

    vis.x = d3.scale.linear()
        .range([0, vis.width/2])
    ;

    barKey = "Tupelo";
    barLevel = "top";

    vis.wrangleData();
};

Bar.prototype.passedIn = function(a,b) {
    var vis = this;

    barKey = a;
    barLevel = b;

    vis.wrangleData();
};

Bar.prototype.wrangleData = function() {
    var vis = this;

    if (barLevel == "top") {
        vis.inter = d3.nest()
            .key(function(d) {return d.category })
            .rollup(function(v) {return d3.sum(v, function(d) { return d.msaRa;})})
            .entries(vis.data);
    }
    else if (barLevel == "bottom") {
        vis.filtered = vis.data.filter(function(d) {
            return (d.category == [barKey]);
        });
        vis.inter = vis.filtered.map(function(d,i) {
            return {
                key: d.key,
                values: d.msaRa
            };
        });
    }

    //Sort by selectVar
    vis.inter.sort(function(a,b) {
        return b.values - a.values;
    });

    vis.updateBar();
};

Bar.prototype.updateBar = function() {
    var vis = this;

    vis.barHeight = 27;

    vis.x.domain([0, d3.max(vis.inter, function(d) {return d.values;  })]);

    vis.bars = vis.svg.selectAll(".rect")
        .data(vis.inter);

    vis.bars
        .enter()
        .append("rect")
        .attr("class", "rect");

    vis.bars
        .transition()
        .duration(300)
        .attr("x", vis.width/2)
        .attr("y", function(d, index) {
            return (index * vis.barHeight);
        })
        .attr("height", vis.barHeight - 3)
        .attr("width", function(d) { return vis.x(d.values); })
        .style("fill", "#D3D3D3");

    vis.bars.exit().remove();

    vis.labels = vis.svg.selectAll(".text")
        .data(vis.inter);

    vis.labels
        .enter()
        .append("text")
        .attr("class", "text");

    vis.labels
        .transition()
        .duration(300)
        .attr("x", (vis.width/2 - 15))
        .attr("y", function (d, index) {
            return (index * vis.barHeight + (vis.barHeight + 3) / 2);
        })
        .style("text-anchor", "end")
        .text(function (d) {
            return d.key;
        });

    vis.labels.exit().remove();

    vis.numbers = vis.svg.selectAll(".number")
        .data(vis.inter);

    vis.numbers
        .enter()
        .append("text")
        .attr("class", "number");

    vis.numbers
        .transition()
        .duration(300)
        .attr("x", vis.width/2)
        .attr("y", function (d, index) {
            return (index * vis.barHeight + (vis.barHeight + 3) / 2);
        })
        //.style("text-anchor", "end")
        .text(function(d) { return Math.round(d.values)});

    vis.numbers.exit().remove();

};