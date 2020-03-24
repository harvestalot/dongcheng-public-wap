//居住人口、就业人口热力图
function PopulationHeatMap(){
    this.mainMap = "";
    this.population_type = "";
}
PopulationHeatMap.prototype.init = function(){
    $("#map_legend,#population_legend").addClass("map_legend_animation");
    var _this = this;
    $("#population_legend input").each(function(i){
        $(this).on("click",function(){
		    //清除停车场所有选中图例
		    $("#map_legend input").each(function(i){
		        $(this).prop("checked",false);
		    });
            _this.population_type = $(this).val();
    		_this.mapInit();
    		_this.populationHeatLayer();
        })
    });
}
//地图初始化
PopulationHeatMap.prototype.mapInit = function(){
	this.mainMap = new AMap.Map("main_map", {
	    // pitch: 50,
        // 隐藏默认楼块--区域面（bg）/道路（road）/建筑物（building）/标注（point）
        features: ['bg', 'road',"building"],
	    center: [116.412255,39.908886],
	    zoom: 12,
    });
}
//人口热力图层
PopulationHeatMap.prototype.populationHeatLayer = function(){
    var populationHeatLayer = new Loca.HeatmapLayer({
        map: this.mainMap,
    });
    var _this = this;
    $.get(service_config.file_server_url+'population_data.json', function (data) {
	    populationHeatLayer.setData(data[_this.population_type], {
	        lnglat: 'lnglat',
	        value: 'value'
	    });
	    populationHeatLayer.setOptions({
	        style: {
	            radius: 20,
	            color: {
	                0.5: '#2c7bb6',
	                0.65: '#abd9e9',
	                0.7: '#ffffbf',
	                0.9: '#fde468',
	                1.0: '#d7191c'
	            }
	        }
	    });
        populationHeatLayer.render();
    })
}

var start_population_heat_map = new PopulationHeatMap();
start_population_heat_map.init();