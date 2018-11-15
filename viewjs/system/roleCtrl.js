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
    app.controller('roleCtrl', ['$scope','$rootScope','$http',function ($scope,$rootScope, $http) {
        datepicker($scope);
        $scope.checked=[];
        $scope.resources=[];
        $scope.setting = {
            view: {
                selectedMulti: false
            },
            check: {
                enable: true,
                chkStyle: "checkbox",
                chkboxType: { "Y": "p", "N": "s" }
            },
            data: {
                key:{
                    name:"name"
                },
                simpleData: {
                    enable: true,
                    idKey:"id",
                    pIdKey:"parent"
                }
            }
        };
        function clickIt() {
            return false;
        }
        //******************查询权限**************
        var searchEntity = {page:1,pageSize:10};
        $scope.query = function (reset) {
            if(reset){
                searchEntity = {page:1,pageSize:10};
            }
            $http({
                method: 'POST',
                url: "eep/authority/role/list",
                data:searchEntity
            }).success(function (data) {
                console.log(data);
                $scope.list=data.attach;
            })
        };
        $scope.query(true);

        // 切换页码时
        $scope.changePages=function(){
            searchEntity.page=$scope.page;
            $scope.query();
        };
        //条件查询
        $scope.search=function(){
            searchEntity = {page:1,pageSize:10};
            if($scope.name)
                searchEntity.name = $scope.name;
            $scope.query();
        };
        $scope.refresh = function () {
            var searchEntity = {page:1,pageSize:10};
            $scope.query();
        };

        $scope.add  = function () {
            $scope.index = openDomLayer("新增角色","role",['500px','500px']);
            $scope.role = {};
            $scope.isAdd = true;
            $scope.resource();
        };
        $scope.edit  = function (item) {
            $scope.index = openDomLayer("编辑角色","role",['500px','500px']);
            $scope.role = {};
            $scope.role.name = item.name;
            $scope.isAdd = false;
            $scope.resource(item);
        };

        //显示所有复选框
        $scope.resource=function(item){
            //打开的是新增窗口
            $http({
                method: 'POST',
                url: "eep/authority/module/list",
                data:{}
            }).success(function (data) {
                if(data.code===$rootScope.successCode){
                    $.fn.zTree.init($("#treeDemo"), $scope.setting, data.attach);
                    if(item){//如果是更新就查找对应栏目权限
                        $http({
                            method: 'POST',
                            url: "eep/authority/module/role/list",
                            data:{id:item.id}
                        }).success(function (data) {
                            console.log(data);
                            $scope.role = item;
                            var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
                            for(var i=0;i<data.attach.length;i++){
                                if(treeObj.getNodeByParam("id",data.attach[i].id))
                                    treeObj.checkNode(treeObj.getNodeByParam("id",data.attach[i].id),true);
                            }
                        });
                    }
                }
            });
        };

        //添加编辑
        $scope.submit = function(){
            var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
            var nodes = treeObj.getCheckedNodes(true);
            $scope.role.ids = [];
            for(var i= 0 ;i<nodes.length;i++){
                $scope.role.ids.push(nodes[i].id);
            }
            if($scope.isAdd){
                $scope.url="eep/authority/role/create";
            }else{
                $scope.url="eep/authority/role/modify";
            }
            $http({
                method: 'POST',
                url: $scope.url,
                data:$scope.role
            }).success(function (data) {
                if(data.code === $rootScope.successCode){
                    toastr.success("操作成功!");
                    layer.closeAll();
                    $("#role").hide();
                    $scope.query();
                }
            });
        };

        $scope.delete = function (id) {
            layer.confirm("确认删除该条记录吗？",function () {
                $http({
                    method: 'POST',
                    url: "eep/authority/role/delete",
                    data:{id:id}
                }).success(function (data) {
                    if(data.code===$rootScope.successCode){
                        toastr.success("删除成功！");
                        layer.closeAll();
                        $scope.query();
                    }
                });
            })
        };
    }]);
});