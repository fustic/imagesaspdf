// Utility
if (typeof Object.create !== 'function') {
    Object.create = function(obj) {
        function F() {
        }
        ;
        F.prototype = obj;
        return new F();
    };
}

;
(function($, window, document, undefined) {
    var ImagesAsPdf = {
        init: function(options, elem) {
            var self = this;
            self.elem = elem;
            self.$elem = $(elem);
            self.options = $.extend({}, $.fn.imagesAsPdf.options, options);
            self.params = {
                totalPages:0,
                currentPage:0,
                currentScale:0,
                pages:{},
                $elems: {}
            };
            self.createView();
            self.initEvents();
            self.initImages();
        },
        createView: function() {
            var self = this,
                options = self.options,
                prefix = options.prefix,
                $elems = self.params.$elems,
                $holder = $("<div/>", {"class": prefix + "holder h-pdf-container"}),
                $content = $('<div>', {'class': 'h-pdf-canvas-container ' + prefix + "iContainer "+ prefix + "content"}),
                $toolbar = $('<div>', {'class': 'h-pdf-toolbar'}),
                $toolbarLeft = $('<div>', {'class': 'h-pdf-toolbar-left'}),
                $toolbarRight = $('<div>', {'class': 'h-pdf-toolbar-right'}),
                $toolbarCenter = $('<div>').addClass('h-pdf-toolbar-center'),
                $buttonNext = $('<div>', {'class': 'h-pdf-button h-pdf-next ' + prefix + "iNextButton", 'title': 'Next Page'}),
                $buttonPrev = $('<div>', {'class': 'h-pdf-button h-pdf-prev ' + prefix + "iPrevButton", 'title': 'Previous Page'}),
                $pageText = $('<span>', {'class': 'h-pdf-pagetext', 'html': 'Page:'}),
                $pageInput = $('<span>', {'class': 'h-pdf-pagetext ' + prefix + "iCurrentPage", 'html': 0}),
                $ofText = $('<span>', {'class': 'h-pdf-pagetext', 'html': 'of '}),
                $pagesText = $('<span>', {'class': 'h-pdf-pagecount ' + prefix + "iTotalPages", 'html': 0}),
                $zoom = $('<span>', {'class': 'h-pdf-zoom'}),
                $zoomSelect = $('<select>', {'class': 'h-pdf-zoom-select ' + prefix + "iZoomSelect"}),
                $buttonDownload = $('<div>', {'class': 'h-pdf-button h-pdf-download h-pdf-right-button ' + prefix + "iDownloadButton"}),
                $buttonNewLayer = $('<div>', {'class': 'h-pdf-button h-pdf-right-button h-pdf-fullscreen ' + prefix + "iDownloadButton"}),
                $buttonPrint = $('<div>', {'class': 'h-pdf-button h-pdf-right-button h-pdf-print ' + prefix + "iDownloadButton"});
            $elems.$holder = $holder;
            $elems.$content = $content;
            $elems.$buttonNext = $buttonNext;
            $elems.$buttonPrev = $buttonPrev;
            $elems.$buttonDownload = $buttonDownload;
            $elems.$buttonNewLayer = $buttonNewLayer;
            $elems.$buttonPrint = $buttonPrint;
            $elems.$zoomSelect = $zoomSelect;
            $elems.$currentPage = $pageInput;
            $elems.$totalPages = $pagesText;
            self.$elem.append($holder);

            $toolbar.append($toolbarLeft).append($toolbarRight).append($toolbarCenter);
            $holder.append($toolbar);
            $zoom.append($zoomSelect);
            $.each(self.options.zoomModes, function(key, value) {
                $zoomSelect.append($("<option></option>").attr("value", key).text(value));
            });
            $toolbarCenter.append($('<div>', {'class': 'h-pdf-toolbar-group'}).append($buttonPrev).append($buttonNext)).append($pageText).append($pageInput).append($ofText).append($pagesText).append($zoom);
            $toolbar.append($('<div>', {'class': 'h-pdf-toolbar-center-outer'}).append($toolbarCenter));
            $toolbarRight.append($buttonDownload).append($buttonNewLayer).append($buttonPrint);
            $holder.append($content);

        },
        initEvents: function() {
            var self= this,
                options = self.options,
                $elems = self.params.$elems,
                params = self.params;
            $elems.$buttonDownload.on("click",function(){
                /*var delim = '?';if (url = ~/\?/) {delim = '&';}var url = options.downloadFileLink + delim + "action=download";*/
                window.open(options.downloadFileLink, '_parent');
            });
            $elems.$zoomSelect.change(function() {
                self.params.currentScale = $(this).val();
                self.adjustImages();
            }).val(options.scale);
            $elems.$buttonNext.on("click",function(){
                params.currentPage = params.currentPage == params.totalPages ? 1 : params.currentPage+1; 
                self.changePage();
            });
            $elems.$buttonPrev.on("click",function(){
                params.currentPage = params.currentPage == 1 ? params.totalPages : params.currentPage-1;
                self.changePage();
            });
            $elems.$content.scroll(function(){
                var scrollHeight = this.scrollHeight,
                    scrollTop = this.scrollTop,
                    page = 1,
                    scrolledPages=0,
                    $this=$(this);
                $.each($this.find("."+options.prefix+"page"),function(key, item){
                    scrolledPages+=item.scrollHeight;
                    if(scrolledPages>=scrollTop){
                        $elems.$currentPage.html(page);
                        return false;
                    }
                    page++;
                });     
            });
            $elems.$buttonPrint.on("click",function(){
                
                self.changePage(params.totalPages);
//                console.log($elems.$content);
//                $elems.$content.printArea();
//                $elems.$content.printPreview();
//                $elems.$content.printPage();
                setTimeout(function(){
                    $elems.$holder.printElement({ 
                    leaveOpen:true,printMode:'popup',
                    printBodyOptions:{
                        classNameToAdd : 'printPage'
                    }
                });
                },100);
                
//                $elems.$content.jqprint();
            });
            
        },
        initImages:function(){
            var self=this,
                options = self.options,
                params = self.params,
                pages = params.pages,
                prefix = options.prefix,
                $elems = params.$elems,
                $totalPages = $elems.$totalPages,
                $currentPage = $elems.$currentPage,
                source = "",
                isString = false,
                totalPages =0,
                initHeigth = options.initHeight === 0 ? $elems.$holder[0].clientHeight-100 : options.initHeight,
                $img;
            params.currentScale = options.scale;
            params.currentPage = options.page > 0 ? options.page : 1;
            
            $.each(options.images, function(key,item){
                isString = $.type(item)==="string"; 
                source = isString ? item : item.source;
                $img = $("<img/>",{
                    "data-url":source,
                    "src":options.blankImage,
                    "title":isString || !item.title ? "" : item.title,
                    "data-original":source,
                    width:"auto",
                    height:initHeigth+"px"
                });
                
                pages[key+1]={
                    source: source,
                    title: isString || !item.title ? "" : item.title,
                    $img: $img
                };
                
                $elems.$content.append($("<div/>",{
                    "class": prefix+"iPageHolder "+prefix+"page "+prefix+"iPage"+(key+1),
                    "data-page": key+1
                }).append($img));
                totalPages++;
            });
            params.totalPages = totalPages;
            
            $elems.$content.find("img").lazyload({
                effect : "fadeIn",
                container: $elems.$content,
                threshold : 200,
                load: function(){
                    var $_img = $(this);
                    setTimeout(function(){
                        $_img.data("width",$_img[0].naturalWidth).data("loaded",true);
                        self.resizeImg($_img, params.currentScale);
                    },10);
                }
            });
            $totalPages.html(totalPages);
            $currentPage.html(params.currentPage);
            if(options.page!==1)
                self.changePage();
        },
        adjustImages: function(){
            var self=this,
                params = self.params,
                pages = params.pages;
            $.each(pages,function(key, page){
               self.resizeImg(page.$img, params.currentScale);
            });
        },  
        changePage: function(page){
            var self = this,
                params = self.params,
                $content = params.$elems.$content;
            $content.scrollTo("."+self.options.prefix+"iPage"+(page || self.params.currentPage));
            params.$elems.$currentPage.html(page || self.params.currentPage);
        },
        resizeImg: function($img, scale){
            if($img.data("loaded")){
                var width = $img[0].naturalWidth;//.data("width");
                if(width!==0)
                    switch (scale.toString()){
                        case "0":{
                            $img.width("100%").height("auto");  
                            break;
                        }
                        case "3":{
                            $img.width(width*3+"px").height("auto");    
                            break;
                        }
                        case "2":{
                            $img.width(width*2+"px").height("auto");
                            break;
                        }
                        case "1.5":{
                            $img.width(width*1.5+"px").height("auto");
                            break;
                        }
                        case "1":{
                            $img.width(width+"px").height("auto");
                            break;
                        }
                        case "0.5":{
                            $img.width(width*0.5+"px").height("auto");
                            break;
                        }
                        case "0.25":{
                            $img.width(width*0.25+"px").height("auto");
                            break;
                        }
                        case "0.1":{
                            $img.width(width*0.1+"px").height("auto");
                            break;
                        }
                    }
            }
        }
    };

    $.fn.imagesAsPdf = function(options) {
        return this.each(function() {
            var imagesAsPdf = Object.create(ImagesAsPdf);

            imagesAsPdf.init(options, this);

            $.data(this, 'imagesAsPdf', imagesAsPdf);
        });
    };

    $.fn.imagesAsPdf.options = {
        page:1,
        scale:0,
        prefix: "isp-",
        initHeight:0,
        zoomModes: {"3": '300%', "2": '200%', "1.5": '150%', "1": 'Actual Size', "0":'Auto width', "0.5": 'Half Size', "0.25": '25%', "0.1": '10%'},
        downloadFileLink : "",
        images:[],
        blankImage:""
    };

})(jQuery, window, document);
