var socket = io()
var canvas = document.getElementById("canvas")
var ctx = canvas.getContext('2d')
ctx.font = '30px Arial'

//event listeners for keypresses
document.addEventListener('keydown', keyPressDown)
document.addEventListener('keyup', keyPressUp)

//keypress down function
function keyPressDown(e) {
    //up
    if (e.keyCode === 38) {
        socket.emit('keypress', {
            inputId:'up',
            state:true
        })
    }
    //down
    else if (e.keyCode === 40) {
        socket.emit('keypress', {
            inputId:'down',
            state:true
        })
    }
    //left
    else if (e.keyCode === 37) {
        socket.emit('keypress', {
            inputId:'left',
            state:true
        })
    }
    //right
    else if (e.keyCode === 39) {
        socket.emit('keypress', {
            inputId:'right',
            state:true
        })
    }
}

//keypress up function
function keyPressUp(e) {
    //up
    if (e.keyCode === 38) {
        socket.emit('keypress', {
            inputId:'up',
            state:false
        })
    }
    //down
    else if (e.keyCode === 40) {
        socket.emit('keypress', {
            inputId:'down',
            state:false
        })
    }
    //left
    else if (e.keyCode === 37) {
        socket.emit('keypress', {
            inputId:'left',
            state:false
        })
    }
    //right
    else if (e.keyCode === 39) {
        socket.emit('keypress', {
            inputId:'right',
            state:false
        })
    }
}

socket.on('newPosition', function(data) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for(var i = 0; i < data.length; i++) {
        ctx.fillText(data[i].number, data[i].x, data[i].y)
    }
})

//old code ----------------------------------------------
// var msg = function() {
//     socket.emit('sendBtnMsg', {
//         message:'Sending message from button'
//     })
// }

//     socket.emit('sendMsg', {
//         message:'Hello'
//     })

// socket.on('messageFromServer', function(data) {
//     console.log(data.message)
// })