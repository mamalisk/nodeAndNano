var nanoProv = require('nano')

var IDProvider = function(url, database){
    nanoProv = nanoProv(url)
    console.log('Creating database:'  + database);
    nanoProv.db.create(database, function () {
        this.users = nanoProv.db.use(database);
    });
    console.log('Database created on: ' + url)
    return this;
}

IDProvider.prototype = {
    url: 'http://localhost:5984',
    database: 'footmanusers',
    nanoProv : nanoProv('http://localhost:5984'),

    insertUser: function(footmanUser){

        try {nanoProv.db.use(this.database).insert({username : footmanUser.username, password: footmanUser.password, admin : footmanUser.isAdmin}
           , footmanUser.username, function(err, body) {
                if(err) { console.log('[footman.db] Error Message: ', err.message); return; }
                console.log(body);
        });} catch(err){
            console.log("[footman.db] Error occured while running: \n" + err.message)
        }
    }
}

module.exports = exports = IDProvider