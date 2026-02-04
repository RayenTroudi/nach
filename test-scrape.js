// Quick test to see what HTML we're getting from ausbildung.de

async function testFetch() {
  try {
    const url = 'https://www.ausbildung.de/suche/?search=Pflegefachmann%7CFrankfurt';
    console.log('Fetching:', url);
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      },
    });
    
    console.log('Status:', response.status);
    console.log('Headers:', response.headers);
    
    const html = await response.text();
    console.log('HTML length:', html.length);
    
    // Look for common job listing patterns
    console.log('\n=== Checking for patterns ===');
    console.log('Contains "ausbildung":', html.toLowerCase().includes('ausbildung'));
    console.log('Contains <article:', html.includes('<article'));
    console.log('Contains class="job":', html.includes('class="job"'));
    console.log('Contains class="result":', html.includes('class="result"'));
    console.log('Contains /api/:', html.includes('/api/'));
    console.log('Contains __NEXT_DATA__:', html.includes('__NEXT_DATA__'));
    
    // Try to find Next.js data
    const nextDataMatch = html.match(/<script id="__NEXT_DATA__" type="application\/json">(.*?)<\/script>/);
    if (nextDataMatch) {
      console.log('\n=== Found __NEXT_DATA__ ===');
      const data = JSON.parse(nextDataMatch[1]);
      console.log(JSON.stringify(data, null, 2).substring(0, 3000));
    }
    
    // Save first 5000 chars to see structure
    console.log('\n=== First 3000 chars ===');
    console.log(html.substring(0, 3000));
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testFetch();
