import {
    ColumnType,
    Generated,
    Insertable,
    JSONColumnType,
    Selectable,
    Updateable,
  } from 'kysely'
  
  export interface Database {
    iqRCampaign: iqRCampaignTable
  }

  export interface iqRCampaignTable {
    id: number;
    cpg_cntr: number;
    cpg_number: number;
    cpg_version: number;
    cpg_name: string;
    cpg_short_name: string | null;
    cpg_name_lang: string | null;
    cpg_date_from: Date;
    cpg_date_to: Date;
    cpg_kunde_cntr: number;
    cpg_kunde_nummer: number;
    cpg_kunde_name: string;
    cpg_agentur_cntr: number | null;
    cpg_agentur_nummer: number | null;
    cpg_agentur_name: string | null;
    cpg_ersteller: string;
    cpg_ersteller_cntr: number;
    cpg_ad_manager_name: string | null;
    cpg_ad_manager_cntr: number | null;
    cpg_sales_manager: string | null;
    cpg_sales_manager_cntr: number | null;
    cpg_last_modified: Date;
    cpg_report_recipient_cntr_list: number | null;
  }

  export type iqRCampaign = Selectable<iqRCampaignTable>
  export type NewIqRCampaign = Insertable<iqRCampaignTable>
  export type IqRCampaignUpdate = Updateable<iqRCampaignTable>