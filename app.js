const express=require('express');
const socket=require('socket.io');
const http=require('http');
const {Chess} = require('chess.js');
const path = require('path');

const app=express();//create an express app
const server=http.createServer(app);//create a server linking express server to http server
const io=socket(server);//create a socket server upgrading the http server to a socket server

const chess = new Chess();//for implementing everything related to chess through chess.js
let players = {};//to store the players colur selection;
let curentPlayer = 'w';
app.set('view engine','ejs');//set the view engine to ejs
app.use(express.static(path.join(__dirname,'public')));//to serve static files

app.get('/',(req,res)=>{
    res.render('index');
});

io.on('connection',(socket)=>{
    console.log(`Socket connected: ${socket.id}`);
   
    if(!players.white){
        players.white = socket.id;
        socket.emit('playerRole','w');
    }
    else if(!players.black){
        players.black = socket.id;
        socket.emit('playerRole','b');
    }
    else{
        socket.emit('spectator');
    }

    socket.on('move',(move)=>{
    try{
        if(chess.turn()==='w'&& socket.id!==players.white) return;
        if(chess.turn()==='b'&& socket.id!==players.black) return;

        const Result = chess.move(move);
        if(Result){
            curentPlayer = chess.turn();
            io.emit('move',move);
            io.emit('boardState',chess.fen());
        }
        else{
            console.log("Invalid Move");
            socket.emit("invalidMove",move);
        }
    }
    catch(error){
        console.log(error);
        socket.emit("invalidMove",move);
    }
        
    });
    socket.on('disconnect',()=>{
        if(players.white === socket.id){
            delete players.white;
        }
        if(players.black === socket.id){
            delete players.black;
        } 
    });
   
});
server.listen(4000,()=>{
    console.log("Server is running on port 3000");
})