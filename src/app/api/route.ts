import { ocr } from "@/service/ocr";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    const { raw } = await req.json();

    if(!raw) {
        return NextResponse.json({ error: "Texto não foi enviado"}, {status: 400});
    }

    try {
        const result_data = ocr(raw);
        return NextResponse.json(result_data, {status: 200});
    } catch (err) {
        console.error(err);
        return NextResponse.json({error: "Erro ao processar o recibo"}, {status: 500});
    }
}