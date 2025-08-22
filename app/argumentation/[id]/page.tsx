"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Calendar, 
  Building2, 
  User, 
  ArrowLeft, 
  ArrowRight,
  FileText,
  Hash,
  Clock,
  Mail,
  Phone,
  MapPin,
  ExternalLink
} from "lucide-react";
import Link from "next/link";


interface CampaignDetails {
  cpg_cntr: number;
  cpg_number: number;
  cpg_version: number;
  cpg_name: string;
  cpg_short_name: string | null;
  cpg_name_lang: string;
  cpg_date_from: string;
  cpg_date_to: string;
  cpg_kunde_cntr: number;
  cpg_kunde_nummer: string;
  cpg_kunde_name: string;
  cpg_agentur_cntr: number | null;
  cpg_agentur_nummer: string | null;
  cpg_agentur_name: string | null;
  cpg_ersteller: string;
  cpg_ersteller_cntr: number;
  cpg_ad_manager_name: string;
  cpg_ad_manager_cntr: number;
  cpg_sales_manager: string;
  cpg_sales_manager_cntr: number;
  cpg_last_modified: string;
  cpg_report_recipient_cntr_list: string;
  cpg_screenshot_recipient_cntr_list: string;
}

interface LineItem {
  cli_cntr: number;
  cli_cpg_cntr: number;
  cli_pos: string;
  cli_delivery_from: string;
  cli_delivery_to: string;
  cli_target_units: number;
  cli_pt_id: number;
  cli_pt_name: string;
  cli_cs_name: string;
  cli_cs_name_enu: string;
  cli_iv_name: string;
  cli_iv_matchcode: string;
  cli_iv_name_enu: string;
  cli_at_name: string;
  cli_at_matchcode: string;
  cli_at_name_enu: string;
  cli_at_size: string | null;
  cli_is_bonus: string;
  cli_description: string | null;
  cli_eTKP_vertical: number;
  cli_eTKP_vertical_manuell: number | null;
  cli_eTKP_vertical_gebucht: number;
  cli_N2: number;
  cli_N2_pro_ME: number;
  cli_buchungsart: string;
  cli_cpg_number: number;
  cli_foreign_number: string | null;
  cli_second_available_units: number;
  cli_last_modified: string;
  cli_actual_cpm_sc: number;
  cli_WM_nicht_spec_konform: string;
  cli_clivm_name: string | null;
  cli_WM_Bemerkung: string;
  cli_clip_id_set: number;
}

