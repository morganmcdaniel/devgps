var width = 960,
    height = 600;

var svg = d3.select("#choropleth").append("svg")
    .attr("width", width)
    .attr("height", height);

var projection = d3.geo.albersUsa()
    .translate([width / 2, height / 2]);

var path = d3.geo.path()
    .projection(projection);

var color = d3.scale.quantize()
    .range(['#b2182b','#ef8a62','#fddbc7','#f7f7f7','#d1e5f0','#67a9cf','#2166ac']);

var div = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var selection = "enr2015";

var msa;

var explanation = {
    enr2015: "2015 ENR",
    enr2014: "2014 ENR",
    enr2010: "2015 ENR",
    enr2005: "2005 ENR",
    enr1yr: "One-Year ENR Projection",
    enr5yr: "Five-Year ENR Projection",
    enr10yr: "Ten-Year ENR Projection",
    enr12yr: "Twelve-Year ENR Projection",
    enrcurrent: "Current ENR Projection",
    enrshort: "Short-Term ENR Projection",
    enrmid: "Mid-Term ENR Projection",
    enrlong: "Long-Term ENR Projection"
};

queue()
    .defer(d3.json, "data/cbsa_us_2014_ex_hi_ak.json")
    .defer(d3.csv, "data/ENR_MSA_Master.csv")
    .await(function(error, msaData, enr) {

        // Convert TopoJSON to GeoJSON
        msa = topojson.feature(msaData, msaData.objects.cbsa_2014_us_ex_hi_ak).features;

        // copy ENR data into geoJson
        for (var i = 0; i < enr.length; i++) {

            // Grab State Name
            var enrMarket = enr[i].Market;

            // Grab data value
            var enr2015 = enr[i].y15;
            var enr2014 = enr[i].y14;
            var enr2010 = enr[i].y10;
            var enr2005 = enr[i].y05;
            var enr2003 = enr[i].y03;
            var enr1yr = enr[i].t1yr;
            var enr5yr = enr[i].t5yr;
            var enr10yr = enr[i].t10yr;

            var enr12yr = enr[i].t12yr;
            var enrcurrent = enr[i].Current;
            var enrshort = enr[i].ShortTerm;
            var enrmid = enr[i].MidTerm;
            var enrlong = enr[i].LongTerm;

            // Find the corresponding state inside the GeoJSON
            for (var j = 0; j < msa.length; j++) {
                var jsonId = msa[j].properties.GEOID;

                if (enrMarket == jsonId) {

                    // Copy the data value into the JSON
                    msa[j].properties.enr2015 = +enr2015;
                    msa[j].properties.enr2014 = +enr2014;
                    msa[j].properties.enr2010 = +enr2010;
                    msa[j].properties.enr2005 = +enr2005;
                    msa[j].properties.enr2003 = +enr2003;
                    msa[j].properties.enr1yr = +enr1yr;
                    msa[j].properties.enr5yr = +enr5yr;
                    msa[j].properties.enr10yr = +enr10yr;
                    msa[j].properties.enr12yr = +enr12yr;
                    msa[j].properties.enrcurrent = +enrcurrent;
                    msa[j].properties.enrshort = +enrshort;
                    msa[j].properties.enrmid = +enrmid;
                    msa[j].properties.enrlong = +enrlong;

                    // Stop looking through the JSON
                    break;
                }
            }
        }

        console.log(msa);

        updateChoropleth(selection);

        d3.select("#options").on("change", onChange);


    });

function updateChoropleth() {

    color.domain([
        d3.min(msa, function(d) { return d.properties[selection]; }),
        d3.max(msa, function(d) { return d.properties[selection]; })
    ]);

    var choro = svg.selectAll("path")
        .data(msa);

    choro.enter().append("path");

    choro
        .attr("d", path)
        .style("fill", function(d) {
            return color(d.properties[selection]);
        })
        .style("opacity", 0.8)
        .on("mouseover", function(d) {
            d3.select(this).transition().duration(300).style("opacity", 1);
            div.transition().duration(300)
                .style("opacity", 1);
            div.text(d.properties.NAME + ": " + d.properties[selection])
                .style("left", (d3.event.pageX) + "px")
                .style("top", (d3.event.pageY -30) + "px")
        })
        .on("mouseout", function() {
            d3.select(this)
                .transition().duration(300)
                .style("opacity", 0.8);
            div.transition().duration(300)
                .style("opacity", 0);
        });

    choro.exit().remove();

    document.getElementById("title").innerHTML = titleText();

    var legend = svg.selectAll('g.legend')
        .data(color.range());

    legend.enter().append('g')
        .attr('class', 'legend')
        .attr("transform", function(d, i) { return "translate(20," + (400 + (i * 20)) + ")"; });

    legend.append("rect")
        .attr("width", 10)
        .attr("height", 10)
        .attr("class", "legendRect")
        .style("fill", function(d) {return d;});

    legend.append("text")
        .attr("dy", "0.8em");

    legend.select("text")
        .attr("x", 35)
        .text(function(d) {
            var extent = color.invertExtent(d);
            return extent[0].toLocaleString() + " - " + extent[1].toLocaleString();

        });

    legend.exit().remove();

}

function onChange() {
    selection = d3.select("#options").property("value");

    console.log(selection);

    updateChoropleth(selection);
}

function titleText () {
    return explanation[selection];
}

// Handle N/As
// Add N/A color to legend
// Background map - state lines

// Switch to counties