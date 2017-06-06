/*
 *  Scatter Plot - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Data
 */

Scatter = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;

    this.initVis();
};

/*
 *  Initialize scatter plot
 */

Scatter.prototype.initVis = function() {

    var vis = this;

    vis.margin = {top: 20, right: 20, bottom: 30, left: 40};

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 450 - vis.margin.top - vis.margin.bottom;

    vis.x = d3.scale.linear()
        .range([0, vis.width]);

    vis.y = d3.scale.linear()
        .range([vis.height, 0]);

    vis.div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Update this later when decided how to color
    // vis.color = d3.scale.ordinal()
    //     .domain(["Northeast","Midwest","South","West"])
    //     .range(['#66c2a5','#fc8d62','#8da0cb','#e78ac3']);

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
    ;

    // draw legend
    vis.legend = vis.svg.selectAll(".legend")
        .data(regionColor.range())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // draw legend colored rectangles
    vis.legend.append("rect")
        .attr("x", vis.width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) {return d;});

    vis.legend.append("text")
        .attr("dy", ".35em");

    vis.legend.select("text")
        .data(regionColor.domain())
        .attr("x", vis.width - 24)
        .attr("y", 9)
        .style("text-anchor", "end")
        .text(function(d) { return d });

    vis.wrangleData();
};

