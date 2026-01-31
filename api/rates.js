export default async function handler(req, res) {
  try {
    const response = await fetch(
      `https://api.stlouisfed.org/fred/series/observations?series_id=WGS1YR&api_key=${process.env.FRED_API_KEY}&file_type=json&sort_order=desc&limit=1000`
    );
    
    if (!response.ok) {
      throw new Error('FRED API request failed');
    }
    
    const data = await response.json();
    
    // Transform the data into a simpler format
    const rates = {};
    for (const obs of data.observations) {
      if (obs.value !== '.') {  // FRED uses '.' for missing data
        rates[obs.date] = parseFloat(obs.value);
      }
    }
    
    res.setHeader('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    res.status(200).json(rates);
  } catch (error) {
    console.error('Error fetching rates:', error);
    res.status(500).json({ error: 'Failed to fetch interest rates' });
  }
}
