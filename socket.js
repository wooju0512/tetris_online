var express = require('express');
var app = express();
var http = require('http').Server(app); //1
var io = require('socket.io')(http);    //1

app.get('/',function(req, res){  //2
  res.sendFile(__dirname + '/tetris.html');
});
var vote_list=[];
var count=0;
var vote_count=0;
var map1=[];
var map2=[];
var user1_cnt=0;
var user2_cnt=0;

io.on('connection', function(socket){ //3
  console.log('user connected: ', socket.id);  //3-1
  var name = "user" + count++;

  socket.on('disconnect', function(){ //3-2
    console.log('user disconnected: ', socket.id);
    count--;
  });
  console.log('User Count :'+count);

  socket.emit('acount',count);
  var isExist = false;
  var end_add_line=1;
  socket.on('vote',function(data){
    for(i = 0 ; i<vote_list.length ; i++){
        if(vote_list[i] === data){
            isExist = true;
        }
    }
    if(!isExist){
      vote_count++;
      console.log(data+'is vote now');
      vote_list.push(data);
      console.log(vote_list);
      if(vote_count==2){
        console.log('유저 2명이 접속했습니다.');
        io.emit('UserCnt',count);
      }
    }
    else{
      console.log(data+'is already vote now');
      socket.emit('Server','이미 준비 하셨습니다.');
    }
    socket.on('map',function(data){
      if(data.user=='USER1'){
        map1=data.map;
        socket.emit('USER2',{'map':map2,'line':data.line});
      }
      else if(data.user=='USER2'){
        map2=data.map;
        socket.emit('USER1',{'map':map1,'line':data.line});
      }
    });
    socket.on('endline',function(data){
        io.emit('end_line',end_add_line);
        console.table(map2);
    });

    socket.on('end',function(data){
      io.emit('res',data.score,data.user);
    });

  });


});
http.listen(3000, function(){ //4
  console.log('server on!');
});
