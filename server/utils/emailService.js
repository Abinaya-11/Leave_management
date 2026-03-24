const nodemailer = require('nodemailer');

/**
 * Send Parent Approval Email
 * @param {Object} student - Student details
 * @param {Object} leave - Leave details
 * @param {String} approveUrl - Direct approval link
 * @param {String} rejectUrl - Direct rejection link
 * @param {String} otp - 6-digit backup OTP
 */
const sendParentApprovalEmail = async (student, leave, approveUrl, rejectUrl, otp) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            secure: process.env.EMAIL_PORT == 465, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: `"Leave Management System" <${process.env.EMAIL_USER}>`,
            to: leave.parent_email,
            subject: `Leave Approval Request: ${student.name}`,
            html: `
                <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; padding: 30px; border: 1px solid #e2e8f0; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    <h2 style="color: #4f46e5; text-align: center; margin-bottom: 24px;">Leave Approval Request</h2>
                    <p style="color: #475569; font-size: 16px;">Dear Parent,</p>
                    <p style="color: #475569; font-size: 16px;">Your ward, <strong>${student.name}</strong>, has applied for leave. Please review the details and take action below.</p>
                    
                    <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #f1f5f9;">
                        <p style="margin: 8px 0;"><strong>Request ID:</strong> <span style="color: #6366f1;">#${leave._id.toString().slice(-6).toUpperCase()}</span></p>
                        <p style="margin: 8px 0;"><strong>Leave Type:</strong> ${leave.leaveType}</p>
                        <p style="margin: 8px 0;"><strong>Duration:</strong> ${new Date(leave.startDate).toLocaleDateString()} to ${new Date(leave.endDate).toLocaleDateString()}</p>
                        <p style="margin: 8px 0;"><strong>Reason:</strong> ${leave.reason}</p>
                    </div>

                    <div style="text-align: center; margin: 32px 0; padding: 20px; background: #eef2ff; border-radius: 12px;">
                        <p style="margin: 0 0 10px 0; color: #4338ca; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Backup OTP</p>
                        <h1 style="margin: 0; font-size: 36px; letter-spacing: 8px; color: #1e1b4b;">${otp}</h1>
                    </div>

                    <div style="margin: 32px 0; text-align: center;">
                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" style="margin: auto;">
                            <tr>
                                <td style="border-radius: 8px; background: #10b981;">
                                    <a href="${approveUrl}" style="background: #10b981; border: 1px solid #10b981; font-family: sans-serif; font-size: 16px; line-height: 1.1; text-align: center; text-decoration: none; display: block; border-radius: 8px; font-weight: bold; padding: 14px 32px; color: #ffffff;">
                                        Approve
                                    </a>
                                </td>
                                <td style="padding-left: 16px;"></td>
                                <td style="border-radius: 8px; background: #ef4444;">
                                    <a href="${rejectUrl}" style="background: #ef4444; border: 1px solid #ef4444; font-family: sans-serif; font-size: 16px; line-height: 1.1; text-align: center; text-decoration: none; display: block; border-radius: 8px; font-weight: bold; padding: 14px 32px; color: #ffffff;">
                                        Reject
                                    </a>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <div style="border-top: 1px solid #e2e8f0; padding-top: 24px; margin-top: 24px; text-align: center;">
                        <p style="font-size: 12px; color: #94a3b8; line-height: 1.5;">
                            This is an automated message from the Leave Management System. <br/>
                            Please do not reply directly to this email.
                        </p>
                    </div>
                </div>
            `
        };

        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent: ' + info.response);
        return true;
    } catch (error) {
        console.error('Error sending email:', error);
        // Fallback for simulation if env vars are missing
        console.log('\n--- SIMULATED EMAIL CONTENT ---');
        console.log(`To: ${leave.parent_email}`);
        console.log(`Student: ${student.name}`);
        console.log(`Approve Link: ${approveUrl}`);
        console.log(`Reject Link: ${rejectUrl}`);
        console.log(`OTP: ${otp}`);
        console.log('--- END SIMULATION ---\n');
        return false;
    }
};

module.exports = { sendParentApprovalEmail };
