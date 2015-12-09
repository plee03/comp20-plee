var express = require('express');
var bodyParser = require('body-parser');
var JSONStream = require('JSONStream');
var app = express();
var logins = ['mchow', 'kaytea', 'CindyLytle', 'BenHarris', 'JeremyMaletic', 'LeeMiller', 'EricDapper', 'RichRumfelt', 'VanAmmerman', 'VicJohnson', 'ErinHolleman', 'PatFitzgerald', 'CheriVasquez', 'HarleyRhoden', 'JanetGage', 'HarleyConnell', 'GlendaMaletic', 'JeffSoulen',
              'MarkHair', 'RichardDrake', 'CalvinStruthers', 'LeslieDapper', 'JefflynGage', 'PaulRamsey', 'BobPicky', 'RonConnelly', 'FrancieCarmody', 'ColleenSayers', 'TomDapper', 'MatthewKerr', 'RichBiggerstaff', 'MarkHarris', 'JerryRumfelt', 'JoshWright', 'LindyContreras',
              'CameronGregory', 'MarkStruthers', 'TravisJohnson', 'RobertHeller', 'CalvinMoseley', 'HawkVasquez', 'LayneDapper', 'HarleyIsdale', 'GaylaSoulen', 'MatthewRichards', 'RoyDuke', 'GaylaRodriquez', 'FrancieGeraghty', 'LisaLytle', 'ErinHair', 'CalvinGraham', 'VanRhoden',
              'KeithRumfelt', 'GlendaSmith', 'KathrynJohnson', 'FredVandeVorde', 'SheriMcKelvey', 'RoyMiller', 'PatIsdale', 'JoseRodriquez', 'KelleyRumfelt', 'JanetKinsey', 'RonCampbell', 'BenKerr', 'RobDennison', 'BobOwens', 'CherylLytle', 'LisaSoulen', 'TravisDuke',
              'CindyGregory', 'JoyceVandeVorde', 'MatthewScholl', 'RobJohnson', 'EricHawthorn', 'CameronRodriquez', 'JoshRamsey', 'CalvinDuke', 'SheriHeller', 'LeaAmmerman', 'LayneVasquez', 'IMConnell', 'BenHauenstein', 'ColleenKerr', 'HawkRichards', 'LeaIsdale', 'RickSoulen', 'RoyMcFatter',
              'KyleContreras', 'MaryHeller', 'KathrynFitzgerald', 'JanetRiedel', 'PatHawthorn', 'KeithHauenstein', 'BenRichards', 'RickVasquez', 'KelleyAmmerman', 'EvanConnelly', 'KendallRumfelt', 'TravisIsdale', 'RobContreras', 'JavierRussell', 'ColleenCampbell', 'JeremyConnelly',
              'BenKinsey', 'JanetScholl', 'PaulaLewis', 'LeslieMcFatter', 'MatthewMcAda', 'LeeMuilman', 'KyleMoseley', 'JeffRhoden', 'AnitaHolleman', 'JefflynMcKelvey', 'BobContreras', 'RobFitzgerald', 'BenJohnson'];


app.set('port', (process.env.PORT || 3000));

// see nodemongoexample from class
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// set up mongodb
var mongoUri = process.env.MONGOLAB_URI || 'mongodb://localhost/checkins';
var MongoClient = require('mongodb').MongoClient;
var db = MongoClient.connect(mongoUri, function(error, dbConnection) {
  db = dbConnection;
});

// serve static content
app.use(express.static(__dirname + '/public'));

//enable cross origin access
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

// views is directory for all template files
app.set('views', __dirname + '/views');
app.set('view engine', 'ejs');

// sendLocation API
app.post('/sendLocation', function(request, response) {
  error = {error: 'Whoops, something is wrong with your data!'};
  response.setHeader('Content-Type', 'application/json');
  if (!(request.body.login && request.body.lat && request.body.lng && request.body.message)) {
    return response.send(error);
  }

  if ((!isNumeric(request.body.lat)) || (!isNumeric(request.body.lng))) {
    return response.send(error);
  }

  if (logins.indexOf(request.body.login) < 0) {
    return response.send(error);
  }

  var newcheckin = request.body;
  newcheckin['created_at'] = Date();

  db.collection('checkins').insert(newcheckin);
  var all_checkins = db.collection('checkins').find();
  all_checkins.toArray(function(err, cursor) {
    if (!err) {
      response.json(cursor);
    }
  });
});

//get latest submission for a specific login
app.get('/latest.json', function(request, response) {
  response.setHeader('Content-Type', 'application/json');
  var req_login = request.query.login;
  if (req_login == undefined) {
    return response.send({});
  }

  var item = db.collection('checkins').find({'login': req_login}).sort({'created_at': -1}).limit(1);
  item.toArray(function(err, cursor) {
    if (!err) {
      if (cursor.length == 0) {
        return response.send({});
      } else {
        response.json(cursor[0]);
      }
    }
  });
});

// get homepage, returns html
app.get('/', function(request, response) {
  response.setHeader('Content-Type', 'text/html');
  var checkin_data = db.collection('checkins').find().sort({'created_at': -1});
  checkin_data.toArray(function(err, cursor) {
    if (!err) {
      var response_txt = '';
      response_txt += "<!DOCTYPE HTML><html><head><title>MapChat Server</title></head><body><h1>List of Logins and Data:</h1>";
      for (count = 0; count < cursor.length; count++) {
        response_txt += '<p>' + cursor[count].login + ' logged in at '
                         + cursor[count].created_at + ' from ' + cursor[count].lat
                         + ', ' + cursor[count].lng + ' and says: ' +
                         cursor[count].message + '</p>';
      }
      response_txt += "</body></html>";
      response.send(response_txt);
    }
  });
});

// serve static content at '/ReadMe'
app.get('/README', function(request, response) {
  response.sendFile(__dirname + '/public/README.md');
});

// http://stackoverflow.com/questions/18082/validate-numbers-in-javascript-isnumeric
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

app.listen(app.get('port'));
