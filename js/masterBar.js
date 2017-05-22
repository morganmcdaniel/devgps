/*
 *  Bar Graph - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Data
 */

MasterBar = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;

    this.initVis();
};

/*
 *  Initialize area chart
 */

MasterBar.prototype.initVis = function() {
    var vis = this;

    console.log(vis.data);

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
        .range([0, vis.width - 400])
    ;

    var barKey = "Mississippi";
    var barLevel = "top";

    // pass in the level we're on
    // pass in the selected value
    vis.wrangleData(barKey, barLevel);
};

MasterBar.prototype.wrangleData = function(barKey, barLevel) {
    var vis = this;

    // Filter by parent value

    console.log(vis.data);

    vis.filtered = vis.data.filter(function(d) {
        if (barLevel == "top") {
            return d;
        }
        else if (barLevel == "middle") {
            return (d.market == d[barKey]);
        }
        else if (barlevel == "bottom") {
            return (d.category == d[barKey]);
        }
    });

    vis.filtered.forEach(function(d) {
        d.emp = +d.emp;
        d.ra = +d.ra;
    });
    console.log(barKey + " " + barLevel);
    console.log(vis.filtered);

    //Sort by selectVar
    vis.filtered.sort(function(a,b) {
        return b[selectVar] - a[selectVar];
    });

    // Shorten
    vis.dataShort = [];

    for (i = 0; i < 15; i++) {
        vis.dataShort[i] = vis.filtered[i];
    }

    vis.updateBar();
};

MasterBar.prototype.updateBar = function() {
    var vis = this;

    vis.x.domain([0, d3.max(vis.data, function(d) {return d.ra;  })]);

    vis.barChart = vis.svg.selectAll('g.bar')
        .data(vis.dataShort)
        .enter().append('g')
        .attr('class', 'bar')
        .attr("transform", function(d, i) { return "translate(0," + (15 + (i * 25)) + ")"; });

    vis.label = vis.svg.append("text")
        .text("Top 15 Industries")
        .attr("x", 0)
        .attr("y", 0)
        .style("font-weight","bold");

    vis.barChart.append("rect")
        .attr("x", 410)
        .attr("width", function(d) { return vis.x(d.ra) ;})
        .attr("height", 20)
        .style("fill", "#D3D3D3");

    vis.barChart.append("text")
        .attr("dy", "0.8em")
        .attr("x", 400)
        .text(function(d) { return d.description })
        .style("text-anchor","end");

    vis.barChart.append("text")
        .attr("dy", "0.8em")
        .attr("x", 415)
        .text(function(d) { return Math.round(d.ra)});

};