import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://seipoxwbqyjqpayzfptl.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNlaXBveHdicXlqcXBheXpmcHRsIiwicm9sZSI6ImFub24iLCJpYXQiOjE2ODY3NDY3NDAsImV4cCI6MjAwMjMyMjc0MH0.9nXrb69A4LxfJNEFTgOb67nNUb3dj2qnSO3hki013Nk";
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;