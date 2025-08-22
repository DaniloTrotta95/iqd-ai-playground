import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the mock data file
    const filePath = path.join(process.cwd(), 'db-azure', 'mock-data-campaigns.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const campaigns = JSON.parse(fileContent);

    // Sort by last modified date (most recent first) and take the latest 20
    const sortedCampaigns = campaigns
      .sort((a: any, b: any) => new Date(b.cpg_last_modified).getTime() - new Date(a.cpg_last_modified).getTime())
      .slice(0, 20);

    return NextResponse.json(sortedCampaigns);
  } catch (error) {
    console.error('Error loading campaigns:', error);
    return NextResponse.json(
      { error: 'Failed to load campaigns' },
      { status: 500 }
    );
  }
}
