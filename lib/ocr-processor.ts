// OCR Text Processing and Validation Logic

export interface ProcessedResult {
  data: any
  confidence: number
  validations: ValidationResult[]
}

export interface ValidationResult {
  field: string
  success: boolean
  message: string
}

/**
 * Main processing function that extracts and validates OCR text
 */
export function processOCRText(text: string): ProcessedResult {
  const validations: ValidationResult[] = []
  let confidenceScore = 1.0

  // Extract establishment name
  const establishment = extractEstablishment(text)
  if (establishment) {
    validations.push({
      field: "estabelecimento",
      success: true,
      message: `Estabelecimento identificado: "${establishment}"`,
    })
  } else {
    validations.push({
      field: "estabelecimento",
      success: false,
      message: "Estabelecimento não identificado",
    })
    confidenceScore -= 0.2
  }

  // Extract and validate CNPJ
  const cnpjResult = extractAndValidateCNPJ(text)
  if (cnpjResult.value) {
    validations.push({
      field: "cnpj",
      success: cnpjResult.isValid,
      message: cnpjResult.isValid
        ? `CNPJ válido: ${cnpjResult.formatted}`
        : `CNPJ encontrado mas formato inválido: ${cnpjResult.value}`,
    })
    if (!cnpjResult.isValid) confidenceScore -= 0.1
  } else {
    validations.push({
      field: "cnpj",
      success: false,
      message: "CNPJ não encontrado",
    })
    confidenceScore -= 0.15
  }

  // Extract and validate date
  const dateResult = extractAndValidateDate(text)
  if (dateResult.value) {
    validations.push({
      field: "data",
      success: true,
      message: `Data extraída: ${dateResult.formatted}${dateResult.correctionsMade ? " (com correções)" : ""}`,
    })
    if (dateResult.correctionsMade) confidenceScore -= 0.05
  } else {
    validations.push({
      field: "data",
      success: false,
      message: "Data não encontrada",
    })
    confidenceScore -= 0.2
  }

  // Extract time
  const time = extractTime(text)

  // Extract items
  const items = extractItems(text)
  if (items.length > 0) {
    validations.push({
      field: "itens",
      success: true,
      message: `${items.length} item(ns) extraído(s)`,
    })
    // Check for OCR corrections in items
    const correctedItems = items.filter((item) => item.correctionsMade)
    if (correctedItems.length > 0) {
      confidenceScore -= 0.05 * correctedItems.length
      validations.push({
        field: "itens",
        success: true,
        message: `${correctedItems.length} item(ns) necessitou correções OCR`,
      })
    }
  }

  // Extract total value
  const totalResult = extractTotalValue(text)
  if (totalResult.value !== null) {
    validations.push({
      field: "valorTotal",
      success: true,
      message: `Valor total: R$ ${totalResult.value.toFixed(2)}${totalResult.isApproximate ? " (aproximado)" : ""}`,
    })
    if (totalResult.isApproximate) confidenceScore -= 0.1
  } else {
    validations.push({
      field: "valorTotal",
      success: false,
      message: "Valor total não encontrado",
    })
    confidenceScore -= 0.3
  }

  // Validate items sum matches total
  if (items.length > 0 && totalResult.value !== null) {
    const itemsSum = items.reduce((sum, item) => sum + (item.valorTotal || 0), 0)
    const difference = Math.abs(itemsSum - totalResult.value)
    if (difference < 0.1) {
      validations.push({
        field: "consistencia",
        success: true,
        message: "Soma dos itens confere com o total",
      })
    } else {
      validations.push({
        field: "consistencia",
        success: false,
        message: `Divergência na soma: itens R$ ${itemsSum.toFixed(2)} vs total R$ ${totalResult.value.toFixed(2)}`,
      })
      confidenceScore -= 0.05
    }
  }

  // Extract payment method
  const paymentMethod = extractPaymentMethod(text)

  // Extract additional info (like service tax, change, etc.)
  const additionalInfo = extractAdditionalInfo(text)

  // Build structured data
  const data: any = {}

  if (establishment) data.estabelecimento = establishment
  if (cnpjResult.formatted) data.cnpj = cnpjResult.formatted
  if (dateResult.formatted) data.data = dateResult.formatted
  if (time) data.hora = time
  if (items.length > 0) data.itens = items
  if (totalResult.value !== null) {
    data.valorTotal = totalResult.value
    if (totalResult.isApproximate) data.valorAproximado = true
  }
  if (paymentMethod) data.formaPagamento = paymentMethod
  if (Object.keys(additionalInfo).length > 0) {
    data.informacoesAdicionais = additionalInfo
  }

  // Ensure confidence is between 0 and 1
  confidenceScore = Math.max(0, Math.min(1, confidenceScore))

  return {
    data,
    confidence: confidenceScore,
    validations,
  }
}

