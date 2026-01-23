/**
 * Generate Missing Translations
 * Automatically generates EN and DE translations for all missing keys from AR
 */

import * as fs from 'fs';
import * as path from 'path';

const MESSAGES_DIR = path.join(process.cwd(), 'messages');

interface TranslationObject {
  [key: string]: string | TranslationObject;
}

// Simple mapping dictionary for common translation patterns
const translationMappings: { [key: string]: { en: string; de: string } } = {
  // Common UI elements
  'actions': { en: 'Actions', de: 'Aktionen' },
  'add': { en: 'Add', de: 'Hinzufügen' },
  'adminNotes': { en: 'Admin Notes', de: 'Admin-Notizen' },
  'adminNotesPlaceholder': { en: 'Add admin notes...', de: 'Admin-Notizen hinzufügen...' },
  'all': { en: 'All', de: 'Alle' },
  'amount': { en: 'Amount', de: 'Betrag' },
  'approve': { en: 'Approve', de: 'Genehmigen' },
  'approveAndSendLink': { en: 'Approve and Send Link', de: 'Genehmigen und Link senden' },
  'approved': { en: 'Approved', de: 'Genehmigt' },
  'approvedBy': { en: 'Approved by', de: 'Genehmigt von' },
  'cancel': { en: 'Cancel', de: 'Abbrechen' },
  'category': { en: 'Category', de: 'Kategorie' },
  'courses': { en: 'Courses', de: 'Kurse' },
  'coursesCount': { en: 'Courses Count', de: 'Anzahl der Kurse' },
  'date': { en: 'Date', de: 'Datum' },
  'delete': { en: 'Delete', de: 'Löschen' },
  'details': { en: 'Details', de: 'Details' },
  'detailsTitle': { en: 'Details', de: 'Einzelheiten' },
  'edit': { en: 'Edit', de: 'Bearbeiten' },
  'error': { en: 'Error', de: 'Fehler' },
  'errorApproving': { en: 'Error approving', de: 'Fehler beim Genehmigen' },
  'errorFetching': { en: 'Error fetching', de: 'Fehler beim Abrufen' },
  'errorRejecting': { en: 'Error rejecting', de: 'Fehler beim Ablehnen' },
  'errorTitle': { en: 'Error', de: 'Fehler' },
  'free': { en: 'Free', de: 'Kostenlos' },
  'meetingDetails': { en: 'Meeting Details', de: 'Meeting-Details' },
  'newCategory': { en: 'New Category', de: 'Neue Kategorie' },
  'next': { en: 'Next', de: 'Weiter' },
  'noBookingsDesc': { en: 'No bookings found', de: 'Keine Buchungen gefunden' },
  'bookingApprovedDesc': { en: 'Booking has been approved', de: 'Buchung wurde genehmigt' },
  'bookingRejectedDesc': { en: 'Booking has been rejected', de: 'Buchung wurde abgelehnt' },
  'bookingDetails': { en: 'Booking Details', de: 'Buchungsdetails' },
  'reject': { en: 'Reject', de: 'Ablehnen' },
  'rejected': { en: 'Rejected', de: 'Abgelehnt' },
  'rejectedBy': { en: 'Rejected by', de: 'Abgelehnt von' },
  'save': { en: 'Save', de: 'Speichern' },
  'title': { en: 'Title', de: 'Titel' },
  'view': { en: 'View', de: 'Ansehen' },
};

function flattenObject(obj: TranslationObject, prefix = ''): Record<string, any> {
  const result: Record<string, any> = {};

  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else {
      result[newKey] = value;
    }
  }

  return result;
}

function unflattenObject(flat: Record<string, any>): TranslationObject {
  const result: TranslationObject = {};

  for (const [key, value] of Object.entries(flat)) {
    const keys = key.split('.');
    let current: any = result;

    for (let i = 0; i < keys.length - 1; i++) {
      if (!current[keys[i]]) {
        current[keys[i]] = {};
      }
      current = current[keys[i]];
    }

    current[keys[keys.length - 1]] = value;
  }

  return result;
}

function generateTranslation(key: string, isEnglish: boolean): string {
  // Extract the last part of the key
  const parts = key.split('.');
  const lastPart = parts[parts.length - 1];

  // Check if we have a direct mapping
  if (translationMappings[lastPart]) {
    return isEnglish ? translationMappings[lastPart].en : translationMappings[lastPart].de;
  }

  // Convert camelCase to title case
  const titleCased = lastPart
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();

  if (isEnglish) {
    return titleCased;
  } else {
    // Basic German translation patterns
    const germanMappings: { [key: string]: string } = {
      'placeholder': 'Platzhalter',
      'description': 'Beschreibung',
      'subtitle': 'Untertitel',
      'error': 'Fehler',
      'success': 'Erfolg',
      'loading': 'Wird geladen',
      'button': 'Schaltfläche',
    };

    for (const [en, de] of Object.entries(germanMappings)) {
      if (titleCased.toLowerCase().includes(en)) {
        return titleCased.replace(new RegExp(en, 'i'), de);
      }
    }

    return titleCased;
  }
}

function generateMissingTranslations() {
  console.log('🔧 Generating missing translations...\n');

  // Load all translation files
  const arPath = path.join(MESSAGES_DIR, 'ar.json');
  const enPath = path.join(MESSAGES_DIR, 'en.json');
  const dePath = path.join(MESSAGES_DIR, 'de.json');

  const arContent = JSON.parse(fs.readFileSync(arPath, 'utf-8'));
  const enContent = JSON.parse(fs.readFileSync(enPath, 'utf-8'));
  const deContent = JSON.parse(fs.readFileSync(dePath, 'utf-8'));

  // Flatten all to compare
  const arFlat = flattenObject(arContent);
  const enFlat = flattenObject(enContent);
  const deFlat = flattenObject(deContent);

  // Find all unique keys
  const allKeys = new Set([...Object.keys(arFlat), ...Object.keys(enFlat), ...Object.keys(deFlat)]);

  let enAdded = 0;
  let deAdded = 0;

  // Generate missing translations
  for (const key of Array.from(allKeys)) {
    // EN
    if (!enFlat[key] || enFlat[key]?.trim() === '') {
      enFlat[key] = generateTranslation(key, true);
      enAdded++;
    }

    // DE
    if (!deFlat[key] || deFlat[key]?.trim() === '') {
      deFlat[key] = generateTranslation(key, false);
      deAdded++;
    }
  }

  // Unflatten and write back
  const enUpdated = unflattenObject(enFlat);
  const deUpdated = unflattenObject(deFlat);

  fs.writeFileSync(enPath, JSON.stringify(enUpdated, null, 2) + '\n');
  fs.writeFileSync(dePath, JSON.stringify(deUpdated, null, 2) + '\n');

  console.log(`✅ Added ${enAdded} translations to EN`);
  console.log(`✅ Added ${deAdded} translations to DE\n`);
  console.log(`📊 Total keys: ${allKeys.size}`);
}

if (require.main === module) {
  generateMissingTranslations();
}

export { generateMissingTranslations };
