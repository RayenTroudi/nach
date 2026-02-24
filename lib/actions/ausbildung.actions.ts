"use server";

interface AusbildungJob {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  type: string;
  url: string;
}

// In-memory cache for server actions
const cache = new Map<string, { data: any[]; timestamp: number }>();
const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function scrapeAusbildung(search: string, location: string) {
  try {
    const searchUrl = `https://www.ausbildung.de/suche/?search=${encodeURIComponent(search)}%7C${encodeURIComponent(location)}`;
    
    console.log('Fetching from ausbildung.de:', searchUrl);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      },
      next: { revalidate: 3600 } // Cache for 1 hour
    });

    if (!response.ok) {
      console.error('ausbildung.de response not ok:', response.status);
      return null;
    }

    const html = await response.text();
    const opportunities: any[] = [];
    
    const patterns = [
      /<article[^>]*class="[^"]*(?:job|result|listing)[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
      /<div[^>]*class="[^"]*(?:job|result|listing|card)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<li[^>]*class="[^"]*(?:job|result|listing)[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,
    ];
    
    let allMatches: RegExpMatchArray[] = [];
    for (const pattern of patterns) {
      const matches = Array.from(html.matchAll(pattern));
      if (matches.length > 0) {
        allMatches = matches;
        break;
      }
    }
    
    if (allMatches.length === 0) {
      return null;
    }
    
    let index = 0;
    for (const match of allMatches) {
      const jobHtml = match[1];
      
      const titleMatch = jobHtml.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i) ||
                        jobHtml.match(/<a[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/a>/i) ||
                        jobHtml.match(/class="[^"]*title[^"]*"[^>]*>([^<]+)<\/[^>]+>/i);
      const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : '';
      
      const companyMatch = jobHtml.match(/class="[^"]*(?:company|firma|arbeitgeber|unternehmen)[^"]*"[^>]*>([^<]+)/i);
      const company = companyMatch ? companyMatch[1].trim().replace(/\s+/g, ' ') : '';
      
      const locationMatch = jobHtml.match(/class="[^"]*(?:location|ort|standort)[^"]*"[^>]*>([^<]+)/i);
      const jobLocation = locationMatch ? locationMatch[1].trim().replace(/\s+/g, ' ') : location;
      
      const urlMatch = jobHtml.match(/href="([^"]+)"/);
      const url = urlMatch ? urlMatch[1] : '';
      
      if (title && (company || url)) {
        opportunities.push({
          id: `ausbildung-${Date.now()}-${index}`,
          title,
          company: company || 'Company Name',
          location: jobLocation,
          description: `Ausbildung als ${title}${company ? ` bei ${company}` : ''} in ${jobLocation}`,
          type: "Ausbildung",
          url: url.startsWith('http') ? url : `https://www.ausbildung.de${url}`,
          source: 'ausbildung.de'
        });
        index++;
      }
      
      if (opportunities.length >= 20) break;
    }

    return opportunities.length > 0 ? opportunities : null;
  } catch (error) {
    console.error("Scraping ausbildung.de error:", error);
    return null;
  }
}

async function scrapeAzubi(search: string, location: string) {
  try {
    const searchUrl = `https://www.azubi.de/ausbildungsplaetze?q=${encodeURIComponent(search)}&l=${encodeURIComponent(location)}`;
    
    console.log('Fetching from azubi.de:', searchUrl);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      },
      next: { revalidate: 3600 }
    });

    if (!response.ok) {
      console.error('azubi.de response not ok:', response.status);
      return null;
    }

    const html = await response.text();
    const opportunities: any[] = [];
    
    const patterns = [
      /<div[^>]*class="[^"]*(?:stellenangebot|job|result|listing)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<article[^>]*class="[^"]*(?:job|result|listing)[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
      /<li[^>]*class="[^"]*(?:job|result|listing)[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,
    ];
    
    let allMatches: RegExpMatchArray[] = [];
    for (const pattern of patterns) {
      const matches = Array.from(html.matchAll(pattern));
      if (matches.length > 0) {
        allMatches = matches;
        break;
      }
    }
    
    if (allMatches.length === 0) {
      return null;
    }
    
    let index = 0;
    for (const match of allMatches) {
      const jobHtml = match[1];
      
      const titleMatch = jobHtml.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i) ||
                        jobHtml.match(/<a[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/a>/i) ||
                        jobHtml.match(/class="[^"]*title[^"]*"[^>]*>([^<]+)<\/[^>]+>/i);
      const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : '';
      
      const companyMatch = jobHtml.match(/class="[^"]*(?:firma|company|arbeitgeber|unternehmen)[^"]*"[^>]*>([^<]+)/i);
      const company = companyMatch ? companyMatch[1].trim().replace(/\s+/g, ' ') : '';
      
      const locationMatch = jobHtml.match(/class="[^"]*(?:ort|location|standort)[^"]*"[^>]*>([^<]+)/i);
      const jobLocation = locationMatch ? locationMatch[1].trim().replace(/\s+/g, ' ') : location;
      
      const urlMatch = jobHtml.match(/href="([^"]+)"/);
      const url = urlMatch ? urlMatch[1] : '';
      
      if (title && (company || url)) {
        opportunities.push({
          id: `azubi-${Date.now()}-${index}`,
          title,
          company: company || 'Company Name',
          location: jobLocation,
          description: `Ausbildung als ${title}${company ? ` bei ${company}` : ''} in ${jobLocation}`,
          type: "Ausbildung",
          url: url.startsWith('http') ? url : `https://www.azubi.de${url}`,
          source: 'azubi.de'
        });
        index++;
      }
      
      if (opportunities.length >= 20) break;
    }

    return opportunities.length > 0 ? opportunities : null;
  } catch (error) {
    console.error("Scraping azubi.de error:", error);
    return null;
  }
}

