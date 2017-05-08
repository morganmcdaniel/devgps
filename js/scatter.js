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
        vis.height = 500 - vis.margin.top - vis.margin.bottom;

    vis.x = d3.scale.linear()
        .range([0, vis.width]);

    vis.y = d3.scale.linear()
        .range([vis.height, 0]);

    vis.div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    // Update this later when decided how to color
    vis.color = d3.scale.ordinal()
        .domain(["Northeast","Midwest","South","West"])
        .range(['#66c2a5','#fc8d62','#8da0cb','#e78ac3']);

    vis.xAxis = d3.svg.axis()
        .scale(vis.x)
        .orient("bottom");

    vis.yAxis = d3.svg.axis()
        .scale(vis.y)
        .orient("left");

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        .attr("width", vis.width + vis.margin.left + vis.margin.right)
        .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
    ;

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

    console.log(vis.wrangleEnr);

    vis.updateScatter();
};


function region(d) {

}

Scatter.prototype.updateScatter = function() {
    var vis = this;

    vis.x.domain(d3.extent(vis.wrangleEnr, function(d) { return d.ENI; })).nice();
    vis.y.domain(d3.extent(vis.wrangleEnr, function(d) { return d.Log_PerCapita; })).nice();

    vis.svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + vis.height + ")")
        .call(vis.xAxis)
        .append("text")
        .attr("class", "label")
        .attr("x", vis.width)
        .attr("y", -6)
        .style("text-anchor", "end")
        .text("ENI");

    vis.svg.append("g")
        .attr("class", "y axis")
        .call(vis.yAxis)
        .append("text")
        .attr("class", "label")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", ".71em")
        .style("text-anchor", "end")
        .text("Log GDP Per Capita");

    vis.svg.selectAll(".dot")
        .data(vis.wrangleEnr)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("id", function(d) { return "dot " + d.Market; })
        .attr("r", 3.5)
        .attr("cx", function(d) {  return vis.x(d.ENI); })
        .attr("cy", function(d) { return vis.y(d.Log_PerCapita); })
        .style("fill", function(d) { return vis.color(d.region); })
        .style("opacity", 0.5)
        .on("mouseover", function(d) {
            d3.select(this).transition().duration(300).style("opacity", 1);
            vis.div.transition().duration(300)
                .style("opacity", 1);
            vis.div.text(d.City)
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY -30) + "px");

            var s = d.Market;
            d3.select("#msa " + s).style('fill', "#ff0000");

        })
        .on("mouseout", function() {
            d3.select(this)
                .transition().duration(300)
                .style("opacity", 0.8);
            vis.div.transition().duration(300)
                .style("opacity", 0);
        });

    // draw legend
    vis.legend = vis.svg.selectAll(".legend")
        .data(vis.color.range())
        .enter().append("g")
        .attr("class", "legend")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    // draw legend colored rectangles
    vis.legend.append("rect")
        .attr("x", vis.width - 18)
        .attr("width", 18)
        .attr("height", 18)
        .style("fill", function(d) {return d;});

    // draw legend text
    // vis.legend.append("text")
    //     .attr("x", vis.width - 24)
    //     .attr("y", 9)
    //     .attr("dy", ".35em")
    //     .style("text-anchor", "end")
    //     .text(function(d) { return d;})

    vis.legend.append("text")
        .attr("dy", ".35em");

    vis.legend.select("text")
        .data(vis.color.domain())
        .attr("x", vis.width - 24)
        .attr("y", 9)
        .style("text-anchor", "end")
        .text(function(d) { return d });

};