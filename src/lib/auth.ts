import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.APP_USER,
    pass: process.env.APP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // This bypasses certificate validation
  },
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql", // or "mysql", "postgresql", ...etc
  }),
  trustedOrigins: [process.env.APP_URL!],
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      phone: {
        type: "string",
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    autoSignIn: false,
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url, token }, request) => {
      try {
        const verificationUrl = `${process.env.APP_URL}/verify-email?token=${token}`;
        const info = await transporter.sendMail({
          from: '"Prisma Blog" <prismablog@ph.com>', // sender address
          to: user.email, // list of recipients
          subject: "Please verify your email", // subject line

          html: `<!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Verify Your Email</title>
      </head>

      <body style="
        margin: 0;
        padding: 0;
        background-color: #f4f7fb;
        font-family: Arial, Helvetica, sans-serif;
        color: #333333;
      ">

        <div style="
          max-width: 600px;
          margin: 40px auto;
          background-color: #ffffff;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
        ">

          <!-- Header -->
          <div style="
            background-color: #2563eb;
            padding: 30px 20px;
            text-align: center;
          ">
            <h1 style="
              margin: 0;
              color: #ffffff;
              font-size: 28px;
            ">
              Prisma Blog
            </h1>
          </div>

          <!-- Content -->
          <div style="padding: 40px 30px;">

            <h2 style="
              margin-top: 0;
              color: #222222;
              font-size: 24px;
            ">
              Verify Your Email Address
            </h2>

            <p style="
              font-size: 16px;
              line-height: 1.6;
              color: #555555;
            ">
             Hello ${user.name}, Welcome to Prisma Blog!
            </p>

            <p style="
              font-size: 16px;
              line-height: 1.6;
              color: #555555;
            ">
              Thank you for creating an account with us. Please verify your
              email address by clicking the button below.
            </p>

            <!-- Button -->
            <div style="
              text-align: center;
              margin: 35px 0;
            ">
              <a
                href="${verificationUrl}"
                style="
                  display: inline-block;
                  background-color: #2563eb;
                  color: #ffffff;
                  text-decoration: none;
                  padding: 14px 30px;
                  border-radius: 6px;
                  font-size: 16px;
                  font-weight: bold;
                "
              >
                Verify My Email
              </a>
            </div>

            <p style="
              font-size: 14px;
              line-height: 1.6;
              color: #777777;
            ">
              If the button above doesn't work, copy and paste the following
              link into your browser:
            </p>

            <p style="
              font-size: 13px;
              line-height: 1.5;
              word-break: break-all;
              background-color: #f3f4f6;
              padding: 12px;
              border-radius: 5px;
            ">
              ${url}
            </p>

            <p style="
              margin-top: 30px;
              font-size: 14px;
              line-height: 1.6;
              color: #777777;
            ">
              If you did not create an account with Prisma Blog, you can
              safely ignore this email.
            </p>

          </div>

          <!-- Footer -->
          <div style="
            background-color: #f8fafc;
            padding: 20px;
            text-align: center;
          ">
            <p style="
              margin: 0;
              font-size: 13px;
              color: #888888;
            ">
              © 2026 Prisma Blog. All rights reserved.
            </p>
          </div>

        </div>

      </body>
    </html>`,
        });
        console.log("verification email sent", info.messageId);
      } catch (error) {
        console.error(error);
        throw error;
      }
    },
  },

  socialProviders: {
    google: {
      prompt: "select_account consent",
      accessType:"offline",
      clientId: process.env.GOOGLE_CLIENT_ID as string,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
    },
  },
});
