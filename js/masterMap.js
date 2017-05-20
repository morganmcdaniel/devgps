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
        vis.centered;
    //
    // vis.active = d3.select(null);

    vis.svg = d3.select("#" + vis.parentElement).append("svg")
        //.attr("width", vis.width + vis.margin.left + vis.margin.right)
        //.attr("height", vis.height + vis.margin.top + vis.margin.bottom)
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox","0 0 " + vis.width + " " + vis.height)
        .attr("class", "svg-content")
        .append("g")
        .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
    ;

    // vis.svg.append("rect")
    //     .attr("class", "background")
    //     .attr("width", vis.width)
    //     .attr("height", vis.height)
    //     .on("click", vis.clicked);

    vis.projection = d3.geo.albersUsa()
        .scale(1000)
        .translate([vis.width / 2, vis.height / 2]);

    vis.path = d3.geo.path()
        .projection(vis.projection);

    vis.color = d3.scale.quantile()
        // .domain([-2, -1, 1, 2])
        .range(['#d7191c','#fdae61','#ffffbf','#a6d96a','#1a9641']);

    vis.div = d3.select("body").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    vis.selection = "enr2015";

    vis.selectData = "counties";

    // State boundaries

    vis.statesGroup = vis.svg.append("g")
        .attr("class", "states")
        .selectAll("path")
        .data(vis.states)
        .enter().append("path")
        .attr("d", vis.path)
        .on("click", vis.clicked);

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

    // vis.color.domain([
    //     d3.min(vis.counties, function(d) { return d.properties[vis.selection]; }),
    //     d3.max(vis.counties, function(d) { return d.properties[vis.selection]; })
    // ]);

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
                .style("opacity", 0);
        });



    // State boundaries

    vis.statesGroup = vis.svg.append("g")
        .attr("class", "statesLine")
        .selectAll("path")
        .data(vis.states)
        .enter().append("path")
        .attr("d", vis.path)
        .attr("fill", "none");

    // National boundaries

    vis.nationGroup = vis.svg.append("g")
        .attr("class", "nation")
        .selectAll('.nation')
        .data(vis.nation)
        .enter().append("path")
        .attr("d", vis.path);

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

    vis.color.domain(vis.domainMsa);

    console.log(vis.color(-3));
    console.log(vis.color(-2));
    console.log(vis.color(-1));
    console.log(vis.color(0));
    console.log(vis.color(1));
    console.log(vis.color(2));
    console.log(vis.color(3));

    // vis.color.domain([
    //     d3.min(vis.msa, function(d) { return d.properties[vis.selection]; }),
    //     d3.max(vis.msa, function(d) { return d.properties[vis.selection]; })
    // ]);

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
        .attr("d", vis.path)
        .attr("fill", "none");

    // National boundaries

    vis.nationGroup = vis.svg.append("g")
        .attr("class", "nation")
        .selectAll('.nation')
        .data(vis.nation)
        .enter().append("path")
        .attr("d", vis.path);


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


/*
 *  Called to change the radio button options
 */

// MasterMap.prototype.changeOptions = function(x) {
//     var vis = this;
//
//     vis.selectData = x;
//
//     vis.msaYears = [
//         {text: "2015", value: "enr2015"},
//         {text: "2014", value: "enr2014"},
//         {text: "2010", value: "enr2010"},
//         {text: "2005", value: "enr2005"},
//         {text: "2003", value: "enr2003"},
//     ];
//
//     vis.msaTrend = [
//         {text: "Current", value: "enrcurrent"},
//         {text: "Short Term", value: "enrshort"},
//         {text: "Mid Term", value: "enrmid"},
//         {text: "Long Term", value: "enrlong"}
//     ];
//
//     vis.countyYears = [
//         {text: "2014", value: "enr2014"},
//         {text: "2009", value: "enr2009"},
//         {text: "2004", value: "enr2004"},
//         {text: "1999", value: "enr1999"}
//     ];
//
//     if (vis.selectData == 'msa') {
//
//         $(document).ready(function(){
//             $('.year').parent().remove();
//
//             $('<fieldset data-role="controlgroup" id="radiodiv">').appendTo('#radiobtn');
//
//             $('<h2>Year:</h2>').appendTo('#radiodiv');
//             $('<input type="radio" name="year" class="year" value="' + vis.msaYears[0].value + '" checked> ' + vis.msaYears[0].text + '<br>').appendTo('#radiodiv');
//             for (i = 1; i < vis.msaYears.length; i++) {
//                 $('<input type="radio" name="year" class="year" value="' + vis.msaYears[i].value + '"> ' + vis.msaYears[i].text + '<br>').appendTo('#radiodiv');
//             }
//
//             $('<h2>Trend:</h2>').appendTo('#radiodiv');
//             for (i = 0; i < vis.msaTrend.length; i++) {
//                 $('<input type="radio" name="year" class="year" value="' + vis.msaTrend[i].value + '"> ' + vis.msaTrend[i].text + '<br>').appendTo('#radiodiv');
//             }
//         });
//     }
//
//     else if (vis.selectData == 'counties') {
//
//         $(document).ready(function(){
//             $('.year').parent().remove();
//
//             $('<fieldset data-role="controlgroup" id="radiodiv">').appendTo('#radiobtn');
//
//             $('<h2>Year:</h2>').appendTo('#radiodiv');
//             $('<input type="radio" name="year" class="year" value="' + vis.countyYears[0].value + '" checked> ' + vis.countyYears[0].text + '<br>').appendTo('#radiodiv');
//             for (i = 1; i < vis.countyYears.length; i++) {
//                 $('<input type="radio" name="year" class="year" value="' + vis.countyYears[i].value + '"> ' + vis.countyYears[i].text + '<br>').appendTo('#radiodiv');
//             }
//         });
//
//         vis.selection = "enr2014";
//     }
//
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


// document.getElementById("title").innerHTML = vis.titleText();

// MasterMap.prototype.titleText = function() {
//     var vis = this;
//
//     vis.explanation = {
//         enr2015: "2015 ENR",
//         enr2014: "2014 ENR",
//         enr2010: "2015 ENR",
//         enr2009: "2009 ENR",
//         enr2005: "2005 ENR",
//         enr2004: "2004 ENR",
//         enr2003: "2003 ENR",
//         enr1999: "1999 ENR",
//         enrcurrent: "Current ENR Projection",
//         enrshort: "Short-Term ENR Projection",
//         enrmid: "Mid-Term ENR Projection",
//         enrlong: "Long-Term ENR Projection"
//     };
//
//     return vis.explanation[vis.selection];
// };

