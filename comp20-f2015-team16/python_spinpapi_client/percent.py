# percent.py
# November 30, 2015
#
# Calculates genre percentage fields for each genre and genre pair
# for each show
#

import sys, pymongo

# Excludes 'count' and 'nodata'
GENRES = ['rock', 'pop', 'jazz', 'blues', 'hip-hop', 'classical', 
          'country', 'folk', 'world', 'reggae', 'funk', 'r&b/soul',
          'electronic', 'metal', 'nodata'] 


# Calculates and adds percentages to each genre and genre pair
def add_percentages(doc):
    total_songs = doc['count']
    nodata = doc['nodata']
    new_doc = doc.copy()
    for genre in doc:
        if not is_genre(genre):
            continue
        new_doc[genre + 'Percent'] = 100 * doc[genre] / float(total_songs) 
    return new_doc

# Returns a boolean of whether a string is a genre
def is_genre(string):
    return string in GENRES

# Takes two genre percentages and returns a combined rating for the two genres
def pair_rating(g1_percent, g2_percent):
    return (max(g1_percent, g2_percent) + 2 * min(g1_percent, g2_percent)) / 3

# Computes and add a rating for each pair of genres in a document
def add_pair_ratings(doc):
    new_doc = doc.copy()
    for genre1 in doc:
        if not is_genre(genre1):
            continue
        for genre2 in doc:
            if not is_genre(genre2) or genre1 == genre2:
                continue
            rating = pair_rating(doc[genre1 + 'Percent'], doc[genre2 + 'Percent'])
            new_doc[min(genre1, genre2) + '-' + max(genre1, genre2)] = rating
    return new_doc                            

def main(argv):
    mongodbClient = pymongo.MongoClient('mongodb://localhost/wfmo')
    db = mongodbClient.wfmo
    collection = db.genreData5
    docs = collection.find()
    for doc in docs:
        print doc['ShowName']
        new_doc = add_percentages(doc)
        new_doc = add_pair_ratings(new_doc)
        collection.find_one_and_update({'_id' : new_doc['_id']}, {'$set' : new_doc})
    
    # Scrapped-together code to insert all documents in local database to heroku database
    remoteMongodbClient = pymongo.MongoClient('')
    remote_db = remoteMongodbClient.heroku_wxwzx95m
    remote_collection = remote_db.genreData
    for doc in collection.find():
         remote_collection.insert(doc)

if __name__ == '__main__': main(sys.argv)
