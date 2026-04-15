class Peers {
    private senderRTCPc: RTCPeerConnection
    private receiverRTCPc: RTCPeerConnection
    private senderDataChannel: RTCDataChannel
    private messagesReceived: Array<any>

    constructor() {
        this.senderRTCPc = new RTCPeerConnection();
        this.receiverRTCPc = new RTCPeerConnection();
        this.senderDataChannel = this.senderRTCPc.createDataChannel("sendChannel");
        this.messagesReceived = []
    }

    private async resolveReceiverDataChannel(): Promise<RTCDataChannel> {
        return new Promise((resolve) => {
            this.receiverRTCPc.onconnectionstatechange = () => {
                if (this.receiverRTCPc.connectionState == "connected") {
                    console.log("Receiver RTC Peer Connected");
                    this.receiverRTCPc.ondatachannel = (event) => {
                        console.log("Data Channel Event Received")
                        const receiverDataChannel = event.channel;
                        receiverDataChannel.onmessage = (dataevent: MessageEvent) => {
                            console.log("Message received from sender", dataevent.data);
                            this.messagesReceived.push(dataevent.data)
                        }
                        resolve(receiverDataChannel);
                    }
                }
            }
        })
    }

    async connectPeer(): Promise<ConnectedPeers> {
        this.senderRTCPc.onicecandidate = async (e) => !e.candidate
            || await this.receiverRTCPc.addIceCandidate(e.candidate)

        this.receiverRTCPc.onicecandidate = async (e) => !e.candidate
            || await this.senderRTCPc.addIceCandidate(e.candidate)
        
        const receiverDataChannelPromise = this.resolveReceiverDataChannel();

        const senderLocalDescription = await this.senderRTCPc.createOffer();
        this.senderRTCPc.setLocalDescription(senderLocalDescription);
        await this.receiverRTCPc.setRemoteDescription(senderLocalDescription);
        const receiverRemoteDescription = await this.receiverRTCPc.createAnswer();
        this.receiverRTCPc.setLocalDescription(receiverRemoteDescription);
        await this.senderRTCPc.setRemoteDescription(receiverRemoteDescription);
        console.log(this.receiverRTCPc.connectionState, this.senderRTCPc.connectionState);
        const receiverDataChannel = await receiverDataChannelPromise;
        return new ConnectedPeers(this.senderDataChannel, receiverDataChannel);
    }
}

class ConnectedPeers {
    private senderDataChannel: RTCDataChannel;
    private receiverDataChannel: RTCDataChannel;

    constructor(senderDataChannel: RTCDataChannel, receiverDataChannel: RTCDataChannel) {
        if (senderDataChannel.readyState !== "open" || receiverDataChannel.readyState !== "open") {
            throw new Error("Peers are not connected");
        }
        this.receiverDataChannel = receiverDataChannel;
        this.senderDataChannel = senderDataChannel
    }

    async sendMessage(message: string) {
        if (this.senderDataChannel.readyState == "open") {
            this.senderDataChannel.send(message)
        } else {
            throw new Error(`Sender Data Channel Not Open, Connection Status: ${this.senderDataChannel.readyState}`)
        }
    }
}

const instance = new Peers();
instance.connectPeer().then((connectedPeer) => {

    connectedPeer.sendMessage("Hey")
})