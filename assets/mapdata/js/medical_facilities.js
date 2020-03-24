//医疗颐养设施
function MedicalFacilities (){
    this.mainMap = "";
    this.markers = [];
	this.lenged_data = ["社区卫生服务站", "社区机构养老设施"];
    this.communityName = [];
    this.radar_chart_indicator_data = [];
    this.pie_comprehensive_data = {
        "社区卫生服务站":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        "社区机构养老设施":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    };
	this.bar_comprehensive_data = {
        "社区卫生服务站":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        "社区机构养老设施":[0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    };
}
MedicalFacilities.prototype.init = function(){
    this.loadBanner();
    this.loadProblemSection();
    this.loadMeasuresSection();
    this.loadFutureSection();
    this.loadFacilitiesCoverage();
    this.mapInit();
    this.layerInit();
}
//加载banner
MedicalFacilities.prototype.loadBanner = function(){
    serveRequest("get", service_config.data_server_url+"banner/getBannerList",{ type:"medical" },function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey));
        var banner_str = '';
        var toUrl = "./assets/bannerSubPage/medical/banner_"
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            banner_str += '<div class="swiper-slide"><a href="'+toUrl+(i+1)+".html"+'"><img src='+ service_config.server_img_url + item.url +' width="100%" data-href='+ toUrl+(i+1)+".html" +' ></div>'
        }
        $("#banner .swiper-wrapper").html(banner_str);
        startBanner();//启动banner
    })
}
//加载问题栏目
MedicalFacilities.prototype.loadProblemSection = function(){
    serveRequest("get", service_config.data_server_url+"problem/getProblemList",{ type:"medical" },function(result){
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
MedicalFacilities.prototype.loadMeasuresSection = function(){
    serveRequest("get", service_config.data_server_url+"solution/getSolutionList",{ type:"medical" },function(result){
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
MedicalFacilities.prototype.loadFutureSection = function(){
    serveRequest("get", service_config.data_server_url+"future/getfutureList",{ type:"medical" },function(result){
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
MedicalFacilities.prototype.loadFacilitiesCoverage = function(){
    var _this = this;
    serveRequest("get", service_config.data_server_url+ "/Coverage/getCoverageByCategory",{ category: "medical_care" },function(result){
        var data_1 = JSON.parse(Decrypt(result.data.coverageKey));
        serveRequest("get", service_config.data_server_url+ "/Coverage/getCoverageByCategory",{ category: "pension" },function(result_2){
            var data_2 = JSON.parse(Decrypt(result_2.data.coverageKey));
            var data = [];
            for(var i = 0; i < data_1.length; i++){
                var item_1 = data_1[i];
                data.push(item_1);
                for(var j =  0; j < data_2.length; j++){
                    var item_2 = data_2[j];
                    if(Object.keys(item_1)[0] === Object.keys(item_2)[0]){
                        data[i][Object.keys(item_1)[0]].push(item_2[Object.keys(item_1)[0]][0])
                    }
                }
            }
            _this.get_view_data(data);
        })
    });
}
//分类拆分数据
MedicalFacilities.prototype.get_view_data = function(result_data){
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
                    // console.log(result_data[i][key][j].CATEGORY_NAME)
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
MedicalFacilities.prototype.mapInit = function(){
	this.mainMap = new AMap.Map("main_map", {
        mapStyle: 'amap://styles/4ab81766c3532896d5b265289c82cbc6',
	    center: [116.412255,39.908886],
	    zoom: 11,
    });
}
//图层初始化
MedicalFacilities.prototype.layerInit = function(){
    this.loadBoundaryLayer();
    this.loadMedicalPointLayer();
}
//各个社区边界范围图层
MedicalFacilities.prototype.loadBoundaryLayer = function(){
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
//加载医疗颐养设施图层
MedicalFacilities.prototype.loadMedicalPointLayer = function(){
	var _this = this;
    $.get(service_config.file_server_url+'medical_facilities_data.json', function (result) {
        // var data = JSON.parse(result);
        var data = result;
		for(var i = 0; i < data.length; i++){
            var item = data[i];
            var marker;
            // if(_this.mapLegend[item.properties.type]){
                marker = new AMap.Marker({
                    map: _this.mainMap,
                    icon: new AMap.Icon({
                        size: new AMap.Size(16, 16),
                        image: service_config.icon_url + 'yiliao.png',
                        imageOffset: new AMap.Pixel(0, 0),
                        imageSize: new AMap.Size(-8, -8)
                    }),
                    position: item.lnglat[0],
                    offset: new AMap.Pixel(-10, -10),
                    extData:item.properties
                });
                // marker.on('click', function (ev) {
                //     var properties = ev.target.B.extData;
                //     _this.loadInfo(properties, ev.lnglat);
                // });
                _this.markers.push(marker);
            // }
        }
	})
}
//加载覆盖率雷达图图表数据
MedicalFacilities.prototype.load_radar_chart = function(){
    var radarChart = echarts.init(document.getElementById("facilities_coverage_content"));
    var radar_option = {
        color: echarts_colors,
        title:get_object_assign({
            text:"各街道医疗颐养设施覆盖率对比图",
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
                '社区卫生服务站': true,
                '社区机构养老设施': false,
            }
        },
        tooltip: {
            show: true,
            trigger: "item"
        },
        radar: {
            center: ["50%", "60%"],
            radius: "60%",
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
MedicalFacilities.prototype.load_bar_stack_chart = function(){
    var barChart = echarts.init(document.getElementById("facilities_bar_content"));
    var bar_option = {
        color: echarts_colors,
        title:get_object_assign({
            text:"各街道医疗颐养设施数量统计",
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
        ]
    };
    barChart.setOption(bar_option, true);
    window.onresize = function(){
        barChart.resize();
    }
}
var start_convenience_people_facilities = new MedicalFacilities();
start_convenience_people_facilities.init();