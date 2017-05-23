var scatter,
    choropleth,
    tree,
    bar,
    network,
    recommended,
    choroLegend,
    masterMap,
    masterTree,
    selectVar = "ra",
    msTreeEmp,
    msTreeRa,
    msTree,
    selectData,
    masterBar,
    barKey,
    barLevel;

loadData();

function loadData() {
    queue()
        .defer(d3.csv, "data/enr_gdp.csv")
        .defer(d3.json, "data/msawithAKHI.geojson")
        .defer(d3.json, "data/gz_2010_us_050_00_5m.json")
        .defer(d3.csv, "data/RNS_MSA_Master.csv")
        .defer(d3.json, "data/gz_2010_us_outline_5m.json")
        .defer(d3.json, "data/gz_2010_us_040_00_5m.json")
        .defer(d3.csv, "data/RNS_CO_Master.csv")
        .defer(d3.csv, "data/state-codes.csv")
        .defer(d3.csv, "data/Tupelo_Tree.csv")
        .defer(d3.json, "data/MS_Tree_Emp.json")
        .defer(d3.json, "data/MS_Tree_RA.json")
        .defer(d3.csv, "data/MS_Tree.csv")
        .await(function(error, enrGdp, msaData, usCounties, enrTime, usNation, usStates, enrTimeCo, stateCodes, tupelo, msTreeE, msTreeR, msTreeBar) {

            if (error) throw error;

            var treeData = tupelo;
            msTreeEmp = msTreeE;
            msTreeRa = msTreeR;

        // DATA WRANGLING

            //SCATTER

            //CHOROPLETH

            // Convert TopoJSON to GeoJSON
            var msa = msaData.features;
            var counties = usCounties.features;
            var states = usStates.features;
            var nation = usNation.features;

            wrangleMapData(msa, counties, enrTime, enrTimeCo, stateCodes);

            // MASTER TREE

            // var nest = d3.nest().key(function(d) { return "Mississippi Industries"; }).key(function(d) { return d.market; }).key(function(d) { return d.category; }).entries(msTree);
            // console.log(nest);

            // INSTANTIATE VISUALIZATIONS

            scatter = new Scatter("scatter", enrGdp);
            choropleth = new Choropleth("choropleth", msa, states, nation);
            bar = new Bar("bar", tupelo);
            masterMap = new MasterMap("masterMap", msa, counties, states, nation);
            choroLegend = new ChoroLegend('choroLegend');
            tree = new Tree("tree", tupelo);
            network = new Network("network");
            recommended = new Recommended("recommended");
            masterTree = new MasterTree("masterTree", msTreeRa);
            masterBar = new MasterBar("masterBar", msTreeBar);
        });
}

function wrangleScatterData(enrGdp, stateCodes) {

}

function wrangleMapData(msa, counties, enrTime, enrTimeCo, stateCodes) {

    // copy ENR data into MSA geoJson
    for (var i = 0; i < enrTime.length; i++) {

        // Grab State Name
        var enrMarket = enrTime[i].Market;

        // Grab data value
        var enr2015 = enrTime[i].y15;
        var enr2014 = enrTime[i].y14;
        var enr2010 = enrTime[i].y10;
        var enr2005 = enrTime[i].y05;
        var enr1yr = enrTime[i].t1yr;
        var enr5yr = enrTime[i].t5yr;
        var enr10yr = enrTime[i].t10yr;

        // Find the corresponding MSA inside the GeoJSON
        for (var j = 0; j < msa.length; j++) {
            var jsonId = +msa[j].properties.geoid;

            if (enrMarket == jsonId) {

                // Copy the data value into the JSON
                msa[j].properties.enr2015 = +enr2015;
                msa[j].properties.enr2014 = +enr2014;
                msa[j].properties.enr2010 = +enr2010;
                msa[j].properties.enr2005 = +enr2005;
                msa[j].properties.enr1yr = +enr1yr;
                msa[j].properties.enr5yr = +enr5yr;
                msa[j].properties.enr10yr = +enr10yr;

                break;
            }
        }
    }

    // Copy ENR data in Counties GeoJSON


    for (var y = 0; y < stateCodes.length; y++) {

        var FIPS = stateCodes[y].FIPSCode;
        var USPScode = stateCodes[y].USPSCode;
        var statename = stateCodes[y].Name;

        for (var z = 0; z < counties.length; z++) {
            counties[z].properties.Market = counties[z].properties.STATE + counties[z].properties.COUNTY;

            counties[z].properties.Market = +counties[z].properties.Market;

            var enrFIPS = counties[z].properties.STATE;

            if (FIPS == enrFIPS) {
                counties[z].properties.statecode = USPScode;
                counties[z].properties.statename = statename;
            }
        }
    }

    for (var k = 0; k < enrTimeCo.length; k++) {

        // Grab County ID Name
        // enrTimeCo[k].Code = +enrTimeCo[k].Code;
        enrMarket = +enrTimeCo[k].Code;

        // Grab data value
         enr2015 = enrTimeCo[k].y15;
         enr2014 = enrTimeCo[k].y14;
         enr2010 = enrTimeCo[k].y10;
         enr2005 = enrTimeCo[k].y05;
         enr1yr = enrTimeCo[k].t1yr;
         enr5yr = enrTimeCo[k].t5yr;
         enr10yr = enrTimeCo[k].t10yr;

        // Find the corresponding County ID inside the GeoJSON
        for (var l = 0; l < counties.length; l++) {
            var jsonMarket = counties[l].properties.Market;

            if (enrMarket == jsonMarket) {
                // console.log(enrMarket + "," + jsonMarket);
                // Copy the data value into the JSON
                counties[l].properties.enr2015 = +enr2015;
                counties[l].properties.enr2014 = +enr2014;
                counties[l].properties.enr2010 = +enr2010;
                counties[l].properties.enr2005 = +enr2005;
                counties[l].properties.enr1yr = +enr1yr;
                counties[l].properties.enr5yr = +enr5yr;
                counties[l].properties.enr10yr = +enr10yr;

                // Stop looking through the JSON
                break;
            }
        }

    }

}

// update visualization to select filter for node coloring
function dataManipulation() {
    var x = $('input[name="options"]:checked', '#type').val();

    masterMap.changeData(x);

}

function changeTreeData() {
    selectVar = $('input[name="options"]:checked', '#treeDisplay').val();

    d3.select("svg").remove();

    console.log(selectVar);

    if (selectVar == "emp") {
        selectData = msTreeEmp;
    }
    else if (selectVar == "ra") {
        selectData = msTreeRa;
    }

    console.log(selectData);

    barKey = "Mississippi";
    barLevel = "top";

    masterBar.wrangleData();
    masterTree = new MasterTree("masterTree", selectData);
}

function toSectionThree() {
    console.log("click!")
}

function toSectionFour() {
    console.log("click!")
}

function toSectionFive() {
    console.log("click!")
}

function passToBar(barKey, barLevel) {
    console.log(barKey + " " + barLevel);
    masterBar.passedIn(barKey, barLevel);
}