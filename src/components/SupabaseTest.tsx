import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const SupabaseTest = () => {
  const [status, setStatus] = useState('Checking...');
  const [error, setError] = useState('');

  useEffect(() => {
    const checkSupabase = async () => {
      try {
        // Check if environment variables are loaded
        const url = import.meta.env.VITE_SUPABASE_URL;
        const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (!url || !key) {
          setError('Environment variables not loaded');
          setStatus('Failed');
          return;
        }

        // Test basic connection
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          setError(`Connection error: ${error.message}`);
          setStatus('Failed');
        } else {
          setStatus('Connected');
        }
      } catch (err) {
        setError(`Test error: ${err}`);
        setStatus('Failed');
      }
    };

    checkSupabase();
  }, []);

  return (
    <div className="p-4 bg-card rounded-lg">
      <h3 className="font-bold mb-2">Supabase Connection Test</h3>
      <p>Status: {status}</p>
      {error && <p className="text-red-500">Error: {error}</p>}
      <div className="mt-2 text-sm text-muted-foreground">
        <p>URL: {import.meta.env.VITE_SUPABASE_URL ? '✅ Loaded' : '❌ Missing'}</p>
        <p>Key: {import.meta.env.VITE_SUPABASE_ANON_KEY ? '✅ Loaded' : '❌ Missing'}</p>
      </div>
    </div>
  );
}; 