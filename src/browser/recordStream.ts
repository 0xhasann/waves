

let mediaRecorder: MediaRecorder | null = null;
let recordedChunks: Blob[] = [];
let recordingStream: MediaStream | null = null;
let isRecording = false;

// Timer state
let timerInterval: ReturnType<typeof setInterval> | null = null;
let startTime = 0;
let elapsedMs = 0;
const recordBtn = document.getElementById("recordBtn") as HTMLDivElement | null;


//  Timer helpers 
function pad(n: number): string {
    return String(Math.floor(n)).padStart(2, "0");
}

function updateTimerDisplay() {
    elapsedMs = performance.now() - startTime;
    const totalSec = Math.floor(elapsedMs / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const cs = Math.floor((elapsedMs % 1000) / 10);

    const tooltip = recordBtn?.querySelector(".tooltip");
    if (tooltip) tooltip.textContent = `${pad(mins)}:${pad(secs)}.${pad(cs)}`;
}

function startTimer() {
    startTime = performance.now() - elapsedMs;
    timerInterval = setInterval(updateTimerDisplay, 50);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function resetTimer() {
    elapsedMs = 0;
}

function formatSize(bytes: number): string {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
}

// Download Popup 
function showDownloadPopup(blob: Blob) {
    const totalSec = Math.floor(elapsedMs / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    const duration = `${pad(mins)}:${pad(secs)}`;
    const size = formatSize(blob.size);
    const url = URL.createObjectURL(blob);

    // Remove existing popup if any
    const popup = document.getElementById("recordingPopup") as HTMLDivElement;
    const backdrop = document.getElementById("recordingBackdrop") as HTMLDivElement;

    const durationEl = document.getElementById("duration") as HTMLElement;
    const sizeEl = document.getElementById("size") as HTMLElement;

    const downloadBtn = document.getElementById("popupDownload") as HTMLAnchorElement;
    const closeBtn = document.getElementById("popupClose") as HTMLButtonElement;

    // assign values
    durationEl.textContent = duration;
    sizeEl.textContent = size;
    downloadBtn.href = url;

    // show
    popup.style.display = "block";
    backdrop.style.display = "block";

    // close
    closeBtn.onclick = () => {
        popup.style.display = "none";
        backdrop.style.display = "none";
    };
    // document.getElementById("recordingPopup")?.remove();

    // const popup = document.createElement("div");
    // popup.id = "recordingPopup";
    // popup.style.cssText = `
    //     position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    //     background: #1a1a2e; border: 1px solid #333; border-radius: 12px;
    //     padding: 24px 28px; z-index: 9999; text-align: center;
    //     color: #fff; font-family: sans-serif; min-width: 280px;
    //     box-shadow: 0 8px 32px rgba(0,0,0,0.5);
    // `;

    // popup.innerHTML = `
    //     <h3 style="margin:0 0 8px; font-size:18px;">Recording Complete</h3>
    //     <p style="margin:0 0 16px; color:#aaa; font-size:13px;">
    //         Duration: <b style="color:#fff">${duration}</b> &nbsp;·&nbsp; Size: <b style="color:#fff">${size}</b>
    //     </p>
    //     <div style="display:flex; gap:10px; justify-content:center;">
    //         <a id="popupDownload" href="${url}" download="screen-recording.webm"
    //            style="padding:10px 20px; background:#e63946; color:#fff; border-radius:8px;
    //                   text-decoration:none; font-weight:600; font-size:14px;">
    //             ⬇ Download
    //         </a>
    //         <button id="popupClose"
    //             style="padding:10px 20px; background:transparent; color:#aaa; border:1px solid #444;
    //                    border-radius:8px; cursor:pointer; font-size:14px;">
    //             Discard
    //         </button>
    //     </div>
    // `;

    // // Backdrop
    // const backdrop = document.createElement("div");
    // backdrop.id = "recordingBackdrop";
    // backdrop.style.cssText = `
    //     position: fixed; inset: 0; background: rgba(0,0,0,0.5);
    //     z-index: 9998; backdrop-filter: blur(3px);
    // `;

    const close = () => {
        popup.remove();
        backdrop.remove();
        URL.revokeObjectURL(url);
    };

    backdrop.addEventListener("click", close);
    popup.querySelector("#popupClose")?.addEventListener("click", close);

    document.body.appendChild(backdrop);
    document.body.appendChild(popup);
}


export async function recordStream() {

    if (!isRecording) {
        try {
            recordingStream = await navigator.mediaDevices.getDisplayMedia({
                video: true,
                audio: true,
            });
        } catch (e) {
            console.error("Screen capture denied:", e);
            return;
        }

        recordedChunks = [];
        mediaRecorder = new MediaRecorder(recordingStream);

        mediaRecorder.ondataavailable = (e) => {
            if (e.data.size > 0) recordedChunks.push(e.data);
        };

        mediaRecorder.start(200); // collect chunks every 200ms
        isRecording = true;
        resetTimer();
        startTimer();

        recordBtn?.classList.add("active");

        // auto-stop if user stops screen share
        const videoTracks = recordingStream?.getVideoTracks();
        if (videoTracks && videoTracks.length > 0 && videoTracks[0]) {
            videoTracks[0].onended = stopRecording;
        }
    } else {
        stopRecording();
    }
}

function stopRecording() {
    if (!mediaRecorder || !isRecording) return;

    stopTimer();
    mediaRecorder.stop();

    mediaRecorder.onstop = () => {
        const blob = new Blob(recordedChunks, { type: "video/webm" });
        showDownloadPopup(blob);
    };

    recordingStream?.getTracks().forEach((track) => track.stop());

    isRecording = false;
    recordBtn?.classList.remove("active");

    const tooltip = recordBtn?.querySelector(".tooltip");
    if (tooltip) tooltip.textContent = "Start Recording";

}