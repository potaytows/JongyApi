const nodemailer = require('nodemailer');

const sendEmail = async (option) => {
    try {
        // const transporter = nodemailer.createTransport({
        //     host: 'live.smtp.mailtrap.io',
        //     port: 587,
        //     secure: false,
        //     auth: {
        //         user: 'api',
        //         pass: '1b18455f7099e5b0a1e4ba16955cde9c'
        //     },
        // });
        const transporter = nodemailer.createTransport({
            service: "Gmail",
            host: "smtp.gmail.com",
            port: 465,
            secure: true,
            auth: {
              user: "ntptv2545@gmail.com",
              pass: "oryb tdxn ybom yudx",
            },
          });

        const emailOptions = {
            from: 'Jonggy@Support.com',
            to: option.email,
            subject: option.subject,
            text: option.message
        };

        await transporter.sendMail(emailOptions);
        console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
};


module.exports = sendEmail;
