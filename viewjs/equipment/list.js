/**
 * Created by sun on 2016/8/4.
 */
define(function (require) {
    var app = require('/../js/app');
    require('ui-table');
    var toastr =require('toastr');
    app.useModule("ui.table");
    app.controller('equipmentListCtrl', ['$scope','$rootScope','$http','enums','DateUtil',function ($scope, $rootScope,$http,enums,DateUtil) {
        $scope.selectOptions = {
            allowClear: false,
            language : 'zh-CN'
        };
        $scope.query=function(reset){
            if(reset){
                $scope.searchEntity = {"page":1,"pageSize":10,"region":$rootScope.region}
            }
            $http({
                method: 'POST',
                url: "eep/device/list",
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

        $scope.detail = function (item) {
            openDomLayer("设备详情","deviceDetail",['500px','500px']);
            $scope.deviceDetail = {};
            for(index in item)
                $scope.deviceDetail[index] = item[index];
            $http({
                method: 'POST',
                url: "eep/device/next/examine/time",
                data:{id:item.id}
            }).success(function(data) {
                console.log(data);
                $scope.deviceDetail.nextTime = data.attach!==null?DateUtil.getFormateDate(new Date(data.attach*1000)):"当前设备没有下次检查时间";
            });
        };

        $scope.qrcodeDownload = function(){
            var xmlResquest = new XMLHttpRequest();
            // xmlResquest.open("POST", "http://183.246.75.54:60080/eep/device/qrcode/download", true);
            xmlResquest.open("POST", "http://localhost:8089/eep/device/qrcode/download", true);
            xmlResquest.setRequestHeader("Content-type", "application/json");
            // xmlResquest.setRequestHeader("Authorization", "Bearer 6cda86e3-ba1c-4737-972c-f815304932ee");
            xmlResquest.responseType = "blob";
            xmlResquest.onload = function (oEvent) {
                var content = xmlResquest.response;
                var elink = document.createElement('a');
                elink.download = "设备二维码.zip";
                elink.style.display = 'none';
                var blob = new Blob([content]);
                elink.href = URL.createObjectURL(blob);
                document.body.appendChild(elink);
                elink.click();
                document.body.removeChild(elink);
            };
            var ids = [];
            for(var i = 0;i < $scope.list.length;i++){
                ids.push($scope.list[i].id);
            }
            xmlResquest.send(JSON.stringify({"ids":ids}));
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