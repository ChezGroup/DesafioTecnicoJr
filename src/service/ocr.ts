export function ocr(text: string) {

    const lines = text
        .split('\n')
        .map(l => l.trim())
        .filter(Boolean);

    const descriptionRegex = /[A-Za-zÀ-ÿ]+/g;
    const quantityRegex = /\d+/;
    const valueRegex = /\d+,\d{2}/;
    const totalValueRegex = /(\d+,\d{2})$/;
    const items: any[] = [];

    // 🎯 Confidence score
    let score = 0;
    const maxScore = 10;

    const marketName = lines[0];
    if (marketName) score += 1;

    const cnpj = text.match(/([\d./-]+)/);
    if (cnpj?.[0]) score += 2;

    const date = lines[3].match(/\d{1,2}[\/-]\d{1,2}[\/-]\d{4}/);
    if (date?.[0]) score += 1;

    const hour = lines[3].match(/\d{1,2}:\d{2}/);
    if (hour?.[0]) score += 1;

    for (let i = 5; i < lines.length; i++) {

        if (lines[i].includes('R$')) break;

        const description = lines[i].match(descriptionRegex)?.join(' ') ?? '';
        const quantity = lines[i].match(quantityRegex)?.[0] ?? null;
        const unitValue = lines[i].match(valueRegex)?.[0] ?? null;
        const totalValue = lines[i].match(totalValueRegex)?.[0] ?? null;

        if (!description && !quantity && !unitValue) continue;

        items.push({
            description,
            quantity,
            unitValue,
            totalValue,
        });
    }

    if (items.length > 0) score += 2;

    const total = lines[7].match(/\d{1,2},\d{1,2}/);
    if (total?.[0]) score += 2;

    const payment = lines[8].match(/([A-Za-zÀ-ÿ ]+)/g);
    if (payment?.[1]) score += 1;

    const confidence = Number((score / maxScore).toFixed(2));

    return {
        business: {
            name: marketName,
            cnpj: cnpj?.[0] ?? null,
        },
        date: date?.[0] ?? null,
        hour: hour?.[0] ?? null,
        items,
        total: total?.[0] ?? null,
        payment: payment?.[1]?.trim() ?? null,
        confidence,
    };
}
