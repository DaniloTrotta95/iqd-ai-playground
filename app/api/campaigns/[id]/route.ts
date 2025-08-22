import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const campaignId = parseInt(id);
    
    if (isNaN(campaignId)) {
      return NextResponse.json(
        { error: 'Invalid campaign ID' },
        { status: 400 }
      );
    }

    // Read the mock data file
    const filePath = path.join(process.cwd(), 'db-azure', 'mock-data-campaigns.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const campaigns = JSON.parse(fileContent);

    // Find the campaign by ID
    const campaign = campaigns.find((c: any) => c.cpg_cntr === campaignId);

    if (!campaign) {
      return NextResponse.json(
        { error: 'Campaign not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(campaign);
  } catch (error) {
    console.error('Error loading campaign details:', error);
    return NextResponse.json(
      { error: 'Failed to load campaign details' },
      { status: 500 }
    );
  }
}
