import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import User from '@/models/User';
import Job from '@/models/Job';
import { getEligibleJobs } from '@/lib/matching';

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({ profile: { $exists: true } }).lean();
    const jobs = await Job.find({ active: { $ne: false } }).lean();

    const analyzedUsers = users.map((u: any) => {
      const candidate = {
        fullName: u.fullName,
        email: u.email,
        gender: u.profile?.gender,
        qualifications: u.profile?.qualifications || [],
      };
      
      const matched = getEligibleJobs(candidate, jobs as any);
      return {
        id: u._id,
        fullName: u.fullName,
        email: u.email,
        profile: u.profile,
        matchesCount: matched.length,
        matches: matched.map((m: any) => ({
          jobId: m.job.id,
          jobTitle: m.job.title,
          matchedOn: m.matchedOn,
        })),
      };
    });

    return NextResponse.json({ success: true, users: analyzedUsers });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'User ID is required' }, { status: 400 });
    }

    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'User deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
