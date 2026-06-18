import nodemailer from 'nodemailer';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import { getEligibleJobs, CandidateProfile } from '@/lib/matching';
import { JobPost } from '@/types/job';

export async function notifyEligibleCandidates(newJob: JobPost) {
  try {
    await dbConnect();
    
    // 1. Fetch all registered users who have a physical profile
    const users = await User.find({ 
      profile: { $exists: true },
      email: { $ne: null, $ne: "", $exists: true } 
    }).lean();

    if (!users || users.length === 0) {
      console.log("No users with profiles found to notify.");
      return;
    }

    console.log(`Scanning ${users.length} users for matches with job: ${newJob.title}`);
    let matchCount = 0;

    // 2. Setup Transporter (Using your SMTP credentials)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      pool: true, // Use pooling for multiple recipients
    });

    // Verify SMTP connection
    try {
      await transporter.verify();
      console.log("SMTP Connection verified.");
    } catch (smtpErr: any) {
      console.error("SMTP Configuration Error:", smtpErr.message);
      return;
    }

    // 3. Process matching and send emails
    for (const user of users) {
      if (!user.profile || !user.profile.qualifications) continue;

      const candidate: CandidateProfile = {
        fullName: user.fullName,
        email: user.email,
        gender: user.profile.gender,
        qualifications: user.profile.qualifications
      };

      // Check if this SPECIFIC job matches this candidate
      const matches = getEligibleJobs(candidate, [newJob]);

      if (matches.length > 0) {
        matchCount++;
        const match = matches[0];
        const jobUrl = `https://rojgar-match.vercel.app/all-jobs/${newJob.id}`;

        const mailOptions = {
          from: `"RojgarMatch" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: `[RojgarMatch] New Match: ${newJob.title}`,
          text: `Hello ${user.fullName},\n\nA new recruitment matching your profile has been posted.\n\nJob: ${newJob.title}\nOrganization: ${newJob.organization || 'National Registry'}\nLast Date: ${newJob.importantDates?.applicationLastDate || "Details Awaited"}\n\nView details: ${jobUrl}\n\n---\nTo unsubscribe from these alerts, reply "UNSUBSCRIBE" or update your profile settings.\nNational Recruitment Registry, RojgarMatch Office`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 550px; margin: 0 auto; color: #1f2328; line-height: 1.5; font-size: 14px;">
              <p>Hello <strong>${user.fullName}</strong>,</p>
              <p>We found a new job match matching your qualification profile: (${match.matchedOn}).</p>
              
              <div style="margin: 20px 0; padding: 15px; border-left: 3px solid #0D244D; background-color: #f6f8fa;">
                <strong style="font-size: 16px; color: #0D244D;">${newJob.title}</strong><br />
                <span style="color: #57606a;">${newJob.organization || 'National Registry'}</span><br />
                <span style="color: #cf222e; font-size: 13px;">Last Date: ${newJob.importantDates?.applicationLastDate || "Details Awaited"}</span>
              </div>
              
              <p>You can view the full details and apply at the following link:<br />
              <a href="${jobUrl}" style="color: #0969da; text-decoration: underline;">${jobUrl}</a></p>
              
              <hr style="border: 0; border-top: 1px solid #d0d7de; margin: 24px 0;" />
              <p style="font-size: 12px; color: #57606a;">
                You are receiving this because your profile is registered on RojgarMatch.<br />
                To unsubscribe, reply to this email with "UNSUBSCRIBE".
              </p>
            </div>
          `,
          headers: {
            'List-Unsubscribe': `<mailto:${process.env.SMTP_USER}?subject=unsubscribe>`,
            'Precedence': 'list',
            'X-Auto-Response-Suppress': 'OOF, AutoReply',
          }
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`Notification sent to matching candidate: ${user.email}`);
        } catch (mailErr: any) {
          console.error(`Failed to send match email to ${user.email}:`, mailErr.message);
        }
      }
    }
    console.log(`Notification sweep complete. Total matches notified: ${matchCount}`);
  } catch (err) {
    console.error('Notification Service Error:', err);
  }
}
