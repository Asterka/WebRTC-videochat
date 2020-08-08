const socket = io('/')

const myPeer = new Peer(undefined, {
    host:'/',
    port: '3001'
});

source = 0;

const peers = {};

const videoGrid = document.getElementById("video-grid");

const myVideo = document.createElement("video");

myVideo.muted = true;

navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true
}).then(stream => {
    addVideoStream(myVideo, stream);

    myPeer.on('call', call => {
        call.answer(stream);
        const video = document.createElement("video");
        call.on('stream', userVideoStream => {
            addVideoStream(video, userVideoStream)
        })
    })

    socket.on("user-connected", userId => {
        connectToNewUser(userId , stream);
    });

});

myPeer.on("open", id => {
    socket.emit("join-room", ROOM_ID, id)
    })

function connectToNewUser(userId, stream){
    const call = myPeer.call(userId, stream);
    const video = document.createElement("video");
    call.on("stream", userVideoStream =>{
        addVideoStream(video, userVideoStream)
    })
    call.on("close", () => {
        video.remove();
    });

    peers[userId] = call;
}

function addVideoStream(video, stream){
    video.srcObject = stream;
    video.addEventListener('loadedmetadata', () => {
        video.play();
    })
    videoGrid.append(video);
}

document.getElementById("switch_source").onclick=function () {
    switchSource();
}

function switchSource(){
    navigator.mediaDevices.getDisplayMedia({video:true, audio:true})
    .then(stream => {
        addVideoStream(myVideo, stream);
    
        myPeer.on('call', call => {
            call.answer(stream);
            const video = document.createElement("video");
            call.on('stream', userVideoStream => {
                addVideoStream(video, userVideoStream)
            })
        })
    
    });
}