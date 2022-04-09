import { openDB } from './node_modules/idb/with-async-ittr.js';

// Creates the database and table for music 
const db = openDB('musicStorage', 3, {
    upgrade(db){
        
        const musicDb = db.createObjectStore('musicList', {keyPath: "id", autoIncrement: true,});

        musicDb.createIndex('music_name', 'name', {unique: true});

        db.createObjectStore('playlists', {autoIncrement: false,});              
    }
});


// Gets the music from the add filepath or add song to store in the table 'musicList'
export async function setMusicValue(name, byteLength, type){

    const transactionMusic = (await db).transaction('musicList', 'readwrite');

    try{

        await Promise.all([transactionMusic.store.put(
            {name: name, byteLength: byteLength, type: type}),
            transactionMusic.done,
        ]);

    } catch(error){
        return false;
    }
    return true;
}

// Gets the info from database but must open it first to use the features
export async function retrieveAllMusicInfo(){

    const fetchMusic = (await db).transaction('musicList');

    let allMusic = [];

    for await (const cursor of fetchMusic.store){
        allMusic.push(cursor.value); 
    }

    return allMusic;

}

// Will get one song from the database using the ID of the song selected
export async function getMusicToPlay(value){

    let valueID = await value;

    if(valueID.length != 0){
        if(valueID.length > 1){
            return (await db).getAll('musicList');
        } else {
            return (await db).get('musicList', parseInt(valueID[0]));
        }
    }

    // return musicInfo;
}

// Puts music ID into playlists table musicInfo and for making of playlists
export async function storeMusicIntoPlaylists(playlistName, valueId){

    let arrayValues = [];

    let inPlaylistCount = false;

    let valueArray = await checksForPlaylist(playlistName); // checks to see if there is no playlist with specified name in the database
    
    // If no name then push to array but if there is an array already will add to it
    if(valueArray != null && valueId != null){
        arrayValues.push(valueId);
        valueArray.map(value => {
            if(value != valueId){
                // Checks to see if value of Music ID is already in database and then won't add it again
                arrayValues.push(value);
    
            } else if(value === valueId && playlistName === "Favorites"){ // Removes musicID from favorite if already in the database
    
                const indexValue = arrayValues.indexOf(valueId);
                    
                arrayValues.splice(indexValue, 1);
                
            } else if(value === valueId) { // If music already in playlist will send bool true back                  
                inPlaylistCount = true;                                 
            }
        })
    }

    (await db).put('playlists', arrayValues, playlistName);

    // This checks to see if music is being added Favorites playlist
    if(playlistName === "Favorites"){
        return getFavoritesIDs(valueId);
    }

    return inPlaylistCount;
}

// Will remove song from playlist 
export async function removeMusicFromPlaylist(musicId, playlistName) {

    let array = await (await db).get('playlists', playlistName); // Gets array of music from database
    
    const indexValue = array.indexOf(musicId);

    array.splice(indexValue, 1); // Removes ID of music from array
   
    (await db).put('playlists', array, playlistName);

}

// For storeMusicIntoPlaylists function
async function checksForPlaylist(keyName){
    
    let arrayOfMusic = await (await db).get('playlists', keyName);

    if(arrayOfMusic == null && keyName === "Favorites") {
        (await db).put('playlists', [], "Favorites");  
        return [];
    }
    return arrayOfMusic; 
}

// Checks to see if music is in Favorite playlist 
export async function getFavoritesIDs(valueID){

    let arrayValueIDs = await (await db).get('playlists', 'Favorites');
   
    if(arrayValueIDs != null){
        if(arrayValueIDs != null && arrayValueIDs?.includes(valueID.toString())){
            return true;
        } else {
            return false;
        }
    } else {
        return false;
    }
}

// Retrieves playlists table Keys
export async function getPlaylistNames(){ 

    let array = await (await db).getAllKeys('playlists'); // Gets all the key names from the table

    const favIndex = array.indexOf('Favorites');
    array.splice(favIndex, 1); // Removes Favorites playlist from displaying
    
    let arrayReturn = Promise.all(array.map(async value =>  {
        
        let innerArray = [];
        innerArray.push(value);
              
        let count = await (await db).getAll('playlists', value);     
         
        innerArray.push(count[0].length);// The amount of songs in each playlist

        return innerArray;
    }))
    
    return await arrayReturn;
}

export async function retrieveMusicFromPlaylist(playlistName){

    let musicToDisplaySend = [];

    let playlistValues  = await (await db).get('playlists', playlistName); // Fetches music from selected playlist

    let allMusicFetched = await getMusicToPlay(playlistValues);
    
    if(allMusicFetched == null){
        return musicToDisplaySend;
    } else if(allMusicFetched.id == playlistValues[0]){
        musicToDisplaySend.push(allMusicFetched)
    } else {
        for(let i = 0; i < playlistValues.length; i++) {
    
            for(let j = 0; j < allMusicFetched.length; j++){
                if(allMusicFetched[j].id == playlistValues[i]){
                    musicToDisplaySend.push(allMusicFetched[j])
                }
            }
        }
    }

    return musicToDisplaySend;
}

// Deletes playlist from database table playlists
export async function deleteKey(keyValue){
    return (await db).delete('playlists', keyValue);
}

export async function deleteMusicDb(valueId){
    const tx = (await db).transaction('musicList', 'readwrite');
    const index = tx.store;
    
    await index.delete(valueId);
    //tx.done;
    
}