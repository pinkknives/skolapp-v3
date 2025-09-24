import { NextResponse } from 'next/server'

export async function POST() {
  try {
    // Check if Supabase environment variables are set
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json({
        success: false,
        message: 'Supabase miljövariabler saknas'
      })
    }

    // Create Supabase client
    const { createClient } = await import('@supabase/supabase-js')
    const supabase = createClient(supabaseUrl, supabaseAnonKey)

    // RLS setup SQL
    const rlsSql = `
      -- Enable RLS on all tables
      ALTER TABLE users ENABLE ROW LEVEL SECURITY;
      ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
      ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;

      -- Create policies for users table
      DROP POLICY IF EXISTS "Users can view own profile" ON users;
      CREATE POLICY "Users can view own profile" ON users
        FOR SELECT USING (auth.uid() = id);

      DROP POLICY IF EXISTS "Users can update own profile" ON users;
      CREATE POLICY "Users can update own profile" ON users
        FOR UPDATE USING (auth.uid() = id);

      DROP POLICY IF EXISTS "Users can insert own profile" ON users;
      CREATE POLICY "Users can insert own profile" ON users
        FOR INSERT WITH CHECK (auth.uid() = id);

      -- Create policies for accounts table
      DROP POLICY IF EXISTS "Users can view own accounts" ON accounts;
      CREATE POLICY "Users can view own accounts" ON accounts
        FOR SELECT USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can insert own accounts" ON accounts;
      CREATE POLICY "Users can insert own accounts" ON accounts
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can update own accounts" ON accounts;
      CREATE POLICY "Users can update own accounts" ON accounts
        FOR UPDATE USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can delete own accounts" ON accounts;
      CREATE POLICY "Users can delete own accounts" ON accounts
        FOR DELETE USING (auth.uid() = user_id);

      -- Create policies for sessions table
      DROP POLICY IF EXISTS "Users can view own sessions" ON sessions;
      CREATE POLICY "Users can view own sessions" ON sessions
        FOR SELECT USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can insert own sessions" ON sessions;
      CREATE POLICY "Users can insert own sessions" ON sessions
        FOR INSERT WITH CHECK (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can update own sessions" ON sessions;
      CREATE POLICY "Users can update own sessions" ON sessions
        FOR UPDATE USING (auth.uid() = user_id);

      DROP POLICY IF EXISTS "Users can delete own sessions" ON sessions;
      CREATE POLICY "Users can delete own sessions" ON sessions
        FOR DELETE USING (auth.uid() = user_id);
    `

    // Try to execute RLS setup
    const { error: rlsError } = await supabase.rpc('exec_sql', { 
      sql: rlsSql 
    })

    if (rlsError) {
      return NextResponse.json({
        success: false,
        message: 'Kunde inte konfigurera RLS automatiskt',
        details: `RLS fel: ${rlsError.message}. Du behöver köra RLS-scriptet manuellt i Supabase Dashboard.`
      })
    }

    return NextResponse.json({
      success: true,
      message: 'RLS konfigurerat framgångsrikt!',
      details: 'Row Level Security är nu aktiverat på alla NextAuth.js tabeller.'
    })

  } catch (error) {
    console.error('RLS setup error:', error)
    return NextResponse.json({
      success: false,
      message: 'Fel vid RLS-konfiguration',
      details: error instanceof Error ? error.message : 'Okänt fel'
    })
  }
}