/**
 * Extract establishment name (usually first line)
 */
function extractEstablishment(text: string): string | null {
  const lines = text
    .split("\n")
    .map((l) => l.trim())
    .filter((l) => l)
  if (lines.length > 0) {
    // Skip lines with just asterisks or dashes
    const firstValidLine = lines.find((line) => !/^[*\-\s]+$/.test(line))
    return firstValidLine?.replace(/^\*+\s*|\s*\*+$/g, "") || null
  }
  return null
}

/**
 * Extract and validate CNPJ
 */
function extractAndValidateCNPJ(text: string): {
  value: string | null
  formatted: string | null
  isValid: boolean
} {
  // Match CNPJ patterns: XX.XXX.XXX/XXXX-XX or variations with spaces
  const cnpjPattern = /CNPJ[:\s]*([0-9.\-/\s]+)/i
  const match = text.match(cnpjPattern)

  if (!match) {
    return { value: null, formatted: null, isValid: false }
  }

  // Extract only numbers
  const digits = match[1].replace(/\D/g, "")

  // CNPJ should have 14 digits
  if (digits.length !== 14) {
    return { value: digits, formatted: null, isValid: false }
  }

  // Format CNPJ: XX.XXX.XXX/XXXX-XX
  const formatted = digits.replace(/^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/, "$1.$2.$3/$4-$5")

  // Basic validation (check if not all same digit)
  const isValid = !/^(\d)\1+$/.test(digits)

  return { value: digits, formatted, isValid }
}

/**
 * Extract and validate date from multiple formats
 */
function extractAndValidateDate(text: string): {
  value: string | null
  formatted: string | null
  correctionsMade: boolean
} {
  let correctionsMade = false

  // Fix common OCR errors in date field label
  const fixedText = text.replace(/Da\s*a:/gi, "Data:")
  if (fixedText !== text) correctionsMade = true

  // Match various date formats: DD/MM/YYYY, DD/MM/YY, DD-MM-YY, etc.
  const datePatterns = [/(?:Data|Data:)?\s*(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/i, /(\d{1,2})[/-](\d{1,2})[/-](\d{2,4})/]

  for (const pattern of datePatterns) {
    const match = fixedText.match(pattern)
    if (match) {
      const day = match[1].padStart(2, "0")
      const month = match[2].padStart(2, "0")
      let year = match[3]

      // Convert 2-digit year to 4-digit
      if (year.length === 2) {
        year = "20" + year
      }

      const formatted = `${year}-${month}-${day}`
      return { value: `${day}/${month}/${year}`, formatted, correctionsMade }
    }
  }

  return { value: null, formatted: null, correctionsMade }
}

/**
 * Extract time
 */
function extractTime(text: string): string | null {
  // Match time patterns: HH:MM or HH.MM
  const timePattern = /(\d{1,2})[:.](\d{2})/
  const match = text.match(timePattern)

  if (match) {
    const hours = match[1].padStart(2, "0")
    const minutes = match[2]
    return `${hours}:${minutes}`
  }

  return null
}

/**
 * Extract items from text
 */
function extractItems(text: string): any[] {
  const items: any[] = []
  const lines = text.split("\n")

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()

    // Skip empty lines and headers
    if (!line || /^(DESC|CUPOM|TOTAL|Pagamento|CNPJ|Data|Hora|Mesa)/i.test(line)) {
      continue
    }

    let correctionsMade = false

    // Pattern 1: "Descricao QT VL_UNIT VL_TOTAL" (Example 1)
    const pattern1 = /^(.+?)\s+(\d+)\s+(\d+[,.]\d{2})\s+(\d+[,.]\d{2})$/
    const match1 = line.match(pattern1)
    if (match1) {
      items.push({
        descricao: match1[1].trim(),
        quantidade: Number.parseInt(match1[2]),
        valorUnitario: Number.parseFloat(match1[3].replace(",", ".")),
        valorTotal: Number.parseFloat(match1[4].replace(",", ".")),
      })
      continue
    }

    // Pattern 2: "Descricao\n QT x VALOR" (Example 2)
    const pattern2 = /^(\d+)\s*x\s*(\d+[,.]?\d*[O0])$/i
    const match2 = line.match(pattern2)
    if (match2) {
      const prevLine = i > 0 ? lines[i - 1].trim() : ""
      let valorStr = match2[2]

      // Fix OCR error: O → 0
      if (/O$/i.test(valorStr)) {
        valorStr = valorStr.replace(/O$/i, "0")
        correctionsMade = true
      }

      const valor = Number.parseFloat(valorStr.replace(",", "."))
      const quantidade = Number.parseInt(match2[1])

      if (prevLine && !/^(DESC|CUPOM|TOTAL|Pagamento|CNPJ)/i.test(prevLine)) {
        items.push({
          descricao: prevLine,
          quantidade,
          valorUnitario: valor,
          valorTotal: valor * quantidade,
          correctionsMade,
        })
      }
      continue
    }

    // Pattern 3: "QT Descricao VALOR" (Example 4)
    const pattern3 = /^(\d+)\s+(.+?)\s+(\d+[,.]\d+)$/
    const match3 = line.match(pattern3)
    if (match3) {
      const quantidade = Number.parseInt(match3[1])
      const valor = Number.parseFloat(match3[3].replace(",", "."))
      items.push({
        descricao: match3[2].trim(),
        quantidade,
        valorUnitario: valor / quantidade,
        valorTotal: valor,
      })
      continue
    }

    // Pattern 4: Heavily degraded (Example 5) - "word frag  QT VALOR"
    const pattern4 = /^([a-z\s]+)\s+(\d+k|un)\s+(\d+\s*[,.]\s*\d+)$/i
    const match4 = line.match(pattern4)
    if (match4) {
      let descricao = match4[1].trim()

      // Fix common word breaks
      descricao = descricao
        .replace(/ar\s*oz/gi, "arroz")
        .replace(/fe\s*jao/gi, "feijão")
        .replace(/ole\s*so\s*a/gi, "óleo soja")

      if (descricao !== match4[1].trim()) correctionsMade = true

      const quantidade = match4[2]
      const valorStr = match4[3].replace(/\s/g, "")
      const valor = Number.parseFloat(valorStr.replace(",", "."))

      items.push({
        descricao: descricao.charAt(0).toUpperCase() + descricao.slice(1),
        quantidade,
        valorTotal: valor,
        correctionsMade,
      })
    }
  }

  return items
}

