import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Job from '@/models/Job';
import { getCachedData, setCachedData, invalidateCache } from '@/lib/cache';
import { notifyEligibleCandidates } from '@/lib/notification-service';

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const cacheKey = `job:${id}`;
      const cachedJob = await getCachedData(cacheKey);
      if (cachedJob) return NextResponse.json(cachedJob);

      const job = await Job.findOne({ id }).lean();
      if (!job) return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });

      await setCachedData(cacheKey, job, 3600); // 1 hour for details
      return NextResponse.json(job);
    }

    // Get DB Jobs - Strictly Database Source with Cache
    const cacheKey = 'jobs:all';
    const cachedJobs = await getCachedData(cacheKey);
    if (cachedJobs) return NextResponse.json(cachedJobs);

    const allJobs = await Job.find({}).sort({ updatedAt: -1, createdAt: -1 }).lean();
    await setCachedData(cacheKey, allJobs, 600); // 10 minutes for list

    return NextResponse.json(allJobs);
  } catch (error) {
    console.error("API GET ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch jobs" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    if (!body.id) body.id = Math.random().toString(36).substr(2, 9);

    const job = await Job.findOneAndUpdate({ id: body.id }, body, { upsert: true, new: true, runValidators: true });

    // Invalidate Cache
    await invalidateCache('jobs:all');
    await invalidateCache(`job:${body.id}`);

    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error: any) {
    console.error("ADMIN INJECTION FAILED:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });

    const deletedJob = await Job.findOneAndDelete({ id });
    if (!deletedJob) return NextResponse.json({ success: false, error: "Job not found" }, { status: 404 });

    // Invalidate Cache
    await invalidateCache('jobs:all');
    await invalidateCache(`job:${id}`);

    return NextResponse.json({ success: true, message: "Job deleted successfully" });
  } catch (error: any) {
    console.error("DELETE FAILED:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
