import { openDB } from './node_modules/idb/with-async-ittr.js';
// import { openDB } from 'https://cdn.jsdelivr.net/npm/idb@7/build/umd-with-async-ittr.js';

let db;

// Creates the database and table for music 
export async function createDatabase() {
    db = await openDB('musicStorage', 3, {
        upgrade(db) {

            const musicDb = db.createObjectStore('musicList', {keyPath: "id", autoIncrement: true,});

            musicDb.createIndex('music_name', 'name', {unique: true});

            // const playlistTable = db.createObjectStore('playlists', {keyPath: "id", autoIncrement: true,});
            db.createObjectStore('playlists', {autoIncrement: false,});         
        }
    });
}


// Gets the music from the add filepath or add song to store in the table 'musicList'
export async function set(name, byteLength, type){

    return (await db).put('musicList', {name: name, byteLength: byteLength, type: type});

}

// Gets the info from database but must open it first to use the features
export async function retrieve(){

    const dbGet = await openDB('musicStorage', undefined, {});
    
    const fetchMusic = dbGet.transaction('musicList');

    let allMusic = [];

    for await (const cursor of fetchMusic.store){
        allMusic.push(cursor.value); 
    }

    return allMusic;

}

// Will get one song from the database using the ID of the song selected
export async function getMusicToPlay(value){

    const musicInfo = await db.get('musicList', parseInt(value));

    return musicInfo;
}

// Puts music ID into playlists table musicInfo
export async function storeMusicIntoPlaylists(playlistName, valueId){

    const musicDatabase = await openDB('musicStorage', undefined, {});

    let arrayValues = [];

    let valueArray = await getKeyName(playlistName); // checks to see if there is no playlist with specified name in the database
    
    // If no name then push to array but if there is an array already will add to it
    if(valueArray == null){
        arrayValues.push(valueId);
    } else {

        arrayValues.push(valueId);

        for(let i = 0; i < valueArray.length; i++){
            // Checks to see if value of Music ID is already in database and then won't add it again
            if(valueArray[i] != valueId){

                arrayValues.push(valueArray[i]);

            } else if(valueArray[i] === valueId){ // Removes musicID from favorite if already in the database

                const indexValue = arrayValues.indexOf(valueId);
                
                arrayValues.splice(indexValue, 1);
                
            }
        }   
    }

    await musicDatabase.put('playlists', arrayValues, playlistName)

}

// For storeMusicIntoPlaylists function
async function getKeyName(keyName){

    const dbOpenCheck = await openDB('musicStorage', undefined, {});

    let arrayOfMusic = await dbOpenCheck.get('playlists', keyName);

    return arrayOfMusic; 
}

// Checks to see if music is in Favorite playlist and then makes color of heart the hover color
export async function getFromFavoritesColor(valueID){

    const dbOpen = await openDB('musicStorage', undefined, {});

    let arrayValueIDs = await dbOpen.get('playlists', 'Favorites');
    console.log(arrayValueIDs)
    console.log(valueID)

    //if(arrayValueIDs != undefined){
    if(arrayValueIDs != null && arrayValueIDs.includes(valueID.toString())){
        return true;
    } else {
        return false;
    }
   // } else {
    //    return false;
   // }

    
}

export async function retrieveMusicFromPlaylist(playlistName){

    const dbOpen = await openDB('musicStorage', undefined, {});

    let musicToDisplaySend = [];

    let playlistValues = await dbOpen.get('playlists', playlistName);

    for(let i = 0; i < playlistValues.length; i++) {
        musicToDisplaySend.push(await getMusicToPlay(playlistValues[i]));
    }
    
    return musicToDisplaySend;
}