
/* The IndexedDb */

import {doDatabaseStuff, set, retrieve, getMusicToPlay} from './database.js'

window.onload = function() {
    doDatabaseStuff();
    musicDisplay();
    
    const myTimeout = setTimeout(
        loading,
        1000
    );

    // function myStopFunction(){
    //     clearTimeout(myTimeout);
    // }
}

function loading(){
    let peenDiv = document.querySelector('.peen');
    let asideDiv = document.querySelector('aside');
    let loadingDiv = document.querySelector('.loading');

    asideDiv.style.display = 'flex';
    peenDiv.style.display = 'flex';
    loadingDiv.style.display = 'none';
}

const musicDivDisplays = document.querySelector('.music__container')

async function musicDisplay(){
    let allMusic = await retrieve();

    for (let musicValues of allMusic) {

        let nameOfMusic = musicValues['name'].replace(/.(mp3)$/, '');

        let mainTagTabs = document.createElement('div');

        mainTagTabs.setAttribute('class', 'main-tag-tabs');      
        
        let buttonPlay = document.createElement('button');
        buttonPlay.setAttribute('id', musicValues['id']);
        buttonPlay.innerText = nameOfMusic;
        buttonPlay.addEventListener('click', musicFetched);

        mainTagTabs.appendChild(buttonPlay);

        let spanAddBox = document.createElement('span');
        spanAddBox.setAttribute('class', 'material-icons md-36');
        spanAddBox.innerText = 'add_box';

        mainTagTabs.appendChild(spanAddBox);

        let spanDelete = document.createElement('span');
        spanDelete.setAttribute('class', 'material-icons md-36');
        spanDelete.innerText = 'delete';

        mainTagTabs.appendChild(spanDelete);

        let spanFavorite = document.createElement('span');
        spanFavorite.setAttribute('class', 'material-icons heart');
        spanFavorite.innerText = 'favorite';

        mainTagTabs.appendChild(spanFavorite);
        
        musicDivDisplays.appendChild(mainTagTabs);

    }

}

/* The IndexedDb */


// Dark Mode toggle
let darkMode = localStorage.getItem('darkMode'); 
const toggleMode = document.querySelector('.toggle-change')

toggleMode.addEventListener('click', toggleChange);

const enabledDarkMode = () => {
    document.body.classList.add('darkmode');
    
    toggleMode.querySelector('span.material-icons').innerText = 'brightness_7';

    localStorage.setItem('darkMode', 'enabled');
}

const disableDarkMode = () => {
    document.body.classList.remove('darkmode');

    toggleMode.querySelector('span.material-icons').innerText = 'nightlight';

    localStorage.setItem('darkMode', 'disabled');
}

// Javascript way of checking for dark mode
let matched = window.matchMedia('(prefers-color-scheme: dark)').matches;

if(darkMode === 'disabled'){
    disableDarkMode();
} else if(matched){
    enabledDarkMode();
}

// if(matched){
//     enabledDarkMode();
// }

function toggleChange(){
    
    darkMode = localStorage.getItem('darkMode'); 
    
    if (darkMode !== 'enabled') {
        enabledDarkMode();
    } else {
        disableDarkMode();
    }
}

// End of Dark Mode toggle


// Sidebar function

const menuDisplay = document.querySelector('#menu-items');
const headerSize = document.querySelector('aside');
const sideBarA = document.querySelector('aside a');
const sidebarMenu = document.querySelector('aside a span');

sidebarMenu.addEventListener('click', async () => {

    if(menuDisplay.className === 'hidden' ){    
        
        headerSize.style.transform = 'translateX(0rem)';
        sideBarA.style.boxShadow = 'var(--box-shadow-color)';
        sideBarA.style.width = "3rem";
        menuDisplay.classList.remove('hidden');
        menuDisplay.classList.add('show');
    
    } else {
        headerSize.style.transform = 'translateX(-12rem)';
        menuDisplay.classList.remove('show');
        menuDisplay.classList.add('hidden');
        sideBarA.style.width = "3.5rem";
        sideBarA.style.boxShadow = 'var(--box-shadow-color)';
        
    }
})

// Sidebar function end

// Fetching music and populating the playlist-area section class

const addDirectory = document.querySelector('.fetchDirectory');
const addMusic = document.querySelector('.fetchMusic');

function blobToArrayBuffer(blob){
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.addEventListener('loadend', (e) => {
            resolve(reader.result);
        });
        reader.addEventListener('error', reject);
        reader.readAsArrayBuffer(blob);
    })
}

async function makeBlobPutIntoDb(entry){

    const fileData = await entry.getFile();

    let byteSize = await blobToArrayBuffer(fileData); // Turns into blob

    let binary = new Uint8Array(byteSize); // Gets the bytes to use for the audio
    console.log('work')
    await set(fileData.name, binary, fileData.type)

}

addDirectory.addEventListener('click', async () => {   // LOOK MATTHEW

    const peen = await window.showDirectoryPicker();
    
    const matchFileSpecs = ".(mp3)$";

    for await (const entry of peen.values()) {

        if (entry.kind === 'file' && entry.name.match(matchFileSpecs)) {

            await makeBlobPutIntoDb(entry);

        }
    }
    
    alert("Music Directory has been added.")
    window.location.reload();
})

// Add music function
addMusic.addEventListener('click', async () => {

    const [filehandle] = await window.showOpenFilePicker();

    const matchFileSpecs = ".(mp3)$";
    
    if (filehandle.kind === 'file' && filehandle.name.match(matchFileSpecs)){
        await makeBlobPutIntoDb(filehandle);

        alert("Music has been added.")
        window.location.reload();
    } else {
        alert("Please select a music file only.");
    }
    
})

// Fetching music and populating the playlist-area section class end

