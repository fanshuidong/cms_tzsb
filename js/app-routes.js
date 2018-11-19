define(function (require) {
    var app = require('./app');
    var $=require("jquery");
    require('angular');
    var toastr=require('toastr');
    var datepicker = require('datepicker');

    app.run(['$state', '$stateParams', '$rootScope','$location','$window','$log','$http','enums',
        function ($state, $stateParams, $rootScope,$location,$window,$log,$http,enums) {
        $rootScope.$state = $state;
        $rootScope.$stateParams = $stateParams;
        $rootScope.path = $location.path();
        $rootScope.userName = window.localStorage.getItem("t_userName");
        $rootScope.uid = window.localStorage.getItem("t_uid");
        $rootScope.region = window.localStorage.getItem("t_region");
        $rootScope.defaultPageSize = 10;
        $rootScope.successCode = "code.ok";
        //获取辖区列表
        $http({
            method: 'POST',
            url: "eep/user/privilleges",
            data:{regionChain:true}
        }).success(function(data) {
            console.log(data.attach.regions);
            $rootScope.regions = data.attach.regions;
        });
        //获取使用单位列表
        $http({
            method: 'POST',
            url: "eep/company/list/use",
            data:{page:1,pageSize:20000}
        }).success(function(data) {
            $rootScope.useCompanies = data.attach.list;
        });
        //获取维保单位列表
        $http({
            method: 'POST',
            url: "eep/company/list/repair",
            data:{page:1,pageSize:20000}
        }).success(function(data) {
            $rootScope.repairCompanies = data.attach.list;
        });
    }]);
    app.controller('AppController', ['$scope','$rootScope', '$http','enums',function($scope,$rootScope,$http,enums) {
        //获取后台系统配置
        // $http({
        //     method: 'POST',
        //     url:"hasan/common/configs",
        //     data:{}
        // }).success(function(data) {
        //     $rootScope.GlobalConfig=data.attach;
        // });
        //获取后台图片资源配置
        // $http({
        //     method: 'POST',
        //     url:"hasan/config/resources",
        //     data:{}
        // }).success(function(data) {
        //     enums.cfgResource = data.attach.list;
        //     enums.enumConfig.cfgResource = enums.cfgResource;
        // });
    }]);
    app.controller('HeaderController', ['$rootScope', '$scope', '$http','$interval','$timeout','$filter',
        function($rootScope, $scope, $http,$interval,$timeout,$filter) {
            //退出
            $scope.logout = function() {
                $http({
                    method: 'POST',
                    url: "eep/user/logout",
                    data:{}
                }).success(function(data) {
                    if(data.code==="code.ok"){
                        window.localStorage.removeItem("t_token");
                        window.location.href = "login.html";
                    }
                }).error(function(data) {
                    window.localStorage.removeItem("t_token");
                    window.location.href = "login.html";
                });
            };
            $scope.changePsw = function() {
                $scope.index = openDomLayer("修改密码","pwd-form");
                $scope.list = {};
            };

            layui.use(['form'],function () {
                var form = layui.form;
                form.verify({
                    password: [/(.+){6,12}$/, '密码必须6到12位']
                });
                form.on('submit(modifyPwd)',function (data) {
                    if(data.field.npassword !== data.field.newPassword){
                        layer.tips('两次密码输入不匹配', '#newPassword');
                        return;
                    }
                    $http({
                        method: 'POST',
                        url: "eep/user/pwd/modify",
                        data:$scope.list
                    }).success(function(data) {
                        if(data.code==="code.ok"){
                            toastr.success('修改成功');
                            $scope.changeModal = !$scope.changeModal;
                            $timeout(function () {
                                location.reload();
                            },1000);
                        }
                    });
                })
            });
            $scope.confirm= function () {

            };
        }

    ]);

    //主页左侧导航栏ctrl
    app.controller('IndexSidebarController', ['$scope','$http', '$rootScope','$location',function($scope,$http,$rootScope,$location) {
        //路由跳转
        $rootScope.moduleName =  window.localStorage.getItem("moduleName");
        $rootScope.childModuleName =  window.localStorage.getItem("childModuleName");
        $scope.goto = function (href,moduleName,childModuleName) {
            $rootScope.moduleName = moduleName;
            $rootScope.childModuleName = childModuleName;
            window.localStorage.setItem("moduleName",moduleName);
            window.localStorage.setItem("childModuleName",childModuleName);
            window.location.href = href;
        };

        $scope.parentResourceList = [];
        $rootScope.resourceMapping = {};
        $http({
            method: 'POST',
            url: "eep/authority/module/user/list",
            data:{}
        }).success(function(data) {
            for(var i=0;i<data.attach.length;i++){
                if(data.attach[i].parent === 0){
                    $scope.childrenResourceList = [];
                    for(var j=0;j<data.attach.length;j++){
                        if(data.attach[j].parent === data.attach[i].id){
                            if(!data.attach[i].href){
                                data.attach[i].href = '#/'+data.attach[i].url +'/'+ data.attach[j].url;
                            }
                            if($location.path()==""){
                                var path='/'+data.attach[i].url +'/'+ data.attach[j].url;
                                $location.path(path);
                            }
                            $scope.childrenResourceList.push(data.attach[j]);
                        }
                    }
                    if($scope.childrenResourceList.length>0)
                        $scope.parentResourceList.push(data.attach[i]);
                    $rootScope.resourceMapping["/"+data.attach[i].url] =$scope.childrenResourceList;
                }
            }
            $rootScope.path = $location.path();
        });
        $scope.setPath = function (url) {
            $rootScope.path = url;
        };
        //$scope.$apply();
    }]);
    app.controller('SidebarController', ['$scope','$http', '$rootScope','$location',function($scope,$http,$rootScope,$location) {
        //获取子模块列表
        $scope.key = $location.path().substring(0,$location.path().lastIndexOf('/'));

    }]);


    app.controller('FooterController', ['$scope', function($scope) {

    }]);

    app.config(['$stateProvider', '$urlRouterProvider',function ($stateProvider, $urlRouterProvider) {
        $urlRouterProvider.otherwise('index');
        $stateProvider
            .state("index", {
            	url: "/index",
            	templateUrl: "view/index.html",
                controllerUrl: "viewjs/indexCtrl.js",
                controller: "indexCtrl"
            })
            //用户管理
            .state("user", {
                url: "/user",
                templateUrl: "view/include/module.html"
            })
            .state("user.list", {
                url: "/list",
                templateUrl: "view/user/list.html",
                controllerUrl: 'viewjs/user/list.js',
                controller: "userListCtrl"
            })
            .state("user.account", {
                url: "/account",
                templateUrl: "view/user/account.html",
                controllerUrl: 'viewjs/user/account.js',
                controller: "accountListCtrl"
            })

            //使用单位
            .state("useCompany", {
                url: "/useCompany",
                templateUrl: "view/include/module.html"
            })
            .state("useCompany.list", {
                url: "/list",
                templateUrl: "view/useCompany/list.html",
                controllerUrl: 'viewjs/useCompany/list.js',
                controller: "useCompanyListCtrl"
            })
            .state("useCompany.listArea", {
                url: "/listArea",
                templateUrl: "view/useCompany/listArea.html",
                controllerUrl: 'viewjs/useCompany/listArea.js',
                controller: "useCompanyListAreaCtrl"
            })
            //维保单位
            .state("repairCompany", {
                url: "/repairCompany",
                templateUrl: "view/include/module.html"
            })
            .state("repairCompany.list", {
                url: "/list",
                templateUrl: "view/repairCompany/list.html",
                controllerUrl: 'viewjs/repairCompany/list.js',
                controller: "repairCompanyListCtrl"
            })
            .state("repairCompany.listArea", {
                url: "/listArea",
                templateUrl: "view/repairCompany/listArea.html",
                controllerUrl: 'viewjs/repairCompany/listArea.js',
                controller: "repairCompanyListAreaCtrl"
            })
            //设备
            .state("equipment", {
                url: "/equipment",
                templateUrl: "view/include/module.html"
            })
            .state("equipment.list", {
                url: "/list",
                templateUrl: "view/equipment/list.html",
                controllerUrl: 'viewjs/equipment/list.js',
                controller: "equipmentListCtrl"
            })
            .state("equipment.listCompany", {
                url: "/listCompany",
                templateUrl: "view/equipment/listCompany.html",
                controllerUrl: 'viewjs/equipment/listCompany.js',
                controller: "equipmentListCompanyCtrl"
            })
            .state("equipment.equipmentType", {
                url: "/equipmentType",
                templateUrl: "view/equipment/equipmentType.html",
                controllerUrl: 'viewjs/equipment/equipmentType.js',
                controller: "equipmentTypeCtrl"
            })
            //作业人员
            .state("homework", {
                url: "/homework",
                templateUrl: "view/include/module.html"
            })
            .state("homework.operators", {
                url: "/operators",
                templateUrl: "view/homework/operators.html",
                controllerUrl: 'viewjs/homework/operators.js',
                controller: "operatorsCtrl"
            })
            .state("homework.useCompany", {
                url: "/useCompany",
                templateUrl: "view/homework/useCompany.html",
                controllerUrl: 'viewjs/homework/useCompany.js',
                controller: "useCompanyCtrl"
            })
            .state("homework.certs", {
                url: "/certs",
                templateUrl: "view/homework/certs.html",
                controllerUrl: 'viewjs/homework/certs.js',
                controller: "certsCtrl"
            })
            //租户管理
            .state("tenant", {
                url: "/tenant",
                templateUrl: "view/include/module.html"
            })
            .state("tenant.list", {
                url: "/list",
                templateUrl: "view/tenant/list.html",
                controllerUrl: 'viewjs/tenant/list.js',
                controller: "tenantListCtrl"
            })
            //法律法规
            .state("law", {
                url: "/law",
                templateUrl: "view/include/module.html"
            })
            .state("law.categories", {
                url: "/categories",
                templateUrl: "view/law/categories.html",
                controllerUrl: 'viewjs/law/categories.js',
                controller: "lawCategoriesCtrl"
            })
            .state("law.list", {
                url: "/list",
                templateUrl: "view/law/list.html",
                controllerUrl: 'viewjs/law/list.js',
                controller: "lawListCtrl"
            })
            //自查自纠
            .state("introspect", {
                url: "/introspect",
                templateUrl: "view/include/module.html"
            })
            .state("introspect.list", {
                url: "/list",
                templateUrl: "view/introspect/list.html",
                controllerUrl: 'viewjs/introspect/list.js',
                controller: "introspectCtrl"
            })
            //检查记录
            .state("inspects", {
                url: "/inspects",
                templateUrl: "view/include/module.html"
            })
            .state("inspects.list", {
                url: "/list",
                templateUrl: "view/inspects/list.html",
                controllerUrl: 'viewjs/inspects/list.js',
                controller: "inspectsCtrl"
            })
            //监察指令
            .state("notice", {
                url: "/notice",
                templateUrl: "view/include/module.html"
            })
            .state("notice.list", {
                url: "/list",
                templateUrl: "view/notice/list.html",
                controllerUrl: 'viewjs/notice/list.js',
                controller: "noticeListCtrl"
            })
            //辖区管理
            .state("popedom", {
                url: "/popedom",
                templateUrl: "view/include/module.html"
            })
            .state("popedom.tree", {
                url: "/tree",
                templateUrl: "view/popedom/tree.html",
                controllerUrl: 'viewjs/popedom/tree.js',
                controller: "treeCtrl"
            })
            //系统配置
            .state("system", {
                url: "/system",
                templateUrl: "view/include/module.html"
            })
            .state("system.role", {
                url: "/role",
                templateUrl: "view/system/role.html",
                controllerUrl: 'viewjs/system/roleCtrl.js',
                controller: "roleCtrl"
            })
            .state("system.column", {
                url: "/column",
                templateUrl: "view/system/column.html",
                controllerUrl: 'viewjs/system/columnCtrl.js',
                controller: "columnCtrl"
            })

    }]);

    app.service("Url",function(){
        this.hasan = {
            zxlUrl:"http://192.168.50.19/",
            fsdUrl:"http://localhost:8089/",
            online:"http://183.246.75.54:60080/"
        };
    });
    //定义枚举实体
    app.service('enums',function () {
        this.os = [
            {value:"IOS",text:"苹果",mark:1},
            {value:"ANDROID",text:"安卓",mark:2},
            {value:"WINPHONE",text:"winphone",mark:3},
            {value:"WINDOWS",text:"windos系统",mark:4},
            {value:"LINUX",text:"linux系统",mark:5}
        ];
        this.client = [
            {value:"BROWSER",text:"浏览器",mark:1},
            {value:"ORIGINAL",text:"原生(自定义)",mark:2}
        ];
        this.deviceType = [
            {value:"PC",text:"个人电脑",mark:1},
            {value:"MOBILE",text:"手机",mark:2},
            {value:"TABLET",text:"平板",mark:4}
        ];
        this.timeUnit = [
            {value:"SECOND",text:"秒",mark:1},
            {value:"HOUR",text:"小时",mark:3},
            {value:"MINUTE",text:"分",mark:2},
            {value:"DAY",text:"天",mark:4},
            {value:"WEEK",text:"周",mark:5},
            {value:"MONTH",text:"月",mark:6},
            {value:"SEASON",text:"季度",mark:7},
            {value:"YEAR",text:"年",mark:8}
        ];
        this.accountType = [
            {value:"COMMON",text:"普通用户",mark:1},
            {value:"MOBILE",text:"手机用户",mark:1},
            {value:"EMAIL",text:"邮箱用户",mark:1}
        ];
        //单位状态
        this.warnLevel = [
            {value:"GREEN",text:"绿灯",mark:1,color:"green"},
            {value:"YELLOW",text:"黄灯",mark:2,color:"yellow"},
            {value:"BLUE",text:"蓝灯",mark:3,color:"blue"},
            {value:"RED",text:"红灯",mark:4,color:"red"}
        ]

        this.enumConfig = {
            os:this.os,
            client:this.client,
            deviceType:this.deviceType,
            timeUnit:this.timeUnit,
            warnLevel:this.warnLevel,
            accountType:this.accountType
        };
        this.cuisineType = [
            {value:"主料",text:"主料",mark:1},
            {value:"辅料",text:"辅料",mark:2}
        ];

        this.getEntity = function (key,value) {
            var entity = this.enumConfig[key];
            for(var i =0 ;i<entity.length;i++){
                if(entity[i].value == value || entity[i].mark == value)
                    return entity[i];
            }
        }
    });
    //日期转化服务
    app.service("DateUtil",function () {
        this.yyyy$MM$dd				= "yyyy/MM/dd";
        this.yyyyMMdd				= "yyyyMMdd";
        this.yyyy_MM_dd				= "yyyy-MM-dd";
        this.yyyyMMMddHHmmss		= "yyyyMMddHHmmss";
        this.YYYY_MM_DD_HH_MM_SS	= "yyyy-MM-dd HH:mm:ss";
        this.HHmmss					= "HHmmss";
        this.HH_mm_ss				= "HH:mm:ss";
        this.getFormateDate = function (date,format) {
            this.year=date.getFullYear();
            this.month=(date.getMonth()+1)<10?"0"+(date.getMonth()+1):(date.getMonth()+1);
            this.date=date.getDate()<10?"0"+date.getDate():date.getDate();
            this.hour=date.getHours()<10?"0"+date.getHours():date.getHours();
            this.minute=date.getMinutes()<10?"0"+date.getMinutes():date.getMinutes();
            this.second=date.getSeconds()<10?"0"+date.getSeconds():date.getSeconds();
            switch (format){
                case this.yyyyMMdd:
                    return this.year+""+this.month+""+this.date;
                default:
                    return this.year+"-"+this.month+"-"+this.date+" "+this.hour+":"+this.minute+":"+this.second;
            }
        };
    });

    //查询服务
    app.service("search",function(){
        /**************************新版查询***************************/
        this.initSearchEntity=function () {
            return {page:1,pageSize:10};
        };
        this.pushSearchField = function (entity,key,value) {
            entity[key] = value;
            return entity;
        };
        /**************************旧版查询***************************/
        //比较符
        this.comparison = {
            "lt":1,
            "lte":2,
            "gt":4,
            "gte":8,
            "eq":16,
            "neq":32,
            "like":64,
            "in":128,
            "nin":256
        };
        this.searchEntity ={
            "page":1,
            "pageSize":10,
            "lock":false,
            "cols":[],
            "groupBys":[],
            "orderBys":[],
            "conditions":[]
        };
        this.newEntity = function () {
            return {
                "page":1,
                "pageSize":10,
                "lock":false,
                "cols":[],
                "groupBys":[],
                "orderBys":[],
                "conditions":[]
            };
        };
        this.appendSelects = function(col,entity){
            var temp = entity?entity:this.searchEntity;
            temp.cols.push(col)
        };
        this.appendOrder = function(col,order,entity){
            var temp = entity?entity:this.searchEntity;
            temp.orderBys.push({
                "key":col,
                "value":order
            })
        };
        this.appendGroup = function(group,entity){
            var temp = entity?entity:this.searchEntity;
            temp.groupBys.push(group);
        };

        this.addCondition = function(col,comparison,value,entity){
            var temp = entity?entity:this.searchEntity;
            temp.conditions.push({
                "col":col,
                "value":value,
                "comparison":comparison
            });
        };

        this.appendEquals= function(col,value,like,entity){
            if(like)
                this.addCondition(col,this.comparison.like,value,entity);
            else
                this.addCondition(col,this.comparison.eq,value,entity);
        };

        this.appendNotEquals= function(col,value,entity){
            this.addCondition(col,this.comparison.neq,value,entity);
        };

        this.appendRange = function(Include,rInclude,min,max,col,entity){
            if(max)
                this.addCondition(col,this.comparison.lte,max,entity);
            if(min)
                this.addCondition(col,this.comparison.gte,min,entity);
        };
        this.appendIns = function(key,set,entity){
            this.addCondition(key,this.comparison.in,set,entity);
        };

        this.appendNotIns = function(key,set,entity){
            this.addCondition(key,this.comparison.nin,set,entity);
        };

        this.addLimit = function(limit,entity){
            var temp = entity?entity:this.searchEntity;
            temp.limit = limit;
        };

        this.reset = function (entity) {
            var temp = entity?entity:this.searchEntity;
            temp = {
                "page":1,
                "pageSize":10,
                "lock":false,
                "cols":[],
                "groupBys":[],
                "orderBys":[],
                "conditions":[]
            };
        };

        this.selectAll = function (entity) {
            var temp = entity?entity:this.searchEntity;
            temp.page = 1;
            temp.pageSize = 1000000;
            return temp;
        }
    });

    require('./directive');
    require('./config');
    require('./filter');

});
