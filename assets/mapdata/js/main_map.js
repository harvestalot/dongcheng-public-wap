//主地图控制
function MainMap(){
    this.mainMap = ""
}
MainMap.prototype.init = function(){
	//初始化地图
	this.mainMap = new AMap.Map("main_map", {
	    // mapStyle: 'amap://styles/twilight',
	    // viewMode: '3D',
	    // pitch: 50,
        // 隐藏默认楼块--区域面（bg）/道路（road）/建筑物（building）/标注（point）
        features: ['bg', 'road',"building"],
	    center: [116.412255,39.908886],
	    zoom: 12,
	    // zIndex: 10
    });
    this.load_boundary();
}
//边界图层
MainMap.prototype.load_boundary = function(){
    var boundaryLayer = new Loca.PolygonLayer({
        map: this.mainMap,
        zIndex: 13,
        // fitView: true,
        // eventSupport:true,
    });
    $.get(service_config.file_server_url+'boundary.js', function (data) {
        boundaryLayer.setData(boundary_data,{lnglat: 'lnglat'})
        // boundaryLayer.setData(JSON.parse(Decrypt(data)), {
        //     lnglat: 'coordinates'
        // });
        var idx = 0;
        boundaryLayer.setOptions({
            style: {
                height: function () {
                    return Math.random() * 20000;
                },
                opacity: 0.8,
                // color:"#3ba0f3",
                color: function () {
                    return echarts_colors[idx++];
                }
            },
            // selectStyle:{
            //     color:"#13EFDC",
            // }
        });
        boundaryLayer.render();
    }); 
}
var start_init = new MainMap();
start_init.init();