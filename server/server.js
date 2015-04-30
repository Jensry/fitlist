var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var express = require('express');
var app = express();

var mongoUrl = 'mongodb://localhost:27017/fitlist';
var activitiesCollection;

app.use('/', express.static(path.join(__dirname, 'dist/')));

var server = app.listen(9000, function () {
    console.log('Server started: http://localhost:%s/', server.address().port);
});

/**
 * GET /activities
 */
app.get('/activities', function (req, res) {
    activitiesCollection.find().toArray(function(err, docs) {
        if (err) {
            return res.status(500).send(err);
        }

        var activities = new Array();
        docs.forEach(function (doc) {
            activities.push(createActivity(doc));
        });
        res.send(JSON.stringify(activities));
    });
});

function createActivity(doc) {
    var activityDoc = doc.TrainingCenterDatabase.Activities.Activity;
    var laps = [];
    activityDoc.Lap.forEach(function (lap) {
        laps.push({
            distance: lap.DistanceMeters,
            avgHR: lap.AverageHeartRateBpm.Value,
            maximumHR: lap.MaximumHeartRateBpm.Value,
            time: lap.TotalTimeSeconds
        });
    });
    var activity = {
        date: activityDoc.Id,
        time: totalLapsTime(laps),
        distance: totalLapsDistance(laps),
        avgHR: averageLapsHR(laps),
        laps: laps
    }
    return activity;
}

function totalLapsTime(laps) {
    var totalTime = 0;
    laps.forEach(function (lap) {
        totalTime += lap.time;
    });
    return totalTime;
}

function totalLapsDistance(laps) {
    var totalDistance = 0;
    laps.forEach(function (lap) {
        totalDistance += lap.distance;
    });
    return totalDistance;
}

function averageLapsHR(laps) {
    var totalHR = 0;
    laps.forEach(function (lap) {
        totalHR += lap.avgHR;
    });
    return totalHR/laps.length;
}

MongoClient.connect(mongoUrl, function(err, db) {
    activitiesCollection = db.collection('activities');
});