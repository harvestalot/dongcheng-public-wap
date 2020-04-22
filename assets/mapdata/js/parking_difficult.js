//停车难
function ParkingDifficult(){
    this.reachability_url = "http://114.64.228.104:8070/reachcircle/walkServlet";
    this.mainMap = "";
    this.parkingMarkers = [];
    this.population_type = "";//人口图层类型
    this.populationHeatLayer = "";//人口热力图层
    this.reachabilityLayer = "";//可达性范围图层
    this.centerpoint = "";
    this.time = 5;
    this.reachability_data = [];
    this.area_cultural_point_data = [];//符合范围内的点
    this.current_parking = "工作地停车场";
    this.mapLegend = {//默认选中第一个图例
        "工作地停车场": true,
        "商业停车场": false,
        "路边停车场": false,
        "小区停车场": false,
        "其他公共停车场": false,
    };
    this.parkingTypeName =  ["工作地停车场", "商业停车场", "路边停车场",
         "小区停车场", "其他公共停车场"];
}
ParkingDifficult.prototype.init = function(){
    // $("#map_legend,#population_legend").addClass("map_legend_animation");
    // //默认选中第一个图例
    // $("#map_legend input").each(function(i){
    //     i === 0? $(this).prop("checked",true): $(this).prop("checked",false);
    // });
    this.loadBanner();
    this.loadProblemSection();
    this.loadMeasuresSection();
    this.loadFutureSection();
    this.handleAccessibility();
    this.mapInit();
    this.layerInit();
    this.initPopulationHeat();
    this.loadParkingBarChart();
    var _this = this;
    // 停车场类型选中
    $("#parking_type_select").on("change", function(){
        _this.current_parking = $("#parking_type_select option:selected").val();
        _this.mainMap? _this.mainMap.remove(_this.parkingMarkers) : "";
        _this.loadParkingLotLayer();
    });
    // 热力图选中
    $("#heat_type_select").on("change", function(){
        _this.population_type = $("#heat_type_select option:selected").val();
        _this.population_type? _this.loadPopulationHeatLayer() : _this.reset();
        ;
    });
}
//加载banner
ParkingDifficult.prototype.loadBanner = function(){
    serveRequest("get", service_config.data_server_url+"banner/getBannerList",{ type:"CARPORT" },function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey));
        var banner_str = '';
        var toUrl = "./assets/bannerSubPage/parking/banner_"
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            banner_str += '<div class="swiper-slide"><a href="'+toUrl+(i+1)+".html"+'"><img src='+ service_config.server_img_url + item.url +' width="100%" data-href='+ toUrl+(i+1)+".html" +' ></div>'
        }
        $("#banner .swiper-wrapper").html(banner_str);
        startBanner();//启动banner
    })
}
//加载问题栏目
ParkingDifficult.prototype.loadProblemSection = function(){
    serveRequest("get", service_config.data_server_url+"problem/getProblemList",{ type:"CARPORT" },function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey));
        var problem_str = '';
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            problem_str += '<li>'+ item.description +'</li>'
        }
        $("#problem_box").html(problem_str);
    })
}
//加载措施栏目
ParkingDifficult.prototype.loadMeasuresSection = function(){
    serveRequest("get", service_config.data_server_url+"solution/getSolutionList",{ type:"CARPORT" },function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey));
        var measures_str = '';
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            measures_str += '<li>'+ item.description +'</li>'
        }
        $("#measures_box").html(measures_str);
    })
}
//加载未来栏目
ParkingDifficult.prototype.loadFutureSection = function(){
    serveRequest("get", service_config.data_server_url+"future/getfutureList",{ type:"CARPORT" },function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey));
        var future_str = '';
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            future_str += '<li>'+ item.description +'</li>'
        }
        $("#future_box").html(future_str);
    })
}
//操作可达性工具
ParkingDifficult.prototype.handleAccessibility = function(){
    var _this = this;
    // $('#accessibility_btn').lc_switch("开启", "关闭");
    $("#accessibility_btn").on("change",function(){
        if($(this).is(':checked')){
            _this.reset();
            //点击地图区域
            _this.mainMap.on('click', function(event){
                _this.centerpoint = event.lnglat.lng+","+event.lnglat.lat;
                _this.accessibility_initialize();
            });
        }else{
            // _this.mapLegend["工作地停车场"] = true;
            // //默认选中第一个图例
            // $("#map_legend input").each(function(i){
            //     i === 0? $(this).prop("checked",true): $(this).prop("checked",false);
            // });
            // $("#population_legend input").each(function(i){
            //     $(this).prop("checked",false);
            // });
            _this.mainMap.clearMap();
            _this.area_cultural_point_data = [];
            _this.loadParkingLotLayer();
        }
    })
    // 时间选择
    $("#accessibility_time").on("change",function(){
        _this.time = $(this).val();
        _this.accessibility_initialize();
    })
    // 停车场类型
    $("#parking_type_select").on("change",function(){
        _this.current_parking = $("#parking_type_select option:selected").val();
        _this.mainMap.clearMap();
        _this.area_cultural_point_data = [];
        _this.accessibility_resources();
    })
}
//地图初始化
ParkingDifficult.prototype.mapInit = function(){
	this.mainMap = new AMap.Map("main_map", {
	    // pitch: 50,
        // 隐藏默认楼块--区域面（bg）/道路（road）/建筑物（building）/标注（point）
        // features: ['bg',],
        mapStyle: 'amap://styles/4ab81766c3532896d5b265289c82cbc6',
	    center: [116.412255, 39.908886],
	    zoom: 12,
    });
}
//图层初始化
ParkingDifficult.prototype.layerInit = function(){
    this.reachabilityLayer = new Loca.PolygonLayer({
        map: this.mainMap,
        zIndex: 1,
        fitView: true,
        eventSupport:false,
    });
    this.loadBoundaryLayer();
    this.loadParkingLotLayer();
    this.loadBoundaryNameLayer();
}
//初始化人口热力
ParkingDifficult.prototype.initPopulationHeat = function(){
    this.populationHeatLayer = new Loca.HeatmapLayer({
        map: this.mainMap,
    });
    // $("#map_legend,#population_legend").addClass("map_legend_animation");
    // var _this = this;
    // $("#population_legend input").each(function(i){
    //     $(this).on("click",function(){
    //         // _this.reset();
    //         // //清除停车场所有选中图例
    //         // $("#map_legend input").each(function(i){
    //         //     $(this).prop("checked",false);
    //         // });
    //         _this.population_type = $(this).val();
    //         _this.loadPopulationHeatLayer();
    //     })
    // });
}
//各个社区边界范围图层
ParkingDifficult.prototype.loadBoundaryLayer = function(){
    var boundaryLayer = new Loca.LineLayer({
        map: this.mainMap,
        zIndex: 13,
        // fitView: true,
        // eventSupport:true,
    });
    $.get(service_config.file_server_url+'boundary_data.json', function (data) {
        // var data = JSON.parse(data);
        var data = data;
        boundaryLayer.setData(data,{lnglat: 'lnglat'})
        // boundaryLayer.setData(JSON.parse(Decrypt(data)), {
        //     lnglat: 'coordinates'
        // });
        var idx = 0;
        boundaryLayer.setOptions({
            style: {
                height: function () {
                    return Math.random() * 20000;
                },
                opacity: 1,
                color:"#d66349",
                // color: function () {
                //     return echarts_colors[idx++];
                // }
            },
        });
        boundaryLayer.render();
    }); 
}
//加载街道名字图层
ParkingDifficult.prototype.loadBoundaryNameLayer = function(){
    //社区名字文字图层
    var layerLabels = new Loca.LabelsLayer({
        map: this.mainMap,
    });
    var _this = this;
    $.get(service_config.file_server_url+'boundary_name_data.json', function (data) {
        var data = data;
        //添加文字标记图层
        layerLabels.setData(data, {
            lnglat: 'lnglat'
        }).setOptions({
            style: {
                direction: 'center',
                offset: [0, 0],
                text: function (item) {
                    return item.value.name;
                },
                fillColor: "#F319A0",
                fontSize: 16,
                strokeWidth: 0
            }
        }).render();
        layerLabels.setzIndex(100);
        layerLabels.show();
    })
}
//加载所有停车厂点标识图层
ParkingDifficult.prototype.loadParkingLotLayer = function(){
    var _this = this;
    $.get(service_config.file_server_url+'parking_lot_data.json', function (data) {
        // var data = JSON.parse(data);
        var data = data;
		for(var i = 0; i < data.length; i++){
            var item = data[i];
            var marker;
            if(_this.current_parking === item.properties.Type){
                marker = new AMap.Marker({
                    map: _this.mainMap,
                    icon: _this.getMarkerIcon(item.properties.Type),
                    position: item.lnglat,
                    offset: new AMap.Pixel(-10, -10),
                    extData:item.properties
                });
                marker.on('click', function (ev) {
                    var properties = ev.target.B.extData;
                    _this.loadInfo(properties, ev.lnglat);
                });
                _this.parkingMarkers.push(marker);
            }
		}
        _this.mainMap.setFitView();
	})
}
//人口热力图层
ParkingDifficult.prototype.loadPopulationHeatLayer = function(){
    var _this = this;
    $.get(service_config.file_server_url+'population_data.json', function (data) {
        _this.populationHeatLayer.setData(data[_this.population_type], {
            lnglat: 'lnglat',
            value: 'value'
        });
        _this.populationHeatLayer.setOptions({
            style: {
                radius: 15,
                color: {
                    0.5: '#2c7bb6',
                    0.65: '#abd9e9',
                    0.7: '#ffffbf',
                    0.9: '#fde468',
                    1.0: '#d7191c'
                }
            }
        });
        _this.populationHeatLayer.render();
        _this.populationHeatLayer.show();
    })
}
//获取Marker对应图标
ParkingDifficult.prototype.getMarkerIcon = function(markerType){
    switch (markerType){
        case "工作地停车场" :
            // 创建 AMap.Icon 实例：
            var icon = new AMap.Icon({
                size: new AMap.Size(16, 16),    // 图标尺寸
                image: service_config.icon_url + 'parking/'+1+'.png',  // Icon的图像
                imageOffset: new AMap.Pixel(0, 0),  // 图像相对展示区域的偏移量，适于雪碧图等
                imageSize: new AMap.Size(-8, -8)   // 根据所设置的大小拉伸或压缩图片
            });
            break;
        case "商业停车场" :
            var icon = new AMap.Icon({
                size: new AMap.Size(16, 16),
                image: service_config.icon_url + 'parking/'+2+'.png',
                imageOffset: new AMap.Pixel(0, 0), 
                imageSize: new AMap.Size(-8, -8)
            });
            break;
        case "路边停车场" :
            var icon = new AMap.Icon({
                size: new AMap.Size(16, 16), 
                image: service_config.icon_url + 'parking/'+3+'.png', 
                imageOffset: new AMap.Pixel(0, 0),
                imageSize: new AMap.Size(-8, -8) 
            });
            break;
        case "小区停车场" :
            var icon = new AMap.Icon({
                size: new AMap.Size(16, 16), 
                image: service_config.icon_url + 'parking/'+4+'.png', 
                imageOffset: new AMap.Pixel(0, 0), 
                imageSize: new AMap.Size(-8, -8)  
            });
            break;
        case "其他公共停车场" :
            var icon = new AMap.Icon({
                size: new AMap.Size(16, 16),
                image: service_config.icon_url + 'parking/'+5+'.png', 
                imageOffset: new AMap.Pixel(0, 0), 
                imageSize: new AMap.Size(-8, -8)
            });
            break;
    }
    return icon;
}
//加载信息窗体
ParkingDifficult.prototype.loadInfo = function(properties, center){
    var info = [];
    info.push('<div class="info_window">名称：'+properties.poi_name+'</div>');
    info.push('<div class="info_window">类型：'+properties.category+'</div>');
    info.push('<div class="info_window">街道：'+properties.poi_street+'</div>');
    info.push('<div class="info_window">地址：'+properties.poi_addres+'</div>');
    infoWindow = new AMap.InfoWindow({
        content: info.join(""),  //使用默认信息窗体框样式，显示信息内容
    });
    infoWindow.open(this.mainMap, center);
}
//加载右侧统计图
ParkingDifficult.prototype.loadParkingBarChart = function(){
    var population_bar_chart = echarts.init(document.getElementById("parking_bar_chart"));
    var seriesLabel = {
        normal: {
            show: true,
            textBorderColor: '#333',
            textBorderWidth: 2
        }
    }
    var bar_option = {
        color: echarts_colors,
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        legend: {
            textStyle:{
                color:"#222",
            },
            data: this.parkingTypeName
        },
        grid: {
            left: 50,
            top:80,
            right:10,
            bottom:30,
        },
        xAxis: {
            type: 'value',
            name: '个',
            axisLabel: coordinate_axis_style.axisLabel,
            axisLine: coordinate_axis_style.axisLine,
            splitLine: coordinate_axis_style.splitLine,
        },
        yAxis: {
            type: 'category',
            axisLabel: coordinate_axis_style.axisLabel,
            axisLine: coordinate_axis_style.axisLine,
            splitLine: coordinate_axis_style.splitLine,
            inverse: true,
            data: street_names,
        },
        series: []
    };
    var _this = this;
    serveRequest("get", service_config.data_server_url+"parking/geParkingList",{ },function(result){
        var englishParking = ["jobParking", "commercialParking", "roadsideParking", "communityParking", "othres"];
        var data = JSON.parse(Decrypt(result.data.resultKey));
        for(var i = 0; i < englishParking.length; i++){
            bar_option.series[i] = {
                name: _this.parkingTypeName[i],
                type: 'bar',
                stack:"1",
                data: []
            };
            var itemData = [];
            for(var j = 0; j < data.length; j++){
                var item = data[j];
                bar_option.series[i].data.push(item[englishParking[i]]);
            }
        }
        population_bar_chart.setOption(bar_option, true);
        window.onresize = function(){
            population_bar_chart.resize();
        }
    })
}
//初始化可达性gongju 
ParkingDifficult.prototype.accessibility_initialize = function(){
    var _this = this;
        _this.mainMap.clearMap();
        _this.area_cultural_point_data = [];
        var marker = new AMap.Marker({
            position: new AMap.LngLat(_this.centerpoint.split(",")[0], _this.centerpoint.split(",")[1]),
            offset: new AMap.Pixel(0, 0),
            icon: '//vdata.amap.com/icons/b18/1/2.png', // 添加 Icon 图标 URL
        });
        _this.mainMap.add(marker);
        _this.accessibility_range(_this.centerpoint);
}
//获取可达性范围
ParkingDifficult.prototype.accessibility_range = function(centerpoint){
    var _this = this;
    $.get(_this.reachability_url+"?centerpoint="+centerpoint+"&time="+_this.time,function(result){
        var reachability_data = [];
        for(var i = 0; i < JSON.parse(result).result.split(";").length; i++){
            var item = JSON.parse(result).result.split(";")[i];
            reachability_data.push([item.split(",")[0],item.split(",")[1]])
        };
        _this.reachability_data = reachability_data;
        _this.load_reachability_layer();
        _this.accessibility_resources();//获取文化资源点
    });
}
// 加载可达性区域范围图层
ParkingDifficult.prototype.load_reachability_layer = function(){
    this.reachabilityLayer.setData([{lnglat: this.reachability_data}], {
        lnglat: 'lnglat'
    });
    this.reachabilityLayer.setOptions({
        style: {
            color: "#35F8BA",
            opacity:0.2,
            // height: function () {
            //     return Math.random() * 500 + 100;
            // }
        }
    });
    this.reachabilityLayer.render();
}
//如停车场类型选择，判断停车场点是否在可达性范围之内
ParkingDifficult.prototype.accessibility_resources = function(){
    var parking_type = this.current_parking;
    var _this = this;
    $.get(service_config.file_server_url+'parking_lot_data.json', function (data) {
        // var data = JSON.parse(data);
        var data = data;
		for(var i = 0; i < data.length; i++){
            var items = data[i];
            if(!parking_type){
                var isPointInRing = AMap.GeometryUtil.isPointInRing(items.lnglat, _this.reachability_data);
                isPointInRing? _this.area_cultural_point_data.push(get_object_assign(items,{
                 icon: service_config.icon_url + 'parking/1.png',
                })): "";
            }else{
                if(parking_type === items.properties.Type){
                    var isPointInRing = AMap.GeometryUtil.isPointInRing(items.lnglat, _this.reachability_data);
                    isPointInRing? _this.area_cultural_point_data.push(get_object_assign(items,{
                     icon: service_config.icon_url + 'parking/1.png',
                    })): "";
                }
            }
		}
        _this.render_point_layer();
	})
}
//渲染可达性区域内的符合条件的点图层
ParkingDifficult.prototype.render_point_layer = function(){
    var _this = this;
    _this.area_cultural_point_data.forEach(function(marker) {
        var marker = new AMap.Marker({
            map: _this.mainMap,
            icon: marker.icon,
             extData:marker,
            position: marker.lnglat,
            offset: new AMap.Pixel(-15, -10)
        });
        marker.on('click', function (ev) {
            var properties = ev.target.B.extData;
            var info = [];
            info.push('<div class="info_window">'+properties.properties.poi_name+'</div>');
            // info.push('<div class="info_window">地址：'+address+'</div>');
            infoWindow = new AMap.InfoWindow({
                content: info.join(""),  //使用默认信息窗体框样式，显示信息内容
            });
            infoWindow.open(_this.mainMap, properties.lnglat);
        });
    });
}
//重置
ParkingDifficult.prototype.reset = function(){
    // this.mainMap.remove(this.parkingMarkers);
    this.populationHeatLayer.hide();
    this.current_parking = "工作地停车场";
    // this.mapLegend = {//默认选中第一个图例
    //     "工作地停车场": false,
    //     "商业停车场": false,
    //     "路边停车场": false,
    //     "小区停车场": false,
    //     "其他公共停车场": false,
    // };
}
var start_parking_difficult = new ParkingDifficult();
start_parking_difficult.init();