import { NextResponse } from "next/server";

// In-memory cache to avoid excessive scraping
let cache: {
  data: any[];
  timestamp: number;
} | null = null;

const CACHE_DURATION = 60 * 60 * 1000; // 1 hour

// Mock data for Ausbildung opportunities
// In production, you would scrape ausbildung.de or use their API
const MOCK_AUSBILDUNG_DATA = [
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
    company: "Helios Klinikum Berlin-Buch",
    location: "Berlin",
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
    company: "Sana Klinikum Lichtenberg",
    location: "Berlin",
    description:
      "Ausbildung mit Schwerpunkt Intensivpflege. Beste Karrierechancen nach der Ausbildung.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/pflegefachmann/",
    salary: "€1.165 - €1.328 pro Monat",
    duration: "3 Jahre",
    requirements: ["Mittlerer Abschluss", "Deutsch B2", "Verantwortungsbewusstsein"],
  },
  {
    id: "6",
    title: "Pflegefachmann/-frau",
    company: "Immanuel Klinikum Bernau",
    location: "Berlin/Brandenburg",
    description:
      "Familienfreundliche Ausbildung mit flexiblen Arbeitszeiten und Kinderbetreuung.",
    type: "Ausbildung",
    url: "https://www.ausbildung.de/berufe/pflegefachmann/",
    salary: "€1.140 - €1.303 pro Monat",
    duration: "3 Jahre",
    requirements: ["Realschulabschluss", "Deutsch B2", "Zuverlässigkeit"],
  },
];

// GET /api/ausbildung - Get Ausbildung opportunities
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "Pflegefachmann";
    const location = searchParams.get("location") || "Berlin";

    // Check cache
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      return NextResponse.json({
        opportunities: cache.data,
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

    // For now, return mock data filtered by search term
    const filteredData = MOCK_AUSBILDUNG_DATA.filter(
      (item) =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.company.toLowerCase().includes(search.toLowerCase())
    );

    // Update cache
    cache = {
      data: filteredData,
      timestamp: Date.now(),
    };

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
