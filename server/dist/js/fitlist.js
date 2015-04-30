/**
 * Created by Jens on 2015-04-30.
 */

var fitlistApp = angular.module('fitlistApp', ['ngResource', 'ui.bootstrap']);

fitlistApp.factory('Activities', function ($resource, $http) {
    return $resource('/activities', {});
});

fitlistApp.controller('ActivityListController', function ($scope, Activities) {
   $scope.allActivities = Activities.query();
})