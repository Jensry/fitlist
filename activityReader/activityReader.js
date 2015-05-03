/**
 * Created by Jens on 2015-04-27.
 */

var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var xml2js = require('xml2js');
var fs = require('fs');

var mongoUrl = 'mongodb://localhost:27017/fitlist';
var activitiesCollection;

MongoClient.connect(mongoUrl, function(err, db) {
    activitiesCollection = db.collection('activities');
    readActivities();
});

function readActivities() {
    fs.readdir(__dirname + '/data', function (err, files) {
        files.forEach(function (file) {
            fs.readFile(__dirname + '/data/' + file, function (err, data) {
                if (err) {
                    console.error(err);
                    return;
                }
                parseActivityFile(data);
            });
        });
    });
}

function parseActivityFile(data) {
    var parser = new xml2js.Parser({
        attrkey: 'attrKeys',
        explicitArray: false,
        mergeAttrs: true,
        valueProcessors: [xml2js.processors.parseNumbers]
    });
    parser.parseString(data, function (err, result) {
        if (err) {
            console.error(err);
        }
        var activityId = result.TrainingCenterDatabase.Activities.Activity.Id;
        isNewActivity(activityId, function () {
            console.log("Inserting: " + activityId);
            insertActivity(result);
        });
    });
}

function isNewActivity(id, callback) {
    activitiesCollection.findOne({'TrainingCenterDatabase.Activities.Activity.Id' : id}, function (err, result) {
        if (!result) {
            callback();
        }
    });
}

var insertActivity = function(activity, callback) {
    activitiesCollection.insert(activity, function(err, result) {
        if (err) {
            console.error(err);
        } else {
            console.log('Done inserting into database');
        }
    });
}