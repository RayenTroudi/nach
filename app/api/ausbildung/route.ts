import { NextResponse } from "next/server";

// Mark this route as dynamic
export const dynamic = 'force-dynamic';

// In-memory cache to avoid excessive scraping - keyed by search params
const cache = new Map<string, { data: any[]; timestamp: number }>();

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

async function scrapeAusbildung(search: string, location: string) {
  try {
    // Construct the ausbildung.de search URL - uses pipe format: search=Term|Location
    const searchUrl = `https://www.ausbildung.de/suche/?search=${encodeURIComponent(search)}%7C${encodeURIComponent(location)}`;
    
    console.log('Fetching from ausbildung.de:', searchUrl);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      console.error('ausbildung.de response not ok:', response.status);
      return null;
    }

    const html = await response.text();
    console.log('HTML received, length:', html.length);
    
    const opportunities: any[] = [];
    
    // Try multiple patterns to find job listings
    // Pattern 1: Look for any div/article with job-related classes
    const patterns = [
      /<article[^>]*class="[^"]*(?:job|result|listing)[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
      /<div[^>]*class="[^"]*(?:job|result|listing|card)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<li[^>]*class="[^"]*(?:job|result|listing)[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,
    ];
    
    let allMatches: RegExpMatchArray[] = [];
    for (const pattern of patterns) {
      const matches = Array.from(html.matchAll(pattern));
      if (matches.length > 0) {
        console.log(`Found ${matches.length} matches with pattern ${pattern.source.substring(0, 50)}...`);
        allMatches = matches;
        break;
      }
    }
    
    if (allMatches.length === 0) {
      console.log('No job listings found in HTML');
      return null;
    }
    
    let index = 0;
    for (const match of allMatches) {
      const jobHtml = match[1];
      
      // Extract title - try multiple patterns
      const titleMatch = jobHtml.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i) ||
                        jobHtml.match(/<a[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/a>/i) ||
                        jobHtml.match(/class="[^"]*title[^"]*"[^>]*>([^<]+)<\/[^>]+>/i);
      const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : '';
      
      // Extract company
      const companyMatch = jobHtml.match(/class="[^"]*(?:company|firma|arbeitgeber|unternehmen)[^"]*"[^>]*>([^<]+)/i);
      const company = companyMatch ? companyMatch[1].trim().replace(/\s+/g, ' ') : '';
      
      // Extract location
      const locationMatch = jobHtml.match(/class="[^"]*(?:location|ort|standort)[^"]*"[^>]*>([^<]+)/i);
      const jobLocation = locationMatch ? locationMatch[1].trim().replace(/\s+/g, ' ') : location;
      
      // Extract URL
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

    console.log(`Scraped ${opportunities.length} opportunities from ausbildung.de`);
    return opportunities.length > 0 ? opportunities : null;
  } catch (error) {
    console.error("Scraping ausbildung.de error:", error);
    return null;
  }
}

