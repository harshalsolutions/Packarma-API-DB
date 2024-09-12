import { createTransport } from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const templateHandler = (name, otp, link = '') => {
  return `
    <html>
    <head>
      <style type="text/css" rel="stylesheet" media="all">
      @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,200..800;1,200..800&display=swap');
        body {
          width: 100% !important;
          height: 100%;
          margin: 0;
          -webkit-text-size-adjust: none;
         font-family: "Plus Jakarta Sans", sans-serif;
          background-color: #F2F4F6;
          color: #51545E;
        }
        a {
          color: #84cc16 !important;
          text-decoration: none;
        }
        .preheader {
          display: none !important;
          visibility: hidden;
          mso-hide: all;
          font-size: 1px;
          line-height: 1px;
          max-height: 0;
          max-width: 0;
          opacity: 0;
          overflow: hidden;
        }
        td, th {
          font-size: 16px;
        }
        p, ul, ol, blockquote {
          margin: .4em 0 1.1875em;
          font-size: 16px;
          line-height: 1.625;
          color: #51545E;
        }
        .button {
          background-color: #84cc16 !important;
          color: black !important;
          text-decoration: none !important;
          border-radius: 3px !important;
          box-shadow: 0 2px 3px rgba(0, 0, 0, 0.16) !important;
          -webkit-text-size-adjust: none !important;
          box-sizing: border-box;
          display: inline-block !important;
          padding: 10px 18px !important;
        }
        .email-wrapper {
          width: 100%;
          margin: 0;
          padding: 0;
          -premailer-width: 100%;
          -premailer-cellpadding: 0;
          -premailer-cellspacing: 0;
          background-color: #F2F4F6;
        }
        .email-masthead {
          padding: 25px 0;
          text-align: center;
        }
        .email-masthead_name {
          font-size: 16px;
          font-weight: bold;
          color: #A8AAAF;
          text-decoration: none;
          text-shadow: 0 1px 0 white;
        }
        .email-body {
          width: 100%;
          margin: 0;
          padding: 0;
          -premailer-width: 100%;
          -premailer-cellpadding: 0;
          -premailer-cellspacing: 0;
        }
        .email-body_inner {
          width: 570px;
          margin: 0 auto;
          padding: 0;
          -premailer-width: 570px;
          -premailer-cellpadding: 0;
          -premailer-cellspacing: 0;
          background-color: #FFFFFF;
        }
        .email-footer {
          width: 570px;
          margin: 0 auto;
          padding: 0;
          -premailer-width: 570px;
          -premailer-cellpadding: 0;
          -premailer-cellspacing: 0;
          text-align: center;
        }
        .email-footer p {
          color: #A8AAAF;
        }
        .body-action {
          width: 100%;
          margin: 30px auto;
          padding: 0;
          -premailer-width: 100%;
          -premailer-cellpadding: 0;
          -premailer-cellspacing: 0;
          text-align: center;
        }
        .body-sub {
          margin-top: 25px;
          padding-top: 25px;
          border-top: 1px solid #EAEAEC;
        }
        .content-cell {
          padding: 45px;
        }
      </style>
    </head>
    <body>
      <span class="preheader">Use this link to reset your password. The link is only valid for 24 hours.</span>
      <table class="email-wrapper" width="100%" cellpadding="0" cellspacing="0" role="presentation">
        <tr>
          <td align="center">
            <table class="email-content" width="100%" cellpadding="0" cellspacing="0" role="presentation">
              <tr>
                <td class="email-body" width="570" cellpadding="0" cellspacing="0">
                  <table class="email-body_inner" align="center" width="570" cellpadding="0" cellspacing="0" role="presentation">
                    <!-- Body content -->
                    <tr>
                      <td class="content-cell">
                        <h1>Hi ${name},</h1>
                        ${link ? `<p>Click the button below to reset your password:</p>
                        <p><a href="${link}" class="button">Reset Password</a></p>` : ''}
                        <p>Your OTP code is <strong>${otp}</strong>. It is valid for 10 minutes.</p>
                        <p>If you did not request this, please ignore this email.</p>
                        <p>Thanks,<br>The Packarma team</p>
                      </td>
                    </tr>
                  </table>
                </td>
              </tr>
            </table>
          </td>
        </tr>
      </table>
    </body>
    </html>
    `;
};

const sendOtpEmail = async (to, otp, type = "basic") => {
  let mailOptions;

  if (type === 'admin') {
    const link = `${process.env.ADMIN_FRONTEND_URL}/update-password?email=${to}&otp=${otp}`;
    mailOptions = {
      from: `Packarma ${process.env.EMAIL_USER}`,
      to: to,
      subject: 'Admin OTP Code',
      html: templateHandler('Admin', otp, link)
    };
  } else {
    mailOptions = {
      from: `Packarma ${process.env.EMAIL_USER}`,
      to: to,
      subject: 'Your OTP Code',
      html: templateHandler('User', otp)
    };
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`OTP sent to ${to}`);
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Could not send OTP email');
  }
}

export default sendOtpEmail