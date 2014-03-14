var vgaButton = document.querySelector("button#vga");
var qvgaButton = document.querySelector("button#qvga");
var hdButton = document.querySelector("button#hd");

var dimensions = document.querySelector("p#dimensions");

var video = document.querySelector("video");
var stream;

navigator.getUserMedia = navigator.getUserMedia ||
  navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

function successCallback(gotStream) {
  window.stream = gotStream; // stream available to console
  video.src = window.URL.createObjectURL(stream);
  //video.src = stream;
  video.play();
}

function errorCallback(error){
  console.log("navigator.getUserMedia error: ", error);
}

/*
function displayVideoDimensions() {
	  dimensions.innerHTML = "Actual video dimensions: " + video.videoWidth +
	    "x" + video.videoHeight + 'px.';
	}

video.addEventListener('play', function(){
  //setTimeout(function(){
    displayVideoDimensions();
  //}, 500);
});
*/


/*
video.addEventListener('play', function(){
  console.log('width: ' + video.videoWidth);
  console.log('height: ' + video.videoHeight);
  
  alert('Video dimensions set to: ' + video.videoWidth +
		    "x" + video.videoHeight + 'px.' );
});
*/


var qvgaConstraints  = {
  video: {
    mandatory: {
      maxWidth: 320,
      maxHeight: 240
    }
  }
};

var vgaConstraints  = {
  video: {
    mandatory: {
      maxWidth: 640,
      maxHeight: 480
    }
  }
};

var hdConstraints  = {
  video: {
    mandatory: {
      minWidth: 1280,
      minHeight: 960
    }
  }
};

qvgaButton.onclick = function(){getMedia(qvgaConstraints)};
vgaButton.onclick = function(){getMedia(vgaConstraints)};
hdButton.onclick = function(){getMedia(hdConstraints)};

function getMedia(constraints){
  if (!!stream) {
    video.src = null;
    stream.stop();
  }
  navigator.getUserMedia(constraints, successCallback, errorCallback);
}