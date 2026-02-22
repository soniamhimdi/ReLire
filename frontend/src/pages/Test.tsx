import { useEffect, useState } from 'react';

export default function Test() {
  const [result, setResult] = useState<string>('Chargement...');

  useEffect(() => {
    fetch('http://localhost:3000/')
      .then(res => res.json())
      .then(data => setResult('✅ CORS OK: ' + JSON.stringify(data)))
      .catch(err => setResult('❌ Erreur: ' + err.message));
  }, []);

  return <div style={{ padding: '2rem' }}>{result}</div>;
}