async function scrapeAzubi(search: string, location: string) {
  try {
    // Construct the azubi.de search URL
    const searchUrl = `https://www.azubi.de/ausbildungsplaetze?q=${encodeURIComponent(search)}&l=${encodeURIComponent(location)}`;
    
    console.log('Fetching from azubi.de:', searchUrl);
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'de-DE,de;q=0.9,en;q=0.8',
      },
    });

    if (!response.ok) {
      console.error('azubi.de response not ok:', response.status);
      return null;
    }

    const html = await response.text();
    console.log('HTML received from azubi.de, length:', html.length);
    
    const opportunities: any[] = [];
    
    // Try multiple patterns to find job listings
    const patterns = [
      /<div[^>]*class="[^"]*(?:stellenangebot|job|result|listing)[^"]*"[^>]*>([\s\S]*?)<\/div>/gi,
      /<article[^>]*class="[^"]*(?:job|result|listing)[^"]*"[^>]*>([\s\S]*?)<\/article>/gi,
      /<li[^>]*class="[^"]*(?:job|result|listing)[^"]*"[^>]*>([\s\S]*?)<\/li>/gi,
    ];
    
    let allMatches: RegExpMatchArray[] = [];
    for (const pattern of patterns) {
      const matches = Array.from(html.matchAll(pattern));
      if (matches.length > 0) {
        console.log(`Found ${matches.length} matches with pattern ${pattern.source.substring(0, 50)}...`);
        allMatches = matches;
        break;
      }
    }
    
    if (allMatches.length === 0) {
      console.log('No job listings found in azubi.de HTML');
      return null;
    }
    
    let index = 0;
    for (const match of allMatches) {
      const jobHtml = match[1];
      
      // Extract title - try multiple patterns
      const titleMatch = jobHtml.match(/<h[1-6][^>]*>([^<]+)<\/h[1-6]>/i) ||
                        jobHtml.match(/<a[^>]*class="[^"]*title[^"]*"[^>]*>([^<]+)<\/a>/i) ||
                        jobHtml.match(/class="[^"]*title[^"]*"[^>]*>([^<]+)<\/[^>]+>/i);
      const title = titleMatch ? titleMatch[1].trim().replace(/\s+/g, ' ') : '';
      
      // Extract company
      const companyMatch = jobHtml.match(/class="[^"]*(?:firma|company|arbeitgeber|unternehmen)[^"]*"[^>]*>([^<]+)/i);
      const company = companyMatch ? companyMatch[1].trim().replace(/\s+/g, ' ') : '';
      
      // Extract location
      const locationMatch = jobHtml.match(/class="[^"]*(?:ort|location|standort)[^"]*"[^>]*>([^<]+)/i);
      const jobLocation = locationMatch ? locationMatch[1].trim().replace(/\s+/g, ' ') : location;
      
      // Extract URL
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

    console.log(`Scraped ${opportunities.length} opportunities from azubi.de`);
    return opportunities.length > 0 ? opportunities : null;
  } catch (error) {
    console.error("Scraping azubi.de error:", error);
    return null;
  }
}

