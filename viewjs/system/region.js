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
    app.controller('regionCtrl', ['$scope','$rootScope','$http',function ($scope,$rootScope, $http) {
        $scope.setting = {
            view: {
                selectedMulti: false,
                addHoverDom: addHoverDom,
                removeHoverDom:removeHoverDom
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
        //获取是所有辖区
        $scope.popedomLoad = function () {
            $http({
                method: 'POST',
                url: "eep/user/privilleges",
                data:{regionChain:true}
            }).success(function(data) {
                console.log(data.attach.regions);
                for(var i = 0;i<data.attach.regions.length;i++){
                    data.attach.regions[i].isOpen = data.attach.regions[i].open;
                }
                if(data.code === $rootScope.successCode){
                    $.fn.zTree.init($("#treeDemo"), $scope.setting, data.attach.regions);
                    var treeObj = $.fn.zTree.getZTreeObj("treeDemo");
                    treeObj.expandAll(true);
                }
            });
        };
        $scope.popedomLoad();

        //删除辖区节点前的操作
        function zTreeBeforeRemove(treeId, treeNode) {
            if(confirm("确认要删除该辖区以及其底下的辖区吗？")){
                $http({
                    method: 'POST',
                    url: "eep/region/delete",
                    data: {id: treeNode.id}
                }).success(function (data) {
                    if (data.code === $rootScope.successCode) {
                        toastr.success("删除成功");
                        return true;
                    } else {
                        toastr.error(data.desc);
                        return false;
                    }
                })
            }else{
                return false;
            }
        }

        function zTreeOnClick(event,treeId,treeNode) {
            $scope.popedom = {parent:treeNode.parent,region:treeNode.id,code:treeNode.code,name:treeNode.name,open:treeNode.isOpen};
            $scope.index = openDomLayer("编辑辖区","popedom");
            layui.use('form',function () {
                var form = layui.form;
                form.on('switch(valid)', function(data){
                    console.log(data.elem.checked); //开关是否开启，true或者false
                    $scope.popedom.open = data.elem.checked;
                });
                $("#valid").prop('checked', treeNode.isOpen);
                form.render();
            });
            $scope.isAdd = false;
            $scope.$apply();
        }

        function addHoverDom(treeId, treeNode) {
            var sObj = $("#" + treeNode.tId + "_span");
            if (treeNode.editNameFlag || $("#addBtn_" + treeNode.tId).length > 0) return;
            var addStr = "<span class='button add' id='addBtn_" + treeNode.tId
                + "' title='add node' onfocus='this.blur();' ></span>";
            sObj.after(addStr);
            var btn = $("#addBtn_" + treeNode.tId);
            if (btn) btn.bind("click", function () {
                $scope.index = openDomLayer("新增辖区","popedom");
                layui.use('form',function () {
                    var form = layui.form;
                    form.on('switch(valid)', function(data){
                        console.log(data.elem.checked); //开关是否开启，true或者false
                        $scope.popedom.valid = data.elem.checked;
                    });
                    form.render();
                });
                $scope.popedom = {parent:treeNode.id};
                $scope.isAdd = true;
                $scope.$apply();
                return false;
            });
        }

        function removeHoverDom(treeId, treeNode) {
            $("#addBtn_" + treeNode.tId).unbind().remove();
        }

        $scope.submit = function () {
            $http({
                method: 'POST',
                url: $scope.isAdd?"eep/region/create":"eep/region/modify",
                data:$scope.popedom
            }).success(function (data) {
                console.log(data);
                if(data.code === $rootScope.successCode){
                    toastr.success("操作成功");
                    layer.closeAll();
                    $("#popedom").hide();
                    $scope.popedomLoad();
                }
            });
        }

    }]);
});