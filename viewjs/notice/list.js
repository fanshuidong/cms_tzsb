/**
 * Created by sun on 2016/8/4.
 */
define(function (require) {
    var app = require('/../js/app');
    require('ui-table');
    var toastr =require('toastr');
    app.useModule("ui.table");
    app.controller('noticeListCtrl', ['$scope','$rootScope','$http','DateUtil','enums',function ($scope,$rootScope, $http,DateUtil,enums) {
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

        $scope.warnLevel = enums.warnLevel;
        $scope.query=function(reset){
            if(reset){
                $scope.searchEntity = {"page":1,"pageSize":10,"region":$rootScope.region}
            }
            $http({
                method: 'POST',
                url: "eep/company/rectify/notice/list/area",
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

        //发送监察指令书
        $scope.notice = {};
        $scope.send = function () {
            openDomLayer("发送监察指令书","notice",['700px','600px']);
            $("#smsSend").prop("checked",true);
            $scope.notice.smsSend = true;
            layui.use(['form'],function () {
                var form = layui.form;
                form.on("switch(smsSend)",function (data) {
                    $scope.notice.smsSend = data.elem.checked;
                });
                form.render();
            });
        };

        $scope.sendSubmit = function () {
            $scope.notice.cid = $("#cid").val();
            $scope.notice.closingTime =Date.parse($scope.notice.closingTime)/1000;
            $scope.notice.warnLevel = $("#warnLevel").val();
            $http({
                method: 'POST',
                url: "eep/company/rectify/notice/create",
                data:$scope.notice
            }).success(function(data) {
                console.log(data);
                layer.closeAll();
                $scope.query();
                $("#notice").hide();
            });
        };

        $scope.lookLaw = function () {
            openDomLayer("法律法规列表","law",['700px','700px']);
            layui.use(['form'],function () {
                var form = layui.form;
                form.render();
            });
            $scope.lawQuery(true);
        };

        $scope.lawQuery=function(reset){
            if(reset){
                $scope.searchEntity2 = {"page":1,"pageSize":10}
            }
            $http({
                method: 'POST',
                url: "eep/common/law/list",
                data:$scope.searchEntity2
            }).success(function(data) {
                console.log(data);
                $scope.lawList = data.attach.list;
                for(var i=0;i<$scope.lawList.length;i++){
                    for(var index in $scope.lawCategories){
                        if($scope.lawCategories[index].id === $scope.lawList[i].categoryId){
                            $scope.lawList[i].categoryName = $scope.lawCategories[index].name;
                        }
                    }
                }
                $scope.initLawPage("lawPage",data.attach.total,$scope.searchEntity2);
            });
        };
        //条件查询
        $scope.lawSearch=function(){
            $scope.lawQuery();
        };
        //刷新
        $scope.lawRefresh = function () {
            $scope.lawQuery(true);
        };

        $scope.lawDetail = function (item) {
            openDomLayer("法律法规详情","lawDetail",['500px','500px']);
            $("#title").val(item.title);
            $("#categoryName").val(item.categoryName);
            $("#content").val(item.content);
        };

        $scope.detail = function (item) {
            openDomLayer("监察指令详情","detail",['500px','500px']);
            $scope.noticeDetail={};
            for(index in item){
                $scope.noticeDetail[index] = item[index];
            }
            $scope.noticeDetail.closingTime = DateUtil.getFormateDate(new Date($scope.noticeDetail.closingTime*1000));
            $("#warnLevel_").val($scope.noticeDetail.warnLevel);
            layui.use(['form'],function () {
                layui.form.render();
            })
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
        $scope.initLawPage = function(id,count,entity) {
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
                            $scope.lawQuery();
                        }
                    }
                });
            });
        };

    }]);
});