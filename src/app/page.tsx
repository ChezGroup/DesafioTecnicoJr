'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { data } from "@/service/data";
import { ocr } from "@/service/ocr";

export default function Home() {
  const [result, setResult] = useState<any>(null);

  function handleProcess() {
    setResult(ocr(data));
  }

  return (
    <Card className="min-h-screen grid place-items justify-center">
      <pre className="">{data}</pre>
      <Button onClick={handleProcess} className="cursor-pointer">Processar</Button>

      {result && (
        <pre className="bg-black text-green-400 p-4 rounded w-full max-w-xl text-sm overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </Card>
  );
}
