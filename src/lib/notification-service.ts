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
      email: { $exists: true } 
    }).lean();

    if (!users || users.length === 0) return;

    // 2. Setup Transporter (Using your SMTP credentials)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    // 3. Process matching and send emails
    for (const user of users) {
      if (!user.profile || !user.profile.qualifications) continue;

      const candidate: CandidateProfile = {
        fullName: user.fullName,
        email: user.email,
        qualifications: user.profile.qualifications
      };

      // Check if this SPECIFIC job matches this candidate
      const matches = getEligibleJobs(candidate, [newJob]);

      if (matches.length > 0) {
        const match = matches[0];
        const jobUrl = `${process.env.NEXTAUTH_URL}/all-jobs/${newJob.id}`;

        const mailOptions = {
          from: `"RojgarMatch Alerts" <${process.env.SMTP_USER}>`,
          to: user.email,
          subject: `New Recruitment Opportunity: ${newJob.title}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #e1e4e8; border-radius: 12px; overflow: hidden;">
              <div style="background-color: #0D244D; color: white; padding: 24px; text-align: center;">
                <h1 style="margin: 0; font-size: 20px;">Job Match Notification</h1>
              </div>
              <div style="padding: 30px;">
                <p style="font-size: 16px; color: #344163;">Hello <strong>${user.fullName}</strong>,</p>
                <p style="font-size: 15px; color: #586069; line-height: 1.6;">
                  We've identified a new government recruitment that matches your qualifications (${match.matchedOn}).
                </p>
                
                <div style="background-color: #f6f8fa; border-radius: 8px; padding: 20px; margin: 24px 0; border-left: 4px solid #0D244D;">
                  <h2 style="margin: 0 0 10px 0; font-size: 18px; color: #0D244D;">${newJob.title}</h2>
                  <p style="margin: 0; font-size: 14px; color: #586069;">Organization: ${newJob.organization || newJob.org || 'National Registry'}</p>
                </div>

                <div style="text-align: center; margin: 30px 0;">
                  <a href="${jobUrl}" style="background-color: #0D244D; color: white; padding: 14px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">View Details & Apply</a>
                </div>
                
                <hr style="border: 0; border-top: 1px solid #e1e4e8; margin: 30px 0;" />
                <p style="font-size: 12px; color: #959da5; text-align: center;">You are receiving this because your qualification profile is active on RojgarMatch.</p>
              </div>
            </div>
          `,
        };

        try {
          await transporter.sendMail(mailOptions);
          console.log(`Notification sent to matching candidate: ${user.email}`);
        } catch (mailErr: any) {
          console.error(`Failed to send match email to ${user.email}:`, mailErr.message);
        }
      }
    }
  } catch (err) {
    console.error('Notification Service Error:', err);
  }
}
