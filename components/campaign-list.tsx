"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Building2, User, ArrowRight, CircleAlert } from "lucide-react";
import Link from "next/link";

interface Campaign {
  cpg_cntr: number;
  cpg_number: number;
  cpg_name: string;
  cpg_short_name: string | null;
  cpg_date_from: string;
  cpg_date_to: string;
  cpg_kunde_name: string;
  cpg_agentur_name: string | null;
  cpg_ersteller: string;
  cpg_last_modified: string;
}

export default function CampaignList() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        const response = await fetch('/api/campaigns');
        if (!response.ok) {
          throw new Error('Failed to fetch campaigns');
        }
        const data = await response.json();
        setCampaigns(data);
      } catch (error) {
        console.error('Error loading campaigns:', error);
        setCampaigns([]);
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, []);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const handleCreateArgumentation = (campaignId: number) => {
    // Handle argumentation creation
    console.log('Creating argumentation for campaign:', campaignId);
    // In a real app, this would navigate to argumentation creation page
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                <div className="h-8 bg-gray-200 rounded w-full"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold tracking-tight">Neueste Kampagnen</h2>
        <Badge variant="secondary">{campaigns.length} Kampagnen</Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaigns.map((campaign) => (
          <Card key={campaign.cpg_cntr} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg font-semibold line-clamp-2">
                  {campaign.cpg_short_name || campaign.cpg_name}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  #{campaign.cpg_number}
                </Badge>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4 flex-1 h-full">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span className="truncate">{campaign.cpg_kunde_name}</span>
                </div>
                
                {campaign.cpg_agentur_name && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-4 w-4" />
                    <span className="truncate">{campaign.cpg_agentur_name}</span>
                  </div>
                )}
                
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>
                    {formatDate(campaign.cpg_date_from)} - {formatDate(campaign.cpg_date_to)}
                  </span>
                </div>
              </div>
              
            </CardContent>
            <CardFooter className="flex flex-col gap-2">
                             <Link className="w-full" href={`/argumentation/${campaign.cpg_cntr}`}>
                 <Button variant="outline" className="w-full cursor-pointer group" size="sm">
                   Details anzeigen <CircleAlert className="w-4 h-4 group-hover:scale-[1.1] transition-transform ease-in-out duration-200" />
                 </Button>
               </Link>
              <Button 
                onClick={() => handleCreateArgumentation(campaign.cpg_cntr)}
                className="w-full cursor-pointer group"
                size="sm"
              >
                Argumentation erstellen <ArrowRight className="w-4 h-4 group-hover:translate-x-3 transition-transform ease-in-out duration-200" />
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
