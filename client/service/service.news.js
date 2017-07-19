/**
 * Created by Chris on 14.12.16.
 */
angular.module('myApp').service('newsService', function ($q,teamService,authService,$http,$filter,$localStorage) {

    var vm = this;
    vm.teams = [];
    vm.teamSelected = {};


    vm.unread = {};

    if(!$localStorage.readNews){
        $localStorage.readNews = authService.getUser().obj.login;
    }
    vm.showTeam = function(teamID){
        var found = $filter('filter')(vm.teams, {id: teamID}, true);
        if (found.length) {
            vm.teamSelected = found[0];
            $localStorage.readNews = new Date();
            delete vm.unread[teamID];
        }
    };
    vm.getUnreadMessages = function(){

    };


    vm.getNews = function(){
        var defer = $q.defer();
        vm.teams = [];

        //get Teams
        vm.getTeams(function(){
            var counter=0;
            for (var item in vm.teams) {
                vm.teams[item].name_short = teamService.shortenName(vm.teams[item].name);
                (function(savedArrayID){
                    vm.getTeamNews(vm.teams[savedArrayID].id, function(result_news) {
                        counter++;
                        if(result_news[0]){
                            vm.teams[savedArrayID].latest = result_news[0].latest;
                        }else{
                            vm.teams[savedArrayID].latest = 0;
                        }
                        vm.teams[savedArrayID].news = result_news;
                        if(vm.teams.length == counter){
                            defer.resolve(true);
                        }
                    });
                })(item);


            }
        });
        return defer.promise;
    };
    vm.getLog = function (name){

    };
    vm.getTeams = function(callback){
        teamService.search({key:"user",value:authService.getUser().obj.id}).then(
            function(result) {
                if (result) {
                    for (var item in result.data) {
                        vm.teams.push(result.data[item]);
                    }
                    callback();
                }
            }
        );
    };
    vm.getTeamNews = function(teamID,callback){
        $http.get("/api/team/"+teamID+"/news").then(
            function(result) {
                if (result.data[0]) {
                    if ($localStorage.readNews < result.data[0].latest) {
                        vm.unread[teamID] = true;
                    }

                }
                callback(result.data);
            }
        );
    };
    vm.getUserNews = function(callback){
        $http.get("/api/log/user/"+authService.getUser().obj.id+"/").then(
            function(result) {
                if (result.data && result.data.length>0 ) {
                    callback(result.data);
                }else{
                    callback([]);
                }

            }
        );
    };
    vm.updateNews = function(teamID){
        vm.getTeamNews(teamID, function(result_news){

            $filter('filter')(vm.teams, {id: parseInt(teamID)}, true)[0].news = result_news;
        });
    };
    vm.postDelete = function(postID){
      $http.delete("/api/team/"+vm.teamSelected.id+"/post/"+postID).then(
          function(){
              vm.updateNews(vm.teamSelected.id);
          },
          function(err){

          }
      )
    };



    return vm;
});