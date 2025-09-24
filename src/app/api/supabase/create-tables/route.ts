import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Check if Supabase environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        message: 'Supabase miljövariabler saknas',
        details: 'NEXT_PUBLIC_SUPABASE_URL eller NEXT_PUBLIC_SUPABASE_ANON_KEY är inte satt'
      })
    }

    // Create Supabase client
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // First, check if we can connect to Supabase by trying to query a simple table
    const { error: connectionError } = await supabase
      .from('users')
      .select('id')
      .limit(1)

    // If we get a "table not found" error, connection is working but table doesn't exist
    if (connectionError && !connectionError.message.includes('Could not find the table')) {
      return NextResponse.json({
        success: false,
        message: 'Kunde inte ansluta till Supabase',
        details: `Anslutningsfel: ${connectionError.message}`
      })
    }

    // Try to create tables using Supabase's SQL execution
    const tables = [
      {
        name: 'users',
        sql: `
          CREATE TABLE IF NOT EXISTS users (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE NOT NULL,
            email_verified TIMESTAMP WITH TIME ZONE,
            image TEXT,
            role VARCHAR(50) DEFAULT 'student',
            school_id UUID,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'accounts',
        sql: `
          CREATE TABLE IF NOT EXISTS accounts (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            user_id UUID NOT NULL,
            type VARCHAR(255) NOT NULL,
            provider VARCHAR(255) NOT NULL,
            provider_account_id VARCHAR(255) NOT NULL,
            refresh_token TEXT,
            access_token TEXT,
            expires_at BIGINT,
            token_type VARCHAR(255),
            scope VARCHAR(255),
            id_token TEXT,
            session_state VARCHAR(255),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(provider, provider_account_id)
          );
        `
      },
      {
        name: 'sessions',
        sql: `
          CREATE TABLE IF NOT EXISTS sessions (
            id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
            session_token VARCHAR(255) UNIQUE NOT NULL,
            user_id UUID NOT NULL,
            expires TIMESTAMP WITH TIME ZONE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      },
      {
        name: 'verification_tokens',
        sql: `
          CREATE TABLE IF NOT EXISTS verification_tokens (
            identifier VARCHAR(255) NOT NULL,
            token VARCHAR(255) UNIQUE NOT NULL,
            expires TIMESTAMP WITH TIME ZONE NOT NULL,
            PRIMARY KEY (identifier, token)
          );
        `
      }
    ]

    const results = []
    let successCount = 0

    // Try to create each table
    for (const table of tables) {
      try {
        // Use Supabase's SQL execution via RPC
        const { error: tableError } = await supabase.rpc('exec_sql', { 
          sql: table.sql 
        })

        if (tableError) {
          // If RPC doesn't work, try alternative approach
          const { error: altError } = await supabase
            .from('information_schema.tables')
            .select('table_name')
            .eq('table_name', table.name)
            .limit(1)

          if (altError) {
            results.push(`${table.name}: Fel - ${tableError.message}`)
          } else {
            results.push(`${table.name}: Redan existerar`)
            successCount++
          }
        } else {
          results.push(`${table.name}: Skapad`)
          successCount++
        }
      } catch (err) {
        results.push(`${table.name}: Fel - ${err}`)
      }
    }

    // Try to create indexes
    const indexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON accounts(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);',
      'CREATE INDEX IF NOT EXISTS idx_sessions_token ON sessions(session_token);'
    ]

    for (const indexQuery of indexQueries) {
      try {
        await supabase.rpc('exec_sql', { sql: indexQuery })
        results.push(`Index: Skapad`)
      } catch (err) {
        results.push(`Index: Fel - ${err}`)
      }
    }

    // Check final status
    const { data: finalTables, error: _finalError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['users', 'accounts', 'sessions', 'verification_tokens'])

    const existingTables = finalTables?.map(row => row.table_name) || []

    if (successCount > 0 || existingTables.length > 0) {
      return NextResponse.json({
        success: true,
        message: `Tabeller skapade/verifierade! ${successCount} nya tabeller, ${existingTables.length} totalt.`,
        details: `Resultat: ${results.join(', ')}. Befintliga tabeller: ${existingTables.join(', ')}`
      })
    } else {
      return NextResponse.json({
        success: false,
        message: 'Kunde inte skapa tabeller automatiskt',
        details: `Resultat: ${results.join(', ')}. Du behöver köra SQL-scriptet manuellt i Supabase Dashboard.`
      })
    }

  } catch (error) {
    console.error('Supabase table creation error:', error)
    return NextResponse.json({
      success: false,
      message: 'Fel vid skapande av tabeller',
      details: error instanceof Error ? error.message : 'Okänt fel'
    })
  }
}
