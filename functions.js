
//Setup Functions
function setAssetPath() {
    for (var i = 0; i < vidsPath.length; i++) {
        vidsPath[i] = str('assets/videos/vid' + (i + 1) + '.mp4');
    }

    for (var i = 0; i < songsPath.length; i++) {
        songsPath[i] = str('assets/music/song' + (i + 1) + '.mp3');
    }
}

function buttonsSetup() {
    uiButtons.start = new Button(width / 2, height / 2, width / 5, height / 8, "Start");
    uiButtons.play = new Button(width / 3, height / 2, width / 6, height / 10, "Play");
    uiButtons.back = new Button((width / 3) * 2, height / 2, width / 6, height / 10, "Go Back");

    vidButtons = new Buttons(vidNum, 2, 0);
    vidButtons.buttonsSetup();

    songButtons = new Buttons(songNum, 3, 1);
    songButtons.buttonsSetup();
}

function SegArrSetup() {
    for (var i = 0; i < segments - 1; i++) {
        segAvs.push(0);
        segPreAvs.push(0);
    }

    for (var i = 0; i < effectsNum; i++) {
        var effect = {
            inUse: false,
            ray: false,
            fx: null,
            count: 20
        }
        effects.push(effect);
    }
}


//Media Functions
function loadAssets() {
    if (loading != true && loaded.all != true) {
        vid = createVideo(vidsPath[selectedAssets.video], videoLoaded);
        song = loadSound(songsPath[selectedAssets.song], songLoaded);
        loading = true;
    }

    if(loaded.song == true && loaded.video == true && loaded.all != true){
        loading.all = true;
    }
}

function videoLoaded() {
    loaded.video = true;
    vid.hide();
    vid.volume(0);
    vid.loop();
    if(loaded.song == true){
        loaded.all = true;
    }
}

function songLoaded() {
    loaded.song = true;
    song.setVolume(0.6);
    if(loaded.video == true){
        loaded.all = true;
    }
}

function playSong() {
    if(playing.song == false && song.isPlaying() == false && song.isPaused() == false){
        playing.song = true;
        song.play();
    } else if(playing.song == true && song.isPlaying() == false && song.isPaused() == false){
        vid.stop();
        playing.song = false;
        playing.video = false;
        selectedAssets.song = null;
        selectedAssets.video = null;
        state = 1;
    }
}


//Window-Interaction Functions
function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function detectCollision(ColXFloor, ColXCelling, ColYFloor, ColYCelling, StaXFloor, StaXCelling, StaYFloor, StaYCelling) {
    //Col is the colliding object
    //sta(whatever) is the stationary or target object, which needs a floor and celling for its X and Y
    //the floor being the minimum value requirement for the corrosponding value of the colliding object
    //the celling being the maximum value requirement for the corrosponding value of the colliding object

    if (ColXFloor > StaXFloor
        && ColXCelling < StaXCelling
        && ColYFloor > StaYFloor
        && ColYCelling < StaYCelling
    ) {
        return true;
    } else {
        return false;
    }
}

function clickButtons(butObj) {
    var output = false;
    if (state == butObj.nativeState) {
        for (var i = 0; i < butObj.buttons.length; i++) {
            if (butObj.buttons[i].hover == true) {
                if (butObj.type == 0) {
                    selectedAssets.video = i + 1;
                } else if (butObj.type == 1) {
                    selectedAssets.song = i + 1;
                }
                output = true;
                break;
            }
        }
    }
    return output;
}


//VFX Functions
function calAllSegAvs() /*Calculate All Segement Averages*/ {
    countPreAvs++;
    if (countPreAvs <= countPreAvsThreshold) {
        for (var i = 0; i < segPreAvs.length; i++) {
            segPreAvs[i] = int(segAvs[i]);
        }
        countPreAvs = 0;
    }
    for (var i = 0; i < segAvs.length; i++) {
        for (var a = i * segSpan; a < (i + 1) * segSpan; a++) {
            segAvs[i] += spectrum[a];
        }
        segAvs[i] /= segSpan;
        segAvs[i] = int(segAvs[i]);
    }
}

function spikeCheck(i) {
    if (segAvs[i] > segPreAvs[i] * spikeThreshold && segAvs[i] > minSpikeThreshold) {
        return true;
    } else {
        return false;
    }
}

function createEffect(I) {
    var eff;
    var ray = false;
    var createEffect = true;

    if (I >= 0 && I <= (segAvs.length / 3) && raySpaceCheck() === true) {
        var coinFlip = random(-1, 1);
        var x;
        if (coinFlip <= 0) {
            x = width
        } else if (coinFlip > 0) {
            x = 0;
        }
        eff = new Rays(x, height, 2, 1200);
        eff.setup();
        ray = true;
    } else if (I > segAvs.length / 3 && I <= (segAvs.length / 3) * 2) {
        eff = new Ball;
    } else if (I > (segAvs.length / 3) * 2 && I <= segAvs.length) {
        eff = new Flower;
    } else {
        createEffect = false;
    }

    if (createEffect == true) {
        for (var i = 0; i < effects.length; i++) {
            if (effects[i].inUse == false) {
                effects[i].fx = eff;
                effects[i].ray = ray;
                effects[i].inUse = true
                break;
            }
        }
    }
}

function drawEffects() {
    for (var i = 0; i < effects.length; i++) {
        if (effects[i].inUse == true) {
            effects[i].fx.draw(i);
            effects[i].count -= 2;
            if (effects[i].count <= 0 && effects[i].fx.fading != true) {
                effects[i].fx.beginFade();
            }
        }
    }
}

function raySpaceCheck() {
    var count = 0;
    var output = true;
    for (var i = 0; i < effects.length; i++) {
        if (effects[i].ray == true) {
            count++;
        }
        if (count > 5) {
            output = false;
            break;
        }
    }
    return output;
}