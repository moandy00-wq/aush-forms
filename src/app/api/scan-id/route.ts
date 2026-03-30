import DocumentIntelligence, {
  getLongRunningPoller,
  isUnexpected,
  type AnalyzeOperationOutput,
} from '@azure-rest/ai-document-intelligence'
import { NextRequest, NextResponse } from 'next/server'

const endpoint = process.env.DOCUMENT_INTELLIGENCE_ENDPOINT
const apiKey = process.env.DOCUMENT_INTELLIGENCE_API_KEY

export async function POST(request: NextRequest) {
  if (!endpoint || !apiKey) {
    return NextResponse.json({ error: 'Azure Document Intelligence not configured' }, { status: 500 })
  }

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Validate file type
    if (!['image/jpeg', 'image/png'].includes(file.type)) {
      return NextResponse.json({ error: 'Only JPEG and PNG files are supported' }, { status: 400 })
    }

    // Validate file size (4MB limit on free tier)
    if (file.size > 4 * 1024 * 1024) {
      return NextResponse.json({ error: 'File must be under 4MB' }, { status: 400 })
    }

    // Convert to base64
    const arrayBuffer = await file.arrayBuffer()
    const base64Source = Buffer.from(arrayBuffer).toString('base64')

    // Create Azure client
    const client = DocumentIntelligence(endpoint, { key: apiKey })

    // Start analyze operation
    const initialResponse = await client
      .path('/documentModels/{modelId}:analyze', 'prebuilt-idDocument')
      .post({
        contentType: 'application/json',
        body: { base64Source },
      })

    if (isUnexpected(initialResponse)) {
      console.error('[Azure OCR] Unexpected response:', initialResponse.body)
      return NextResponse.json({ error: 'OCR processing failed' }, { status: 500 })
    }

    // Poll until done
    const poller = getLongRunningPoller(client, initialResponse)
    const result = (await poller.pollUntilDone()).body as AnalyzeOperationOutput

    const document = result.analyzeResult?.documents?.[0]

    if (!document) {
      return NextResponse.json({
        extractedFields: {},
        confidence: 0,
        status: 'failed',
      })
    }

    const fields = document.fields ?? {}

    // Extract and normalize fields to match our IntakeFormData shape
    const extractedFields: Record<string, string> = {}
    const fieldConfidences: Record<string, number> = {}

    // Helper to get string value from a field (uses content as universal fallback)
    function fieldStr(name: string): string {
      const f = fields[name]
      if (!f) return ''
      // Try typed value properties first, then content
      return String(f.valueString ?? f.valueDate ?? f.content ?? '').trim()
    }

    function fieldConf(name: string): number {
      return fields[name]?.confidence ?? 0
    }

    // Name — Azure may include middle initial in FirstName
    const firstName = fieldStr('FirstName')
    if (firstName) {
      const nameParts = firstName.split(/\s+/)
      extractedFields.firstName = capitalize(nameParts[0] || '')
      if (nameParts.length > 1) {
        const middle = nameParts.slice(1).join(' ').replace(/\.$/, '')
        if (middle.length > 0) extractedFields.middleName = capitalize(middle)
      }
      fieldConfidences.firstName = fieldConf('FirstName')
    }

    const lastName = fieldStr('LastName')
    if (lastName) {
      extractedFields.lastName = capitalize(lastName)
      fieldConfidences.lastName = fieldConf('LastName')
    }

    // Date of birth
    const dob = fieldStr('DateOfBirth')
    if (dob) {
      extractedFields.dateOfBirth = dob
      fieldConfidences.dateOfBirth = fieldConf('DateOfBirth')
    }

    // Address — use the structured valueAddress if available, otherwise content
    const addrField = fields['Address']
    if (addrField) {
      fieldConfidences.address = addrField.confidence ?? 0

      const addrObj = addrField.valueAddress
      if (addrObj) {
        if (addrObj.streetAddress) extractedFields.address = addrObj.streetAddress
        if (addrObj.city) extractedFields.city = capitalize(addrObj.city)
        if (addrObj.state) extractedFields.state = addrObj.state.toUpperCase()
        if (addrObj.postalCode) extractedFields.zipCode = addrObj.postalCode
      } else if (addrField.content) {
        extractedFields.address = addrField.content
      }
    }

    // Region as fallback for state
    const region = fieldStr('Region')
    if (!extractedFields.state && region) {
      extractedFields.state = stateToAbbr(region)
      fieldConfidences.state = fieldConf('Region')
    }

    // Filter out empty values
    const cleanFields: Record<string, string> = {}
    for (const [key, value] of Object.entries(extractedFields)) {
      if (value && value.trim()) cleanFields[key] = value.trim()
    }

    return NextResponse.json({
      extractedFields: cleanFields,
      fieldConfidences,
      confidence: document.confidence ?? 0,
      docType: document.docType,
      status: Object.keys(cleanFields).length >= 3 ? 'success' : Object.keys(cleanFields).length > 0 ? 'partial' : 'failed',
    })
  } catch (err) {
    console.error('[Azure OCR] Error:', err)
    return NextResponse.json({ error: 'OCR processing failed' }, { status: 500 })
  }
}

function capitalize(str: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase()
}

const STATE_MAP: Record<string, string> = {
  alabama: 'AL', alaska: 'AK', arizona: 'AZ', arkansas: 'AR', california: 'CA',
  colorado: 'CO', connecticut: 'CT', delaware: 'DE', florida: 'FL', georgia: 'GA',
  hawaii: 'HI', idaho: 'ID', illinois: 'IL', indiana: 'IN', iowa: 'IA',
  kansas: 'KS', kentucky: 'KY', louisiana: 'LA', maine: 'ME', maryland: 'MD',
  massachusetts: 'MA', michigan: 'MI', minnesota: 'MN', mississippi: 'MS', missouri: 'MO',
  montana: 'MT', nebraska: 'NE', nevada: 'NV', 'new hampshire': 'NH', 'new jersey': 'NJ',
  'new mexico': 'NM', 'new york': 'NY', 'north carolina': 'NC', 'north dakota': 'ND',
  ohio: 'OH', oklahoma: 'OK', oregon: 'OR', pennsylvania: 'PA', 'rhode island': 'RI',
  'south carolina': 'SC', 'south dakota': 'SD', tennessee: 'TN', texas: 'TX', utah: 'UT',
  vermont: 'VT', virginia: 'VA', washington: 'WA', 'west virginia': 'WV', wisconsin: 'WI',
  wyoming: 'WY', 'district of columbia': 'DC',
}

function stateToAbbr(state: string): string {
  if (state.length === 2) return state.toUpperCase()
  return STATE_MAP[state.toLowerCase()] || state
}
