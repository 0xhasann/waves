// imports code from other files and assembles them
// 

import { WebSocketHandler } from "./websocketHandler";

const ws = new WebSocketHandler();

document.getElementById("loginBtn")?.addEventListener("click", login);
document.getElementById("hangup-button")?.addEventListener("click", hangUpCall);
ws.on("accept", ({ name }) => {
    const userListDiv = document.getElementById("user-list");
    if (userListDiv && ws.myUserName) {
        const callButtons = userListDiv.querySelectorAll("button");
        callButtons.forEach((btn) => {
            const li = btn.closest("li");
            if (li) {
                const span = li.querySelector("span");
                if (span && span.textContent ===name) {
                    btn.textContent = "Call";
                    btn.disabled = true;
                }
            }
        });
    }
});

ws.on("call", ({ name }) => {
   
    const userListDiv = document.getElementById("user-list");
    if (!userListDiv) return;

    let prevPrompt = document.getElementById("incoming-call-prompt");
    if (prevPrompt) prevPrompt.remove();

    const promptDiv = document.createElement("div");
    promptDiv.id = "incoming-call-prompt";
    promptDiv.style.margin = "8px 0";

    const message = document.createElement("span");
    message.textContent = `Incoming call from ${name}.`;

    const acceptBtn = document.createElement("button");
    acceptBtn.textContent = "Accept";
    acceptBtn.addEventListener("click", () => {
        ws.accept(name);
        promptDiv.remove();
        const userListDiv = document.getElementById("user-list");
        if (userListDiv) {
            const callButtons = userListDiv.querySelectorAll("button");
            callButtons.forEach((btn) => {
                const li = btn.closest("li");
                if (li) {
                    const span = li.querySelector("span");
                    if (span && span.textContent === name) {
                        btn.textContent = "Call";
                        btn.disabled = true;
                    }
                }
            });
        }
    });

    promptDiv.appendChild(message);
    promptDiv.appendChild(document.createTextNode(" "));
    promptDiv.appendChild(acceptBtn);
    userListDiv.parentElement?.insertBefore(promptDiv, userListDiv);
});
ws.on("user-list", ({ names }) => {
    console.log("user-list");
    const userListDiv = document.getElementById("user-list");
    if (!userListDiv) {
        console.log("userListDiv not found");
        return;
    }

    userListDiv.innerHTML = "";

    const ul = document.createElement("ul");
    names.forEach((name: string) => {
        if (ws.myUserName == name) return;
        const li = document.createElement("li");

        const nameSpan = document.createElement("span");
        nameSpan.textContent = name;

        const callBtn = document.createElement("button");
        callBtn.textContent = "Call";
        callBtn.addEventListener("click", () => {
            ws.call(name);
            callBtn.textContent = "Calling...";
            callBtn.disabled = true;
        });
    
        li.appendChild(nameSpan);
        li.appendChild(document.createTextNode(" ")); 
        li.appendChild(callBtn);

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