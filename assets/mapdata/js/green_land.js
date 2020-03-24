//公园绿地
function GreenLand(){
    this.mainMap = "";
    this.parkingMarkers = [];
}
GreenLand.prototype.init = function(){
    this.loadBanner();
    this.loadProblemSection();
    this.loadMeasuresSection();
    this.loadFutureSection();
    this.loadGreenLandCoverage();
    this.mapInit();
    this.layerInit();
}
//加载banner
GreenLand.prototype.loadBanner = function(){
    serveRequest("get", service_config.data_server_url+"banner/getBannerList",{ type:"green" },function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey));
        var banner_str = '';
        var toUrl = "./assets/bannerSubPage/green_land/banner_"
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            banner_str += '<div class="swiper-slide"><a href="'+toUrl+(i+1)+".html"+'"><img src='+ service_config.server_img_url + item.url +' width="100%" data-href='+ toUrl+(i+1)+".html" +' ></div>'
        }
        $("#banner .swiper-wrapper").html(banner_str);
        startBanner();//启动banner
    })
}
//加载问题栏目
GreenLand.prototype.loadProblemSection = function(){
    serveRequest("get", service_config.data_server_url+"problem/getProblemList",{ type:"green" },function(result){
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
GreenLand.prototype.loadMeasuresSection = function(){
    serveRequest("get", service_config.data_server_url+"solution/getSolutionList",{ type:"green" },function(result){
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
GreenLand.prototype.loadFutureSection = function(){
    serveRequest("get", service_config.data_server_url+"future/getfutureList",{ type:"green" },function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey));
        var future_str = '';
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            future_str += '<li>'+ item.description +'</li>'
        }
        $("#future_box").html(future_str);
    })
}
//加载绿地500m覆盖面积
GreenLand.prototype.loadGreenLandCoverage = function(){
    var _this = this;
    serveRequest("get", service_config.data_server_url+ "/Coverage/getCoverageByCategory",{ category: "medical_care" },function(result){
        _this.get_view_data(JSON.parse(Decrypt(result.data.coverageKey)));
        // _this.load_chart("");
        // _this.click_dom();
        // _this.load_bar_chart();//柱状图
    });
}
//分类拆分数据
GreenLand.prototype.get_view_data = function(result_data){
	for(var i = 0; i < result_data.length; i++){
	}
    this.load_green_land_area_chart();//加载覆盖率图表
    this.load_bar_stack_chart();//加载设施柱状图表
}
//地图初始化
GreenLand.prototype.mapInit = function(){
	this.mainMap = new AMap.Map("main_map", {
        mapStyle: 'amap://styles/4ab81766c3532896d5b265289c82cbc6',
	    center: [116.412255,39.908886],
	    zoom: 11,
    });
}
//图层初始化
GreenLand.prototype.layerInit = function(){
    this.loadBoundaryLayer();
    this.loadGreenLandLayer();
}
//各个社区边界范围图层
GreenLand.prototype.loadBoundaryLayer = function(){
    var boundaryLayer = new Loca.LineLayer({
        map: this.mainMap,
        zIndex: 13,
        // fitView: true,
        // eventSupport:true,
    });
    $.get(service_config.file_server_url+'boundary_data.json', function (result) {
        // var data = JSON.parse(result);
        var data = result;
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
            },
            // selectStyle:{
            //     color:"#13EFDC",
            // }
        });
        boundaryLayer.render();
    }); 
}
//各个社区绿地分部图层
GreenLand.prototype.loadGreenLandLayer = function(){
    var boundaryLayer = new Loca.PolygonLayer({
        map: this.mainMap,
        zIndex: 13,
        // fitView: true,
        // eventSupport:true,
    });
    $.get(service_config.file_server_url+'green_land_data.json', function (result) {
        // var data = JSON.parse(result);
        var data = result;
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
                color:"#5e61aa",
            },
            // selectStyle:{
            //     color:"#13EFDC",
            // }
        });
        boundaryLayer.render();
    }); 
}
//加载所有再生资源回收站点标识图层
GreenLand.prototype.loadGreenEnvironmentalLayer = function(){
    var _this = this;
    // _this.markers = [];
    $.get(service_config.file_server_url+'recycle_bin_data.json', function (result) {
        // var data = JSON.parse(result);
        var data = result;
		for(var i = 0; i < data.length; i++){
            var item = data[i];
            var marker = new AMap.Marker({
                    map: _this.mainMap,
                    icon: _this.getMarkerIcon(),
                    position: item.lnglat,
                    offset: new AMap.Pixel(-10, -10),
                    extData:item.properties
                });
                marker.on('click', function (ev) {
                    var properties = ev.target.B.extData;
                    _this.loadInfo(properties.street, "", ev.lnglat);
                });
                _this.parkingMarkers.push(marker);
		}
	})
}
//获取Marker对应图标
GreenLand.prototype.getMarkerIcon = function(){
    var icon = new AMap.Icon({
        size: new AMap.Size(16, 16),
        image: service_config.icon_url + 'green/recovery.png',
        imageOffset: new AMap.Pixel(0, 0), 
        imageSize: new AMap.Size(-8, -8)
    });
    return icon;
}
//加载信息窗体
GreenLand.prototype.loadInfo = function(name, introduction_text, center){
    var info = [];
    info.push('<div class="info_window">'+name+'</div>');
    info.push(introduction_text?'<div class="info_window text_indent">'+introduction_text+'</div>':"");
    infoWindow = new AMap.InfoWindow({
        content: info.join(""),  //使用默认信息窗体框样式，显示信息内容
    });
    infoWindow.open(this.mainMap, center);
}
//加载各街道500米服务半径绿地面积图表数据
GreenLand.prototype.load_green_land_area_chart = function(){
    var data = [
        {"name":"安定门街道","value":"83.24535698"},
        {"name":"北新桥街道","value":"64.87039533"},
        {"name":"朝阳门街道","value":"55.84170105"},
        {"name":"崇外街道","value":"66.31813528"},
        {"name":"东花市街道","value":"70.93509696"},
        {"name":"东华门街道","value":"89.02332249"},
        {"name":"东四街道","value":"63.61750913"},
        {"name":"东直门街道","value":"47.08230329"},
        {"name":"和平里街道","value":"74.64925791"},
        {"name":"建国门街道","value":"54.75731373"},
        {"name":"交道口街道","value":"55.3354134"},
        {"name":"景山街道","value":"59.98824568"},
        {"name":"龙潭街道","value":"81.80579307"},
        {"name":"前门街道","value":"31.12823581"},
        {"name":"体育馆街道","value":"73.10850882"},
        {"name":"天坛街道","value":"93.76551365"},
        {"name":"永定门街道","value":"62.12940867"}
    ]
    var barChart = echarts.init(document.getElementById("green_land_coverage_content"));
    var bar_option = {
        color: echarts_colors,
        title:get_object_assign({
            text:"各街道绿地500米覆盖率",
        },echart_title),
        tooltip : {
            trigger: 'axis',
            axisPointer : {            
                type : 'shadow'       
            }
        },
        grid: get_object_assign(facilities_bar_config.grid, { top:60 }),
        xAxis:{
            type : 'category',
            inverse: true,
            data: [],
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
            name: '%',
            // minInterval:100,//设置左侧Y轴最小刻度
            axisLabel: coordinate_axis_style.axisLabel,
            axisLine: coordinate_axis_style.axisLine,
            splitLine: coordinate_axis_style.splitLine,
        },
        series :{
            name:'各街道绿地500米覆盖率',
            type:'bar',
            data:[],
            barCategoryGap:5,
            itemStyle:{
              normal:{
                barBorderRadius: [30, 30, 0, 0],
              }
            }
        },
    };
    for(var i = 0; i < data.length; i++){
        var item = data[i];
        bar_option.xAxis.data.push(item.name.replace("街道",""));
        bar_option.series.data.push(item.value);
    }
    barChart.setOption(bar_option, true);
    window.onresize = function(){
        barChart.resize();
    }
}
//加载各社区绿地覆盖面积和人均绿地面积图表数据
GreenLand.prototype.load_bar_stack_chart = function(){
    var data = [
        {"value":"5.251251657","per_area":"1.75642359","name":"安定门街道"},
        {"value":"2.563265858","per_area":"0.077698369","name":"北新桥街道"},
        {"value":"1.253742965","per_area":"0.37628037","name":"朝阳门街道"},
        {"value":"0.074720748","per_area":"0.022459803","name":"崇外街道"},
        {"value":"1.132617787","per_area":"0.441504839","name":"东花市街道"},
        {"value":"11.0881746","per_area":"8.832721708","name":"东华门街道"},
        {"value":"1.360207502","per_area":"0.426107263","name":"东四街道"},
        {"value":"0.495070258","per_area":"0.239600198","name":"东直门街道"},
        {"value":"14.72741632","per_area":"5.744017771","name":"和平里街道"},
        {"value":"4.651962007","per_area":"2.857367194","name":"建国门街道"},
        {"value":"0.58070042","per_area":"0.170877398","name":"交道口街道"},
        {"value":"1.397721324","per_area":"0.51066127","name":"景山街道"},
        {"value":"29.36469755","per_area":"13.87786023","name":"龙潭街道"},
        {"value":"1.393196412","per_area":"0.744361383","name":"前门街道"},
        {"value":"7.662965557","per_area":"3.412853043","name":"体育馆街道"},
        {"value":"50.22919569","per_area":"39.58814354","name":"天坛街道"},
        {"value":"2.052995282","per_area":"0.838819317","name":"永定门街道"}
    ]
    var barChart = echarts.init(document.getElementById("green_land_bar_content"));
    var bar_option = {
        color: echarts_colors,
        title:get_object_assign({
            text:"各街道绿地覆盖率和人均绿地面积",
        },echart_title),
        legend: {
            data: ['覆盖率', '人均绿地面积'],
            textStyle: {
                color: '#B4B4B4'
            },
            top:20,
        },
        tooltip : {
            trigger: 'axis',
            axisPointer : {            
                type : 'shadow'       
            }
        },
        grid: get_object_assign(facilities_bar_config.grid, { top:80 }),
        xAxis:{
            type : 'category',
            inverse: true,
            data: [],
            axisLabel: get_object_assign(coordinate_axis_style.axisLabel,{
		        formatter:function(val){
		            return val.split("").join("\n");
		        }
    		}),
            axisLine: coordinate_axis_style.axisLine,
            splitLine: coordinate_axis_style.splitLine,
        },
        yAxis:[
            {
                type : 'value',
                name: '%',
                // minInterval:100,//设置左侧Y轴最小刻度
                axisLabel: coordinate_axis_style.axisLabel,
                axisLine: coordinate_axis_style.axisLine,
                splitLine: coordinate_axis_style.splitLine,
            },
            {
                name: '平方公里',
                splitLine: {show: false},
                axisLine: {
                    lineStyle: {
                        color: '#B4B4B4',
                    }
                },
                axisLabel:{
                    formatter:'{value} ',
                }
            }
        ],
        series : [
            {
                type:'bar',
                name:'覆盖率',
                data:[],
                barCategoryGap:5,
                itemStyle:{
                    normal:{
                    barBorderRadius: [30, 30, 0, 0],
                    }
                }
            },{
                name: '人均绿地面积',
                type: 'line',
                smooth: true,
                showAllSymbol: true,
                symbol: 'emptyCircle',
                symbolSize: 5,
                yAxisIndex: 1,
                itemStyle: {
                        normal: {
                        color:'#F02FC2'},
                },
                data: []
            }, 
        ]
    };
    for(var i = 0; i < data.length; i++){
        var item = data[i];
        bar_option.xAxis.data.push(item.name.replace("街道",""));
        bar_option.series[0].data.push(item.value);
        bar_option.series[1].data.push(item.per_area);
    }
    barChart.setOption(bar_option, true);
    window.onresize = function(){
        barChart.resize();
    }
}
var start_green_land = new GreenLand();
start_green_land.init();