const MOCK_AUSBILDUNG_DATA = [
  // Pflegefachmann/-frau
  {
    id: "1",
    title: "Pflegefachmann/-frau",
    company: "Charité Universitätsmedizin Berlin",
    location: "Berlin",
    description:
      "Ausbildung zur Pflegefachkraft mit Schwerpunkt Krankenhauspflege. Moderne Ausstattung und erfahrene Mentoren.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/pflegefachmann/",
    salary: "€1.165 - €1.328 pro Monat",
    duration: "3 Jahre",
    requirements: ["Mittlerer Schulabschluss", "Deutsch B2", "Gesundheitszeugnis"],
  },
  {
    id: "2",
    title: "Pflegefachmann/-frau",
    company: "Vivantes Klinikum",
    location: "Berlin",
    description:
      "Dreijährige Ausbildung in einem der größten Gesundheitsnetzwerke Deutschlands mit garantierter Übernahme.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/pflegefachmann/",
    salary: "€1.191 - €1.353 pro Monat",
    duration: "3 Jahre",
    requirements: ["Realschulabschluss", "Deutsch B2", "Empathie"],
  },
  {
    id: "3",
    title: "Pflegefachmann/-frau",
    company: "DRK Kliniken Berlin",
    location: "Berlin",
    description:
      "Ausbildung mit internationaler Perspektive. Wir unterstützen ausländische Bewerber aktiv.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/pflegefachmann/",
    salary: "€1.140 - €1.303 pro Monat",
    duration: "3 Jahre",
    requirements: ["Mittlere Reife", "Deutsch B2", "Teamfähigkeit"],
  },
  {
    id: "4",
    title: "Pflegefachmann/-frau",
    company: "Klinikum München",
    location: "München",
    description:
      "Praxisnahe Ausbildung in einem hochmodernen Klinikum mit Spezialisierungsmöglichkeiten.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/pflegefachmann/",
    salary: "€1.191 - €1.353 pro Monat",
    duration: "3 Jahre",
    requirements: ["Realschulabschluss", "Deutsch B2", "Belastbarkeit"],
  },
  {
    id: "5",
    title: "Pflegefachmann/-frau",
    company: "Universitätsklinikum Hamburg",
    location: "Hamburg",
    description:
      "Ausbildung mit Schwerpunkt Intensivpflege. Beste Karrierechancen nach der Ausbildung.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/pflegefachmann/",
    salary: "€1.165 - €1.328 pro Monat",
    duration: "3 Jahre",
    requirements: ["Mittlerer Abschluss", "Deutsch B2", "Verantwortungsbewusstsein"],
  },
  
  // Kaufmann/-frau
  {
    id: "10",
    title: "Kaufmann/-frau für Büromanagement",
    company: "Deutsche Bank AG",
    location: "Frankfurt",
    description:
      "Vielseitige kaufmännische Ausbildung in einem internationalen Umfeld. Intensive Betreuung garantiert.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/kaufmann-bueromanagement/",
    salary: "€1.036 - €1.200 pro Monat",
    duration: "3 Jahre",
    requirements: ["Abitur oder Fachabitur", "Deutsch C1", "MS Office Kenntnisse"],
  },
  {
    id: "11",
    title: "Kaufmann/-frau im Einzelhandel",
    company: "REWE Group",
    location: "Köln",
    description:
      "Ausbildung zum Einzelhandelskaufmann mit Übernahmemöglichkeit als Marktleiter.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/kaufmann-einzelhandel/",
    salary: "€1.000 - €1.200 pro Monat",
    duration: "3 Jahre",
    requirements: ["Realschulabschluss", "Deutsch B2", "Kundenorientierung"],
  },
  {
    id: "12",
    title: "Industriekaufmann/-frau",
    company: "Siemens AG",
    location: "München",
    description:
      "Industriekaufmann Ausbildung bei einem der weltweit führenden Technologieunternehmen.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/industriekaufmann/",
    salary: "€1.036 - €1.200 pro Monat",
    duration: "3 Jahre",
    requirements: ["Abitur", "Deutsch C1", "Mathematik Kenntnisse"],
  },
  
  // IT-Spezialist
  {
    id: "20",
    title: "Fachinformatiker/-in Anwendungsentwicklung",
    company: "SAP SE",
    location: "Stuttgart",
    description:
      "IT-Ausbildung mit Fokus auf moderne Softwareentwicklung. Arbeite an echten Projekten von Tag 1.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/fachinformatiker-anwendungsentwicklung/",
    salary: "€1.100 - €1.300 pro Monat",
    duration: "3 Jahre",
    requirements: ["Abitur oder Fachabitur", "Deutsch B2", "Programmier-Interesse"],
  },
  {
    id: "21",
    title: "IT-Systemelektroniker/-in",
    company: "Telekom Deutschland",
    location: "Berlin",
    description:
      "Ausbildung zum IT-Systemelektroniker mit modernster Technik und Netzwerktechnologie.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/it-systemelektroniker/",
    salary: "€1.050 - €1.250 pro Monat",
    duration: "3 Jahre",
    requirements: ["Realschulabschluss", "Deutsch B2", "Technisches Verständnis"],
  },
  {
    id: "22",
    title: "Fachinformatiker/-in Systemintegration",
    company: "Deutsche Telekom",
    location: "Düsseldorf",
    description:
      "Werde Experte für IT-Infrastruktur und Netzwerke in einem führenden Telekommunikationsunternehmen.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/fachinformatiker-systemintegration/",
    salary: "€1.100 - €1.300 pro Monat",
    duration: "3 Jahre",
    requirements: ["Fachabitur", "Deutsch B2", "IT-Affinität"],
  },
  
  // Mechatroniker
  {
    id: "30",
    title: "Mechatroniker/-in",
    company: "Volkswagen AG",
    location: "Stuttgart",
    description:
      "Mechatronik-Ausbildung bei einem der führenden Automobilhersteller weltweit.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/mechatroniker/",
    salary: "€1.100 - €1.300 pro Monat",
    duration: "3,5 Jahre",
    requirements: ["Realschulabschluss", "Deutsch B2", "Handwerkliches Geschick"],
  },
  {
    id: "31",
    title: "Mechatroniker/-in",
    company: "BMW Group",
    location: "München",
    description:
      "High-Tech Ausbildung mit Robotik und Automatisierung. Premium Arbeitgeber mit besten Konditionen.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/mechatroniker/",
    salary: "€1.150 - €1.350 pro Monat",
    duration: "3,5 Jahre",
    requirements: ["Mittlere Reife", "Deutsch B2", "Technisches Interesse"],
  },
  {
    id: "32",
    title: "Mechatroniker/-in",
    company: "Bosch GmbH",
    location: "Leipzig",
    description:
      "Ausbildung zum Mechatroniker mit Schwerpunkt Industrie 4.0 und Smart Factory.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/mechatroniker/",
    salary: "€1.100 - €1.300 pro Monat",
    duration: "3,5 Jahre",
    requirements: ["Realschulabschluss", "Deutsch B2", "Präzision"],
  },
  
  // Koch/Köchin
  {
    id: "40",
    title: "Koch/Köchin",
    company: "Hotel Adlon Kempinski",
    location: "Berlin",
    description:
      "Haute Cuisine Ausbildung in einem 5-Sterne Superior Hotel. Lerne von Sterneköchen.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/koch/",
    salary: "€850 - €1.100 pro Monat",
    duration: "3 Jahre",
    requirements: ["Hauptschulabschluss", "Deutsch B2", "Leidenschaft fürs Kochen"],
  },
  {
    id: "41",
    title: "Koch/Köchin",
    company: "Marriott Hotels",
    location: "Hamburg",
    description:
      "Internationale Koch-Ausbildung mit Möglichkeit zu Auslandseinsätzen in der Marriott Gruppe.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/koch/",
    salary: "€900 - €1.150 pro Monat",
    duration: "3 Jahre",
    requirements: ["Realschulabschluss", "Deutsch B2", "Kreativität"],
  },
  {
    id: "42",
    title: "Koch/Köchin",
    company: "Hilton München",
    location: "München",
    description:
      "Koch-Ausbildung in einem internationalen Hotelumfeld mit vielfältigen Küchenstilen.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/koch/",
    salary: "€900 - €1.100 pro Monat",
    duration: "3 Jahre",
    requirements: ["Hauptschulabschluss", "Deutsch B2", "Teamfähigkeit"],
  },
];

