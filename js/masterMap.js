/*
 *  Choropleth - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Data
 */

MasterMap = function(_parentElement, _msa, _counties, _states, _nation) {

    this.parentElement = _parentElement;
    this.msa = _msa;
    this.counties = _counties;
    this.states = _states;
    this.nation = _nation;

    this.initVis();

};

/*
 *  Initialize map
 */

MasterMap.prototype.initVis = function() {
    var vis = this;

    vis.margin = {top: 0, right: 0, bottom: 0, left: 0};

    vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
        vis.height = 600 - vis.margin.top - vis.margin.bottom,
        vis.scale0 = (vis.width - 1) / 2 / Math.PI;

    vis.projection = d3.geo.albersUsa()
        .scale(1000)
        .translate([vis.width / 2, vis.height / 2]);

    vis.path = d3.geo.path()
        .projection(vis.projection);

    vis.color = d3.scale.quantile()
        .range(['#d7191c','#fdae61','#ffffbf','#a6d96a','#1a9641']);

    /* Initialize Vars */
    vis.selection = "enr2015";
    vis.selectData = "counties";

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        //.attr("width", vis.width + vis.margin.left + vis.margin.right)
        //.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox","0 0 " + vis.width + " " + vis.height)
        .attr("class", "svg-content")
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")");


    /* Tooltip Div */

    vis.div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    vis.zoom = d3.behavior.zoom()
        .on("zoom",function() {
            vis.svg.attr("transform","translate("+
                d3.event.translate.join(",")+")scale("+d3.event.scale+")");
            vis.svg.selectAll("path")
                .attr("d", vis.path.projection(vis.projection));
        });

    vis.svg.call(vis.zoom);

    /* State Fill under Select Group*/

    vis.statesGroup = vis.svg.append("g")
        .attr("class", "statesFill")
        .selectAll("path")
        .data(vis.states)
        .enter().append("path")
        .attr("d", vis.path);

    /* Initialize Select Group */

    vis.selectGroup = vis.svg.append("g")
        .attr("class", "select")
        .selectAll("path")
        .data(vis.counties);

    vis.updateMap(vis.selection);
};

/*
 *  Remove previous map, route to correct level, update with selected data
 */

MasterMap.prototype.updateMap = function() {
    var vis = this;

    vis.selectGroup.remove();

    if (vis.selectData == "counties") {

        vis.drawCounties();
    }
    else if (vis.selectData == "msa") {

        vis.drawMSA();
    }

};

/*
 *  Draw map by counties
 */

MasterMap.prototype.drawCounties = function() {
    var vis = this;

    vis.domainCounty = [];

    for (i = 0; i < vis.counties.length; i++) {
        vis.domainCounty[i] = vis.counties[i].properties[vis.selection];
    }

    vis.color.domain(vis.domainCounty);

    vis.selectGroup = vis.svg.append("g")
        .attr("class", "select")
        .selectAll("path")
        .data(vis.counties);

    vis.selectGroup.enter().append("path");

    vis.selectGroup
        .attr("d", vis.path)
        .style("fill", function(d) { return vis.color(d.properties[vis.selection]); })
        .style("opacity", 0.8)
        .on("mouseover", function(d) {
            d3.select(this).transition().duration(300).style("opacity", 1);
            vis.div.transition().duration(300)
                .style("opacity", 1);
            vis.div.text(function() { return (d.properties.NAME + ", " + d.properties.statecode); })
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY -30) + "px")
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition().duration(300)
                .style("opacity", 0.8);
            vis.div.transition().duration(300)
                .style("opacity", 0)
            ;
        });

    // State boundaries

    vis.statesGroup = vis.svg.append("g")
        .attr("class", "statesLine")
        .selectAll("path")
        .data(vis.states)
        .enter().append("path")
        .attr("d", vis.path);

    // National boundaries

    // vis.nationGroup = vis.svg.append("g")
    //     .attr("class", "nation")
    //     .selectAll('.nation')
    //     .data(vis.nation)
    //     .enter().append("path")
    //     .attr("d", vis.path);

    vis.selectGroup.exit().remove();

};

/*
 *  Draw map by MSA
 */

