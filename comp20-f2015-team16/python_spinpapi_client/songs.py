# songs.py
# November 23, 2015
# 
# Updates the database of song genre data.
#
# Note: Depends on the pylast module. See https://github.com/pylast/pylast
#

import sys, requests, pylast, pymongo
from SpinPapiClient import SpinPapiClient
from time import sleep

# Uses Spinpapi API to get the current regular scheduled shows. Returns as
# a list of shows.
def get_shows(sp_client):
    query = sp_client.query({'method' : 'getRegularShowsInfo'})
    r = requests.get(query)
    jsondata = r.json()
    return jsondata['results']

# Given a show tuple, returns its show ID
def show_id(show):
    return show['ShowID']

# Given a SpinPapi client and a showID, returns num_playlists most recent 
# playlists
def get_playlists(sp_client, showID, num_playlists):
    
    query = sp_client.query({'method' : 'getPlaylistsInfo', 
                             'ShowID' : str(showID),
                             'Num' : str(num_playlists)})
    r = requests.get(query)
    jsondata = r.json()
    return jsondata['results']

# Given a playlist metadata tuple, returns the playlistID
def playlist_id(playlist):
    return playlist['PlaylistID']

# Uses Spinpapi API to get a playlist given it's playlist ID.
def get_songs(sp_client, playlistID):
    query = sp_client.query({'method' : 'getSongs', 'PlaylistID' : str(playlistID)})
    r = requests.get(query)
    jsondata = r.json()
    return jsondata['results']

# Returns the name of a Last.fm song
def song_name(song):
    return song['SongName']

# Returns the artist of a Last.fm song
def song_artist(song):
    return song['ArtistName']

# Matches tags to genres and matching tags and increments genre counts.
# Increments noData if none of the tags matched.
def match_tags(tags, genreData):
    tagMatch = False
    matchedTags = set([])
    for tag in tags:
        cleanTag = tag[0].get_name().lower()
        if cleanTag in genreData:
            if cleanTag in matchedTags:
                continue
            genreData[cleanTag] += 1
            matchedTags.add(cleanTag)
            tagMatch = True
        elif cleanTag in MATCHINGTAGS:
            if MATCHINGTAGS[cleanTag] in matchedTags:
                continue
            genreData[MATCHINGTAGS[cleanTag]] += 1
            matchedTags.add(MATCHINGTAGS[cleanTag])
            tagMatch = True
    if not tagMatch:
        genreData['nodata'] += 1
    return genreData

# Runs a track through the tag matching process
def process_track(track, genreData):
    genreData['count'] += 1
    #print track
    try:
        tags = track.get_top_tags(TAGSLIMIT)
    except: 
        print "Not Found"
        genreData['nodata'] += 1
    else:
        genreData = match_tags(tags, genreData)
    return genreData

# Returns a genreData dictionary with appropriate show metadata given a show
def initialize_showdata(show):
    genreData = {genre : 0 for genre in GENRES}
    genreData['ShowName'] = show['ShowName']
    genreData['ShowId'] = show_id(show)
    genreData['ShowDJ'] = map(lambda dj : dj['DJName'], show['ShowUsers'])
    genreData['Days'] = show['Weekdays']
    genreData['OnairTime'] = show['OnairTime']
    genreData['OffairTime'] = show['OffairTime']
    return genreData


GENRES = ['rock', 'pop', 'jazz', 'blues', 'hip-hop', 'classical', 
          'country', 'folk', 'world', 'reggae', 'funk', 'r&b/soul',
          'electronic', 'metal', 'nodata', 'count']
MATCHINGTAGS = {'hip hop' : 'hip-hop', 'rap' : 'hip-hop', 'r&b' : 'r&b/soul', 
                'soul' : 'r&b/soul', 'kpop' : 'world', 'jpop' : 'world',
                'ethnic' : 'world', 'latin' : 'world', 'asian' : 'world',
                'african' : 'world', 'traditional' : 'world', 
                'techno' : 'electronic', 'house' : 'electronic',
                'trap' : 'hip-hop', 'edm' : 'electronic', 'funky' : 'funk'}
TAGSLIMIT = 30

def main(argv):
    client = SpinPapiClient('', '', '')
    lastFM = pylast.LastFMNetwork(api_key = '')
    mongodbClient = pymongo.MongoClient('mongodb://localhost/wfmo')
    db = mongodbClient.wfmo
    collection = db.genreData5

    # Gets shows
    shows = get_shows(client)
    for show in shows:
        sid = show_id(show) 
        showName = show['ShowName']
        if showName == "":
            continue
            continue
        genreData = initialize_showdata(show)
        
        # Gets playlist IDs
        playlists = get_playlists(client, sid, 99)
        if playlists == None:
            continue
        playlist_ids = map(playlist_id, playlists)

        for pid in playlist_ids:
            try:
                songs = get_songs(client, pid) 
            except:
                sleep(30)
                songs = get_songs(client, pid)
            if songs == None:
                continue
            for song in songs:
                track = lastFM.get_track(song_artist(song), song_name(song))
                genreData = process_track(track, genreData)
            print "------------------------------------------------------"
            print genreData
        collection.insert(genreData)

if __name__ == '__main__': main(sys.argv)
