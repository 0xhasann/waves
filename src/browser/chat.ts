import { RTCPeerConnectionHandler } from "./webrtcEventHandler";


export class ChatUI {
    static init() {
        const input = document.getElementById("chat-input") as HTMLInputElement;
        const btn = document.getElementById("send-btn") as HTMLButtonElement;

        btn.onclick = () => {
            const message = input.value.trim();
            if (!message) return;

            this.appendMessage(message, "self");
            RTCPeerConnectionHandler.dataChannel?.send(message);

            input.value = "";
        };
    }

    static appendMessage(message: string, type: "self" | "remote") {
        const container = document.getElementById("messages");
        if (!container) return;

        const div = document.createElement("div");
        div.textContent = message;
        div.className = type;

        container.appendChild(div);
    }
}