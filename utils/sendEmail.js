const nodemailer = require("nodemailer");

const OtpMessge = () => {
  let otp = Math.floor(100000 + Math.random() * 900000);
  let message = {
    subject: "Your password reset code (valid for 5 min)",
    otp: otp,
    content: `<p>otp is<br> <h1>${otp}</h1><br><h3>Your code will expire in 5 minutes</h3></p>`,
  };
  return message;
};
const welcomeUser = (username) => {
  let message = {
    subject: "Welcome",
    content: `<!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Welcome to Loader Project!</title>
            <style>
                /* Add your custom CSS styles here */
                body {
                    font-family: Arial, sans-serif;
                    background-color: #f4f4f4;
                    margin: 0;
                    padding: 0;
                }
        
                .container {
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #ffffff;
                    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
                }
        
                .header {
                    background-color: #007BFF;
                    color: #ffffff;
                    text-align: center;
                    padding: 10px 0;
                }
        
                .content {
                    padding: 20px;
                }
        
                .button {
                    display: inline-block;
                    padding: 10px 20px;
                    background-color: #007BFF;
                    color: #ffffff;
                    text-decoration: none;
                    border-radius: 5px;
                    margin-top: 20px;
                }
        
                .button:hover {
                    background-color: #0056b3;
                }
        
                .footer {
                    text-align: center;
                    color: #888888;
                    font-size: 12px;
                    margin-top: 20px;
                }
            </style>
        </head>
        <body>
            <div class="container">
                <div class="header">
                    <h1>Welcome to Loader Project!</h1>
                </div>
                <div class="content">
                    <p>Hello ${username}</p>
                    <p>We are thrilled to welcome you to the Loader Project, your gateway to a world of exciting opportunities. Our mission is to simplify and enhance your experience in the world of [project description].</p>
                    <p>Here are a few things you can do with Loader Project:</p>
                    <ul>
                        <li>upload video by different quality</li>
                        <li>this account and videos is private anyone can not show it</li>
                    </ul>
                    <p>Getting started is easy! Just click the button below to access your account:</p>
                    <a class="button" href="http://localhost:3000/profile">Access Your Account</a>
                </div>
            </div>
        </body>
        </html>
        `,
  };
  return message;
};
// Nodemailer
const sendEmail = async (options) => {
  try {
    let transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      service: process.env.EMAIL_SERVICE,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
    // console.log(options);
    const mailOpts = {
      from: "Loader <ahmed.abdelbasir140@gmail.com>",
      to: options.email, // Ensure that options.email is a valid email address
      subject: options.subject,
      html: options.message,
    };

    // Send email
    await transporter.sendMail(mailOpts);
  } catch (error) {
    console.error("Error sending email:", error);
    throw error; // Rethrow the error to handle it in the calling function (sendOtp)
  }
};

module.exports = { sendEmail, OtpMessge, welcomeUser };
