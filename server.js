const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

app.get('/', function(req, res){
 res.sendFile(__dirname + '/index.html');
});

const activeUsers = {};

io.on('connection', function(socket){
 console.log('A user connected');

 const username = socket.handshake.query.username;
 const sessionId = socket.handshake.query.sessionId;
 if (username) {
   socket.username = username;
   activeUsers[username] = true;

   if (!activeUsers[username]) {
     io.emit('chat message', { user: 'System', message: `${username} has joined the chat!` });
   }

   console.log(`User ${username} connected with session ID: ${sessionId}`);
 } else {
   console.log('Anonymous user connected');
 }

 if (username && activeUsers[username]) {
   io.emit('chat message', { user: 'System', message: `${username} has joined the chat!` });
 }

 socket.on('chat message', function(data){
   io.emit('chat message', { user: socket.username, message: data.message });
 });

 socket.on('disconnect', function(){
   if (socket.username && activeUsers[socket.username]) {
     io.emit('chat message', { user: 'System', message: `${socket.username} has left the chat.` });
     activeUsers[socket.username] = false;
   }
   console.log('user disconnected');
 });

 socket.emit('session id', socket.id);
});

http.listen(3000, function(){
 console.log('listening on *:3000');
});
