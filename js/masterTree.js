/*
 *  Tree Map - Object constructor function
 *  @param _parentElement   -- HTML element in which to draw the visualization
 *  @param _data            -- Data
 */

MasterTree = function(_parentElement, _data) {

    this.parentElement = _parentElement;
    this.data = _data;

    var vis = this;

    var barLevel, barKey;

    window.addEventListener('message', function(e) {
        var opts = e.data.opts,
            data = e.data.data;

        return vis.main(opts, data);
    });

    var defaults = {
        margin: {top: 24, right: 0, bottom: 0, left: 0},
        rootname: "TOP",
        title: "",
        width: $("#" + vis.parentElement).width(),
        height: 600
    };

    function main(o, data) {
        var root,
            opts = $.extend(true, {}, defaults, o),
            rname = opts.rootname,
            margin = opts.margin,
            theight = 36 + 16;

        var width = opts.width - margin.left - margin.right,
            height = opts.height - margin.top - margin.bottom - theight,
            transitioning;

        var color = d3.scale.category20c();

        var div = d3.select("body").append("div")
            .attr("class", "tooltip")
            .style("opacity", 0);

        var x = d3.scale.linear()
            .domain([0, width])
            .range([0, width]);

        var y = d3.scale.linear()
            .domain([0, height])
            .range([0, height]);

        var treemap = d3.layout.treemap()
            .children(function(d, depth) { return depth ? null : d._children; })
            .sort(function(a, b) { return a.ra - b.ra; })
            .ratio(height / width * 0.5 * (1 + Math.sqrt(5)))
            .round(false);

        var svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("preserveAspectRatio", "xMinYMin meet")
            .attr("viewBox","0 0 " + width + " " + height)
            .attr("class", "svg-content")
            .style("margin-left", -margin.left + "px")
            .style("margin.right", -margin.right + "px")
            .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
            .style("shape-rendering", "crispEdges");

        var grandparent = svg.append("g")
            .attr("class", "grandparent");

        grandparent.append("rect")
            .attr("y", -margin.top)
            .attr("width", width)
            .attr("height", margin.top);

        grandparent.append("text")
            .attr("x", 6)
            .attr("y", 6 - margin.top)
            .attr("dy", ".75em");

        if (data instanceof Array) {
            root = { key: rname, values: data };
        } else {
            root = data;
        }

        initialize(root);
        accumulate(root);
        layout(root);
        display(root);

        if (window.parent !== window) {
            var myheight = document.documentElement.scrollHeight || document.body.scrollHeight;
            window.parent.postMessage({height: myheight}, '*');
        }

        function initialize(root) {
            root.x = root.y = 0;
            root.dx = width;
            root.dy = height;
            root.depth = 0;
        }

        // Aggregate the values for internal nodes. This is normally done by the
        // treemap layout, but not here because of our custom implementation.
        // We also take a snapshot of the original children (_children) to avoid
        // the children being overwritten when when layout is computed.
        function accumulate(d) {
            return (d._children = d.values)
                ? d.value = d.values.reduce(function(p, v) { return p + accumulate(v); }, 0)
                : d.value;
        }

        // Compute the treemap layout recursively such that each group of siblings
        // uses the same size (1×1) rather than the dimensions of the parent cell.
        // This optimizes the layout for the current zoom state. Note that a wrapper
        // object is created for the parent node for each group of siblings so that
        // the parent’s dimensions are not discarded as we recurse. Since each group
        // of sibling was laid out in 1×1, we must rescale to fit using absolute
        // coordinates. This lets us use a viewport to zoom.
        function layout(d) {
            if (d._children) {
                treemap.nodes({_children: d._children});
                d._children.forEach(function(c) {
                    c.x = d.x + c.x * d.dx;
                    c.y = d.y + c.y * d.dy;
                    c.dx *= d.dx;
                    c.dy *= d.dy;
                    c.parent = d;
                    layout(c);
                });
            }
        }

        function display(d) {
            grandparent
                .datum(d.parent)
                .on("click", transition)
                .select("text")
                .text(name(d));

            var g1 = svg.insert("g", ".grandparent")
                .datum(d)
                .attr("class", "depth");

            var g = g1.selectAll("g")
                .data(d._children)
                .enter().append("g");

            g.filter(function(d) { return d._children; })
                .classed("children", true)
                .on("click", transition);

            var children = g.selectAll(".child")
                .data(function(d) { return d._children || [d]; })
                .enter().append("g");

            children.append("rect")
                .attr("class", "child")
                .call(rect)
                .append("title")
                .text(function(d) { return d.key + "(" + d.value.toFixed(2) + ")"; });

            g.append("rect")
                .attr("class", "parent")
                .call(rect)
            .on("mouseover", function(d) {
                div.transition().duration(300)
                    .style("opacity", 1);
                div.text(function() { return (d.key + ", " + Math.round((d.value/d.parent.value)*100) + "%"); })
                    .style("left", (d3.event.pageX) + "px")
                    .style("top", (d3.event.pageY) + "px")
            })
            .on("mouseout", function() {
                div.transition().duration(300)
                    .style("opacity", 0);
            });

            var t = g.append("text")
                .attr("class", "ptext")
                .attr("dy", ".75em");

            t.append("tspan")
                .text(function(d) { return (d.key + ", " + Math.round((d.value/d.parent.value)*100) + "%"); });
            t.append("tspan")
                .attr("dy", "1.0em")
                .text(function(d) { return Math.round(d.value); });
            t.call(text);

            g.selectAll("rect")
                .style("fill", function(d) { return color(d.key); });

            function transition(d) {
                if (transitioning || !d) {return;}
                transitioning = true;

                var g2 = display(d),
                    t1 = g1.transition().duration(750),
                    t2 = g2.transition().duration(750);

                // Update the domain only after entering new elements.
                x.domain([d.x, d.x + d.dx]);
                y.domain([d.y, d.y + d.dy]);

                // Enable anti-aliasing during the transition.
                svg.style("shape-rendering", null);

                // Draw child nodes on top of parent nodes.
                svg.selectAll(".depth").sort(function(a, b) { return a.depth - b.depth; });

                // Fade-in entering text.
                g2.selectAll("text").style("fill-opacity", 0);

                // Transition to the new view.
                t1.selectAll(".ptext").call(text).style("fill-opacity", 0);
                t1.selectAll(".ctext").call(text2).style("fill-opacity", 0);
                t2.selectAll(".ptext").call(text).style("fill-opacity", 1);
                t2.selectAll(".ctext").call(text2).style("fill-opacity", 1);
                t1.selectAll("rect").call(rect);
                t2.selectAll("rect").call(rect);

                // Remove the old node when the transition is finished.
                t1.remove().each("end", function() {
                    svg.style("shape-rendering", "crispEdges");
                    transitioning = false;
                });

                barKey = d.key;
                if (d.depth == 0) {
                    barLevel = "top";
                }
                else if (d.depth == 1 && d.parent.key == "Mississippi") {
                    barLevel = "middle";
                }
                else {
                    barLevel = "bottom";
                }

                passToMasterBar(barKey, barLevel);
            }

            return g;
        }

        function text(text) {
            text.selectAll("tspan")
                .attr("x", function(d) { return x(d.x) + 6; });
            text.attr("x", function(d) { return x(d.x) + 6; })
                .attr("y", function(d) { return y(d.y) + 6; })
                // .each(function(d) {
                //     var tspan = this.childNodes[0];
                //     var w = x(d.x + d.dx) - x(d.x);
                //     wrap(tspan, w, x(d.x) + 6);
                // })
                .style("opacity", function(d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) && y(d.y + d.dy) - y(d.y) > 40 ? 1 : 0; })
        }

        function text2(text) {
            text.attr("x", function(d) { return x(d.x + d.dx) - this.getComputedTextLength() - 6; })
                .attr("y", function(d) { return y(d.y + d.dy) - 6; })
                .style("opacity", function(d) { return this.getComputedTextLength() < x(d.x + d.dx) - x(d.x) && y(d.y + d.dy) - y(d.y) > 40 ? 1 : 0; })
        }

        function rect(rect) {
            rect.attr("x", function(d) { return x(d.x); })
                .attr("y", function(d) { return y(d.y); })
                .attr("width", function(d) { return x(d.x + d.dx) - x(d.x); })
                .attr("height", function(d) { return y(d.y + d.dy) - y(d.y); })
                .style("opacity", .7);
        }

        function name(d) {
            return d.parent
                ? "< Back"
                : d.key ;
        }

        function wrap(tspan, width, x) {

            var text = d3.select(tspan),
                words = text.text().split(/\s+/).reverse(),
                word,
                line = [],
                y = text.attr("y"),
                dy = parseFloat(text.attr("dy")) || 0.4,
                tspan = text.text(null).append("tspan").attr("x", x).attr("y", y).attr("dy", "0.75em");

            while (word = words.pop()) {
                line.push(word);
                tspan.text(line.join(" "));
                if (tspan.node().getComputedTextLength() > width) {
                    line.pop();
                    tspan.text(line.join(" "));
                    line = [word];
                    tspan = text.append("tspan").attr("x", x).attr("y", y).attr("dy", "1em").text(word);
                }
            }
        }
    }

    if (window.location.hash === "") {
        var data = d3.nest().key(function(d) { return d.market; }).key(function(d) { return d.category; }).entries(vis.data);

        main({title: "Mississippi"}, {key: "Mississippi", values: data});
    }


};