// GET /api/ausbildung - Get Ausbildung opportunities
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "Pflegefachmann";
    const location = searchParams.get("location") || "Berlin";

    // Create cache key based on search parameters
    const cacheKey = `${search.toLowerCase()}-${location.toLowerCase()}`;

    // Check cache
    const cachedResult = cache.get(cacheKey);
    if (cachedResult && Date.now() - cachedResult.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        opportunities: cachedResult.data,
        cached: true,
        search,
        location,
      });
    }

    // Try to scrape real data from both ausbildung.de and azubi.de
    const [ausbildungResults, azubiResults] = await Promise.all([
      scrapeAusbildung(search, location),
      scrapeAzubi(search, location)
    ]);

    // Combine results from both sources
    let opportunities: any[] = [];
    
    if (ausbildungResults && ausbildungResults.length > 0) {
      opportunities = [...opportunities, ...ausbildungResults];
    }
    
    if (azubiResults && azubiResults.length > 0) {
      opportunities = [...opportunities, ...azubiResults];
    }

    // If scraping fails or returns no results, use mock data as fallback
    if (opportunities.length === 0) {
      // More flexible location matching - match if location is anywhere in the string
      const locationLower = location.toLowerCase();
      
      opportunities = MOCK_AUSBILDUNG_DATA.filter(
        (item) => {
          const matchesSearch = item.title.toLowerCase().includes(search.toLowerCase()) ||
                               item.company.toLowerCase().includes(search.toLowerCase()) ||
                               item.description.toLowerCase().includes(search.toLowerCase());
          
          // Match if the searched location is in the item location, or vice versa
          const matchesLocation = item.location.toLowerCase().includes(locationLower) ||
                                 locationLower.includes(item.location.toLowerCase());
          
          return matchesSearch && matchesLocation;
        }
      );
      
      // If no location-specific results found, don't fall back to all cities
      // This ensures users see results only for their selected location
    }

    // Update cache
    cache.set(cacheKey, {
      data: opportunities,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      opportunities,
      cached: false,
      search,
      location,
      sources: opportunities.length > 0 ? 
        Array.from(new Set(opportunities.map((o: any) => o.source || 'fallback'))) : 
        ['fallback'],
      totalResults: opportunities.length,
    });
  } catch (error: any) {
    console.error("Error fetching Ausbildung opportunities:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunities" },
      { status: 500 }
    );
  }
}