MasterMap.prototype.drawMSA = function() {
    var vis = this;

    vis.domainMsa = [];

    for (i = 0; i < vis.msa.length; i++) {
        vis.domainMsa[i] = vis.msa[i].properties[vis.selection];
    }

    vis.selectGroup = vis.svg.append("g")
        .attr("class", "select")
        .selectAll("path")
        .data(vis.msa);

    vis.selectGroup.enter().append("path");

    vis.selectGroup
        .attr("d", vis.path)
        .style("fill", function(d) { return vis.color(d.properties[vis.selection]); })
        .style("opacity", 0.8)
        .on("mouseover", function(d) {
            d3.select(this).transition().duration(300).style("opacity", 1);
            vis.div.transition().duration(300)
                .style("opacity", 1);
            vis.div.text(function () { return (d.properties.name); })
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

    // State boundaries

    vis.statesGroup = vis.svg.append("g")
        .attr("class", "statesLine")
        .selectAll("path")
        .data(vis.states)
        .enter().append("path")
        .attr("d", vis.path);

    // National boundaries

    // vis.nationGroup = vis.svg.append("g")
    //     .attr("class", "nation")
    //     .selectAll('.nation')
    //     .data(vis.nation)
    //     .enter().append("path")
    //     .attr("d", vis.path);


    vis.selectGroup.exit().remove();

};

/*
 *  Called when toggled, triggers change in options and updates the map
 */

MasterMap.prototype.changeData = function(x) {
    var vis = this;

    vis.selectData = x;

    console.log(vis.selectData);

    vis.updateMap();
};

/*
 *  Called when new radio button clicked to change data in map
 */

MasterMap.prototype.onChangeYear = function() {
    var vis = this;

    vis.selection = $('input:radio[name=year]:checked').val();

    console.log(vis.selection);

    vis.updateMap();
};


// MasterMap.prototype.zoomed = function() {
//     var vis = this;
//
//     vis.projection
//         .translate(vis.zoom.translate())
//         .scale(vis.zoom.scale());
//
//     g.selectAll("path")
//         .attr("d", path);
// };

// MasterMap.prototype.clicked = function(d) {
//     var vis = this;
//
//     if (vis.active.node() === this) return vis.reset();
//     vis.active.classed("active", false);
//     vis.active = d3.select(this).classed("active", true);
//
//     var bounds = vis.path.bounds(d),
//         dx = bounds[1][0] - bounds[0][0],
//         dy = bounds[1][1] - bounds[0][1],
//         x = (bounds[0][0] + bounds[1][0]) / 2,
//         y = (bounds[0][1] + bounds[1][1]) / 2,
//         scale = .9 / Math.max(dx / width, dy / height),
//         translate = [width / 2 - scale * x, height / 2 - scale * y];
//
//     vis.statesGroup.transition()
//         .duration(750)
//         .style("stroke-width", 1.5 / scale + "px")
//         .attr("transform", "translate(" + translate + ")scale(" + scale + ")");
// };
//
// MasterMap.prototype.reset = function() {
//     var vis = this;
//
//     vis.active.classed("active", false);
//     vis.active = d3.select(null);
//
//     vis.statesGroup.transition()
//         .duration(750)
//         .style("stroke-width", "1.5px")
//         .attr("transform", "");
// };
//
// MasterMap.prototype.clicked = function(d)  {
//     var vis = this;
//
//     console.log("click!");
//
//     var x, y, k;
//
//     if (d && vis.centered !== d) {
//         var centroid = vis.path.centroid(d);
//         x = centroid[0];
//         y = centroid[1];
//         k = 4;
//         vis.centered = d;
//     } else {
//         x = vis.width / 2;
//         y = vis.height / 2;
//         k = 1;
//         vis.centered = null;
//     }
//
//     console.log(vis.statesGroup);
//
//     vis.statesGroup.selectAll("path")
//         .classed("active", vis.centered && function(d) { return d === vis.centered; });
//
//     vis.statesGroup.transition()
//         .duration(750)
//         .attr("transform", "translate(" + vis.width / 2 + "," + vis.height / 2 + ")scale(" + k + ")translate(" + -x + "," + -y + ")")
//         .style("stroke-width", 1.5 / k + "px");
// };

