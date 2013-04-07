$(function(){
   $("#preview").imagesAsPdf({
       images:[
           {source:"img/page0001.jpg",title:"page 1"},
           "img/page0002.jpg",
           "img/page0003.jpg",
           "img/page0004.jpg",
           "img/page0005.jpg",
           "img/page0006.jpg",
           "img/page0007.jpg",
           "img/page0008.jpg"
       ],
       blankImage:"img/grey.gif",
       downloadFileLink:"img/page0008.jpg"
   });
});
