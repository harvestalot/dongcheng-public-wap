    $(document).ready(function () {
        $(".menu-toggle").on("tap", function () {
            var menu = $(".menu");
            menu.hasClass("open") ? menuClose() : menuOpen();
        });

        $(".menu").on("click", function(e){
            $(e.target).is($(".menu")) && menuClose() && e.preventDefault();
        });

        $(".menu a").on("touchstart", function(e){
            //e.stopPropagation();
        });

        function menuClose() {
            $(".menu").removeClass("open");
            var toggleEle = $(".menu-toggle .iconfont");
            toggleEle.removeClass("icon-close").addClass("icon-menu");
        }

        function menuOpen() {
            $(".menu").addClass("open");
            var toggleEle = $(".menu-toggle .iconfont");
            toggleEle.removeClass("icon-menu").addClass("icon-close");
        }
    });