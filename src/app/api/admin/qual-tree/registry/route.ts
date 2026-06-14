import { NextResponse } from 'next/server';
import dbConnect from '@/lib/mongodb';
import Registry from '@/models/Registry';
import Job from '@/models/Job';
import { QUAL_TREE } from '@/lib/constants';

// Seeding logic: If DB is empty, push everything from constants.ts
async function seedIfNeeded() {
  const count = await Registry.countDocuments();
  if (count === 0) {
    console.log("Seeding Registry from constants.ts...");
    // InsertMany will handle the array
    await Registry.insertMany(QUAL_TREE);
  }
}

export async function GET() {
  try {
    await dbConnect();
    await seedIfNeeded();
    
    const registry = await Registry.find({}).sort({ level: 1 }).lean();
    const jobs = await Job.find({}).lean();
    
    // Accumulate counts
    const courseCounts: Record<string, number> = {};
    const branchCounts: Record<string, Record<string, number>> = {};
    
    const extractRequirements = (obj: any) => {
      const reqs: { qualification: string; branches: string[] }[] = [];
      if (obj && obj.educationRequirementForMatch && Array.isArray(obj.educationRequirementForMatch) && obj.educationRequirementForMatch.length > 0) {
        obj.educationRequirementForMatch.forEach((r: any) => {
          if (r && r.qualification) {
            reqs.push({
              qualification: r.qualification,
              branches: Array.isArray(r.branches) ? r.branches : []
            });
          }
        });
      } else if (obj && obj.qualification) {
        const qual = obj.qualification;
        if (qual && Array.isArray(qual.courses)) {
          qual.courses.forEach((c: any) => {
            if (c && c.name) {
              reqs.push({
                qualification: c.name,
                branches: Array.isArray(c.branches) ? c.branches : []
              });
            }
          });
        } else if (qual && qual.course) {
          const courses = Array.isArray(qual.course) ? qual.course : [qual.course];
          const branches = Array.isArray(qual.branch) ? qual.branch : (qual.branch ? [qual.branch] : []);
          courses.forEach((c: string) => {
            if (c) {
              reqs.push({
                qualification: c,
                branches: branches
              });
            }
          });
        }
      }
      return reqs;
    };
    
    jobs.forEach((job: any) => {
      const requirements: { qualification: string; branches: string[] }[] = [];
      if (job.posts && Array.isArray(job.posts) && job.posts.length > 0) {
        job.posts.forEach((post: any) => {
          requirements.push(...extractRequirements(post));
        });
      } else {
        requirements.push(...extractRequirements(job));
      }
      
      requirements.forEach((req) => {
        const courseName = req.qualification.trim().toLowerCase();
        courseCounts[courseName] = (courseCounts[courseName] || 0) + 1;
        
        if (req.branches && Array.isArray(req.branches)) {
          if (!branchCounts[courseName]) {
            branchCounts[courseName] = {};
          }
          req.branches.forEach((b: string) => {
            if (b) {
              const branchName = b.trim().toLowerCase();
              branchCounts[courseName][branchName] = (branchCounts[courseName][branchName] || 0) + 1;
            }
          });
        }
      });
    });
    
    const augmentedRegistry = registry.map((course: any) => {
      const courseNorm = course.name.toLowerCase();
      const courseCount = courseCounts[courseNorm] || 0;
      
      const branches = Array.isArray(course.branches)
        ? course.branches.map((b: any) => {
            const valNorm = (b.value || '').toLowerCase();
            const lblNorm = (b.label || '').toLowerCase();
            
            let count = 0;
            const courseBranchCounts = branchCounts[courseNorm];
            if (courseBranchCounts) {
              for (const [reqBranch, reqCount] of Object.entries(courseBranchCounts)) {
                if (reqBranch === valNorm || reqBranch === lblNorm) {
                  count += reqCount;
                }
              }
            }
            return {
              ...b,
              jobCount: count
            };
          })
        : [];
        
      return {
        ...course,
        jobCount: courseCount,
        branches
      };
    });
    
    return NextResponse.json(augmentedRegistry);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name, label, level, branches } = await request.json();
    if (!name) return NextResponse.json({ error: "Name required" }, { status: 400 });

    await dbConnect();
    
    // UPSERT: Create if doesn't exist, update if it does
    const updated = await Registry.findOneAndUpdate(
      { name },
      { label, level, branches },
      { upsert: true, new: true }
    );

    return NextResponse.json({ success: true, data: updated });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const name = searchParams.get('name');
    if (!name) return NextResponse.json({ error: "Course name required" }, { status: 400 });

    await dbConnect();
    await Registry.deleteOne({ name });
    
    return NextResponse.json({ success: true, message: `Course ${name} deleted from registry.` });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
