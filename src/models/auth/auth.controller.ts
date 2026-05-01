import { database } from "../../db/utils";
import { signupService } from "./auth.service"

export const signupController = async (req: Request) => {
    try {
        console.log(req);
        const body = await req.json()
        console.log(body);
        const { email, password, username, firstName, lastName, avatarURL, mobileNo } = body

        // basic validation
        if (!email || !password || !username) {
            return Response.json(
                { error: "email, password and username are required" },
                { status: 400 }
            )
        }

        const result = await signupService(database, email, password, username, firstName, lastName, avatarURL, mobileNo);
        
        

        return new Response(
            JSON.stringify({ success: true, data: result }),
            {
                status: 200,
                headers: { "Content-Type": "application/json" },
            }
        )

    } catch (error: any) {
        return Response.json(
            { error: error.message },
            { status: 500 }
        )
    }
}