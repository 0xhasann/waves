
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
        this.senderRTCPc.onicecandidate = async (e) => !e.candidate
            || await this.receiverRTCPc.addIceCandidate(e.candidate)

        this.receiverRTCPc.onicecandidate = async (e) => !e.candidate
            || await this.senderRTCPc.addIceCandidate(e.candidate)

        return new Promise((resolve, reject) => {
            this.receiverRTCPc.ondatachannel = (event) => {
                console.log("Data Channel Event Received")
                const receiverDataChannel = event.channel;
                receiverDataChannel.onmessage = (dataevent: MessageEvent) => {
                    console.log("Message received from sender", dataevent.data);
                    this.messagesReceived.push(dataevent.data)
                }
                resolve(receiverDataChannel);
            }
        })
    }

    async createSafeOffer(): Promise<OfferCreated> {
        const receiverDataChannelPromise = this.resolveReceiverDataChannel();
        const senderLocalDescription = await this.senderRTCPc.createOffer();
        this.senderRTCPc.setLocalDescription(senderLocalDescription);
        await this.receiverRTCPc.setRemoteDescription(senderLocalDescription);
        return new OfferCreated(this.senderRTCPc, this.receiverRTCPc, this.senderDataChannel, receiverDataChannelPromise);
    }

}

class OfferCreated {
    private senderRTCPc: RTCPeerConnection;
    private receiverRTCPc: RTCPeerConnection;
    private senderDataChannel: RTCDataChannel;
    private receiverDataChannelPromise: Promise<RTCDataChannel>;

    constructor(senderRTCPc: RTCPeerConnection, receiverRTCPc: RTCPeerConnection, senderDataChannel: RTCDataChannel, receiverDataChannelPromise: Promise<RTCDataChannel>) {
        if (!receiverRTCPc.remoteDescription && !senderRTCPc.localDescription) {
            throw new Error("sender local and receiver remote description is mandatory for answer creation");
        }
        this.senderRTCPc = senderRTCPc;
        this.receiverRTCPc = receiverRTCPc;
        this.senderDataChannel = senderDataChannel;
        this.receiverDataChannelPromise = receiverDataChannelPromise;

        console.log("Offer Created")
    }

    async createSafeAnswer() {
        const receiverRemoteDescription = await this.receiverRTCPc.createAnswer();
        this.receiverRTCPc.setLocalDescription(receiverRemoteDescription);
        await this.senderRTCPc.setRemoteDescription(receiverRemoteDescription);
        console.log("Answer Created")

        const receiverDataChannel = await this.receiverDataChannelPromise;
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
async function main() {
    const peers = new Peers();
    const offerCreated = await peers.createSafeOffer();
    const connectedPeer = await offerCreated.createSafeAnswer();
    await connectedPeer.sendMessage("Hello");
}

main()