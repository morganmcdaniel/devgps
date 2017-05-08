var scatter,
    choropleth,
    tree,
    bar,
    network,
    recommended,
    masterMap;

loadData();

function loadData() {
    queue()
        .defer(d3.csv, "data/enr_gdp.csv")
        .defer(d3.json, "data/cbsa_us_2014_ex_hi_ak.json")
        .defer(d3.json, "data/gz_2010_us_050_00_5m.json")
        .defer(d3.csv, "data/ENR_MSA_Master.csv")
        .defer(d3.json, "data/gz_2010_us_outline_5m.json")
        .defer(d3.json, "data/gz_2010_us_040_00_5m.json")
        .defer(d3.csv, "data/ENI_CO_Master.csv")
        .defer(d3.csv, "data/state-codes.csv")
        .await(function(error, enrGdp, msaData, usCounties, enrTime, usNation, usStates, enrTimeCo, stateCodes) {

            if (error) throw error;

        // DATA WRANGLING

            //SCATTER

            //CHOROPLETH

            // Convert TopoJSON to GeoJSON
            var msa = topojson.feature(msaData, msaData.objects.cbsa_2014_us_ex_hi_ak).features;
            var counties = usCounties.features;
            var states = usStates.features;
            var nation = usNation.features;

            wrangleMapData(msa, counties, enrTime, enrTimeCo, stateCodes);

            // INSTANTIATE VISUALIZATIONS

            scatter = new Scatter("scatter", enrGdp);
            choropleth = new Choropleth("choropleth", msa, states, nation);
            tree = new Tree("tree");
            bar = new Bar("bar");
            network = new Network("network");
            recommended = new Recommended("recommended");
            masterMap = new MasterMap("masterMap", msa, counties, states, nation);

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
        var enr2003 = enrTime[i].y03;
        var enr1yr = enrTime[i].t1yr;
        var enr5yr = enrTime[i].t5yr;
        var enr10yr = enrTime[i].t10yr;
        var enr12yr = enrTime[i].t12yr;
        var enrcurrent = enrTime[i].Current;
        var enrshort = enrTime[i].ShortTerm;
        var enrmid = enrTime[i].MidTerm;
        var enrlong = enrTime[i].LongTerm;

        // Find the corresponding MSA inside the GeoJSON
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

            var enrFIPS = counties[z].properties.STATE;

            if (FIPS == enrFIPS) {
                counties[z].properties.statecode = USPScode;
                counties[z].properties.statename = statename;
            }
        }
    }

    for (var k = 0; k < enrTimeCo.length; k++) {

        // Grab County ID Name
        enrMarket = +enrTimeCo[k].Market;

        // Grab data value
        enr2014 = enrTimeCo[k].y14;
        var enr2009 = enrTimeCo[k].y09;
        var enr2004 = enrTimeCo[k].y04;
        var enr1999 = enrTimeCo[k].y99;
        enr1yr = enrTimeCo[k].t1yr;
        enr5yr = enrTimeCo[k].t5yr;
        var enr15yr = enrTimeCo[k].t15yr;

        // Find the corresponding County ID inside the GeoJSON
        for (var l = 0; l < counties.length; l++) {
            var jsonMarket = +counties[l].properties.Market;

            if (enrMarket == jsonMarket) {

                // Copy the data value into the JSON
                counties[l].properties.enr2014 = +enr2014;
                counties[l].properties.enr2009 = +enr2009;
                counties[l].properties.enr2004 = +enr2004;
                counties[l].properties.enr1999 = +enr1999;
                counties[l].properties.enr1yr = +enr1yr;
                counties[l].properties.enr5yr = +enr5yr;
                counties[l].properties.enr10yr = +enr10yr;
                counties[l].properties.enr15yr = +enr15yr;

                // Stop looking through the JSON
                break;
            }
        }
    }
}

// update visualization to select filter for node coloring
function dataManipulation() {
    masterMap.changeData();

}