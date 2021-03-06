// Place all the behaviors and hooks related to the matching controller here.
// All this logic will automatically be available in application.js.
function get_browser(){
    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || []; 
    if(/trident/i.test(M[1])){
        tem=/\brv[ :]+(\d+)/g.exec(ua) || []; 
        return 'IE '+(tem[1]||'');
        }   
    if(M[1]==='Chrome'){
        tem=ua.match(/\bOPR\/(\d+)/)
        if(tem!=null)   {return 'Opera '+tem[1];}
        }   
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return M[0];
    }

function get_browser_version(){
    var ua=navigator.userAgent,tem,M=ua.match(/(opera|chrome|safari|firefox|msie|trident(?=\/))\/?\s*(\d+)/i) || [];                                                                                                                         
    if(/trident/i.test(M[1])){
        tem=/\brv[ :]+(\d+)/g.exec(ua) || [];
        return 'IE '+(tem[1]||'');
        }
    if(M[1]==='Chrome'){
        tem=ua.match(/\bOPR\/(\d+)/)
        if(tem!=null)   {return 'Opera '+tem[1];}
        }   
    M=M[2]? [M[1], M[2]]: [navigator.appName, navigator.appVersion, '-?'];
    if((tem=ua.match(/version\/(\d+)/i))!=null) {M.splice(1,1,tem[1]);}
    return M[1];
    }



// var video = document.querySelector('#video');
// var canvas = document.querySelector('#canvas');
function userMonitor(mediaQuality) {
  var width =  '';
  var height =  '';
  var cameraTimer = '';
  var streaming = false;
  var quality = ''; //on a scale of 0 - 1
  var vidStream        = '';
  var canvas       = '';
  var frequencyTimer = '';
  var urlToPost = '';
  var streamTimer = '';
  // canvasId = '',
  // vidStreamId = '',
  this.browserName= get_browser();
  this.browserVersion = get_browser_version();
  //constructor
  this.setVal = function(mediaQuality,selectorvidStreamCanvas,urlTo){
    // console.log(mediaQuality);
    width = mediaQuality['width'];
    height = mediaQuality['height'];
    canvas = document.querySelector(selectorvidStreamCanvas['canvas']);
    vidStream = document.querySelector(selectorvidStreamCanvas['vidStream']);
    // console.log(vidStream);
    vidStream.setAttribute('width', width);
    vidStream.setAttribute('height', height);
    // vidStream.watch();
    // console.log(vidStream);
    quality = mediaQuality['quality'];
    urlToPost = urlTo;

  };

  //methods
  this.getMedia =  function(){
    return ( navigator.getUserMedia ||
                         navigator.webkitGetUserMedia ||
                         navigator.mozGetUserMedia ||
                         navigator.msGetUserMedia)
  },

  this.selectWorkFlow =  function(){
    //doesn't work in internet explorer to get function name
    var media = this.getMedia().name;
    if (media != '' || media != undefined){
      //for now choosing the same workflow for all browsers
      // console.log('the height is '+ height);
    }
  },
  this.getUserPermission = function(){
    // console.log('inside media');
    var global = this;
    // console.log(vidStream);
    navigator.getMedia = this.getMedia();
    navigator.getMedia(
    {
      video: true,
      audio: false
    },
    function(stream) {
      // console.log(vidStream);
      if (navigator.mozGetUserMedia) {
        vidStream.mozSrcObject = stream;
        // console.log(vidStream);
      } else {
        var vendorURL = window.URL || window.webkitURL;
        // console.log('inside stream');
        console.log(stream);
        vidStream.src = vendorURL.createObjectURL(stream);
        // console.log(vidStream.src);
      }
      vidStream.play();
      streaming = true;
      $.ajax({
        type: "GET",
        url: "/user_monitor/start_camera_capture",
        data: {"stream": true}
      });
      cameraTimer = setInterval(function(){
        checkIfCamIsOff();
      },2000);   

    },
    function(err) {
      console.log("An error occured! in getUserPermission " + err);
      if (err == 'PERMISSION_DENIED'){
        // send an ajax request that user denied;
        alert('the user denied');
      }
      else{
        alert("your browser doesn't support getUserMedia");
      }
    }

    );
  },
  this.takePicture = function takepicture() {
    // height = 240;
    var global = this;
    if (streaming){
      console.log(this);
      canvas.setAttribute('width',width);
      canvas.setAttribute('height',height);    
      console.log(vidStream.mozSrcObject);
      context1 = canvas.getContext('2d')
      context1.drawImage(vidStream, 0, 0, width, height);
      var data = canvas.toDataURL("image/jpeg",quality);
      // photo.setAttribute('src', data);
      $.ajax({
        type: "POST",
        url: urlToPost,
        data: {img: data}
      })
    }
    else{
      clearInterval(cameraTimer);
      console.log('sorry streaming is not available, please get permission first')
    }
  },
  this.getCanvas = function getCanvas(){
    var global = this;
    if (streaming){
      console.log(this);
      canvas.setAttribute('width',width);
      canvas.setAttribute('height',height);    
      console.log(vidStream.mozSrcObject);
      context1 = canvas.getContext('2d')
      context1.drawImage(vidStream, 0, 0, width, height);
      var data = canvas.toDataURL("image/jpeg",.9);
      // photo.setAttribute('src', data);
      console.log('canvas is '+ canvas);
      return data;
    }
    else{
      clearInterval(cameraTimer);
      console.log('sorry streaming is not available, please get permission first')
    }
  },
  this.hasPermission = function(){
  	return streaming;
  }
  this.startTimedPics = function(frequency){
    var global = this;
    if (frequency >= 1000 && streaming){
      frequencyTimer = setInterval(function(){
        global.takePicture();
      },frequency);     
    }

  },
  this.stopTimedPics = function(){
    if (frequencyTimer != ''){
      clearInterval(frequencyTimer);
      frequencyTimer = '';
    }
    else{
      console.log('No timer has been set');
    }
  };

  this.takePictureOnce = function(){
  	var global = this;
	picTimer = setInterval(function(){
		if (streaming){
			global.takePicture();
			clearInterval(picTimer);
		}
	},2000); 
  };

  var checkIfCamIsOff = function(){
    var oldtime = streamTimer;
    if (vidStream.mozSrcObject != undefined){
      streamTimer = vidStream.mozSrcObject.currentTime;
    }
    else{
      if (vidStream.ended == true){
        streaming = false;
        $.ajax({
          type: "GET",
          url: "/user_monitor/start_camera_capture",
          data: {"stream": false}
        });
        clearInterval(cameraTimer);
        return false;
      }
      else{
        streaming = true;
        return true;
      }

    }
    if (streamTimer == oldtime && streamTimer != '' ){
      clearInterval(cameraTimer);
      streaming = false;
      // alert('You disabled the camera');
      return false;

    }
    else{
      return true;
    }
  }
}
//setter for the object