export default function CampaignDetailsPage() {
  const params = useParams();
  const [campaign, setCampaign] = useState<CampaignDetails | null>(null);
  const [lineItems, setLineItems] = useState<LineItem[]>([]);
  const [techSpecUrls, setTechSpecUrls] = useState<Record<string, string | null>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadCampaignDetails = async () => {
      try {
        // Load campaign details
        const campaignResponse = await fetch(`/api/campaigns/${params.id}`);
        if (!campaignResponse.ok) {
          throw new Error('Campaign not found');
        }
        const campaignData = await campaignResponse.json();
        setCampaign(campaignData);

        // Load line items
        const lineItemsResponse = await fetch(`/api/campaigns/${params.id}/lineitems`);
        if (lineItemsResponse.ok) {
          const lineItemsData = await lineItemsResponse.json();
          setLineItems(lineItemsData);
          
          // Fetch techspec URLs for each line item
          const urlPromises = lineItemsData.map(async (item: LineItem) => {
            if (item.cli_at_name) {
              try {
                const response = await fetch(`/api/techspec/${encodeURIComponent(item.cli_at_name)}`);
                if (response.ok) {
                  const data = await response.json();
                  return { matchcode: item.cli_at_name, url: data.url };
                }
              } catch (error) {
                console.error(`Error fetching URL for ${item.cli_at_name}:`, error);
              }
              return { matchcode: item.cli_at_name, url: null };
            }
            return { matchcode: item.cli_at_name, url: null };
          });
          
          const urlResults = await Promise.all(urlPromises);
          const urlMap = urlResults.reduce((acc, { matchcode, url }) => {
            if (matchcode) {
              acc[matchcode] = url;
            }
            return acc;
          }, {} as Record<string, string | null>);
          
          setTechSpecUrls(urlMap);
          console.log(urlMap)
        }
      } catch (error) {
        console.error('Error loading campaign details:', error);
        setError('Failed to load campaign details');
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      loadCampaignDetails();
    }
  }, [params.id]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('de-DE', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatDateRange = (from: string, to: string) => {
    return `${formatDate(from)} - ${formatDate(to)}`;
  };

  const handleCreateArgumentation = () => {
    console.log('Creating argumentation for campaign:', campaign?.cpg_cntr);
    // In a real app, this would navigate to argumentation creation page
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6 space-y-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader>
                  <div className="h-6 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {[...Array(3)].map((_, j) => (
                      <div key={j} className="h-4 bg-gray-200 rounded w-3/4"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <div className="text-red-500 text-lg font-semibold">
                {error || 'Campaign not found'}
              </div>
              <Link href="/argumentation">
                <Button variant="outline">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Zurück zur Übersicht
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/argumentation">
            <Button variant="outline" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Zurück
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              {campaign.cpg_short_name || campaign.cpg_name}
            </h1>
            <p className="text-muted-foreground">
              Kampagne #{campaign.cpg_number} • Version {campaign.cpg_version}
            </p>
          </div>
        </div>
        <Badge variant="secondary">
          ID: {campaign.cpg_cntr}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5" />
              Kampagnen-Informationen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Name</label>
                <p className="text-sm">{campaign.cpg_name}</p>
              </div>
              
              {campaign.cpg_short_name && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Kurzname</label>
                  <p className="text-sm">{campaign.cpg_short_name}</p>
                </div>
              )}
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Langer Name</label>
                <p className="text-sm">{campaign.cpg_name_lang}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Laufzeit</label>
                <p className="text-sm flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {formatDateRange(campaign.cpg_date_from, campaign.cpg_date_to)}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Letzte Änderung</label>
                <p className="text-sm flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {formatDate(campaign.cpg_last_modified)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customer Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Kunden-Informationen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Kundenname</label>
                <p className="text-sm font-medium">{campaign.cpg_kunde_name}</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Kundennummer</label>
                <p className="text-sm flex items-center gap-2">
                  <Hash className="w-4 h-4" />
                  {campaign.cpg_kunde_nummer}
                </p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Kunden-ID</label>
                <p className="text-sm">{campaign.cpg_kunde_cntr}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Agency Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5" />
              Agentur-Informationen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {campaign.cpg_agentur_name ? (
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Agenturname</label>
                  <p className="text-sm font-medium">{campaign.cpg_agentur_name}</p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Agenturnummer</label>
                  <p className="text-sm flex items-center gap-2">
                    <Hash className="w-4 h-4" />
                    {campaign.cpg_agentur_nummer}
                  </p>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Agentur-ID</label>
                  <p className="text-sm">{campaign.cpg_agentur_cntr}</p>
                </div>
              </div>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">Keine Agentur zugeordnet</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="w-5 h-5" />
              Kontakt-Informationen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ersteller</label>
                <p className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {campaign.cpg_ersteller}
                </p>
                <p className="text-xs text-muted-foreground">ID: {campaign.cpg_ersteller_cntr}</p>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Ad Manager</label>
                <p className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {campaign.cpg_ad_manager_name}
                </p>
                <p className="text-xs text-muted-foreground">ID: {campaign.cpg_ad_manager_cntr}</p>
              </div>
              
              <Separator />
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Sales Manager</label>
                <p className="text-sm flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {campaign.cpg_sales_manager}
                </p>
                <p className="text-xs text-muted-foreground">ID: {campaign.cpg_sales_manager_cntr}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recipients */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ExternalLink className="w-5 h-5" />
              Empfänger-Listen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Report Empfänger</label>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  {campaign.cpg_report_recipient_cntr_list ? (
                    <p className="text-sm font-mono break-all">
                      {campaign.cpg_report_recipient_cntr_list}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Keine Empfänger definiert</p>
                  )}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-muted-foreground">Screenshot Empfänger</label>
                <div className="mt-2 p-3 bg-muted rounded-md">
                  {campaign.cpg_screenshot_recipient_cntr_list ? (
                    <p className="text-sm font-mono break-all">
                      {campaign.cpg_screenshot_recipient_cntr_list}
                    </p>
                  ) : (
                    <p className="text-sm text-muted-foreground">Keine Empfänger definiert</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
                 </Card>
       </div>

       {/* Line Items Section */}
       <Card className="lg:col-span-2">
         <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Hash className="w-5 h-5" />
             Kampagnen-Positionen ({lineItems.length})
           </CardTitle>
         </CardHeader>
         <CardContent>
           {lineItems.length > 0 ? (
             <div className="grid grid-cols-1  gap-4">
               {lineItems.map((item) => (
                 <div
                   key={item.cli_cntr}
                   className={`p-4 rounded-lg border transition-all duration-200 hover:shadow-md ${
                     item.cli_is_bonus === "1" 
                       ? "bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-200" 
                       : "bg-gradient-to-br from-white via-white to-blue-100 border-black"
                   }`}
                 >
                   <div className="flex items-start justify-between mb-3">
                     <div className="flex-1">
                       <h4 className="font-semibold text-sm text-gray-900 mb-1">
                         {item.cli_pos}
                       </h4>
                       <p className="text-xs text-gray-600 mb-2">
                         {item.cli_cs_name}
                       </p>
                     </div>
                     <Badge 
                       variant={item.cli_is_bonus === "1" ? "secondary" : "default"}
                       className="text-xs"
                     >
                       {item.cli_is_bonus === "1" ? "Bonus" : item.cli_pt_name}
                     </Badge>
                   </div>

                   <div className="space-y-2 text-xs">
                     <div className="flex items-center gap-2">
                       <Calendar className="w-3 h-3 text-gray-500" />
                       <span className="text-gray-700">
                         {formatDate(item.cli_delivery_from)} - {formatDate(item.cli_delivery_to)}
                       </span>
                     </div>

                     <div className="flex items-center gap-2">
                       <User className="w-3 h-3 text-gray-500" />
                       <span className="text-gray-700">
                         {item.cli_iv_name}
                       </span>
                     </div>

                     <div className="flex items-center gap-2">
                       <FileText className="w-3 h-3 text-gray-500" />
                       <span className="text-gray-700">
                         {item.cli_at_name}
                       </span>
                       -
                       <span className="text-gray-700">
                        TechSpec: 
                        {item.cli_at_name && techSpecUrls[item.cli_at_name] ? (
                          <a 
                            href={techSpecUrls[item.cli_at_name]!} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-500 hover:text-blue-700 underline"
                          >
                            {item.cli_at_name}
                          </a>
                        ) : (
                          <span className="text-gray-500">
                            {item.cli_at_name}
                          </span>
                        )}
                       </span>
                     </div>

                     {item.cli_at_size && (
                       <div className="flex items-center gap-2">
                         <span className="text-gray-500">Size:</span>
                         <span className="text-gray-700 font-mono text-xs">
                           {item.cli_at_size}
                         </span>
                       </div>
                     )}

                     <div className="flex items-center justify-between pt-2 border-t border-gray-200">
                       <div>
                         <span className="text-gray-500">Target:</span>
                         <span className="text-gray-700 font-medium ml-1">
                           {item.cli_target_units.toLocaleString()}
                         </span>
                       </div>
                       <div>
                         <span className="text-gray-500">eTKP:</span>
                         <span className="text-gray-700 font-medium ml-1">
                           {item.cli_eTKP_vertical_gebucht.toLocaleString()}
                         </span>
                       </div>
                     </div>

                     {item.cli_description && (
                       <div className="pt-2 border-t border-gray-200">
                         <p className="text-gray-600 text-xs italic">
                           {item.cli_description}
                         </p>
                       </div>
                     )}
                   </div>
                 </div>
               ))}
             </div>
           ) : (
             <div className="text-center py-8">
               <p className="text-gray-500">Keine Positionen für diese Kampagne gefunden</p>
             </div>
           )}
         </CardContent>
       </Card>
 
       {/* Action Buttons */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              onClick={handleCreateArgumentation}
              className="flex-1 max-w-xs"
              size="lg"
            >
              Argumentation erstellen
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
