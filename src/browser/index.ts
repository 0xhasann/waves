// imports code from other files and assembles them
// 

import { WebSocketHandler } from "./websocketHandler";

const ws = new WebSocketHandler();

document.getElementById("loginBtn")?.addEventListener("click", login);
document.getElementById("hangup-button")?.addEventListener("click", hangUpCall);
ws.on("user-list", ({ names }) => {
    console.log("user-list");
    const userListDiv = document.getElementById("user-list");
    if (!userListDiv) {
        console.log("userListDiv not found");
        return;

    }

    // Clear any existing list
    userListDiv.innerHTML = "";

    // Create and append a list item for each user
    const ul = document.createElement("ul");
    names.forEach((name: string) => {
        const li = document.createElement("li");
        li.textContent = name;
        ul.appendChild(li);
    });

    userListDiv.appendChild(ul);
});
function login() {
    const nameInput = document.getElementById("name") as HTMLInputElement | null;
    if (!nameInput) {
        return;
    }
    const username = nameInput.value.trim();
    if (username.length === 0) {
        return;
    }
    ws.login(username);
}

function hangUpCall() {
    const localVideo = document.getElementById("local_video") as HTMLVideoElement | null;
    const remoteVideo = document.getElementById("received_video") as HTMLVideoElement | null;
    ws.hangUp();

    if (localVideo && localVideo.srcObject instanceof MediaStream) {
        localVideo.pause();
        localVideo.srcObject.getTracks().forEach((track) => {
            track.stop();
        });
        localVideo.srcObject = null;
    }

    if (remoteVideo && remoteVideo.srcObject instanceof MediaStream) {
        remoteVideo.srcObject.getTracks().forEach((track) => {
            track.stop();
        });
        remoteVideo.srcObject = null;
    }
}