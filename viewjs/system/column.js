/**
 * Created by sun on 2016/8/4.
 */
define(function (require) {
    var app = require('/../js/app');
    require('ui-table');
    require('ztree');
    require('multiselect');
    var toastr =require('toastr');
    app.useModule("ui.table");
    app.controller('columnCtrl', ['$scope','$rootScope','$http',function ($scope,$rootScope,$http) {
        $scope.setting = {
            view: {
                selectedMulti: false
            },
            check: {
                enable: false
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
            },
            edit: {
                enable: true,
                showRenameBtn: false
            },
            callback: {
                beforeRemove:zTreeBeforeRemove,
                onClick: zTreeOnClick

            }
        };

        //删除栏目节点前的操作
        function zTreeBeforeRemove(treeId, treeNode) {
              var b = false;
              layer.confirm("确认删除吗？",function () {
                    var ids = [];
                    ids.push(treeNode.id);
                    if(treeNode.isParent)
                        for(var i = 0 ;i<treeNode.children.length;i++)
                            ids.push(treeNode.children[i].id);
                    $http({
                        method: 'POST',
                        url: "eep/authority/module/delete",
                        data:{ids:ids}
                    }).success(function (data) {
                        if(data.code === $rootScope.successCode){
                            toastr.success("删除成功");
                            layer.closeAll();
                            $scope.query();
                        }
                    });
              });
            return b;
        }

        //获取后台栏目列表
        $scope.query = function(){
            var resources = [];
            $http({
                method: 'POST',
                url: "eep/authority/module/list",
                data:{}
            }).success(function (data) {
                console.log(data);
                if(data.code === $rootScope.successCode){
                    for(var i = 0;i< data.attach.length; i++){
                        var resource = data.attach[i];
                        resources.push(resource);
                    }
                    $.fn.zTree.init($("#treeDemo"), $scope.setting, resources);
                }
            });
        };
        $scope.query();
        var selectedNode;
        function zTreeOnClick(event,treeId,treeNode) {
            $scope.isAdd = false;
            $("#moduleId").show();
            openDomLayer("编辑模块","column",['500px','500px']);
            selectedNode = {
                id:treeNode.id,
                name:treeNode.name,
                url:treeNode.url,
                priority:treeNode.priority,
                parent:treeNode.parent===null?0:treeNode.parent,
                type:treeNode.type,
                css:treeNode.css
            };
            $("#id").val(selectedNode.id);
            $("#name").val(selectedNode.name);
            $("#url").val(selectedNode.url);
            $("#priority").val(selectedNode.priority);
            $("#parent").val(selectedNode.parent);
            $("#type").val(selectedNode.type);
            $("#css").val(selectedNode.css);
            layui.form.render();
        }

        $scope.submit = function () {
            selectedNode = {
                id:$("#id").val(),
                name:$("#name").val(),
                url:$("#url").val(),
                priority:$("#priority").val(),
                parent:$("#parent").val(),
                type:$("#type").val(),
                css:$("#css").val()
            };
            $http({
                method: 'POST',
                url:  $scope.isAdd?"eep/authority/module/create":"eep/authority/module/modify",
                data: selectedNode
            }).success(function(data) {
                console.log(data);
                if(data.code === $rootScope.successCode){
                    toastr.success("提交成功");
                    layer.closeAll();
                    $("#column").hide();
                    $scope.query();
                }
            });
        };
        $scope.add = function () {
            $scope.isAdd = true;
            $("#moduleId").hide();
            $("#id").val("");
            $("#name").val("");
            $("#url").val("");
            $("#priority").val("");
            $("#parent").val("");
            $("#type").val("");
            $("#css").val("");
            openDomLayer("新增模块","column",['500px','500px']);
        };
    }]);
});