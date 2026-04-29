import { localStream } from "./dom";
import { RTCPeerConnectionHandler } from "./webrtcEventHandler";
const shareBtn = document.getElementById("shareBtn") as HTMLButtonElement | null;

let shareStream: MediaStream | null = null;
let isSharing = false;
const pc = RTCPeerConnectionHandler.pc;
const dc = RTCPeerConnectionHandler.dataChannel;

async function replaceVideoTrack(track: MediaStreamTrack): Promise<boolean> {
    const senders = pc.getSenders();

    senders.forEach((s, i) => {
        console.log(`Sender ${i}:`, s.track?.kind, s.track?.label, s.transport);
    });

    const videoSenders = senders.filter(
        (s) => s.track?.kind === "video" && s.transport !== null
    );

    if (videoSenders.length === 0) {
        console.error("No active video sender found with transport");
        return false;
    }

    console.log(`Replacing track on ${videoSenders.length} video sender(s)`);
    await Promise.all(videoSenders.map((s) => {
        console.log("Replacing track on sender:", s.track?.label);
        return s.replaceTrack(track);
    }));

    return true;
}

function setShareBtnState(active: boolean) {
    isSharing = active;
    shareBtn?.classList.toggle("active", active);
    const tooltip = shareBtn?.querySelector(".tooltip");
    if (tooltip) {
        tooltip.textContent = active ? "Stop Sharing" : "Start Sharing";
    }
}

export async function shareScreen() {
    if (isSharing) {
        await stopSharing();
        return;
    }

    console.log("Starting screen share...");

    let newShareStream: MediaStream;
    try {
        newShareStream = await navigator.mediaDevices.getDisplayMedia({
            video: true,
            audio: true,
        });
    } catch (e) {
        console.error("Screen share denied or dismissed:", e);
        return; // user cancelled — do nothing
    }

    const screenTrack = newShareStream.getVideoTracks()[0];
    if (!screenTrack) {
        console.error("No video track in display stream");
        newShareStream.getTracks().forEach((t) => t.stop());
        return;
    }

    // Attach onended BEFORE replacing the track
    screenTrack.onended = () => stopSharing();

    console.log("Senders:", pc.getSenders());
    console.log("PC state:", pc.signalingState, pc.connectionState);

    const success = await replaceVideoTrack(screenTrack);
    if (!success) {
        newShareStream.getTracks().forEach((t) => t.stop());
        return;
    }

    
    if (dc?.readyState === "open") {
        dc.send(JSON.stringify({ type: "screen-share", active: true }));
    }

    shareStream = newShareStream;

    const localVideo = document.getElementById("local_video") as HTMLVideoElement | null;
    if (localVideo) localVideo.srcObject = shareStream;

    setShareBtnState(true);
    console.log("Screen share started");
}

async function stopSharing() {
    if (!isSharing) return;

    console.log("Stopping screen share...");

    // Stop all screen share tracks
    shareStream?.getTracks().forEach((track) => track.stop());
    shareStream = null;

    // localStream must be a proper MediaStream — fix the type in dom.ts if needed
    const cameraStream = localStream as unknown as MediaStream | null;
    const cameraTrack = cameraStream?.getVideoTracks()[0];

    if (!cameraTrack) {
        console.error("No camera track to revert to");
        setShareBtnState(false);
        return;
    }

    await replaceVideoTrack(cameraTrack);
    if (dc?.readyState === "open") {
        dc.send(JSON.stringify({ type: "screen-share", active: false }));
    }

    const localVideo = document.getElementById("local_video") as HTMLVideoElement | null;
    if (localVideo && cameraStream) {
        localVideo.srcObject = cameraStream;
    }

    setShareBtnState(false);
    console.log("Reverted to camera");
}