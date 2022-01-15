
App = {

    calc : 'linearPointerEvent',
    screenSize : {},
    touch_pad : document.getElementById('touch-pad'),
    scroll_pad : document.getElementById('scroll-pad'),
    input_holder : document.getElementById('inputs'),
    text_input: document.getElementById('text-input'),
    fr_LastPos : {x : 0,y :0},
    socket : {},
    keyModifiers : [],
    
    init: function(){
        
        App.socket = io(window.location.href);
        App.touch_pad.style.height = (window.innerHeight - 50) + 'px';
        App.scroll_pad.style.height = (window.innerHeight - 50) + 'px';
        App.touch_pad.addEventListener('touchmove',App.onTouchMove,false);
        //App.scroll_pad.addEventListener('touchend',App.onScroll,false);
        App.scroll_pad.addEventListener('scroll',App.onScroll,false)
        window.addEventListener('dblclick',App.onDblClick,false);
        window.addEventListener('contextmenu',App.onContextMenu,false);
        document.getElementById('keyboard_btn').addEventListener('click',App.openKeyboard);
        document.getElementById('send-input').addEventListener('click',App.sendText);
        document.getElementById('pointer_btn').addEventListener('click',App.hideInput,false);
        
        //App.text_input.addEventListener('blur',App.hideInput,false);
        App.text_input.addEventListener('keydown',App.specKeyHandler,false);

        document.querySelectorAll('.spec').forEach(e=>{
            e.addEventListener('click',App.modifierListener);
        });

        App.socket.on('error',(err)=>{
            alert(JSON.stringify(err));
        });
        App.socket.on('connect', function () {
            document.querySelector('.connection_error').style.display = 'none';
         });
        App.socket.on('disconnect', function () {
            document.querySelector('.connection_error').style.display = 'block';
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

    requestFullScreen : function(event){
        event.preventDefault();
        event.stopPropagation();

        var docelem = document.documentElement;
            if (docelem.requestFullscreen) {
                docelem.requestFullscreen();
            }
            else if (docelem.msRequestFullscreen) {
                docelem.msRequestFullscreen();
            }
            else if (docelem.mozRequestFullScreen) {
                docelem.mozRequestFullScreen();
            }
            else if (docelem.webkitRequestFullScreen) {
                docelem.webkitRequestFullScreen();
            }

    },
    onTouchMove: function(event){

        switch(App.calc){
            case 'percentage':
                App.socket.emit( 'mouseAction_percent', App.makePercentage( event.touches[0].clientX,event.touches[0].clientY ) );
            break;
            case 'linearPointerEvent':
                App.socket.emit( 'mouseAction_freedom', App.detectSwipeDirection(event.touches[0].clientX,event.touches[0].clientY));
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
        
        //console.log(event);
        //console.log('innerHeight:',event.target.offsetHeight);
        //console.log('ScrollHeight:',event.target.scrollHeight);
        //console.log('ScrollTop:',event.target.scrollTop);
        //console.log('ClientHeight:',event.target.clientHeight);
        //console.log('Calc:',event.target.scrollHeight - event.target.scrollTop);

    
        if(event.target.scrollTop <= 50){

            App.scroll_pad.insertBefore(App.scroll_pad.lastElementChild,App.scroll_pad.firstElementChild);
           
        }if(event.target.scrollHeight - event.target.scrollTop <= event.target.clientHeight + 100){

            App.scroll_pad.appendChild(App.scroll_pad.firstElementChild);

        }

        /*
        if(event.touches[0].clientY > window.innerHeight / 2){  
            App.tapKey('pageup')
        }else{
            App.tapKey('pagedown');
        }
        */
        
    },
    openKeyboard: function(){
        App.input_holder.style.display = 'inline';
        App.text_input.focus();
        App.text_input.click();
    },
    hideInput : function(clear){
        if(clear){
            App.text_input.value = "";
            App.text_input.blur();
        }
        App.input_holder.style.display = 'none';
    },
    tapKey : function(key){
        App.socket.emit('tapKey',key);
    },
    sendText: function(){
        
        if(App.keyModifiers.length > 0 && App.text_input.value.length === 1){
            App.socket.emit('tapKeyCombo',{
                key : App.text_input.value,
                array : App.keyModifiers
            });
            return;
        }
        App.socket.emit('sendText',App.text_input.value);
        App.hideInput(true);
       
    },
    specKeyHandler : function(ev){
        
        if(App.text_input.value == "" && ev.keyCode == 8){
            App.tapKey('backspace');
        }
        else if(ev.keyCode == 13){
            App.tapKey('enter');
        }
    },
    removeModifier : function(key){

        App.keyModifiers = App.keyModifiers.filter(e=>{
            return e != key;
        });
    },
    addMofier : function(key){
        if(App.addMofier[key] == undefined){
            App.keyModifiers.push(key);
        }
    },
    modifierListener : function(event){

        if(App.keyModifiers.includes(event.target.dataset.key) ){
            App.removeModifier(event.target.dataset.key);
            event.target.classList.remove('spec_selected');
        }else{
            App.addMofier(event.target.dataset.key);
            event.target.classList.add('spec_selected');
        }
        
    },



}

window.addEventListener('DOMContentLoaded',App.init,false);
