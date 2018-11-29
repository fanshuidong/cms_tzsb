/**
 * Created by sun on 2016/8/4.
 */
define(function (require) {
    var app = require('/../js/app');
    require('ui-table');
    app.useModule("ui.table");
    var toastr =require('toastr');
    var datepicker = require('datepicker');
    require('ztree');
    app.controller('taskCtrl', ['$scope','$rootScope','$http',function ($scope,$rootScope, $http) {
        datepicker($scope);
        //数据同步
        $scope.sync = function () {
            if($rootScope.uname !== "admins"){
                layer.open({content:"该用户没有同步权限！"});
                return;
            }
            $http({
                method: 'POST',
                url: "eep/task/sync",
                data:{}
            }).success(function(data) {
                if(data.code === $rootScope.successCode){
                    toastr.success("同步成功!");
                }
            });
        }

    }]);
});