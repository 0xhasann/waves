import { email, z } from "zod";



export const signupSchema = z.object({
    body: z.object({
        username: z.string().min(3).max(15),

        password: z.string().min(6).max(15),

        email:  z.string().regex(/^\S+@\S+\.\S+$/, { message: "Invalid email", }).optional(),

        mobileNo: z
            .string()
            .regex(/^\+?[0-9\s]{10,15}$/, {
                message: "Invalid mobile number",
            })
            .optional(),

        firstName: z.string().optional(),
        lastName: z.string().optional(),

        avatarURL: z.string().url().optional(),
    }),
});


export const signinSchema = z.object({
    body: z.object({
        username: z.string().min(3).max(15),
        password: z.string().min(6).max(15),
    }),
});

export type SignupInput = z.infer<typeof signupSchema>["body"];
export type SigninInput = z.infer<typeof signinSchema>["body"];