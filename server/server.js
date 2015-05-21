var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var express = require('express');
var app = express();

var mongoUrl = 'mongodb://localhost:27017/fitlist';
var activitiesCollection;

var thresholdHR = 165;

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

function createActivity(activityDoc) {
    var laps = getLaps(activityDoc);
    var activity = {
        date: activityDoc.Id,
        time: totalLapsTime(laps),
        distance: totalLapsDistance(laps),
        avgHR: averageLapsHR(laps),
        laps: laps
    }
    activity.fitnessValue = calculateFitnessValue(activity.distance, activity.time, activity.avgHR);
    return activity;
}

function getLaps(activityDoc) {
    var laps = [];
    activityDoc.Lap.forEach(function (lap, index) {
        laps.push({
            distance: lap.DistanceMeters,
            avgHR: lap.AverageHeartRateBpm.Value,
            maximumHR: lap.MaximumHeartRateBpm.Value,
            time: lap.TotalTimeSeconds
        });
        laps[index].accumulatedDistance = totalLapsDistance(laps);
        laps[index].accumulatedAvgHR = averageLapsHR(laps);
        laps[index].accumulatedTime = totalLapsTime(laps)
        laps[index].accumulatedFitnessValue = calculateFitnessValue(
            laps[index].accumulatedDistance, laps[index].accumulatedTime, laps[index].accumulatedAvgHR);
        laps[index].accumulatedFitnessValue2 = calculateNewFitnessValue(
            laps[index].accumulatedDistance, laps[index].accumulatedTime, laps[index].accumulatedAvgHR);
        laps[index].accumulatedSpeedByHR =
            laps[index].accumulatedDistance / laps[index].accumulatedTime / (laps[index].accumulatedAvgHR-65) * 1000;
    });
    return laps;
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
    var totalHRxTime = 0;
    laps.forEach(function (lap) {
        totalHRxTime += lap.avgHR * lap.time;
    });
    return totalHRxTime/totalLapsTime(laps);
}

function calculateFitnessValue(distance, time, avgHR) {
    return Math.round(distance/time/avgHR*360*(0.97+0.00001*distance)*100);
}

function calculateNewFitnessValue(distance, time, avgHR) {
    //return Math.round(distance/time/(avgHR-35)*360*(2-Math.pow((1500+distance)/1000, -1.3))*10);
    return Math.round(distance/time/(1+(avgHR-thresholdHR)*0.008)*100);
}

MongoClient.connect(mongoUrl, function(err, db) {
    activitiesCollection = db.collection('activities');
});