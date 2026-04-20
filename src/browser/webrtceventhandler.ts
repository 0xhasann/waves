// methods that webrtc expects us to implement for peer to peer connection
// onicecandidate -> send ice candidate to peer
// ontrack -> display the stream on dom (displayRemoteStream) from dom.ts
// onnegotiationneeded -> call createOffer -> set local description -> send video-offer to peer
// onremovetrack -> close video call
// oniceconnectionstatechange -> update the dom to reflect ice connection states
// onicegatheringstatechange -> update the dom to reflect ine gathering states
// onsignalingstatechange -> update the dom to reflect rtc signaling states

