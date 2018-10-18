const fs = require('fs');

var completeList = {};
var titleAllListsOfOwners = "allListsOfOwners";
var titleFreshListsOfOwners = "freshListsOfOwners";
var titleObsoleteListsOfOwners = "obsoleteListsOfOwners";
completeList[titleAllListsOfOwners] = [];

const filePathOfCSVMapping = ".\\area_gem_gpm_mappings.csv";
var allLinesInCSV = fs.readFileSync(filePathOfCSVMapping, { encoding: "utf-8" })
    .toString()
    .split('\n');
// To parse all the titles in the CSV file
const allTitles = allLinesInCSV[0].split(',');
for (var l = 1; l < allLinesInCSV.length; l++) {
    var line = allLinesInCSV[l];
    oneJsonObjectGenerator(allTitles, line, function (err, jsonObj) {
        completeList[titleAllListsOfOwners].push(jsonObj);
    });
}

completeList[titleFreshListsOfOwners] = [];
fs.readFileSync('additions.log')
    .toString()
    .split('\n')
    .forEach(function (line) {
        oneJsonObjectGenerator(allTitles, line.substring(1, line.length), function (err, jsonObj) {
            if (err) {
                return console.log(err);
            } else {
                completeList[titleFreshListsOfOwners].push(jsonObj);
            }
        });
    });

completeList[titleObsoleteListsOfOwners] = [];
fs.readFileSync('deletions.log')
    .toString()
    .split('\n')
    .forEach(function (line) {
        oneJsonObjectGenerator(allTitles, line.substring(1, line.length), function (err, jsonObj) {
            if (err) {
                return console.log(err);
            } else {
                completeList[titleObsoleteListsOfOwners].push(jsonObj);
            }
        });
    });

fs.writeFile("./ResponseInJSON.json", JSON.stringify(completeList), 'utf8',
    function (err) {
        if (err) {
            return console.log(err);
        }

        console.log("The file was saved!");
    });

/**
 * This function generates one JSON file from one CSV record/line
 * Todo: lack of basic error checking
 */
function oneJsonObjectGenerator(allTitles, line, callback) {
    // To remove the blank line
    line = line.replace(/(^[ \t]*\n)/gm, "");
    if (line.length > 0) {
        var jsonObj = {};
        var err;
        for (var i = allTitles.length; i > 1; i--) {
            var lastIndexOfComma = line.lastIndexOf(',');
            var lastSegment = line.substring(lastIndexOfComma + 1, line.length);
            // To remove the heading and trailing white spaces
            lastSegment = lastSegment.replace(/^\s+|\s+$/g, "");
            // To get the title of the CSV, which is the key of the JSON object
            const curTitle = allTitles[i - 1];
            // console.log("curTitle:" + curTitle);
            jsonObj[curTitle] = lastSegment;
            //console.log(lastSegment);
            line = line.substring(0, lastIndexOfComma);
            // console.log(line);
            var firstTitle = allTitles[0];
            // To strip the BOM
            firstTitle = firstTitle.replace(/^\uFEFF/, '');
            jsonObj[firstTitle] = line;
        }

        callback(err, jsonObj);
    }
}

