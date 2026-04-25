import * as z from "zod";
// webrtc negotiation
// routed peer to peer through server
// video - offer SDP offer from caller
// video - answer SDP answer from callee 
// new - ice - candidate ICE candidates exchange 
// hang - up end call
export type SignalMessage =
    { type: "video-offer"; data: { sdp: RTCSessionDescriptionInit } }
    | { type: "video-answer"; data: { sdp: RTCSessionDescriptionInit } }
    | { type: "new-ice-candidate"; data: { candidate: RTCIceCandidateInit } }
    | { type: "hang-up" };

export const SignalMessageSchema = z.discriminatedUnion("type",[
    z.object({
        type: z.literal("video-offer"),
        data: z.object({
            sdp: z.unknown(),
        }),
    }),
    z.object({
        type: z.literal("video-answer"),
        data: z.object({
            sdp: z.unknown(),
        }),
    }),
    z.object({
        type: z.literal("new-ice-candidate"),
        data: z.object({
            candidate: z.unknown(),
        }),
    }),
    z.object({
        type: z.literal("hang-up"),
    }),
]);