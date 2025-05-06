import nodemailer from 'nodemailer'
import path from 'path'
import ejs from 'ejs'

const domainName = "Construction Inception"

export const sendEmail = async (toEmail, subject, templateName, additionalData, attachments = []) => {
    try {

        const transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE,
            port: 587,
            secure: false,
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_PASSWORD,
            },
        });


        const defaultTemplateData = {
            domainName: domainName,
            copyRightYear: new Date().getFullYear(),
        };

        const templateData = {
            ...defaultTemplateData,
            ...additionalData,
        };

        const templatePath = path.join(__dirname, 'templates', `${templateName}.ejs`);


        const html = await ejs.renderFile(templatePath, templateData);

        const mailOption = {
            from: process.env.GMAIL_USER,
            to: toEmail,
            subject: subject,
            text: templateData.text ?? '',
            html: html,
            attachments: attachments,
        };

        await transporter.sendMail(mailOption);
        console.log("Email Sent Succesfully")

    } catch (error) {
        console.error("Email not sent:", error);
    }
};





export const sendWelcomEmail = async (toEmail, name) => {
    const subject = `Welcome to ${domainName}`;
    const templateName = 'welcome';
    const additionalData = {
        name
    };
    await sendEmail(toEmail, subject, templateName, additionalData);
};






export const sendOtpEmail = async (email: string, otp: string, name: string) => {
    const subject = 'Verify your email with OTP';
    const appName = 'ProjectSphere';
    const year = new Date().getFullYear();


    const additionalData = {
        name,
        otp,
        appName,
        year,

    };

    await sendEmail(email, subject, 'SendOtp', additionalData);
};


export const resetPasswordEmail = async (email: string, mailLink: string, name: string) => {
    const subject = 'Reset Your Password';
    const appName = 'ProjectSphere';
    const year = new Date().getFullYear();
    const additionalData = {
        appName, year, name, mailLink
    }
    await sendEmail(email, subject, 'resetPassword', additionalData)


}







export const sendNotificationEmail = async (
    toEmail: string,
    title: string,
    message: string,
    username: string,
    adminName: string,
    projectName?: string,
    phaseName?: string,
    status?: string
) => {
    const subject = title;
    const templateName = 'notification';
    const additionalData = {
        title,
        message,
        username,
        adminName,
        projectName,
        phaseName,
        status
    };
    await sendEmail(toEmail, subject, templateName, additionalData);
};