/**
 * Created by Jens on 2015-05-04.
 */

var fs = require('fs');

//var garminActivitiesFolder = '%ProgramData%/Garmin/GarminConnect/Forerunner 405CX-3819971394/FitnessHistory/';
var garminActivitiesFolder = 'C:\ProgramData/Garmin/GarminConnect/-3819971394/FitnessHistory/';
var localActivitiesFolder = __dirname + '/data/';


fs.watch(garminActivitiesFolder, function (event, filename) {
    console.log("Event: " + event + " || Filename: " + filename);
    if (filename && event == 'change') {
        console.log("Checking new/changed file: " + filename);
        copyFile(garminActivitiesFolder + filename, localActivitiesFolder + filename, function (err) {
            if (err) {
                console.error("Failed to copy " + garminActivitiesFolder + filename + ". Error: " + err);
            } else {
                console.log("File copied From: " + garminActivitiesFolder + filename + " To: " + localActivitiesFolder + filename);
            }
        });
    }
});

function copyFile(source, target, cb) {
    var cbCalled = false;

    var rd = fs.createReadStream(source);
    rd.on("error", function(err) {
        done(err);
    });
    var wr = fs.createWriteStream(target);
    wr.on("error", function(err) {
        done(err);
    });
    wr.on("close", function(ex) {
        done();
    });
    rd.pipe(wr);

    function done(err) {
        if (!cbCalled) {
            cb(err);
            cbCalled = true;
        }
    }
}