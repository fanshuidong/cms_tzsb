/**
 * Created by sun on 2016/8/4.
 */
define(function (require) {
    var app = require('/../js/app');
    require('ui-table');
    var toastr =require('toastr');
    app.useModule("ui.table");
    app.controller('accountListCtrl', ['$scope','$http','enums','DateUtil',function ($scope, $http,enums,DateUtil) {
        $scope.accountType = enums.accountType;
        $scope.selectOptions = {
            allowClear: false,
            language : 'zh-CN'
        };
        $scope.query=function(reset){
            if(reset){
                $scope.searchEntity = {"page":1,"pageSize":10,"region":1001000000000}
            }
            $http({
                method: 'POST',
                url: "eep/uname/list/area",
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
        $scope.add  = function () {
            $scope.index = openDomLayer("新增用户","user");
            $scope.user = {};
            $scope.isAdd = true;
        };
        $scope.edit  = function (item) {
            $scope.index = openDomLayer("编辑用户","user");
            $scope.user = {};
            for(var index in item)
                $scope.user[index] = item[index];
            $scope.isAdd = false;
        };
        $scope.delete = function () {
            layer.confirm("确认删除该条记录吗？",function () {
                
            })  
        };
        $scope.submit = function () {
            $http({
                method: 'POST',
                url: $scope.isAdd?"sem/user/create":"sem/user/modify",
                data:$scope.user
            }).success(function(data) {
                if(data.code === 'code.success'){
                    toastr.success("操作成功!");
                    layer.closeAll();
                    $("#user").hide();
                    $scope.query();
                }
            });
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

    }]);
});