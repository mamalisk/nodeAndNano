//setup Dependencies
var connect = require('connect')
    , express = require('express')
    , io = require('socket.io')
    , port = (process.env.PORT || 8081)
    , nano = require('nano')
    , IDProvider = require('./idprov/idProvider')

var idprov;

//Setup Express
var server = express.createServer();
server.configure(function(){
    server.set('views', __dirname + '/views');
    server.set('view options', { layout: false });
    server.use(connect.bodyParser());
    server.use(express.cookieParser());
    server.use(express.session({ secret: "shhhhhhhhh!"}));
    server.use(connect.static(__dirname + '/static'));
    server.use(server.router);

});

//setup the errors
server.error(function(err, req, res, next){
    if (err instanceof NotFound) {
        res.render('404.jade', { locals: { 
                  title : '404 - Not Found'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX' 
                },status: 404 });
    } else {
        res.render('500.jade', { locals: { 
                  title : 'The Server Encountered an Error'
                 ,description: ''
                 ,author: ''
                 ,analyticssiteid: 'XXXXXXX'
                 ,error: err 
                },status: 500 });
    }
});
server.listen( port);

//Setup Socket.IO
var io = io.listen(server);
io.sockets.on('connection', function(socket){
  console.log('Client Connected');
  socket.on('message', function(data){
    socket.broadcast.emit('server_message',data);
    socket.emit('server_message',data);
  });
  socket.on('disconnect', function(){
    console.log('Client Disconnected.');
  });
});


///////////////////////////////////////////
//              Routes                   //
///////////////////////////////////////////

/////// ADD ALL YOUR ROUTES HERE  /////////

server.get('/', function(req,res){
  res.render('index.jade', {
    locals : { 
              title : 'Your Page Title'
             ,description: 'Your Page Description'
             ,author: 'Your Name'
             ,analyticssiteid: 'XXXXXXX' 
            }
  });
});


server.get('/users',function(req,res){
    var username = 'user' + Math.random().toString();
    idprov.insertUser(FootmanUser(username,'P455w0rd',true))
           res.render('index.jade', {
               locals : {
                   title : 'User Created: ' + username
                   ,description: 'User Creation page'
                   ,author: 'mamalisk'
                   ,analyticssiteid: 'TBD'
               }
           });
});


//A Route for Creating a 500 Error (Useful to keep around)
server.get('/500', function(req, res){
    throw new Error('This is a 500 Error');
});

//The 404 Route (ALWAYS Keep this as the last route)
server.get('/*', function(req, res){
    throw new NotFound;
});

function NotFound(msg){
    this.name = 'NotFound';
    Error.call(this, msg);
    Error.captureStackTrace(this, arguments.callee);
}


console.log('Listening on http://0.0.0.0:' + port );
idprov = new IDProvider('http://localhost:5984','footmanusers')


// FOOTMAN USER

function FootmanUser(username, password, isAdmin){

    if(typeof username !== 'string') {
        throw new Error("Invalid string: " + username);
    }

    if(typeof password !== 'string') {
        throw new Error("Invalid string: " + password);
    }

    if(typeof isAdmin !== 'boolean') {
        throw new Error("Invalid boolean: " + isAdmin);
    }
    this.username = username
    this.password = password
    this.isAdmin = isAdmin
    return this;
}

FootmanUser.prototype = {
    username : 'user' + Math.random().toString(),
    password : 'P455w0rd',
    isAdmin : false
}

// Crockford's technique

var createObject = function (o) {
    function F() {}
    F.prototype = o;
    return new F();
};

