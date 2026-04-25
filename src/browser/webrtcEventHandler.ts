// methods that webrtc expects us to implement for peer to peer connection
// onicecandidate -> send ice candidate to peer
// ontrack -> display the stream on dom (displayRemoteStream) from dom.ts
// onnegotiationneeded -> call createOffer -> set local description -> send video-offer to peer
// onremovetrack -> close video call
// oniceconnectionstatechange -> update the dom to reflect ice connection states
// onicegatheringstatechange -> update the dom to reflect ine gathering states
// onsignalingstatechange -> update the dom to reflect rtc signaling states

import { ChatUI } from "./chat";
import { WebSocketHandler } from "./websocketHandler";

// the webrtc event handler
// singleton class
export class RTCPeerConnectionHandler {
    private static rtcPeerConnectionHandler: RTCPeerConnectionHandler | null;
    public static dataChannel: RTCDataChannel | null = null;
    private rtcPeerConnection: RTCPeerConnection;

    private constructor() {
        this.rtcPeerConnection = createPeerConnection();
    }

    //cleanly nulls all handlers and closes the connection.
    public static close():void {
        this.dataChannel?.close();
        this.dataChannel = null;
        this.pc.ondatachannel = null;
        this.pc.getTransceivers().forEach(t => t.stop());
        this.pc.ontrack = null;
        this.pc.onicecandidate = null;
        this.pc.oniceconnectionstatechange = null;
        this.pc.onsignalingstatechange = null;
        this.pc.onicegatheringstatechange = null;
        this.pc.onnegotiationneeded = null;
        this.pc.close();
        this.rtcPeerConnectionHandler = null;
 
    }

    public static get pc(): RTCPeerConnection {
        if (this.rtcPeerConnectionHandler) return this.rtcPeerConnectionHandler.rtcPeerConnection;
        this.rtcPeerConnectionHandler = new RTCPeerConnectionHandler();
        return this.rtcPeerConnectionHandler.rtcPeerConnection;
    }

}

function createPeerConnection(): RTCPeerConnection {
    const ws = WebSocketHandler.getInstance();
    const pc = new RTCPeerConnection({
        iceServers: [
            {
                urls: "stun:stun.stunprotocol.org",
            },
        ],
    });
    if (!RTCPeerConnectionHandler.dataChannel) {
        RTCPeerConnectionHandler.dataChannel = pc.createDataChannel("chat");

        RTCPeerConnectionHandler.dataChannel.onopen = () => {
            console.log("Data channel open");
            document.getElementById("chat-input")?.removeAttribute("disabled");
        };

        RTCPeerConnectionHandler.dataChannel.onmessage = (event) => {
            console.log("Message received:", event.data);
            ChatUI.appendMessage(event.data, "remote");
        };

        RTCPeerConnectionHandler.dataChannel.onclose = () => {
            console.log("Data channel closed");
        };
    }
    // sends gathered ICE candidates to the other peer via ws.newIceCandidate()
    pc.onicecandidate = (e) => {
        if (!e.candidate) return;
        ws.newIceCandidate(e.candidate);
    }
    // creates an SDP offer, sets local description, sends video-offer via ws
    // this fires automatically when tracks are added
    pc.onnegotiationneeded = () => {
        if (pc.signalingState != "stable") return;
        pc
            .createOffer()
            .then((offer) => pc.setLocalDescription(offer))
            .then(() => {
                if (!pc.localDescription) throw new Error("local description not found");
                ws.videoOffer(pc.localDescription);
            })
            .catch(window.reportError);
    }
    // shows the hang-up button when connected
    
    pc.onconnectionstatechange = () => {
        const btn = document.getElementById("hangup-button");
        if (!btn) return;
        if (pc.connectionState === "connected") {
            btn.style.display = "block";
        }
    };
    //  receives the remote video stream and plugs it into the <video#received_video> element
    pc.ontrack = (event) => {
        const receivedVideo = document.getElementById("received_video") as HTMLVideoElement | null;
        if (receivedVideo && event.streams && event.streams[0]) {
            receivedVideo.srcObject = event.streams[0];
        }
        const hangupBtn = document.getElementById("hangup-button") as HTMLButtonElement | null;
        if (hangupBtn) {
            hangupBtn.disabled = false;
        }
    };

    pc.ondatachannel = (event) => {
        RTCPeerConnectionHandler.dataChannel = event.channel;

        RTCPeerConnectionHandler.dataChannel.onopen = () => {
            console.log("Data channel open");
        };

        RTCPeerConnectionHandler.dataChannel.onmessage = (event) => {
            console.log("Message received:", event.data);
            ChatUI.appendMessage(event.data, "remote");
        };

        RTCPeerConnectionHandler.dataChannel.onclose = () => {
            console.log("Data channel closed");
        };
    };
    
    return pc;
}