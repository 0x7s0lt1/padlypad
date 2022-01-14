#! /usr/bin/env node


const express = require('express');
const io = require('socket.io');
const robot = require('robotjs');
const chalk = require('chalk');
const ip = require('ip');
const qrcode = require('qrcode-terminal');
var app = express();

app.use(express.static('public'));

//console.log(process.argv);

var server = app.listen(4444,()=>{
    //console.log(logo);
    qrcode.generate('http://'+ip.address()+':4444 ', {small: true});
    console.log(chalk.bgBlack(chalk.green(' Mouse server runing on : http://'+ip.address()+':4444 ')));
});

var UPserver = io(server,{
    cors:{
        origin : '*',
    }
});


robot.setMouseDelay(2);
var screenSize = robot.getScreenSize();
var fr_lastPos = {x : screenSize.width / 2,y : screenSize.height / 2};

UPserver.on('connection',(socket)=>{


    console.log(time()+chalk.bgGreen(' Connected: ',socket.request.connection.remoteAddress + " "));

    socket.emit('initScreen',screenSize);
    
    socket.on('mouseAction_percent',(mouse)=>{
        robot.moveMouse((screenSize.width / 100) * mouse.x, (screenSize.height / 100) * mouse.y); 
    });
    socket.on('mouseAction_freedom',(mouse)=>{
        getFreedomPos(mouse);
    });
    socket.on('scroll',(scroll)=>{
        console.log(scroll);
        //robot.scrollMouse(scroll.x,scroll.y);

        if(scroll == 'up'){
            robot.keyTap('pageup');
        }else{
            robot.keyTap('pagedown');
        }
    })
    socket.on('click',(mouse)=>{
        robot.mouseClick();
    });
    socket.on('rightClick',(mouse)=>{
        robot.mouseClick('right');
    });
    socket.on('sendText',(text)=>{
        robot.typeString(text);
    });
    socket.on('tapKey',(key)=>{
        robot.keyTap(key);
    });
    socket.on('tapKeyCombo',(data) =>{
        robot.keyTap(data.key,data.array);
    })
    socket.on('error',(err)=>{
        console.log(time()+chalk.red(err));
    })   







    socket.on('disconnect',()=>{
        console.log(time()+chalk.bgYellow(chalk.black('Disconnection: ',socket.request.connection.remoteAddress)));
    })


});


function getFreedomPos(obj){
    
    if(obj.x == "+" ){
        fr_lastPos.x += 10;
    }else if(obj.x == "-"){
        fr_lastPos.x -= 10;
    }
    if(obj.y == '+'){
        fr_lastPos.y += 10;
    }else if(obj.y == '-'){
        fr_lastPos.y -= 10;
    }

    borderPatrol();

}

function borderPatrol(){


    if(fr_lastPos.x > screenSize.width){
        fr_lastPos.x = screenSize.width;
    }else if(fr_lastPos.x < 0){
        fr_lastPos.x = 0;
    }
    if(fr_lastPos.y > screenSize.height){
        fr_lastPos.y = screenSize.height;
    }else if(fr_lastPos.y < 0){
        fr_lastPos.y = 0;
    }

    robot.moveMouse(fr_lastPos.x,fr_lastPos.y);

}

function time(){
    return "["+new Date().toLocaleString()+"] ";
}