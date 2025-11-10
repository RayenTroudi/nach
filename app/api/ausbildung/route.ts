import { NextResponse } from "next/server";

// In-memory cache to avoid excessive scraping - keyed by search params
const cache = new Map<string, { data: any[]; timestamp: number }>();

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Mock data for Ausbildung opportunities
// In production, you would scrape ausbildung.de or use their API
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
  
  // Einzelhandelskaufmann/-frau
  {
    id: "50",
    title: "Einzelhandelskaufmann/-frau",
    company: "EDEKA Nord",
    location: "Hamburg",
    description:
      "Ausbildung im Lebensmitteleinzelhandel mit Fokus auf regionale Produkte und Nachhaltigkeit.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/kaufmann-einzelhandel/",
    salary: "€950 - €1.150 pro Monat",
    duration: "3 Jahre",
    requirements: ["Realschulabschluss", "Deutsch B2", "Freundlichkeit"],
  },
  {
    id: "51",
    title: "Einzelhandelskaufmann/-frau",
    company: "MediaMarkt Saturn",
    location: "Frankfurt",
    description:
      "Technik-Einzelhandel Ausbildung mit Spezialisierung auf Consumer Electronics.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/kaufmann-einzelhandel/",
    salary: "€1.000 - €1.200 pro Monat",
    duration: "3 Jahre",
    requirements: ["Mittlere Reife", "Deutsch B2", "Technikbegeisterung"],
  },
  {
    id: "52",
    title: "Einzelhandelskaufmann/-frau",
    company: "dm-drogerie markt",
    location: "Köln",
    description:
      "Einzelhandelsausbildung in der Drogeriebranche mit hoher Übernahmequote.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/kaufmann-einzelhandel/",
    salary: "€1.000 - €1.200 pro Monat",
    duration: "3 Jahre",
    requirements: ["Realschulabschluss", "Deutsch B2", "Serviceorientierung"],
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

    // TODO: In production, implement real scraping or API integration
    /*
    Example with Puppeteer:
    
    import puppeteer from 'puppeteer';
    
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    
    const searchUrl = `https://www.ausbildung.de/suche?q=${search}&location=${location}`;
    await page.goto(searchUrl, { waitUntil: 'networkidle2' });
    
    const opportunities = await page.evaluate(() => {
      const items = document.querySelectorAll('.ausbildung-item');
      return Array.from(items).map(item => ({
        title: item.querySelector('.title')?.textContent?.trim(),
        company: item.querySelector('.company')?.textContent?.trim(),
        location: item.querySelector('.location')?.textContent?.trim(),
        description: item.querySelector('.description')?.textContent?.trim(),
        url: item.querySelector('a')?.href,
      }));
    });
    
    await browser.close();
    */

    // For now, return mock data filtered by search term and location
    let filteredData = MOCK_AUSBILDUNG_DATA;

    // Filter by search term (title or company)
    if (search) {
      filteredData = filteredData.filter(
        (item) =>
          item.title.toLowerCase().includes(search.toLowerCase()) ||
          item.company.toLowerCase().includes(search.toLowerCase()) ||
          item.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Filter by location
    if (location) {
      filteredData = filteredData.filter((item) =>
        item.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    // Update cache with unique key
    cache.set(cacheKey, {
      data: filteredData,
      timestamp: Date.now(),
    });

    return NextResponse.json({
      opportunities: filteredData,
      cached: false,
      search,
      location,
      note: "Currently using mock data. Implement real scraping or API integration for production.",
    });
  } catch (error: any) {
    console.error("Error fetching Ausbildung opportunities:", error);
    return NextResponse.json(
      { error: "Failed to fetch opportunities" },
      { status: 500 }
    );
  }
}
