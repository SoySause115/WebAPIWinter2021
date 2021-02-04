var socket = io()
var canvas = document.getElementById("canvas")
var ctx = canvas.getContext('2d')
var chatText = document.getElementById('chat-text')
var chatInput = document.getElementById('chat-input')
var chatForm = document.getElementById('chat-form')
ctx.font = '30px Arial'

//event listeners for keypresses and mouse clicks
document.addEventListener('keydown', keyPressDown)
document.addEventListener('keyup', keyPressUp)
document.addEventListener('mousedown', mouseDown)
document.addEventListener('mouseup', mouseUp)
document.addEventListener('mousemove', mouseMove)

//keypress down function
function keyPressDown(e) {
    //up
    if (e.keyCode === 87) {
        socket.emit('keypress', {
            inputId:'up',
            state:true
        })
    }
    //down
    else if (e.keyCode === 83) {
        socket.emit('keypress', {
            inputId:'down',
            state:true
        })
    }
    //left
    else if (e.keyCode === 65) {
        socket.emit('keypress', {
            inputId:'left',
            state:true
        })
    }
    //right
    else if (e.keyCode === 68) {
        socket.emit('keypress', {
            inputId:'right',
            state:true
        })
    }
}

//keypress up function
function keyPressUp(e) {
    //up
    if (e.keyCode === 87) {
        socket.emit('keypress', {
            inputId:'up',
            state:false
        })
    }
    //down
    else if (e.keyCode === 83) {
        socket.emit('keypress', {
            inputId:'down',
            state:false
        })
    }
    //left
    else if (e.keyCode === 65) {
        socket.emit('keypress', {
            inputId:'left',
            state:false
        })
    }
    //right
    else if (e.keyCode === 68) {
        socket.emit('keypress', {
            inputId:'right',
            state:false
        })
    }
}

function mouseDown(e) {
    socket.emit('keypress', {
        inputId:'attack',
        state:true
    })
}

function mouseUp(e) {
    socket.emit('keypress', {
        inputId:'attack',
        state:false
    })
}
function mouseMove(e) {
    var x = -canvas.width / 2 + e.clientX - 8
    var y = -canvas.height / 2 + e.clientY - 8
    var angle = Math.atan2(y, x) / Math.PI * 180
    socket.emit('keypress', {
        inputId:'mouseAngle',
        state:angle
    })
}

socket.on('newPosition', function(data) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for(var i = 0; i < data.player.length; i++) {
        ctx.fillText(data.player[i].number, data.player[i].x, data.player[i].y)
    }
    for(var i = 0; i < data.bullet.length; i++) {
        ctx.fillRect(data.bullet[i].x, data.bullet[i].y, 10, 10)
    }
})

socket.on('addToChat', function(data) {
    chatText.innerHTML += `<div>${data}</div>`
})

socket.on('evalResponse', function(data) {
    socket.emit('sendMessageToServer', chatInput.value)
    console.log(data)
})

chatForm.onsubmit = function(e) {
    e.preventDefault()

    //server command
    if (chatInput.value[0] === '/') {
        socket.emit('evalServer', chatInput.value.slice(1))
        chatInput.value = ""
    } else {
        socket.emit('sendMessageToServer', chatInput.value)
        //clear out the input field
        chatInput.value = ""
    }    
}

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