/**
 * Extract total value
 */
function extractTotalValue(text: string): {
  value: number | null
  isApproximate: boolean
} {
  // Fix common OCR errors
  const fixedText = text.replace(/to\s*al/gi, "total")

  const isApproximate = /aprox/i.test(text)

  // Match patterns: TOTAL R$ XX,XX or TOTAL=XX.XX or total XX,X
  const totalPatterns = [
    /TOTAL\s*R?\$?\s*(\d+[,.]\d{2})/i,
    /TOTAL\s*=\s*(\d+[,.]\d{2})/i,
    /(?:Sub\s*t|total)\s+(\d+[,.]\d+)/i,
  ]

  for (const pattern of totalPatterns) {
    const match = fixedText.match(pattern)
    if (match) {
      const value = Number.parseFloat(match[1].replace(",", "."))
      return { value, isApproximate }
    }
  }

  return { value: null, isApproximate: false }
}

/**
 * Extract payment method
 */
function extractPaymentMethod(text: string): string | null {
  const paymentPatterns = [
    { pattern: /Pagamento:\s*(.+)/i, name: null },
    { pattern: /Pgto\s+(.+)/i, name: null },
    { pattern: /Débito|Debito/i, name: "Débito" },
    { pattern: /Crédito|Credito|Cart/i, name: "Cartão" },
    { pattern: /Dinheiro|d\s*nh/i, name: "Dinheiro" },
  ]

  for (const { pattern, name } of paymentPatterns) {
    const match = text.match(pattern)
    if (match) {
      return name || match[1]?.trim() || null
    }
  }

  return null
}

/**
 * Extract additional information
 */
function extractAdditionalInfo(text: string): Record<string, any> {
  const info: Record<string, any> = {}

  // Service tax
  const taxMatch = text.match(/Tx\s*serv\s*(\d+)%\s*(\d+[,.]\d+)/i)
  if (taxMatch) {
    info.taxaServico = {
      percentual: Number.parseInt(taxMatch[1]),
      valor: Number.parseFloat(taxMatch[2].replace(",", ".")),
    }
  }

  // Change/Rest
  const changeMatch = text.match(/Rest\s*(\d+[,.]\d+)/i)
  if (changeMatch) {
    info.troco = Number.parseFloat(changeMatch[1].replace(",", "."))
  }

  // Mesa/Table
  const tableMatch = text.match(/Mesa\s*(\d+)/i)
  if (tableMatch) {
    info.mesa = tableMatch[1]
  }

  // Volume (for gas stations)
  const volumeMatch = text.match(/Vol:\s*(\d+[,.]\d+)\s*L/i)
  if (volumeMatch) {
    info.volume = Number.parseFloat(volumeMatch[1].replace(",", "."))
  }

  // Price per liter
  const pricePerLiterMatch = text.match(/Preco\/L:\s*(\d+[,.]\d+)/i)
  if (pricePerLiterMatch) {
    info.precoPorLitro = Number.parseFloat(pricePerLiterMatch[1].replace(",", "."))
  }

  return info
}