Scatter.prototype.wrangleData = function() {

    var vis = this;

    vis.wrangleEnr = [];

    var l = 0;
    for (var k = 0; k < vis.data.length; k++) {
        if (vis.data[k].Log_PerCapita !== "NA") {
            vis.wrangleEnr[l] = vis.data[k];
            l++;
        }
    }

    vis.wrangleEnr.forEach(function(d){
        d['ENI'] = +d['ENI'],
            d['GDP'] = +d['GDP'],
            d['Log_GDP'] = +d['Log_GDP'],
            d['Log_PerCapita'] = +d['Log_PerCapita'],
            d['Market'] = +d['Market'],
            d['PerCapita'] = +d['PerCapita'],
            d['State'] = d.City[d.City.length -2] + d.City[d.City.length -1];

        switch (d.State) {
            case "CT": d.region = "Northeast"; break;
            case "ME": d.region = "Northeast"; break;
            case "NH": d.region = "Northeast"; break;
            case "RI": d.region = "Northeast"; break;
            case "VT": d.region = "Northeast"; break;
            case "DE": d.region = "Northeast"; break;
            case "NJ": d.region = "Northeast"; break;
            case "NY": d.region = "Northeast"; break;
            case "PA": d.region = "Northeast"; break;
            case "IL": d.region = "Midwest"; break;
            case "IN": d.region = "Midwest"; break;
            case "MI": d.region = "Midwest"; break;
            case "OH": d.region = "Midwest"; break;
            case "WI": d.region = "Midwest"; break;
            case "IA": d.region = "Midwest"; break;
            case "KS": d.region = "Midwest"; break;
            case "MN": d.region = "Midwest"; break;
            case "MO": d.region = "Midwest"; break;
            case "NE": d.region = "Midwest"; break;
            case "ND": d.region = "Midwest"; break;
            case "SD": d.region = "Midwest"; break;
            case "FL": d.region = "South"; break;
            case "GA": d.region = "South"; break;
            case "MD": d.region = "South"; break;
            case "NC": d.region = "South"; break;
            case "SC": d.region = "South"; break;
            case "DC": d.region = "South"; break;
            case "VA": d.region = "South"; break;
            case "WV": d.region = "South"; break;
            case "AL": d.region = "South"; break;
            case "KY": d.region = "South"; break;
            case "MS": d.region = "South"; break;
            case "TN": d.region = "South"; break;
            case "AR": d.region = "South"; break;
            case "LA": d.region = "South"; break;
            case "TX": d.region = "South"; break;
            case "OK": d.region = "South"; break;
            case "AZ": d.region = "West"; break;
            case "CO": d.region = "West"; break;
            case "ID": d.region = "West"; break;
            case "MT": d.region = "West"; break;
            case "NV": d.region = "West"; break;
            case "NM": d.region = "West"; break;
            case "UT": d.region = "West"; break;
            case "WY": d.region = "West"; break;
            case "AK": d.region = "West"; break;
            case "CA": d.region = "West"; break;
            case "HI": d.region = "West"; break;
            case "OR": d.region = "West"; break;
            case "WA": d.region = "West"; break;
            default: d.region = "None";
        }

    });

    vis.x.domain(d3.extent(vis.wrangleEnr, function(d) { return d.ENI; })).nice();
    vis.y.domain(d3.extent(vis.wrangleEnr, function(d) { return d.Log_PerCapita; })).nice();

    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom");

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left");

    vis.xA = vis.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(vis.xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", vis.width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("ENI");

    vis.yA = vis.svg.append("g")
        .attr("class", "y axis")
        .call(vis.yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Log GDP Per Capita");

    var x = ["Northeast","Midwest","South","West"];

    vis.filter(x);
};

Scatter.prototype.filter = function(x) {
    var vis = this;

    vis.filtered = [];
    var k = 0;
    // cycle through data
    for (i = 0; i < vis.wrangleEnr.length; i++) {

        // cycle through selected regions
        for (j = 0; j < x.length; j++) {
            if (vis.wrangleEnr[i].region == x[j]) {
                vis.filtered[k] = vis.wrangleEnr[i];
                k++;
            }
        }
    }

    vis.displayData = vis.filtered.sort(function(a,b) {
        return a.ENI - b.ENI;
    });

    vis.updateScatter();
};

Scatter.prototype.updateScatter = function() {
    var vis = this;

    vis.dot = vis.svg.selectAll(".dot")
        .data(vis.displayData);

    vis.dot
        .enter().append("circle")
        .attr("class", "dot")
        .attr("id", function(d) { return "dot" + d.Market; });

    vis.dot
        .attr("r", 3.5)
        .attr("cx", function(d) {  return vis.x(d.ENI); })
        .attr("cy", function(d) { return vis.y(d.Log_PerCapita); })
        .style("fill", function(d) { return regionColor(d.region); })
        .style("opacity", 0.8)
        .on("mouseover", function(d) {
            d3.select(this)
                .attr("r", 5)
                .style('fill', "#ff0000")
                .style("stroke", "black")
                .style("opacity", 1);
                // .moveToFront();

            vis.div.transition().duration(300)
                .style('fill', "#ff0000")
                .attr("r", 5)
                .style("opacity", 1);

            vis.div.text(d.City)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY -30) + "px");

            vis.s = d.Market;
            d3.select("#msa" + vis.s).style('fill', "#551A8B");

        })
        .on("mouseout", function() {
            d3.select(this)
                .style("opacity", 0.8)
                .attr("r", 3.5)
                .style("stroke", "none")
                .style('fill', function (d) {
                    return regionColor(d.region);
                });

            vis.div.transition().duration(300)
                .style("opacity", 0);

            d3.select("#msa" + vis.s).style("fill", function (d) {
                return choroColor(d.properties.enr2015);

                // d3.selectAll(".select").style("fill", function(d) { return scatter.color(d.region); });
            });
        });

    vis.dot.exit().remove();

    // Trend Line

    var xLabels = vis.displayData.map(function (d) { return d.ENI; });

    // get the x and y values for least squares
    var xSeries = xLabels;
    var ySeries = vis.displayData.map(function(d) { return d.Log_PerCapita; });

    var leastSquaresCoeff = leastSquares(xSeries, ySeries);

    console.log(leastSquaresCoeff);

    // apply the results of the least squares regression
    var x1 = xLabels[0];
    var y1 = leastSquaresCoeff[0] * xSeries[0] + leastSquaresCoeff[1];
    var x2 = xLabels[xLabels.length - 1];
    var y2 = leastSquaresCoeff[0] * xLabels[xLabels.length - 1] + leastSquaresCoeff[1];
    var trendData = [[x1,y1,x2,y2]];

    console.log([x1,y1,x2,y2]);

    vis.trendline = vis.svg.selectAll(".trendline")
        .data(trendData);

    vis.trendline.enter()
        .append("line")
        .attr("class", "trendline");

    vis.trendline
        .attr("x1", function(d) { return vis.x(d[0]); })
        .attr("y1", function(d) { return vis.y(d[1]); })
        .attr("x2", function(d) { return vis.x(d[2]); })
        .attr("y2", function(d) { return vis.y(d[3]); })
        .attr("stroke", "black")
        .attr("stroke-width", 1);

    vis.trendline.exit().remove();

    // returns slope, intercept and r-square of the line
    function leastSquares(xSeries, ySeries) {
        var reduceSumFunc = function(prev, cur) { return prev + cur; };

        var xBar = xSeries.reduce(reduceSumFunc) * 1.0 / xSeries.length;
        var yBar = ySeries.reduce(reduceSumFunc) * 1.0 / ySeries.length;

        var ssXX = xSeries.map(function(d) { return Math.pow(d - xBar, 2); })
            .reduce(reduceSumFunc);

        var ssYY = ySeries.map(function(d) { return Math.pow(d - yBar, 2); })
            .reduce(reduceSumFunc);

        var ssXY = xSeries.map(function(d, i) { return (d - xBar) * (ySeries[i] - yBar); })
            .reduce(reduceSumFunc);

        var slope = ssXY / ssXX;
        var intercept = yBar - (xBar * slope);
        var rSquare = Math.pow(ssXY, 2) / (ssXX * ssYY);

        return [slope, intercept, rSquare];
    }

};

d3.selection.prototype.moveToFront = function() {
    return this.each(function(){
        this.parentNode.appendChild(this);
    });
};