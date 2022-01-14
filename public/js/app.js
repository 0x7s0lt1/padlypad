
App = {

    calc : 'freedom',
    screenSize : {},
    touch_pad : document.getElementById('touch-pad'),
    scroll_pad : document.getElementById('scroll-pad'),
    input_holder : document.getElementById('inputs'),
    text_input: document.getElementById('text-input'),
    fr_LastPos : {x : 0,y :0},
    scroll: {x:0,y:0},
    socket : {},
    
    init: function(){
        
        App.socket = io(window.location.href);
        App.touch_pad.style.height = (window.innerHeight - 50) + 'px';
        App.scroll_pad.style.height = (window.innerHeight - 50) + 'px';
        App.touch_pad.addEventListener('touchmove',App.onTouchMove,false);
        App.scroll_pad.addEventListener('touchmove',App.onScroll,false);
        window.addEventListener('dblclick',App.onDblClick,false);
        window.addEventListener('contextmenu',App.onContextMenu,false);
        document.getElementById('keyboard_btn').addEventListener('click',App.openKeyboard);
        document.getElementById('send-input').addEventListener('click',App.sendText);

        //App.text_input.addEventListener('blur',App.hideInput,false);
        App.text_input.addEventListener('keydown',App.specKeyHandler,false);

        App.socket.on('error',(err)=>{
            alert(JSON.stringify(err));
        });

        App.socket.on('initScreen',(screenSize)=>{
            App.screenSize = screenSize;
        });

    },

    makePercentage: function (_x,_y){

        return {
            x : (_x / parseInt(window.getComputedStyle(App.touch_pad).width)) * 100,
            y : (_y / parseInt(window.getComputedStyle(App.touch_pad).height)) * 100
        };

      },
    detectSwipeDirection : function (_x,_y){

        let dir = {x : '=',y:'='};

        if(App.fr_LastPos.x < _x){
            dir.x = '+';
        }else if(App.fr_LastPos.x > _x){
            dir.x = '-';
        }

        if(App.fr_LastPos.y < _y){
            dir.y = '+';
        }else if(App.fr_LastPos.y > _y){
            dir.y = '-';
        }

        App.fr_LastPos = {
            x : _x,
            y : _y
        };

        return dir;

    },  

    calcFreePos(){

    },


    onTouchMove: function(event){

        switch(App.calc){
            case 'percentage':
                App.socket.emit( 'mouseAction_percent', App.makePercentage( event.touches[0].clientX,event.touches[0].clientY ) );
            break;
            case 'freedom':
                App.socket.emit( 'mouseAction_freedom', App.detectSwipeDirection(event.touches[0].clientX,event.touches[0].clientY));
            break;
            case 'joystick':
                console.log('Mode:',"joystick");
                //App.socket.emit( 'MouseAction',App.makePercentage( event.touches[0].clientX,event.touches[0].clientY ) );
            break;
            case 'gamepad':
                console.log('Mode:',"gamepad");
                //App.socket.emit( 'MouseAction',App.makePercentage( event.touches[0].clientX,event.touches[0].clientY ) );
            break;

        }

    },
    onContextMenu: function(){
        App.socket.emit( 'rightClick',true);
        return false;
    },
    onDblClick: function(){
        App.socket.emit('click',true);
    },
    onScroll: function(event){
        if(event.touches[0].clientY > window.innerHeight / 2){
            App.scroll.y -= 5;
            App.socket.emit('scroll',App.scroll);
        }else{
            App.scroll.y += 5;
            App.socket.emit('scroll',App.scroll);
        }
    },
    openKeyboard: function(){
        App.input_holder.style.display = 'inline';
        App.text_input.focus();
        App.text_input.click();
    },
    hideInput : function(){
        App.input_holder.style.display = 'none';
    },
    tapKey : function(key){
        App.socket.emit('tapKey',key);
    },
    sendText: function(){
        
        App.socket.emit('sendText',App.text_input.value);
        App.text_input.value = "";
        App.text_input.blur();
        App.input_holder.style.display = 'none';
       
    },
    specKeyHandler : function(ev){
        
        if(App.text_input.value == "" && ev.keyCode == 8){
            App.tapKey('backspace');
        }
        else if(ev.keyCode == 13){
            App.tapKey('enter');
        }
    },



}

window.addEventListener('load',function(){
    
    App.init(); 

})

