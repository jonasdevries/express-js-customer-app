var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');
var expressValidator = require('express-validator');
var mongojs = require('mongojs');
var db = mongojs('mongodb://sa:sas@ds139899.mlab.com:39899/express-js-customer-app', ['customer']);
var ObjectId = mongojs.ObjectId;

var app = express();
var port = 3000;

/*
var logger = function(req, res, next){
    console.log('Logging...');
    next();
};
app.use(logger);
*/

// Body Parser Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:false}));

// Set Static Path
app.use(express.static(path.join(__dirname, 'public')));

// Global Vars
app.use(function(req, res, next){
    res.locals.errors = null;
    next();
});

// Express Validiator Middleware
app.use(expressValidator({
  errorFormatter: function(param, msg, value) {
      var namespace = param.split('.')
      , root        = namespace.shift()
      , formParam   = root;

    while(namespace.length) {
      formParam += '[' + namespace.shift() + ']';
    }
    return {
      param : formParam,
      msg   : msg,
      value : value
    };
  }
}));

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

/*
var people = [
    {
    name:'Jeff',
    age:30
    },
    {
    name:'Sarah',
    age:31
    },
    {
    name:'Mike',
    age:32
    }
];

app.get('/', function(req, res){
    res.json(people);
});
*/

var users = [
    {
    id:1,
    first_name: 'John',
    last_name: 'Doe',
    email: 'john@gmail.com'
    },
    {
    id:2,
    first_name: 'Bob',
    last_name: 'Smith',
    email: 'bob@gmail.com'
    },
    {
    id:3,
    first_name: 'Jill',
    last_name: 'Jackson',
    email: 'jill@gmail.com'
    }
];

app.get('/', function(req, res){ 
    // find everything
    /*db.users.find(function (err, docs) {
        console.log(docs);
        res.render('index',  {
            title: 'Customers',
            users: docs
        });
    });*/

    res.render('index', {
        title: 'Customers',
        users: users
    });
});

app.post('/users/add', function(req, res){

    req.checkBody('first_name', 'First Name is Required').notEmpty();
    req.checkBody('last_name', 'Last  Name is Required').notEmpty();
    req.checkBody('email', 'Email is Required').notEmpty();

    var errors = req.validationErrors();
        if(errors){
            res.render('index', {
                title: 'Customers',
                users: users,
                errors: errors            
            });
    } else {        
        var newUser = {
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email
        }
        db.users.insert(newUser, function(err, result){
            if(err){
                console.log(err);
            } 
            res.redirect('/');
            
        });
        console.log('success');
    }
    
});

app.post('/users/delete/:id', function(req, res){
    console.log(req.params.id);
    db.users.remove({_id: ObjectId(req.params.id)}, function(err, result){
        if(err){
            console.log(err);
        }
        res.redirect('/');
    });
});    

app.listen(port, function(){
    console.log('Server started on '+port);
});