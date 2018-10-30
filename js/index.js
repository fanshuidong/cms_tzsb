//导航栏 layui样式 延迟初始化
setTimeout(function () {
    layui.use(['element','form'], function(){
        var element = layui.element;
        var form = layui.form;
        element.init();
        form.render();
    })
},500);
//弹窗全局配置
layui.use("layer",function () {
    layer.config({
        anim: 0, //默认动画风格
        shade:0,
        skin: 'layui-layer-molv',
        offset: '100px'
    });
});
//页面 DOM layer
function openDomLayer(title,id,area) {
    return layer.open({
        title:title,
        type:1,
        area:area?area:'auto',
        content:$("#"+id),
        cancel: function(){
            $("#"+id).hide();
        }
    });
}