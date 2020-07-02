//教育设施
function EducationFacilities (){
    this.mainMap = "";
    this.parkingMarkers = [];
	this.lenged_data = ["幼儿园", "小学", "中学", "九年一贯制"];
    this.communityName = [];
    this.radar_chart_indicator_data = [];
    this.pie_comprehensive_data = {
        "幼儿园":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        "小学":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        "中学":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        "九年一贯制":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    };
	this.bar_comprehensive_data = {
        "幼儿园":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        "小学":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        "中学":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        "九年一贯制":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    };
}
EducationFacilities.prototype.init = function(){
    this.loadBanner();
    this.loadProblemSection();
    this.loadMeasuresSection();
    this.loadFutureSection();
    this.loadFacilitiesCoverage();
    this.mapInit();
    this.layerInit();
}
//加载banner
EducationFacilities.prototype.loadBanner = function(){
    serveRequest("get", service_config.data_server_url+"banner/getBannerList",{ type:"EDU" },function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey));
        var banner_str = '';
        var toUrl = "./assets/bannerSubPage/education/banner_"
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            banner_str += '<div class="swiper-slide"><a href="'+toUrl+(i+1)+".html"+'"><img src='+ service_config.server_img_url + item.url +' width="100%" data-href='+ toUrl+(i+1)+".html" +' ></div>'
        }
        $("#banner .swiper-wrapper").html(banner_str);
        startBanner();//启动banner
    })
}
//加载问题栏目
EducationFacilities.prototype.loadProblemSection = function(){
    serveRequest("get", service_config.data_server_url+"problem/getProblemList",{ type:"EDU" },function(result){
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
EducationFacilities.prototype.loadMeasuresSection = function(){
    serveRequest("get", service_config.data_server_url+"solution/getSolutionList",{ type:"EDU" },function(result){
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
EducationFacilities.prototype.loadFutureSection = function(){
    serveRequest("get", service_config.data_server_url+"future/getfutureList",{ type:"EDU" },function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey));
        var future_str = '';
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            future_str += '<li>'+ item.description +'</li>'
        }
        $("#future_box").html(future_str);
    })
}
//加载设施覆盖率
EducationFacilities.prototype.loadFacilitiesCoverage = function(){
    var _this = this;
    serveRequest("get", service_config.data_server_url+ "/Coverage/getCoverageByCategory",{ category: "education" },function(result){
        _this.get_view_data(JSON.parse(Decrypt(result.data.coverageKey)));
        // _this.load_chart("");
        // _this.click_dom();
        // _this.load_bar_chart();//柱状图
    });
}
//分类拆分数据
EducationFacilities.prototype.get_view_data = function(result_data){
	for(var i = 0; i < result_data.length; i++){
	    for(var key in result_data[i]){
	        this.communityName.push(key.replace("街道",""));
	        this.radar_chart_indicator_data.push({
                name: key.replace("街道",""),
                max:100,
                color:'#222',
                rotate:90
	        })
	        if(result_data[i][key].length > 0){
	            for(var j = 0; j < result_data[i][key].length; j++){
	                this.pie_comprehensive_data[result_data[i][key][j].CATEGORY_NAME][i] = result_data[i][key][j].COVERAGE.toFixed(2);
	                this.bar_comprehensive_data[result_data[i][key][j].CATEGORY_NAME][i] = result_data[i][key][j].QUANTITY;
	            }
	        }
	    }
	}
    this.load_radar_chart();//加载覆盖率图表
    this.load_bar_stack_chart();//加载设施柱状图表
}
//地图初始化
EducationFacilities.prototype.mapInit = function(){
	this.mainMap = new AMap.Map("main_map", {
        mapStyle: 'amap://styles/4ab81766c3532896d5b265289c82cbc6',
	    center: [116.412255,39.908886],
	    zoom: 11,
    });
}
//图层初始化
EducationFacilities.prototype.layerInit = function(){
    this.loadBoundaryLayer();
    this.loadEducationPointLayer();
}
//各个社区边界范围图层
EducationFacilities.prototype.loadBoundaryLayer = function(){
    var boundaryLayer = new Loca.LineLayer({
        map: this.mainMap,
        zIndex: 13,
    });
    $.get(service_config.file_server_url+'boundary_data.json', function (result) {
        // var data = JSON.parse(result);
        var data = result;
        boundaryLayer.setData(data,{lnglat: 'lnglat'})
        var idx = 0;
        boundaryLayer.setOptions({
            style: {
                height: function () {
                    return Math.random() * 20000;
                },
                opacity: 1,
                color:"#d66349",
            },
        });
        boundaryLayer.render();
    }); 
}
//加载教育设施图层
EducationFacilities.prototype.loadEducationPointLayer = function(){
	var _this = this;
    $.get(service_config.file_server_url+'education_facilities_data.json', function (result) {
        // var data = JSON.parse(result);
        var data = result;
		for(var i = 0; i < data.length; i++){
            var item = data[i];
            var marker;
            // if(_this.mapLegend[item.properties.type]){
                marker = new AMap.Marker({
                    map: _this.mainMap,
                    icon: _this.getMarkerIcon(item.properties.type),
                    position: item.lnglat[0],
                    offset: new AMap.Pixel(-10, -10),
                    extData:item.properties
                });
                marker.on('click', function (ev) {
                    var properties = ev.target.getExtData();
                    _this.loadInfo(properties, ev.lnglat);
                });
                _this.parkingMarkers.push(marker);
            // }
        }
	})
}
//获取Marker对应图标
EducationFacilities.prototype.getMarkerIcon = function(markerType){
    switch (markerType){
        case "幼儿园" :
            // 创建 AMap.Icon 实例：
            var icon = new AMap.Icon({
                size: new AMap.Size(16, 16),    // 图标尺寸
                image: service_config.icon_url + 'jiaoyu.png',  // Icon的图像
                imageOffset: new AMap.Pixel(0, 0),  // 图像相对展示区域的偏移量，适于雪碧图等
                imageSize: new AMap.Size(-8, -8)   // 根据所设置的大小拉伸或压缩图片
            });
            break;
        case "小学" :
            var icon = new AMap.Icon({
                size: new AMap.Size(16, 16),
                image: service_config.icon_url + 'jiaoyu.png',
                imageOffset: new AMap.Pixel(0, 0), 
                imageSize: new AMap.Size(-8, -8)
            });
            break;
        case "中学" :
            var icon = new AMap.Icon({
                size: new AMap.Size(16, 16), 
                image: service_config.icon_url + 'jiaoyu.png', 
                imageOffset: new AMap.Pixel(0, 0),
                imageSize: new AMap.Size(-8, -8) 
            });
            break;
        case "九年一贯制" :
            var icon = new AMap.Icon({
                size: new AMap.Size(16, 16), 
                image: service_config.icon_url +'jiaoyu.png', 
                imageOffset: new AMap.Pixel(0, 0), 
                imageSize: new AMap.Size(-8, -8)  
            });
            break;
    }
    return icon;
}
//加载信息窗体
EducationFacilities.prototype.loadInfo = function(properties, center){
    var info = [];
    info.push('<div class="info_window">'+properties.type+'</div>');
    info.push('<div class="info_window text_indent">'+properties.street_name+'</div>');
    infoWindow = new AMap.InfoWindow({
        content: info.join(""),  //使用默认信息窗体框样式，显示信息内容
    });
    infoWindow.open(this.mainMap, center);
}
//加载覆盖率雷达图图表数据
EducationFacilities.prototype.load_radar_chart = function(){
    var radarChart = echarts.init(document.getElementById("facilities_coverage_content"));
    var radar_option = {
        color: echarts_colors,
        title:get_object_assign({
            text:"各街道教育设施覆盖率对比图",
        },echart_title),
        legend: {
            show: true,
            left:10,
            top:25,
            textStyle: {
                "fontSize": 12,
                "color": "#222"
            },
            "data": this.lenged_data,
            selected: {
                '幼儿园': true,
                '小学': false,
                '中学': false,
                '九年一贯制': false,
            }
        },
        tooltip: {
            show: true,
            trigger: "item"
        },
        radar: {
            center: ["50%", "65%"],
            radius: "59%",
            startAngle: 90,
            splitNumber: 4,
            shape: "circle",
            splitArea: {
                "areaStyle": {
                    "color": ["transparent"]
                }
            },
            axisLine: {
                "show": true,
                "lineStyle": {
                    "color": "grey"//
                }
            },
            splitLine: {
                "show": true,
                "lineStyle": {
                    "color": "grey"//
                }
            },
            indicator: this.radar_chart_indicator_data
        },
        "series": []
    };
    for(var i = 0; i < this.lenged_data.length; i++){
        radar_option.series.push(
            {
                "name": this.lenged_data[i],
                "type": "radar",
                "symbol": "circle",
                "symbolSize": 5,
                "areaStyle": {
                    "normal": {
                        "color": echarts_colors[i],
                        opacity:0.5,
                    }
                },
                itemStyle:{
                    color:echarts_colors[i],
                    borderColor:echarts_colors[i],
                    borderWidth:5,
                    opacity:0.5,
                },
                "lineStyle": {
                    "normal": {
                        "type": "dashed",
                        "color": echarts_colors[i],
                        "width": 2,
                        opacity:0.3,
                    }
                },
                "data": [
                    this.pie_comprehensive_data[this.lenged_data[i]]
                ]
            }); 
    }
    radarChart.setOption(radar_option, true);
    window.onresize = function(){
        radarChart.resize();
    }
}
//加载各社区设施数量堆积柱状图表数据
EducationFacilities.prototype.load_bar_stack_chart = function(){
    var barChart = echarts.init(document.getElementById("facilities_bar_content"));
    var bar_option = {
        color: echarts_colors,
        title:get_object_assign({
            text:"各街道教育设施数量统计",
        },echart_title),
        tooltip : {
            trigger: 'axis',
            axisPointer : {            
                type : 'shadow'       
            }
        },
        legend:get_object_assign(facilities_bar_config.legend, {
            data: this.lenged_data
        }),
        grid: get_object_assign(facilities_bar_config.grid,{top:110}),
        xAxis:{
            type : 'category',
            inverse: true,
            data: this.communityName,
            axisLabel: get_object_assign(coordinate_axis_style.axisLabel,{
		        formatter:function(val){
		            return val.split("").join("\n");
		        }
    		}),
            axisLine: coordinate_axis_style.axisLine,
            splitLine: coordinate_axis_style.splitLine,
        },
        yAxis: {
            type : 'value',
            name: '数量',
            // minInterval:100,//设置左侧Y轴最小刻度
            axisLabel: coordinate_axis_style.axisLabel,
            axisLine: coordinate_axis_style.axisLine,
            splitLine: coordinate_axis_style.splitLine,
        },
        series : [
	        {
                name: this.lenged_data[0],
                type: 'bar',
                stack: 'a',
                barCategoryGap:5,
                data: this.bar_comprehensive_data[this.lenged_data[0]]
	        },
	        {
                name: this.lenged_data[1],
                type: 'bar',
                stack: 'a',
                barCategoryGap:5,
                data: this.bar_comprehensive_data[this.lenged_data[1]]
	        },
	        {
                name: this.lenged_data[2],
                type: 'bar',
                stack: 'a',
                barCategoryGap:5,
                data: this.bar_comprehensive_data[this.lenged_data[2]]
	        },
	        {
                name: this.lenged_data[3],
                type: 'bar',
                stack: 'a',
                barCategoryGap:5,
                data: this.bar_comprehensive_data[this.lenged_data[3]]
	        },
        ]
    };
    barChart.setOption(bar_option, true);
    window.onresize = function(){
        barChart.resize();
    }
}
var start_education_facilities = new EducationFacilities();
start_education_facilities.init();