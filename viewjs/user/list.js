/**
 * Created by sun on 2016/8/4.
 */
define(function (require) {
    var app = require('/../js/app');
    require('ui-table');
    var toastr =require('toastr');
    app.useModule("ui.table");
    require('multiselect');
    app.controller('userListCtrl', ['$scope','$http','enums','DateUtil','$rootScope',function ($scope, $http,enums,DateUtil,$rootScope) {
        $scope.selectOptions = {
            allowClear: false,
            language : 'zh-CN'
        };
        $scope.useRegions = $rootScope.regions;
        $scope.query=function(reset){
            if(reset){
                $scope.searchEntity = {"page":1,"pageSize":10}
            }
            $http({
                method: 'POST',
                url: "eep/user/list",
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
            $scope.user = {};
            for(var index in item)
                $scope.user[index] = item[index];
            $scope.isAdd = false;
            $scope.index = openDomLayer("编辑用户","userModify");
        };
        $scope.delete = function () {
            layer.confirm("确认删除该条记录吗？",function () {
                
            })  
        };
        $scope.submit = function () {
            $http({
                method: 'POST',
                url: $scope.isAdd?"eep/user/create":"eep/user/modify",
                data:$scope.user
            }).success(function(data) {
                if(data.code === $rootScope.successCode){
                    toastr.success("操作成功!");
                    layer.closeAll();
                    $("#user").hide();
                    $("#userModify").hide();
                    $scope.query();
                }
            });
        };

        //角色授权
        $scope.auth  = function (item) {
            $scope.index = openDomLayer("角色授权","auth",['700px','300px']);
            $scope.userAuthInit(item.id);
            $('#multiselect1').multiselect({
                keepRenderingSort: true,
                afterMoveToRight:function ($left, $right, $options) {
                    $scope.auth_($right);
                },
                afterMoveToLeft:function ($left, $right, $options) {
                    $scope.auth_($right);
                }
            });
            layui.form.render();
        };
        /***********multiselect 模块开始************/
        var sid="";
        $scope.userAuthInit = function(uid) {
            sid = uid;
            $http({
                method: 'POST',
                url: "eep/authority/role/list",
                data:{}
            }).success(function (data) {
                $scope.leftList=data.attach;
            });
            $http({
                method: 'POST',
                url: "eep/authority/role/user/list",
                data:{id:uid}
            }).success(function (data) {
                $scope.rightList=data.attach;
                for(var i=0;i<$scope.leftList.length;i++){
                    for(var j=0;j<$scope.rightList.length;j++){
                        if($scope.rightList[j].id === $scope.leftList[i].id){
                            $scope.leftList.splice(i,1);
                            i--;
                            break;
                        }
                    }
                }
            });
        };

        //分配权限
        $scope.auth_ = function ($right) {
            var tid = [];
            for(var i = 0;i<$right[0].children.length;i++){
                tid.push(Number($right[0].children[i].value));
            }
            $http({
                method: 'POST',
                async:false,
                url: "eep/authority/auth/role",
                data:{sid:sid,tid:tid}
            }).success(function (data) {
            });
        };

        //分配单位
        $scope.allocation  = function (item) {
            $scope.index = openDomLayer("分配辖区或单位","allocation",['700px','550px']);
            $scope.obj = {uid:item.id};
            $("#type").val("");
            $("#region").hide();
            $("#use").hide();
            $("#repair").hide();
            layui.use(['form','jquery'],function () {
                var form = layui.form,$ = layui.jquery;
                form.on('select(type)', function(data){
                    switch(data.value){
                        case "region":
                            $("#region").show();
                            $("#use").hide();
                            $("#repair").hide();
                            break;
                        case "use":
                            $("#use").show();
                            $("#region").hide();
                            $("#repair").hide();
                            break;
                        case "repair":
                            $("#repair").show();
                            $("#region").hide();
                            $("#use").hide();
                            break;
                    }
                    $scope.obj.type = data.value;
                });
                form.render();
            })
        };
        //分配提交
        $scope.allocationSubmit = function(){
            var url = "";
            switch($scope.obj.type){
                case "region":
                    $scope.obj.region = $("#region_").val();
                    url = "eep/region/grant";
                    break;
                case "use":
                    $scope.obj.cid = $("#useCompany").val();
                    url = "eep/company/employee/create";
                    break;
                case "repair":
                    $scope.obj.cid = $("#repairCompany").val();
                    url = "eep/company/employee/create";
                    break;
            }
            $http({
                method: 'POST',
                url: url,
                data:$scope.obj
            }).success(function(data) {
                if(data.code === $rootScope.successCode){
                    toastr.success("操作成功!");
                    layer.closeAll();
                    $("#allocation").hide();
                    $scope.query();
                }
            });
        }

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