const MOCK_AUSBILDUNG_DATA: AusbildungJob[] = [
  {
    id: "1",
    title: "Pflegefachmann/-frau",
    company: "Charité Universitätsmedizin Berlin",
    location: "Berlin",
    description: "Ausbildung zum/zur Pflegefachmann/-frau in einem der größten Universitätskliniken Europas.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/pflegefachmann/",
  },
  {
    id: "2",
    title: "Pflegefachmann/-frau",
    company: "Vivantes Klinikum",
    location: "Berlin",
    description: "Generalistische Pflegeausbildung mit vielfältigen Einsatzmöglichkeiten.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/pflegefachmann/",
  },
  {
    id: "3",
    title: "Kaufmann/-frau für Büromanagement",
    company: "Siemens AG",
    location: "München",
    description: "Ausbildung in einem internationalen Technologiekonzern mit verschiedenen Abteilungsdurchläufen.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/kaufmann-bueromanagement/",
  },
  {
    id: "4",
    title: "Fachinformatiker/in Anwendungsentwicklung",
    company: "SAP SE",
    location: "Walldorf",
    description: "IT-Ausbildung bei einem der weltweit führenden Softwareunternehmen.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/fachinformatiker-anwendungsentwicklung/",
  },
  {
    id: "5",
    title: "Mechatroniker/in",
    company: "Volkswagen AG",
    location: "Wolfsburg",
    description: "Technische Ausbildung in der Automobilindustrie mit modernen Produktionsanlagen.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/mechatroniker/",
  },
  {
    id: "6",
    title: "Einzelhandelskaufmann/-frau",
    company: "REWE Group",
    location: "Köln",
    description: "Handelsausbildung mit Schwerpunkt Kundenberatung und Warenwirtschaft.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/einzelhandelskaufmann/",
  },
];

export async function getAusbildungJobs(search: string = "Pflegefachmann", location: string = "Berlin") {
  try {
    const cacheKey = `${search.toLowerCase()}-${location.toLowerCase()}`;
    
    // Check cache
    const cachedResult = cache.get(cacheKey);
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
      return {
        success: true,
        opportunities: cachedResult.data,
        cached: true,
        search,
        location,
      };
    }

    // Try to scrape real data from both sources
    const [ausbildungResults, azubiResults] = await Promise.all([
      scrapeAusbildung(search, location),
      scrapeAzubi(search, location)
    ]);

    // Combine results
    let opportunities: AusbildungJob[] = [];
    
    if (ausbildungResults && ausbildungResults.length > 0) {
      opportunities = [...opportunities, ...ausbildungResults];
    }
    
    if (azubiResults && azubiResults.length > 0) {
      opportunities = [...opportunities, ...azubiResults];
    }

    // Fallback to mock data if scraping fails
    if (opportunities.length === 0) {
      const locationLower = location.toLowerCase();
      
      opportunities = MOCK_AUSBILDUNG_DATA.filter(
        (item) => {
          const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                               item.description.toLowerCase().includes(search.toLowerCase());
          
          const matchesLocation = item.location.toLowerCase().includes(locationLower) ||
                                 locationLower.includes(item.location.toLowerCase());
          
          return matchesSearch && matchesLocation;
        }
      );
    }

    // Update cache
    cache.set(cacheKey, {
      data: opportunities,
      timestamp: Date.now(),
    });

    return {
      success: true,
      opportunities,
      cached: false,
      search,
      location,
      totalResults: opportunities.length,
    };
  } catch (error) {
    console.error("Error fetching Ausbildung opportunities:", error);
    return {
      success: false,
      opportunities: [],
      error: "Failed to fetch opportunities"
    };
  }
}
