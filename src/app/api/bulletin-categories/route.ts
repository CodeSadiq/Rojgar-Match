import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import BulletinCategory from '@/models/BulletinCategory';

const DEFAULT_CATEGORIES = [
  { name: 'Important', isStatic: true, active: true },
  { name: 'Syllabus', isStatic: true, active: true },
  { name: 'Admission', isStatic: true, active: true },
  { name: 'Result', isStatic: true, active: true },
  { name: 'Admit Card', isStatic: true, active: true }
];

async function seedCategoriesIfEmpty() {
  const count = await BulletinCategory.countDocuments();
  if (count === 0) {
    await BulletinCategory.insertMany(DEFAULT_CATEGORIES);
  }
}

export async function GET(request: Request) {
  await dbConnect();
  try {
    await seedCategoriesIfEmpty();
    const { searchParams } = new URL(request.url);
    const showAll = searchParams.get('all') === 'true';

    const query = showAll ? {} : { active: true };
    const categories = await BulletinCategory.find(query).sort({ isStatic: -1, name: 1 }).lean();
    return NextResponse.json(categories);
  } catch (error) {
    console.error("BULLETIN CATEGORY GET ERROR:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch categories" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  await dbConnect();
  try {
    const body = await request.json();
    if (!body.name) return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });

    const formattedName = body.name.trim();

    const category = await BulletinCategory.findOneAndUpdate(
      { name: { $regex: new RegExp(`^${formattedName}$`, 'i') } },
      { name: formattedName, active: body.active !== false },
      { upsert: true, new: true, runValidators: true }
    );

    return NextResponse.json({ success: true, data: category }, { status: 201 });
  } catch (error: any) {
    console.error("BULLETIN CATEGORY POST FAILED:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: Request) {
  await dbConnect();
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    if (!name) return NextResponse.json({ success: false, error: "Name is required" }, { status: 400 });

    const category = await BulletinCategory.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
    if (!category) return NextResponse.json({ success: false, error: "Category not found" }, { status: 404 });

    await BulletinCategory.findOneAndDelete({ name: category.name });
    return NextResponse.json({ success: true, message: "Category deleted successfully" });
  } catch (error: any) {
    console.error("BULLETIN CATEGORY DELETE FAILED:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
