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

    // Read the line items data file
    const filePath = path.join(process.cwd(), 'db-azure', 'mock-data-lineItems-for-campaigns.json');
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const lineItems = JSON.parse(fileContent);

    // Filter line items by campaign ID
    const campaignLineItems = lineItems.filter((item: any) => item.cli_cpg_cntr === campaignId);

    // Sort by position number (extract number from cli_pos)
    const sortedLineItems = campaignLineItems.sort((a: any, b: any) => {
      const posA = parseFloat(a.cli_pos.split(':')[1] || '0');
      const posB = parseFloat(b.cli_pos.split(':')[1] || '0');
      return posA - posB;
    });

    return NextResponse.json(sortedLineItems);
  } catch (error) {
    console.error('Error loading line items:', error);
    return NextResponse.json(
      { error: 'Failed to load line items' },
      { status: 500 }
    );
  }
}
