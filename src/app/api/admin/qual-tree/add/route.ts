import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request: Request) {
  try {
    const { qualification, branch } = await request.json();
    if (!qualification || !branch) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const filePath = path.join(process.cwd(), 'src', 'lib', 'constants.ts');
    if (!fs.existsSync(filePath)) {
       return NextResponse.json({ error: "constants.ts not found" }, { status: 404 });
    }

    let content = fs.readFileSync(filePath, 'utf8');
    let lines = content.split('\n');

    // Find the qualification level block
    let foundIndex = -1;
    for (let i = 0; i < lines.length; i++) {
      // Precise check for name property
      if (lines[i].includes(`name: "${qualification}"`) || lines[i].includes(`name: '${qualification}'`)) {
        // Now find the branches line within this block
        for (let j = i; j < i + 10 && j < lines.length; j++) { 
          if (lines[j].includes('branches: [')) {
            foundIndex = j;
            break;
          }
        }
      }
      if (foundIndex !== -1) break;
    }

    if (foundIndex === -1) {
      console.error(`Qual not found: ${qualification}`);
      return NextResponse.json({ error: `Qualification "${qualification}" block not found in QUAL_TREE. Please ensure it matches exactly.` }, { status: 404 });
    }

    // Check if branch already exists in this block
    let exists = false;
    for (let k = foundIndex; k < lines.length; k++) {
        if (lines[k].includes(']') && !lines[k].includes('{')) break; // End of branches array
        if (lines[k].toLowerCase().includes(`value: "${branch.toLowerCase()}"`) || lines[k].toLowerCase().includes(`value: '${branch.toLowerCase()}'`)) {
            exists = true;
            break;
        }
    }

    if (exists) {
      return NextResponse.json({ success: true, message: "Branch already exists" });
    }

    // Insert new branch at the top of the branches array for visibility
    // Determine indentation
    const matchIndentation = lines[foundIndex].match(/^(\s*)/);
    const indent = matchIndentation ? matchIndentation[1] : '      ';
    const newBranch = `${indent}  { value: "${branch}", label: "${branch}" },`;
    
    lines.splice(foundIndex + 1, 0, newBranch);

    fs.writeFileSync(filePath, lines.join('\n'));

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("ADD BRANCH API ERROR:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
