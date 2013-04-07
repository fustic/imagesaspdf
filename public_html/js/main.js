$(function(){
   $("#preview").imagesAsPdf({
       images:[
           {source:"/ImagesAsPdf/img/page0001.jpg",title:"page 1"},
           "/ImagesAsPdf/img/page0002.jpg",
           "/ImagesAsPdf/img/page0003.jpg",
           "/ImagesAsPdf/img/page0004.jpg",
           "/ImagesAsPdf/img/page0005.jpg",
           "/ImagesAsPdf/img/page0006.jpg",
           "/ImagesAsPdf/img/page0007.jpg",
           "/ImagesAsPdf/img/page0008.jpg"
       ],
       blankImage:"/ImagesAsPdf/img/grey.gif",
       scale:0.5,
       downloadFileLink:"/ImagesAsPdf/img/page0008.jpg"
   });
});
