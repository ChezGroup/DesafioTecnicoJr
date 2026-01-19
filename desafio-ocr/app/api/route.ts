import { NextResponse } from "next/server";
import { processarTextoOCR } from "@/lib/ocr-processor";

export async function POST(request: Request) {
  const { texto } = await request.json();

  const resultado = await processarTextoOCR(texto);

  return NextResponse.json(resultado);
}
