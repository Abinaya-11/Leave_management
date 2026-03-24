require('dotenv').config();
const { sendParentApprovalEmail } = require('./utils/emailService');

const mockStudent = {
    name: "Test Student",
    register_no: "2024REG001"
};

const mockLeave = {
    _id: "leave123",
    leaveType: "GP",
    startDate: new Date(),
    endDate: new Date(Date.now() + 86400000),
    reason: "Going home for wedding",
    parent_email: "test-parent@example.com"
};

const approveUrl = "http://localhost:5173/parent-approve/leave123?token=mocktoken&decision=Approved";
const rejectUrl = "http://localhost:5173/parent-approve/leave123?token=mocktoken&decision=Rejected";
const otp = "123456";

console.log("Testing Parent Approval Email...");
sendParentApprovalEmail(mockStudent, mockLeave, approveUrl, rejectUrl, otp)
    .then(success => {
        if (success) {
            console.log("\n✅ Verification script executed successfully (Email sent or simulated).");
        } else {
            console.log("\n⚠️ Verification script finished (Simulation mode triggered).");
        }
    })
    .catch(err => {
        console.error("\n❌ Verification script failed:", err);
    });