// Music area icon functions

// For play and pause music
const playButton = document.querySelector('#play-button');
const sourceTag = document.querySelector("#audioToPlay");
const songNameHeader = document.querySelector(".container-play-music-area h1");
const artistNameHeader = document.querySelector(".container-play-music-area h3");

let audio;

async function pauseSong() {

    audio.pause();

    playButton.classList.remove('playing');

    playButton.querySelector('span.material-icons').innerText = 'play_arrow';

}

async function playSong(value) { // LOOK MATTHEW

    audio.pause();

    if(value === undefined || value === ''){
        alert('No music has been selected to play.')
        return;
    }  

    unmuteMusic();

    audio.play();
    audio.volume = previousVolume / 100;

    playButton.classList.add('playing');
    playButton.querySelector('span.material-icons').innerText = 'pause';
}

playButton.addEventListener('click', () => {

    const isPlaying = playButton.classList.contains('playing');

    let valueToPlayOrPause = sourceTag.getAttribute('src');

    if(!isPlaying) {
        playSong(valueToPlayOrPause);
    } else {
        pauseSong();
    }

})

// For repeat music
const repeatButton = document.querySelector('#repeat-song');

function repeatOff(){
    repeatButton.classList.add('repeat_off');
    repeatButton.querySelector('span.material-icons').innerText = 'repeat';
    repeatButton.style.opacity = "0.5";
}

function repeatSong(){
    repeatButton.classList.remove('repeat_playlist');
    repeatButton.querySelector('span.material-icons').innerText = 'repeat_one';
    repeatButton.style.opacity = "1";
}

function repeatPlaylist(){
    repeatButton.classList.add('repeat_playlist');
    repeatButton.classList.remove('repeat_off');
    repeatButton.querySelector('span.material-icons').innerText = 'repeat';
    repeatButton.style.opacity = "1";
}

// For repeating the music that is playing or repeat whole playlist
repeatButton.addEventListener('click', () => {

    if(repeatButton.classList.contains('repeat_off')){
        repeatPlaylist();
    } else if(repeatButton.classList.contains('repeat_playlist')){
        repeatSong();
    } else {
        repeatOff();
    }

})

// For shuffle music 
const shuffleButton = document.querySelector('#shuffle');

function shuffleSong(){
    shuffleButton.classList.remove('shuffle_off');

    shuffleButton.querySelector('span.material-icons').innerText = 'shuffle';
}

function shuffleOff(){
    shuffleButton.classList.add('shuffle_off'); 

    shuffleButton.querySelector('span.material-icons').innerText = 'sync_alt';
}

shuffleButton.addEventListener('click', () => {

    const isShuffle = shuffleButton.classList.contains('shuffle_off');

    if(isShuffle){
        shuffleSong();
    } else {
        shuffleOff();
    }

})


// Music area icon functions end


// Music selected to play

async function musicFetched(id){ // LOOK MATTHEW

    if(audio != null){
        audio.pause();
    }
    
    let musicToPlay = await getMusicToPlay(id.target.id);   

    let musicBlob = new Blob([musicToPlay.byteLength], {type: 'audio/mpeg'}) // Turn bytes into blob
    const url = URL.createObjectURL(musicBlob);

    sourceTag.src =  "data:audio/mpeg;base64," + url; // Used for the createObjectURL to store audio to play
    sourceTag.setAttribute('type', musicToPlay.type);

    await checkName(musicToPlay.name);

    audio = new Audio(url);

    playSong(musicToPlay);

}

async function checkName(nameOfMusic){

    let songNameAndArtist = nameOfMusic.split("-");

    if(songNameAndArtist.length > 1){
        let musicName = songNameAndArtist[1].replace(/.(mp3)$/, '');

        songNameHeader.innerText = musicName.trim();
        artistNameHeader.innerText = songNameAndArtist[0].trim();

    } else {
        let musicName = nameOfMusic.replace(/.(mp3)$/, '');

        songNameHeader.innerText = musicName.trim();
        artistNameHeader.innerText = 'Unknown';
    }

}

// Music selected to play end

// Volume control

const volumeControl = document.querySelector('#volume-control');
const volumeIcon = document.querySelector('#volume_icon');

let previousVolume = 30;

volumeControl.addEventListener('input', async () => {

    let volumeLevel = await volumeControl.value;

    if(audio != undefined || audio != null) {
        let vol = volumeLevel / 100;
        audio.volume = vol;
    }

    await volumeCheck(volumeLevel);

})

async function volumeCheck(volumeLevel){

    if(volumeLevel < 1){

        volumeIcon.innerText = 'volume_off';
        previousVolume = volumeLevel;
        
    } else if(volumeLevel < 50){

        volumeIcon.innerText = 'volume_down';
        previousVolume = volumeLevel;

    } else {

        volumeIcon.innerText = 'volume_up';
        previousVolume = volumeLevel;

    }

}

// When the icon is clicked it will be muted
volumeIcon.addEventListener('click', async () => {

    if(volumeControl.value > 0){
        
        mutedMusic(); // mute music

    } else {

        unmuteMusic(); // unmute music
        
    } 
    
})

async function mutedMusic(){

    volumeIcon.innerText = 'volume_off';
    volumeControl.value = 0;

    if(audio != undefined || audio != null) {
        audio.muted = true; // mute method
    }
    
}

async function unmuteMusic(){

    volumeControl.value = previousVolume;
    await volumeCheck(previousVolume);

    if(audio != undefined || audio != null) {
        audio.muted = false; // mute method
    }

}


/* For deleting music */

/* For deleting music end */

/* For adding music to playlist */

/* For adding music to playlist end */

/* For adding to Favorite playlist */

/* For adding to Favorite playlist end */