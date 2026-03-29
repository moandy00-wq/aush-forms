import { createWorker, type Worker } from 'tesseract.js'
import type { IntakeFormData, OcrResult } from './types'

let workerInstance: Worker | null = null

export async function getOcrWorker(): Promise<Worker> {
  if (!workerInstance) {
    workerInstance = await createWorker('eng')
  }
  return workerInstance
}

export async function terminateOcrWorker(): Promise<void> {
  if (workerInstance) {
    await workerInstance.terminate()
    workerInstance = null
  }
}

export async function processImage(
  file: File,
  onProgress?: (progress: number) => void
): Promise<OcrResult> {
  try {
    const worker = await getOcrWorker()
    const imageUrl = URL.createObjectURL(file)
    const { data } = await worker.recognize(imageUrl)
    URL.revokeObjectURL(imageUrl)

    const text = data.text || ''
    const confidence = data.confidence || 0

    if (!text.trim()) {
      return { text: '', confidence: 0, extractedFields: {}, status: 'failed' }
    }

    const extractedFields = parseAllFields(text)
    const fieldCount = Object.keys(extractedFields).length

    return {
      text,
      confidence,
      extractedFields,
      status: fieldCount >= 3 ? 'success' : fieldCount > 0 ? 'partial' : 'failed',
    }
  } catch (err) {
    console.error('[OCR] Processing error:', err)
    return { text: '', confidence: 0, extractedFields: {}, status: 'failed' }
  }
}

function parseAllFields(text: string): Partial<IntakeFormData> {
  const fields: Partial<IntakeFormData> = {}
  Object.assign(fields, parseDriversLicense(text))
  Object.assign(fields, parseFinancialDoc(text))
  return fields
}

