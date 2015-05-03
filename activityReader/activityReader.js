/**
 * Created by Jens on 2015-04-27.
 */

var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var xml2js = require('xml2js');
var fs = require('fs');

var mongoUrl = 'mongodb://localhost:27017/fitlist';
var activitiesFolder = __dirname + '/data/';
var activitiesCollection;

MongoClient.connect(mongoUrl, function(err, db) {
    activitiesCollection = db.collection('activities');
    readActivities();
    watchForNewActivies();
});

function watchForNewActivies() {
    fs.watch(activitiesFolder, function (event, filename) {
        console.log("Event: " + event + " || Filename: " + filename)
        if (!filename) {
            readActivities();
        } else if (event == 'change') {
            console.log("Checking new/changed file: " + filename)
            parseActivityFile(filename);
        }
    });
}

function readActivities() {
    fs.readdir(activitiesFolder, function (err, files) {
        files.forEach(function (filename) {
            console.log("Parsing file: " + filename);
            parseActivityFile(filename);
        });
    });
}

function parseActivityFile(filename) {
    fs.readFile(activitiesFolder + filename, function (err, data) {
        if (err) {
            if (err.code == 'ENOENT') {
                console.log("File does not exist (" + filename + ")");
            }
            console.error(err);
        } else {
            var parser = new xml2js.Parser({
                attrkey: 'attrKeys',
                explicitArray: false,
                mergeAttrs: true,
                valueProcessors: [xml2js.processors.parseNumbers]
            });
            parser.parseString(data, function (err, result) {
                if (err) {
                    console.error("Error parsing: " + filename + " Error: " + err);
                } else {
                    insertActivity(result.TrainingCenterDatabase.Activities.Activity);
                }
            });
        }
    });
}

var insertActivity = function(activity, callback) {
    console.log("Inserting: " + activity.Id);
    activity._id = activity.Id;
    activitiesCollection.insert(activity, function(err, result) {
        if (err) {
            if (err.code == 11000) {
                console.log(activity.Id + " already inserted.");
            } else {
                console.error(err);
            }
        } else {
            console.log('Done inserting into database');
        }
    });
}