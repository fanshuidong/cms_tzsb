/**
 * Created by sun on 2016/8/4.
 */
define(function (require) {
    var app = require('/../js/app');
    require('ui-table');
    var toastr =require('toastr');
    app.useModule("ui.table");
    app.controller('repairCompanyListCtrl', ['$scope','$rootScope','$http','enums','DateUtil',function ($scope, $rootScope,$http,enums,DateUtil) {
        $scope.selectOptions = {
            allowClear: false,
            language : 'zh-CN'
        };
        $scope.query=function(reset){
            if(reset){
                $scope.searchEntity = {"page":1,"pageSize":10}
            }
            $http({
                method: 'POST',
                url: "eep/company/list/repair",
                data:$scope.searchEntity
            }).success(function(data) {
                console.log(data);
                $scope.list = data.attach.list;
                $scope.initPage("page",data.attach.total,$scope.searchEntity);
            });
        };
        $scope.query(true);

        //条件查询
        $scope.search=function(){
            if($scope.start)
                $scope.searchEntity.timeStart = Date.parse($scope.start)/1000;
            else{
                delete  $scope.searchEntity.timeStart
            }
            if($scope.end)
                $scope.searchEntity.timeStop = Date.parse($scope.end)/1000;
            else{
                delete  $scope.searchEntity.timeStop
            }
            $scope.query();
        };
        //刷新
        $scope.refresh = function () {
            $scope.query(true);
        };

        $scope.openRepairs = function (item) {
            $scope.rid = item.id;
            openDomLayer("检查记录列表","repairs",['700px','700px']);
            layui.use(['form'],function () {
                var form = layui.form;
                form.render();
            });
            $scope.repairs(true)
        };

        $scope.repairs = function (reset) {
            if(reset){
                $scope.searchEntity2 = {"page":1,"pageSize":10,region:$rootScope.region,"rid":$scope.rid}
            }
            $http({
                method: 'POST',
                url: "eep/device/repairs/area",
                data:$scope.searchEntity2
            }).success(function(data) {
                $scope.repairsList = data.attach.list;
                $scope.initRepairsPage("repairsPage",data.attach.total,$scope.searchEntity2);
            });
        };
        //条件查询
        $scope.repairsSearch=function(){
            $scope.query();
        };
        //刷新
        $scope.repairsRefresh = function () {
            $scope.repairs(true);
        };


        //分页 laypage
        $scope.initPage = function(id,count,entity) {
            layui.use('laypage', function(){
                var laypage = layui.laypage;
                //执行一个laypage实例
                laypage.render({
                    elem: id, //注意，这里的 test1 是 ID，不用加 # 号
                    count: count, //数据总数，从服务端得到
                    limit:entity.pageSize,
                    limits:[entity.pageSize, 20, 30, 40, 50],
                    curr:entity.page,
                    groups:5,
                    layout:['count','prev', 'page', 'next','limit','refresh','skip'],
                    jump: function(obj, first){
                        //首次不执行
                        if(!first){
                            entity.page=obj.curr;
                            $scope.query();
                        }
                    }
                });
            });
        };

        //分页 lawPage
        $scope.initRepairsPage = function(id,count,entity) {
            layui.use('laypage', function(){
                var laypage = layui.laypage;
                //执行一个laypage实例
                laypage.render({
                    elem: id, //注意，这里的 test1 是 ID，不用加 # 号
                    count: count, //数据总数，从服务端得到
                    limit:entity.pageSize,
                    limits:[entity.pageSize, 20, 30, 40, 50],
                    curr:entity.page,
                    groups:5,
                    layout:['count','prev', 'page', 'next','limit','refresh','skip'],
                    jump: function(obj, first){
                        //首次不执行
                        if(!first){
                            entity.page=obj.curr;
                            $scope.repairs();
                        }
                    }
                });
            });
        };

    }]);
});