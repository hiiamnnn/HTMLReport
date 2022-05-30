/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.03206291591047, "KoPercent": 0.9679370840895342};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.5966928816293607, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.007259528130671506, 500, 1500, "get firebase-ActionRequest"], "isController": false}, {"data": [0.8039927404718693, 500, 1500, "get firebase-ComedyRequest"], "isController": false}, {"data": [0.7604355716878403, 500, 1500, "get firebase-RomanceRequest"], "isController": false}, {"data": [0.6288566243194192, 500, 1500, "get firebase-AdventureRequest"], "isController": false}, {"data": [0.13611615245009073, 500, 1500, "get firebase-MysteryRequest"], "isController": false}, {"data": [0.7295825771324864, 500, 1500, "get firebase-ThrillerRequest"], "isController": false}, {"data": [0.8058076225045372, 500, 1500, "get firebase-HorrorRequest"], "isController": false}, {"data": [0.7477313974591652, 500, 1500, "get firebase-FantasyRequest"], "isController": false}, {"data": [0.7504537205081669, 500, 1500, "get firebase-DramaRequest"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 4959, 48, 0.9679370840895342, 1197.1433756805775, 253, 5508, 511.0, 3268.0, 3870.0, 4999.0, 4.396490963655143, 42.74079984784276, 1.025180021798492], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["get firebase-ActionRequest", 551, 48, 8.711433756805807, 3632.8166969147, 612, 5508, 3820.0, 4988.0, 5041.0, 5141.040000000001, 0.5296498159202545, 5.0678797816275925, 0.12310220330959042], "isController": false}, {"data": ["get firebase-ComedyRequest", 551, 0, 0.0, 577.2776769509992, 253, 3746, 475.0, 901.8000000000001, 1730.3999999999987, 2625.84, 0.5302895419395508, 5.1889660256194325, 0.12325088963048153], "isController": false}, {"data": ["get firebase-RomanceRequest", 551, 0, 0.0, 648.0998185117973, 254, 3940, 493.0, 1260.8000000000002, 1517.8, 2743.48, 0.5286020729643544, 5.155935063249972, 0.1233748978891413], "isController": false}, {"data": ["get firebase-AdventureRequest", 551, 0, 0.0, 820.7513611615254, 253, 3801, 672.0, 1487.4, 2562.8, 3782.44, 0.5304769093317724, 5.174222041411857, 0.12484856948140345], "isController": false}, {"data": ["get firebase-MysteryRequest", 551, 0, 0.0, 2217.8584392014513, 264, 4785, 2140.0, 3523.0, 4075.399999999999, 4630.360000000001, 0.5283917041543479, 5.007337008900188, 0.12332579813758705], "isController": false}, {"data": ["get firebase-ThrillerRequest", 551, 0, 0.0, 763.1107078039922, 254, 4653, 470.0, 2230.4, 2492.4, 3620.1600000000017, 0.5286380805544656, 5.060780374683033, 0.12389955012995288], "isController": false}, {"data": ["get firebase-HorrorRequest", 551, 0, 0.0, 669.1687840290383, 255, 4026, 476.0, 1342.2000000000003, 2513.2, 3520.2400000000002, 0.5297949568519987, 5.055299339258672, 0.12313593723708563], "isController": false}, {"data": ["get firebase-FantasyRequest", 551, 0, 0.0, 770.4482758620691, 255, 4845, 484.0, 2242.8000000000006, 2699.5999999999995, 4095.6000000000026, 0.5298943096467692, 5.5571630774381395, 0.12367650391169711], "isController": false}, {"data": ["get firebase-DramaRequest", 551, 0, 0.0, 674.7586206896544, 255, 4052, 481.0, 1722.8000000000002, 2442.2, 2951.5200000000004, 0.529979935786823, 5.063275109182118, 0.12266137185691119], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Assertion failed", 48, 100.0, 0.9679370840895342], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 4959, 48, "Assertion failed", 48, null, null, null, null, null, null, null, null], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": ["get firebase-ActionRequest", 551, 48, "Assertion failed", 48, null, null, null, null, null, null, null, null], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
