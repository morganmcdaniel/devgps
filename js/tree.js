/*
 *  Tree Map - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Data
 */

Tree = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;

    // this.initVis();
};

/*
 *  Initialize area chart
 */

// Tree.prototype.initVis = function() {
//
//     var vis = this;
//
//     vis.margin = {top: 50, right: 20, bottom: 40, left: 60};
//
//     vis.width = $("#" + vis.parentElement).width() - vis.margin.left - vis.margin.right,
//         vis.height = 600 - vis.margin.top - vis.margin.bottom;
//
//     vis.svg = d3.select("#" + vis.parentElement).append("svg")
//         .attr("width", vis.width + vis.margin.left + vis.margin.right)
//         .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
//         .append("g")
//         .attr("transform", "translate(" + vis.margin.left + "," + vis.margin.top + ")")
//         .style("shape-rendering", "crispEdges")
//     ;
//
//     // Transform data to nested structure
//
//     vis.data.forEach(function(d) {
//         d.main = "Industry";
//     });
//
//     vis.nestedData = d3.nest().key(function(d) {return d.main; }).key(function(d) { return d.category; }).entries(vis.data);
//     //main({title: "Tupelo Industries"}, {key: "Industries", values: vis.data});
//
//     console.log(vis.nestedData);
//
//         // opts = $.extend(true, {}, defaults, o),
//         // formatNumber = d3.format(opts.format),
//         // rname = opts.rootname,
//         // margin = opts.margin,
//         // theight = 36 + 16;
//
//     vis.color = d3.scale.category20c();
//
//     vis.x = d3.scale.linear()
//         .domain([0, vis.width])
//         .range([0, vis.width]);
//
//     vis.y = d3.scale.linear()
//         .domain([0, vis.height])
//         .range([0, vis.height]);
//
//     vis.treemap = d3.layout.treemap();
//         // .children(function(d, depth) { return depth ? null : d._children; })
//         // .sort(function(a, b) { return a.value - b.value; })
//         // .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
//         // .round(true);
//
//     vis.updateTree();
// };
//
// Tree.prototype.updateTree = function() {
//     var vis = this;
//
//     // vis.grandparent = svg.append("g")
//     //     .attr("class", "grandparent");
//     //
//     // vis.grandparent.append("rect")
//     //     .attr("y", -margin.top)
//     //     .attr("width", width)
//     //     .attr("height", margin.top);
//     //
//     // vis.grandparent.append("text")
//     //     .attr("x", 6)
//     //     .attr("y", 6 - margin.top)
//     //     .attr("dy", ".75em");
//
//     vis.root = d3.hierarchy(vis.nestedData);
//
//     vis.treemap(root);
//
//         var cell = vis.svg.selectAll("g")
//             .data(vis.root.leaves())
//             .enter().append("g")
//             .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; });
//
//         cell.append("rect")
//             .attr("id", function(d) { return d.data.id; })
//             .attr("width", function(d) { return d.x1 - d.x0; })
//             .attr("height", function(d) { return d.y1 - d.y0; })
//             .attr("fill", function(d) { return color(d.parent.data.id); });
//
//         cell.append("clipPath")
//             .attr("id", function(d) { return "clip-" + d.data.id; })
//             .append("use")
//             .attr("xlink:href", function(d) { return "#" + d.data.id; });
//
//         cell.append("text")
//             .attr("clip-path", function(d) { return "url(#clip-" + d.data.id + ")"; })
//             .selectAll("tspan")
//             .data(function(d) { return d.data.name; })
//             .enter().append("tspan")
//             .attr("x", 4)
//             .attr("y", function(d, i) { return 13 + i * 10; })
//             .text(function(d) { return d; });
//
//         cell.append("title")
//             .text(function(d) { return d.data.id + "\n" + format(d.value); });
//
//         // d3.selectAll("input")
//         //     .data([sumBySize, sumByCount], function(d) { return d ? d.name : this.value; })
//         //     .on("change", changed);
//
//         var timeout = d3.timeout(function() {
//             d3.select("input[value=\"sumByCount\"]")
//                 .property("checked", true)
//                 .dispatch("change");
//         }, 2000);
//
//         function changed(sum) {
//             timeout.stop();
//
//             treemap(root.sum(sum));
//
//             cell.transition()
//                 .duration(750)
//                 .attr("transform", function(d) { return "translate(" + d.x0 + "," + d.y0 + ")"; })
//                 .select("rect")
//                 .attr("width", function(d) { return d.x1 - d.x0; })
//                 .attr("height", function(d) { return d.y1 - d.y0; });
//         }
//
//     // function sumByCount(d) {
//     //     return d.children ? 0 : 1;
//     // }
//     //
//     // function sumBySize(d) {
//     //     return d.size;
//     // }
//
// };