import UserModel from "@/app/model/userModel"
import { ForgetPasswordRequest } from "@/app/types"
import { NextResponse } from "next/server";
import crypto from 'crypto';
import PasswordResetTokenModel from "@/app/model/passwordResetTokenModel";
import nodemailer from 'nodemailer';
import startDb from "@/app/lib/db";

export const POST = async (req:Request) => {
    try {
        const {email} = await req.json() as ForgetPasswordRequest

        if(!email) return NextResponse.json({error: "Invalid email!"},{status:401});
    
        await startDb();
        const user = await UserModel.findOne({email});
        if(!user) return NextResponse.json({error: "user not found!"},{status:404});
    
        await PasswordResetTokenModel.findOneAndDelete({user: user._id});
        const token = crypto.randomBytes(36).toString('hex');
        await PasswordResetTokenModel.create({
            user: user._id,
            token,
        });
    
        const resetPassLink = `${process.env.PASSWORD_RESET_URL}?token=${token}&userId=${user._id}`;
    
        const transport = nodemailer.createTransport({
            host: "sandbox.smtp.mailtrap.io",
            port: 2525,
            auth: {
              user: "4dfdbae97a09d3",
              pass: "aa697c5227d5a1"
            }
          });
    
          await transport.sendMail({
            from: 'verification@nextecom.com',
            to: user.email,
            html: `<h1>Click on <a href="${resetPassLink}"> this link </a> to reset your password</h1>`
          })
    
        return NextResponse.json({message: "Please check your email!"});
    } catch(error) {
        return NextResponse.json({error: (error as any).message}, {status: 500});
    }
    
}