/*
 *  Bar Graph - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Data
 */

MasterBar = function(_parentElement, _data) {

    this.parentElement = _parentElement;

    this.initVis();
};

/*
 *  Initialize area chart
 */

MasterBar.prototype.initVis = function() {
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
        .range([0, vis.width - 400])
    ;

    vis.y = d3.scale.ordinal()
        .rangeRoundBands([vis.height, 0], .2)
    ;

    barKey = "Mississippi";
    barLevel = "top";

    vis.wrangleData();
};

MasterBar.prototype.passedIn = function(a,b) {
    var vis = this;

    barKey = a;
    barLevel = b;
    console.log("bar level = " + barLevel + ", bar key = " + barKey);
    vis.wrangleData();
};

MasterBar.prototype.wrangleData = function() {
    var vis = this;

    console.log(barData);
    console.log("bar level = " + barLevel + ", bar key = " + barKey);
    // Filter by parent value

    if (barLevel == "top") {
        vis.inter = d3.nest()
            .key(function(d) {return d.category })
            .rollup(function(v) {return d3.sum(v, function(d) { return d[selectVar];})})
            .entries(barData);
    }
    else if (barLevel == "middle") {
        vis.filtered = barData.filter(function(d) {
            return (d.market == [barKey]);
        });
        vis.inter = d3.nest()
            .key(function(d) {return d.category })
            .rollup(function(v) {return d3.sum(v, function(d) { return d[selectVar];})})
            .entries(vis.filtered);
        vis.barKeyMiddle = barKey
    }
    else if (barLevel == "bottom") {
        vis.filtered = barData.filter(function(d) {
            return (d.category == [barKey] && d.market == vis.barKeyMiddle);
        });
        vis.inter = vis.filtered.map(function(d,i) {
            return {
                key: d.description,
                values: d[selectVar]
            };
        });
    }

    console.log(vis.inter);

    // vis.filtered.forEach(function(d) {
    //     d.emp = +d.emp;
    //     d.ra = +d.ra;
    // });

    //Sort by selectVar
    vis.inter.sort(function(a,b) {
        return b.values - a.values;
    });
    console.log(vis.inter);

    // Shorten
    //vis.dataShort = [];
    //
    // for (i = 0; i < 15; i++) {
    //     vis.dataShort[i] = vis.inter[i];
    // }

    vis.updateBar();
};

MasterBar.prototype.updateBar = function() {
    var vis = this;

    vis.barHeight = 27;

    vis.x.domain([0, d3.max(vis.inter, function(d) {return d.values;  })]);

    // vis.title = vis.svg.selectAll(".title")
    //     .append("text")
    //     .attr("class", "title")
    //     .text(function() {
    //         if (barLevel == "top" && selectLevel == "msa") {
    //             return "Top Industries in Large Mississippi Cities";
    //         }
    //         else if (barLevel == "top" && selectLevel == "county") {
    //             return "Top Industries in Mississippi Counties";
    //         }
    //         else if (barLevel == "middle") {
    //             return "Top Industries in " + barKey;
    //         }
    //         else if (barLevel == "bottom") {
    //             return "Top Industries in " + barKey;
    //         }
    //     })
    //     .attr("x", 0)
    //     .attr("y", 0);
    //
    // vis.title.remove();

    vis.bars = vis.svg.selectAll(".rect")
        .data(vis.inter);

    vis.bars
        .enter()
        .append("rect")
        .attr("class", "rect");

    vis.bars
        .transition()
        .duration(300)
        .attr("x", 415)
        .attr("y", function(d, index) {
            return (index * vis.barHeight);
        })
        .attr("height", vis.barHeight - 3)
        .attr("width", function(d) { return vis.x(d.values); })
        .style("fill", "#D3D3D3");

    vis.bars.exit().remove();

    // y-axis labels
    vis.labels = vis.svg.selectAll(".text")
        .data(vis.inter);

    vis.labels
        .enter()
        .append("text")
        .attr("class", "text");

    vis.labels
        .transition()
        .duration(300)
        .attr("x", 400)
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
        .attr("x", 415)
        .attr("y", function (d, index) {
            return (index * vis.barHeight + (vis.barHeight + 3) / 2);
        })
        //.style("text-anchor", "end")
        .text(function(d) { return Math.round(d.values)});

    vis.numbers.exit().remove();
};