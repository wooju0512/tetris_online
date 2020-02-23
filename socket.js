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


var user1_score=0;
var user2_score=0;
var end_cnt=[];

var end_user=0;


var replay=[];
var replay_bool=false;
var replay_user=0;

io.on('connection', function(socket){ //3
  console.log('user connected: ', socket.id);  //3-1
  var name = "user" + count++;

  socket.on('disconnect', function(){ //3-2
    console.log('user disconnected: ', socket.id);
    count--;
    vote_count--;
    if(count==0){
      vote_list=[];
    }
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

    socket.on('replay',function(data){
      var replay_bool=false;
      for(i=0;i<replay.length;i++){
        if(replay[i]===data.user)
        replay_bool=true;
      }
      if(!replay_bool){
        replay.push(data.user);
        replay_user++;
      }
      console.log(replay+":"+replay_user);
      io.emit('replay_res',{'res':replay_user});
      if(replay_user==2){
        user1_score=0;
        user2_score=0;
        end_cnt=[];

        end_user=0;


        replay=[];
        replay_bool=false;
        replay_user=0;
      }
    });

    socket.on('score_info',function(data){
      var end_bool=false;
      for(i=0;i<end_cnt.length;i++){
        if(end_cnt[i]===data.user)
        end_bool=true;
      }
      if(!end_bool){
        end_cnt.push(data.user);
        end_user++;
      }
        if(data.user=='USER1'){
          user1_score=data.score;
        }
        else{
          user2_score=data.score;
        }
        if(end_user==2){
          io.emit('score_final',{'usr1':user1_score,'usr2':user2_score});
        }
    });
    socket.on('end',function(data){
      io.emit('res',data.score,data.user);
    });

  });


});
http.listen(3000, function(){ //4
  console.log('server on!');
});
