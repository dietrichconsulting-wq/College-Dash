import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

const { data, error } = await supabase
  .from('profiles')
  .update({ onboarding_complete: false, gpa: null, sat: null, act_score: null })
  .eq('display_name', 'Gabriela Dietrich')
  .select('id, display_name, onboarding_complete, gpa, sat')

if (error) {
  console.error('Error:', error.message)
} else {
  console.log('Reset onboarding for:', data)
}
