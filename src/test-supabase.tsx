import { supabase } from './lib/supabase'

export default function TestSupabase() {
  const testConnection = async () => {
    const { data, error } = await supabase.from('profiles').select('count').limit(1)
    console.log('Supabase Test:', { data, error })
    if (error) alert('Error: ' + error.message)
    else alert('✅ Supabase Connected Successfully!')
  }

  return (
    <button onClick={testConnection} className="p-4 bg-blue-600 text-white rounded">
      Test Supabase Connection
    </button>
  )
}