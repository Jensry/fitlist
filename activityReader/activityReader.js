/**
 * Created by Jens on 2015-04-27.
 */

var assert = require('assert');
var MongoClient = require('mongodb').MongoClient;
var xml2js = require('xml2js');
var fs = require('fs');

var mongoUrl = 'mongodb://localhost:27017/fitlist';

fs.readdir(__dirname + '/data', function (err, files) {
    files.forEach(function (file) {
        fs.readFile(__dirname + '/data/' + file, function(err, data) {
            if (err) {
                console.error(err);
                return;
            }
            var parser = new xml2js.Parser({ attrkey: 'attrKeys',
                explicitArray: false,
                mergeAttrs: true,
                valueProcessors: [xml2js.processors.parseNumbers]
            });
            parser.parseString(data, function (err, result) {
                if (err) {
                    console.error(err);
                }
                console.log(JSON.stringify(result));
                console.log(result.TrainingCenterDatabase.Activities.Activity.Lap[0].TotalTimeSeconds);
                insertActivity(result, function () {
                    console.log('Done inserting into database');
                });
            });
        });
    });
});

var insertActivity = function(activity, callback) {
    MongoClient.connect(mongoUrl, function(err, db) {
        var collection = db.collection('activities');
        collection.insert(activity, function(err, result) {
            if (err) {
                console.error(err);
            }
            callback(result);
        });
    });
}