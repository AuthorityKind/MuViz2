//Asset Variables
var vidNum = 11;
var songNum = 11;
var vidsPath = new Array(vidNum);
var songsPath = new Array(songNum);
var vid;
var song;
var loading = false;
var loaded = {
  all: false,
  video: false,
  song: false
};
var playing = {
  video: false,
  song: false
}


//Audio React Variables
var fft;
var spectrum = [];
var bins = 256;
var segments = 32;
var segAvs = [0];//Segment Averages
var segPreAvs = [0];//Segment Previous Averages
var segSpan = bins / segments;//Segment Span (how many bins are in a segment)
var countPreAvs = 0;//Count Previous Averages
var countPreAvsThreshold = 40;//Count Previous Averages
var spikeThreshold = 1.45;//multiplies with the segment previous average to see if the segment average exceeds that sum
//the higher it is, the more the segment average needs to exceed the previous segment average for a spike to be read
var minSpikeThreshold = 70;//the minimum a segment average needs to be before it counts as a spike


//VFX Variables
var effectsNum = 30;
var effects = [];


//Interface Variables
var state = 1;
var selectedAssets = {
  video: null,
  song: null
}
var uiButtons = {
  start: null,
  play: null,
  back: null
};
var vidButtons;
var songButtons;


//The Stuff
function setup() {
  createCanvas(windowWidth, windowHeight);
  soundFormats('mp3');
  setAssetPath();
  buttonsSetup();
  fft = new p5.FFT(0.2, bins);
  SegArrSetup();

  imageMode(CORNERS);
  rectMode(CENTER);
  angleMode(DEGREES);
  textAlign(CENTER);
  textSize(32);
}

function draw() {
  windowResized();
  switch (state) {
    case 1:
      background(0);
      background(0);
      fill(255);
      stroke(255);
      strokeWeight(1);
      textSize(128);
      text("MuViz", width / 2, height / 7);

      textSize(48);
      text("Version 0.2", width / 2, height / 4.5);

      uiButtons.start.drawButton();
      break;

    case 2:
      background(0);
      noStroke();    
      fill(255);
      textSize(64);
      text("Choose a Video", width / 2, height / 10);

      vidButtons.drawButtons();
      break;

    case 3:
      background(0)
      noStroke();;
      fill(255);
      textSize(64);
      text("Choose a Song", width / 2, height / 10);

      textSize(24);
      text("Chosen Video: " + selectedAssets.video, width / 4, height / 12);

      songButtons.drawButtons();
      break;

    case 4:
      background(0);
      noStroke();
      fill(255);
      textSize(64);
      text("You have chosen", width / 2, height / 9);
      textSize(56);
      text("Video " + selectedAssets.video + " & Song " + selectedAssets.song, width / 2 + 5, height / 5);
      
      uiButtons.play.drawButton();
      uiButtons.back.drawButton();
      break;

    case 5:
      background(0);
      fill(255);
      text("Loading...", width / 2, height / 2);

      loadAssets();

      if(loaded.all == true){
        state = 6;
      }
      break;

    case 6:
      playSong();

      image(vid, 0, 0, width, height);
      drawEffects();

      spectrum = fft.analyze(bins);
      calAllSegAvs();

      for (let i = 0; i < segAvs.length; i++) {
        if (spikeCheck(i) == true) {
          createEffect(i);
        }
      }
      
      break;
  }
}

function mouseReleased() {
  switch (state) {
    case 1:
      if (uiButtons.start.clickButton() === true) {
        state = 2;
      }
      break;

    case 2:
      if (clickButtons(vidButtons) === true) {
        state = 3;
      }
      break;

    case 3:
      if (clickButtons(songButtons) === true) {
        state = 4;
      }
      break;

    case 4:
      if (uiButtons.back.clickButton() === true) {
        state = 1;
        selectedAssets.video = null;
        selectedAssets.song = null;
      } else if(uiButtons.play.clickButton() === true){
        state = 5;
      }
      break;

    case 5:

      break;
  }
}