export function parseDriversLicense(text: string): Partial<IntakeFormData> {
  const fields: Partial<IntakeFormData> = {}
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean)

  // ── Name extraction ──

  // Strategy 1: Labeled first/last/middle
  const fnMatch = text.match(/(?:FN|FIRST\s*NAME|GIVEN\s*NAME)[:\s]+([A-Za-z'-]+)/i)
  const lnMatch = text.match(/(?:LN|LAST\s*NAME|FAMILY\s*NAME|SURNAME)[:\s]+([A-Za-z'-]+)/i)
  const mnMatch = text.match(/(?:MN|MIDDLE\s*NAME|MIDDLE)[:\s]+([A-Za-z'-]+)/i)

  if (fnMatch) fields.firstName = capitalize(fnMatch[1]!)
  if (lnMatch) fields.lastName = capitalize(lnMatch[1]!)
  if (mnMatch) fields.middleName = capitalize(mnMatch[1]!)

  // Strategy 2: "NAME: LAST, FIRST MIDDLE" or "NAME: FIRST MIDDLE LAST"
  if (!fields.firstName && !fields.lastName) {
    // LAST, FIRST MIDDLE
    const commaMatch = text.match(/(?:NAME|NM)[:\s]+([A-Za-z'-]+)\s*,\s*([A-Za-z'-]+)(?:\s+([A-Za-z'-]+))?/i)
    if (commaMatch) {
      fields.lastName = capitalize(commaMatch[1]!)
      fields.firstName = capitalize(commaMatch[2]!)
      if (commaMatch[3] && !fields.middleName) fields.middleName = capitalize(commaMatch[3])
    } else {
      // FIRST MIDDLE LAST (3 words) or FIRST LAST (2 words)
      const spaceMatch = text.match(/(?:NAME|NM)[:\s]+([A-Za-z'-]+)\s+([A-Za-z'-]+)(?:\s+([A-Za-z'-]+))?/i)
      if (spaceMatch) {
        if (spaceMatch[3]) {
          fields.firstName = capitalize(spaceMatch[1]!)
          fields.middleName = capitalize(spaceMatch[2]!)
          fields.lastName = capitalize(spaceMatch[3])
        } else {
          fields.firstName = capitalize(spaceMatch[1]!)
          fields.lastName = capitalize(spaceMatch[2]!)
        }
      }
    }
  }

  // Strategy 3: DL-specific 4d/4a/4b labels
  if (!fields.firstName) {
    const dl4d = text.match(/4d\w?\s*[:\s]+([A-Za-z'-]+)/i)
    if (dl4d) fields.firstName = capitalize(dl4d[1]!)
  }
  if (!fields.lastName) {
    const dl4a = text.match(/(?:4a)\s*[:\s]+([A-Za-z'-]+)/i)
    if (dl4a) fields.lastName = capitalize(dl4a[1]!)
  }
  if (!fields.middleName) {
    const dl4b = text.match(/(?:4b)\s*[:\s]+([A-Za-z'-]+)/i)
    if (dl4b) fields.middleName = capitalize(dl4b[1]!)
  }

  // Strategy 4: All-caps name lines
  if (!fields.firstName && !fields.lastName) {
    for (const line of lines) {
      if (/\d{5}/.test(line) || /\d[\/-]\d/.test(line)) continue
      // LASTNAME FIRSTNAME MIDDLE or LASTNAME, FIRSTNAME MIDDLE
      const caps = line.match(/^([A-Z][A-Z'-]+)\s*,?\s+([A-Z][A-Z'-]+)(?:\s+([A-Z][A-Z'-]*))?$/)
      if (caps && line.length < 40 && !line.includes('LICENSE') && !line.includes('STATE') && !line.includes('CLASS')) {
        fields.lastName = capitalize(caps[1]!)
        fields.firstName = capitalize(caps[2]!)
        if (caps[3] && caps[3].length > 1 && !fields.middleName) fields.middleName = capitalize(caps[3])
        break
      }
    }
  }

  // ── Date of birth ──
  const dobMatch = text.match(/(?:DOB|DATE\s*OF\s*BIRTH|BIRTH\s*DATE|BD|FECHA)[:\s]*(\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4})/i)
  if (dobMatch) {
    fields.dateOfBirth = normalizeDate(dobMatch[1]!)
  } else {
    const allDates = text.match(/\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}/g)
    if (allDates) {
      for (const d of allDates) {
        const normalized = normalizeDate(d)
        if (normalized && looksLikeBirthdate(normalized)) {
          fields.dateOfBirth = normalized
          break
        }
      }
    }
  }

  // ── Address ──
  // US DLs typically have the address on 1-2 lines after a label like "8" or "ADDRESS"
  // The street is usually a line like "123 MAIN ST" or "456 ELM AVE APT 2"

  // Strategy 1: Labeled address
  const addrLabeled = text.match(/(?:8\s|ADDRESS|ADDR|STREET|DOMICILIO)[:\s]*(\d+\s+.+)/im)
  if (addrLabeled) {
    fields.address = cleanAddress(addrLabeled[1]!)
  }

  // Strategy 2: Find line with street number + street type keyword
  if (!fields.address) {
    const streetTypes = /\b(?:ST|AVE|BLVD|DR|RD|CT|LN|WAY|PL|CIR|TER|HWY|PKWY|STREET|AVENUE|BOULEVARD|DRIVE|ROAD|COURT|LANE|PLACE|CIRCLE|TERRACE|HIGHWAY|PARKWAY)\b/i
    for (const line of lines) {
      // Must start with a number and contain a street type
      if (/^\d+\s+[A-Za-z]/.test(line) && streetTypes.test(line) && line.length < 80) {
        fields.address = cleanAddress(line)
        break
      }
    }
  }

  // Strategy 3: Any line starting with a number that's long enough to be an address
  if (!fields.address) {
    for (const line of lines) {
      if (/^\d+\s+[A-Za-z]/.test(line) && line.length >= 10 && line.length < 80) {
        if (!/^\d{5}/.test(line) && !/\d[\/-]\d/.test(line) && !/^\d+\s*$/.test(line)) {
          fields.address = cleanAddress(line)
          break
        }
      }
    }
  }

  // ── City, State, ZIP ──
  const cszMatch = text.match(/([A-Za-z][A-Za-z\s]{1,25}),?\s+([A-Z]{2})\s+(\d{5}(?:-\d{4})?)/i)
  if (cszMatch && isUSState(cszMatch[2]!)) {
    fields.city = capitalize(cszMatch[1]!.trim())
    fields.state = cszMatch[2]!.toUpperCase()
    fields.zipCode = cszMatch[3]!
  } else {
    // Try state + zip separately
    const stateZip = text.match(/\b([A-Z]{2})\s+(\d{5}(?:-\d{4})?)\b/)
    if (stateZip && isUSState(stateZip[1]!)) {
      fields.state = stateZip[1]!
      fields.zipCode = stateZip[2]!

      // Find city from same line
      for (const line of lines) {
        if (line.includes(fields.state) && line.includes(fields.zipCode)) {
          const before = line.substring(0, line.indexOf(fields.state)).replace(/,\s*$/, '').trim()
          const words = before.split(/\s+/)
          // Take the last 1-3 words before the state as the city
          const city = words.slice(-3).join(' ')
          if (city.length > 1 && /^[A-Za-z]/.test(city)) {
            fields.city = city.split(' ').map(capitalize).join(' ')
          }
          break
        }
      }
    }
  }

  return fields
}

export function parseFinancialDoc(text: string): Partial<IntakeFormData> {
  const fields: Partial<IntakeFormData> = {}

  const employerMatch = text.match(/(?:EMPLOYER|COMPANY|EMPLOYER\s*NAME)[:\s]+(.+)/i)
  if (employerMatch) fields.employerName = employerMatch[1]!.trim()

  const incomeMatch = text.match(/(?:GROSS\s*PAY|TOTAL\s*PAY|SALARY|ANNUAL\s*(?:INCOME|SALARY)|YTD\s*GROSS)[:\s]*\$?([\d,]+\.?\d*)/i)
  if (incomeMatch) fields.annualIncome = incomeMatch[1]!.replace(/,/g, '')

  const titleMatch = text.match(/(?:TITLE|POSITION|JOB\s*TITLE|OCCUPATION)[:\s]+(.+)/i)
  if (titleMatch) fields.jobTitle = titleMatch[1]!.trim()

  return fields
}

export function parseMedicalDoc(text: string): Partial<IntakeFormData> {
  const fields: Partial<IntakeFormData> = {}

  const memberMatch = text.match(/(?:MEMBER|INSURED|SUBSCRIBER|PATIENT)[:\s]+([A-Za-z\s'-]+)/i)
  if (memberMatch) {
    const parts = memberMatch[1]!.trim().split(/\s+/)
    if (parts.length >= 2) {
      fields.firstName = capitalize(parts[0]!)
      fields.lastName = capitalize(parts[parts.length - 1]!)
      if (parts.length >= 3) fields.middleName = capitalize(parts[1]!)
    }
  }

  return fields
}

// ============================================================
// Helpers
// ============================================================

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

function normalizeDate(raw: string): string {
  const parts = raw.split(/[\/-]/)
  if (parts.length !== 3) return ''
  const month = parts[0]!.padStart(2, '0')
  const day = parts[1]!.padStart(2, '0')
  let year = parts[2]!
  if (year.length === 2) year = (parseInt(year) > 50 ? '19' : '20') + year
  return `${year}-${month}-${day}`
}

function looksLikeBirthdate(isoDate: string): boolean {
  const d = new Date(isoDate)
  if (isNaN(d.getTime())) return false
  const age = (Date.now() - d.getTime()) / (365.25 * 24 * 60 * 60 * 1000)
  return age >= 14 && age <= 110
}

function cleanAddress(raw: string): string {
  return raw
    .replace(/,?\s+[A-Z]{2}\s+\d{5}.*$/, '')  // Remove trailing city/state/zip
    .replace(/\s{2,}/g, ' ')                     // Collapse multiple spaces
    .trim()
}

const US_STATE_SET = new Set([
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA','HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ','NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY','DC',
])

function isUSState(str: string): boolean {
  return US_STATE_SET.has(str.toUpperCase())
}
