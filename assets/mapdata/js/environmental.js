//胡同环卫
function HutongSanitation(){
    this.mainMap = "";
    this.markers = [];
}
HutongSanitation.prototype.init = function(){
    this.loadBanner();
    this.loadProblemSection();
    this.loadMeasuresSection();
    this.loadFutureSection();
    this.loadReproducibleChart();
    this.mapInit();
    this.layerInit();
}
//加载banner
HutongSanitation.prototype.loadBanner = function(){
    serveRequest("get", service_config.data_server_url+"banner/getBannerList",{ type:"Sanitation" },function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey));
        var banner_str = '';
        var toUrl = "./assets/bannerSubPage/sanitation/banner_"
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            banner_str += '<div class="swiper-slide"><a href="'+toUrl+(i+1)+".html"+'"><img src='+ service_config.server_img_url + item.url +' width="100%" data-href='+ toUrl+(i+1)+".html" +' ></div>'
        }
        $("#banner .swiper-wrapper").html(banner_str);
        startBanner();//启动banner
    })
}
//加载问题栏目
HutongSanitation.prototype.loadProblemSection = function(){
    serveRequest("get", service_config.data_server_url+"problem/getProblemList",{ type:"Sanitation" },function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey));
        var problem_str = '';
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            problem_str += '<li>'+ item.description +'</li>'
        }
        $("#problem_box ").html(problem_str);
    })
}
//加载措施栏目
HutongSanitation.prototype.loadMeasuresSection = function(){
    serveRequest("get", service_config.data_server_url+"solution/getSolutionList",{ type:"Sanitation" },function(result){
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
HutongSanitation.prototype.loadFutureSection = function(){
    serveRequest("get", service_config.data_server_url+"future/getfutureList",{ type:"Sanitation" },function(result){
        var data = JSON.parse(Decrypt(result.data.resultKey));
        var future_str = '';
        for(var i = 0; i < data.length; i++){
            var item = data[i];
            future_str += '<li>'+ item.description +'</li>'
        }
        $("#future_box").html(future_str);
    })
}
//地图初始化
HutongSanitation.prototype.mapInit = function(){
	this.mainMap = new AMap.Map("main_map", {
        mapStyle: 'amap://styles/4ab81766c3532896d5b265289c82cbc6',
	    center: [116.412255,39.908886],
	    zoom: 11,
    });
}
//图层初始化
HutongSanitation.prototype.layerInit = function(){
    this.loadBoundaryLayer();
    this.loadSanitationPotionLayer();
}
//各个社区边界范围图层
HutongSanitation.prototype.loadBoundaryLayer = function(){
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
            // selectStyle:{
            //     color:"#13EFDC",
            // }
        });
        boundaryLayer.render();
    }); 
}
//胡同环卫图层
HutongSanitation.prototype.loadSanitationPotionLayer = function(){
	var _this = this;
    $.get(service_config.file_server_url+'recycle_bin_data.json', function (result) {
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
                        image: service_config.icon_url + 'huishou.png',
                        imageOffset: new AMap.Pixel(0, 0),
                        imageSize: new AMap.Size(-8, -8)
                    }),
                    position: item.lnglat,
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
//加载右侧可再生资源统计图
HutongSanitation.prototype.loadReproducibleChart = function(){
    var data = [
        {"name":"安定门街道","value":"0"},
        {"name":"北新桥街道","value":"0"},
        {"name":"朝阳门街道","value":"1"},
        {"name":"崇文门外街道","value":"1"},
        {"name":"东花市街道","value":"0"},
        {"name":"东华门街道","value":"1"},
        {"name":"东四街道","value":"0"},
        {"name":"东直门街道","value":"0"},
        {"name":"和平里街道","value":"0"},
        {"name":"建国门街道","value":"8"},
        {"name":"交道口街道","value":"1"},
        {"name":"景山街道","value":"2"},
        {"name":"龙潭街道","value":"0"},
        {"name":"前门街道","value":"1"},
        {"name":"体育馆街道","value":"0"},
        {"name":"天坛街道","value":"0"},
        {"name":"永定门街道","value":"0"}
    ]
    var population_bar_chart = echarts.init(document.getElementById("reproducible_bar_chart"));
    var seriesLabel = {
        normal: {
            show: true,
            textBorderColor: '#333',
            textBorderWidth: 2
        }
    }
    var bar_option = {
        color: echarts_colors,
        title:get_object_assign({
            text:"各街道再生资源回收站数量统计",
        },echart_title),
        tooltip: {
            trigger: 'axis',
            axisPointer: {
                type: 'shadow'
            }
        },
        grid: {
            containLabel:false,
            left: 50,
            top: 40,
            right:30,
            bottom:40,
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
            data: [],
        },
        series: {
            name: "可再生资源",
            type: 'bar',
            itemStyle: {
                barBorderRadius: 10,
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [{
                        offset: 0,
                        color: 'rgba(0,222,215,0.2)'
                    },
                    {
                        offset: 1,
                        color: '#FFFC00'
                    }
                ])
            },
            barWidth: 10,
            data: []
        }
    };
    for(var i = 0; i < data.length; i++){
        var item = data[i];
        bar_option.yAxis.data.push(item.name.replace("街道",""));
        bar_option.series.data.push(item.value);
    }
    population_bar_chart.setOption(bar_option, true);
    window.onresize = function(){
        population_bar_chart.resize();
    }
    // var _this = this;
    // serveRequest("get", service_config.data_server_url+"parking/geParkingList",{ },function(result){
    //     var englishParking = ["jobParking", "commercialParking", "roadsideParking", "communityParking", "othres"];
    //     var data = result.data.resultKey;
    //     population_bar_chart.setOption(bar_option, true);
    //     window.onresize = function(){
    //         population_bar_chart.resize();
    //     }
    // })
}
var start_sanitation = new HutongSanitation();
start_sanitation.init();