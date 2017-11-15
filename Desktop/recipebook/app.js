var express= require('express'),
    path =require('path'),
    bodyParser =require('body-parser'),
    cons =require('consolidate'),
    dust =require('dustjs-helpers'),
    pg =require('pg'),
    push = require('get-push'),
    app =express();


    //connecting to database
    var PGUSER = 'admin';
    var PGPASSWORD = '1234';
    var PGDATABASE = 'recipebookdb';
    //var connect = "postgres:/admin:1234@localhost/recipebookdb";
    var config = {
        user: PGUSER, // name of the user account
        password: PGPASSWORD, // password of the user account
        database: PGDATABASE, // name of the database
        max: 10, // max number of clients in the pool
        idleTimeoutMillis: 30000 // how long a client is allowed to remain idle before being closed
    }
    var pool = new pg.Pool(config)

    //assign dust engine to dust files
    app.engine('dust',cons.dust);
    //set default extension dust
    app.set('view engine','dust');
    app.set('views',__dirname +'/views');

    //set public folder
    app.use(express.static(path.join(__dirname,'public')));

    //body parser middleware
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false}));

    app.get('/',function(req,res){
        //console.log('test')
        //res.render('index');
        pool.connect(function(err,client,done){
            if(err){
                return console.error('error fetching  client from pool',err);
            }
            client.query("Select * from recipe",function(err,result){
                if(err){
                    return console.error('error running query',err);
                }
                res.render('index',{recipe:result.rows});
                done(); //release client back to pool
            });
        });
    });

    // handle post
    app.post('/add',function(req,res){
        pool.connect(function(err,client,done){
            if(err){
                return console.error('error fetching  client from pool',err);
            }
            client.query("insert into recipe(name,ingredients,directions) values($1,$2,$3)",[req.body.name,req.body.ingredients,req.body.directions],function(err,result){
                if(err){
                    return console.error('error running query',err);
                }
                done(); //release client back to pool
                res.redirect('/');
            });
        });

    });



    //server
    app.listen(3000,function(){console.log('server started on port 3000')});


