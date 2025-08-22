"use server"

import { enhancedDb, dbUtils } from "@/db-azure/sqlserver-db"
import { iqRCampaign } from "@/db-azure/types"

export async function getIqRCampaigns() {
    console.log('[Azure Actions] Getting campaigns...')
    
    // First, let's check the connection status
    const status = dbUtils.getConnectionStatus()
    const lastError = dbUtils.getLastError()
    const attempts = dbUtils.getConnectionAttempts()
    
    console.log('[Azure Actions] Connection status:', status)
    console.log('[Azure Actions] Connection attempts:', attempts)
    if (lastError) {
        console.log('[Azure Actions] Last error:', lastError)
    }
    
    // Use the enhanced database interface
    const result = await enhancedDb.selectAll('iqRCampaign')
    
    if (result.success) {
        console.log('[Azure Actions] Successfully retrieved campaigns:', result.data?.length || 0)
        return result.data
    } else {
        console.error('[Azure Actions] Failed to retrieve campaigns:', result.error)
        throw new Error(`Failed to retrieve campaigns: ${result.error}`)
    }
}

// Additional utility function to test connection
export async function testDatabaseConnection() {
    console.log('[Azure Actions] Testing database connection...')
    
    const result = await dbUtils.testConnection()
    
    if (result.success) {
        console.log('[Azure Actions] Database connection test successful')
        return {
            success: true,
            message: 'Database connection is working',
            status: dbUtils.getConnectionStatus(),
            attempts: dbUtils.getConnectionAttempts()
        }
    } else {
        console.error('[Azure Actions] Database connection test failed:', result.error)
        return {
            success: false,
            error: result.error,
            status: dbUtils.getConnectionStatus(),
            attempts: dbUtils.getConnectionAttempts(),
            config: dbUtils.getConnectionConfig()
        }
    }
}

// Function to get connection diagnostics
export async function getConnectionDiagnostics() {
    return {
        status: dbUtils.getConnectionStatus(),
        lastError: dbUtils.getLastError(),
        attempts: dbUtils.getConnectionAttempts(),
        config: dbUtils.getConnectionConfig()
    }
}