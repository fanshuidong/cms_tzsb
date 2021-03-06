/**
 * Created by sun on 2016/8/4.
 */
define(function (require) {
    var app = require('/../js/app');
    require('ui-table');
    require('upload');
    var toastr =require('toastr');
    app.useModule("ui.table");
    app.useModule("ngFileUpload");
    app.controller('inspectsCtrl', ['$scope','$rootScope','$http','Upload','DateUtil',function ($scope,$rootScope, $http,Upload,DateUtil) {
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
                url: "eep/company/inspects/area",
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

        $scope.images = [];
        $scope.inspect = {};
        $scope.add = function () {
            openDomLayer("新增检查记录","inspects",['700px','700px']);
            $("#smsSend").prop("checked",true);
            $scope.inspect.smsSend = true;
            layui.use(['form'],function () {
                var form = layui.form;
                form.on('select(type)', function(data){
                    switch(data.value){
                        case "use":
                            $("#use").show();
                            $("#repair").hide();
                            break;
                        case "repair":
                            $("#repair").show();
                            $("#use").hide();
                            break;
                        default:
                            $("#use").hide();
                            $("#repair").hide();
                            break;
                    }
                    form.on("switch(smsSend)",function (data) {
                        $scope.inspect.smsSend = data.elem.checked;
                    });
                });
                form.render();
            });

        };
        $scope.addImage = function (image) {
            var render = new FileReader();
            render.readAsDataURL(image);
            render.onload = function (e) {
                $scope.images.push({url:e.target.result,file:image});
            }
        };

        $scope.deleteImg =function (image,index) {
            $scope.images.splice(index,1);
        };

        $scope.submit = function(){
            $scope.inspect.time= Date.parse($("#time").val())/1000;
            $scope.inspect.content= $("#content").val();
            $scope.inspect.files= [];
            switch($("#type").val()){
                case "use":
                    $scope.inspect.cid = $("#useCompany").val();
                    break;
                case "repair":
                    $scope.inspect.cid = $("#repairCompany").val();
                    break;
            }
            for(var i=0;i<$scope.images.length;i++){
                $scope.inspect.files.push($scope.images[i].file);
            }
            Upload.upload({
                url: 'eep/company/inspect/create',
                data: $scope.inspect
            }).then(function (resp) {
                if (resp.data.code === $rootScope.successCode) {
                    toastr.success("操作成功！");
                    layer.closeAll();
                    $("#inspects").hide();
                    $scope.query();
                }
            });
        };

        $scope.detail = function (item) {
            openDomLayer("检查记录详情","inspectDetail",['700px','700px']);
            $http({
                method: 'POST',
                url: "eep/company/inspect/detail",
                data:{id:item.id}
            }).success(function(data) {
                console.log(data);
                $scope.inspectDetail = data.attach;
                $scope.inspectDetail.time = DateUtil.getFormateDate(new Date($scope.inspectDetail.time*1000));
                $scope.inspectDetail.nextTime = DateUtil.getFormateDate(new Date($scope.inspectDetail.time*1000))
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