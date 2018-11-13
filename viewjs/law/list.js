/**
 * Created by sun on 2016/8/4.
 */
define(function (require) {
    var app = require('/../js/app');
    require('ui-table');
    var toastr =require('toastr');
    app.useModule("ui.table");
    app.controller('lawListCtrl', ['$scope','$rootScope','$http','enums','DateUtil',function ($scope,$rootScope, $http,enums,DateUtil) {
        $scope.selectOptions = {
            allowClear: false,
            language : 'zh-CN'
        };

        $http({
            method: 'POST',
            url: "eep/common/law/categories",
            data:{}
        }).success(function(data) {
            console.log(data);
            $scope.lawCategories = data.attach.list;
            console.log($scope.lawCategories);
        });

        $scope.query=function(reset){
            if(reset){
                $scope.searchEntity = {"page":1,"pageSize":10}
            }
            $http({
                method: 'POST',
                url: "eep/common/law/list",
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
            $scope.index = openDomLayer("新增法律法规","law",['500px']);
            $scope.law = {};
            $scope.isAdd = true;
            $("#categoryId").val("");
            layui.use('form',function () {
                var form = layui.form;
                form.on('select(categoryId)', function(data){
                    $scope.law.categoryId = data.value;
                });
                form.render();
            })
        };
        $scope.edit  = function (item) {
            $scope.index = openDomLayer("编辑法律法规","law",['500px']);
            $scope.law = {};
            for(var index in item)
                $scope.law[index] = item[index];
            $scope.isAdd = false;
            $("#categoryId").val($scope.law.categoryId);
            layui.use('form',function () {
                var form = layui.form;
                form.on('select(categoryId)', function(data){
                    $scope.law.categoryId = data.value;
                });
                form.render();
            })
        };
        $scope.delete = function (item) {
            layer.confirm("确认删除该条记录吗？",function () {
                $http({
                    method: 'POST',
                    url: "eep/common/law/delete",
                    data:{id:item.id}
                }).success(function(data) {
                    if(data.code === $rootScope.successCode){
                        toastr.success("操作成功!");
                        layer.closeAll();
                        $("#law").hide();
                        $scope.query();
                    }
                });
            })
        };
        $scope.submit = function () {
            $http({
                method: 'POST',
                url: $scope.isAdd?"eep/common/law/create":"eep/common/law/modify",
                data:$scope.law
            }).success(function(data) {
                if(data.code === $rootScope.successCode){
                    toastr.success("操作成功!");
                    layer.closeAll();
                    $("#law").hide();
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