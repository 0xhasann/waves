import { z } from 'zod';

export const signupSchema = z.object({
  body: z.object({
    username: z.string().min(3).max(50),

    password: z.string().min(6).max(15),

    email: z.email().max(50),

    mobileNo: z
      .string()
      .regex(/^\+?[0-9\s]{10,15}$/, {
        message: 'Invalid mobile number',
      })
      .max(15)
      .optional(),

    firstName: z.string().min(3).max(50).optional(),
    lastName: z.string().min(3).max(50).optional(),

    avatarURL: z.string().max(200).url().optional(),
  }),
});

export const signinSchema = z.object({
  query: z.object({
    username: z.string().min(3).max(50),
    password: z.string().min(6).max(15),
  }),
});

export type SignupInput = z.infer<typeof signupSchema>['body'];
export type SigninInput = z.infer<typeof signinSchema>['query'];
