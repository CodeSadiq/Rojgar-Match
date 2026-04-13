import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Bulletin from '@/models/Bulletin';
import { getCachedData, setCachedData, invalidateCache } from '@/lib/cache';

export async function GET(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      const cacheKey = `bulletin:${id}`;
      const cached = await getCachedData(cacheKey);
      if (cached) return NextResponse.json(cached);

      const bulletin = await Bulletin.findOne({ id }).lean();
      if (!bulletin) return NextResponse.json({ success: false, error: "Bulletin not found" }, { status: 404 });
      
      await setCachedData(cacheKey, bulletin, 3600);
      return NextResponse.json(bulletin);
    }

    const cacheKey = 'bulletins:active';
    const cached = await getCachedData(cacheKey);
    if (cached) return NextResponse.json(cached);

    const allBulletins = await Bulletin.find({ active: true }).sort({ createdAt: -1 }).lean();
    await setCachedData(cacheKey, allBulletins, 300); // 5 minutes for bulletins
    
    return NextResponse.json(allBulletins);
  } catch (error) {
    console.error("BULLETIN GET ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch bulletins" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    if (!body.id) body.id = 'b-' + Math.random().toString(36).substr(2, 9);

    const bulletin = await Bulletin.findOneAndUpdate({ id: body.id }, body, { upsert: true, new: true, runValidators: true });
    
    // Invalidate Cache
    await invalidateCache('bulletins:active');
    await invalidateCache(`bulletin:${body.id}`);

    return NextResponse.json({ success: true, data: bulletin }, { status: 201 });
  } catch (error: any) {
    console.error("BULLETIN SYNC FAILED:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) return NextResponse.json({ success: false, error: "ID is required" }, { status: 400 });

    const deleted = await Bulletin.findOneAndDelete({ id });
    if (!deleted) return NextResponse.json({ success: false, error: "Bulletin not found" }, { status: 404 });

    // Invalidate Cache
    await invalidateCache('bulletins:active');
    await invalidateCache(`bulletin:${id}`);

    return NextResponse.json({ success: true, message: "Bulletin deleted successfully" });
  } catch (error: any) {
    console.error("BULLETIN DELETE FAILED:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
