Onde esse código pode quebrar?
Resposta: O código pode quebrar na API, se for inserido um recibo diferente do formado do primeiro exemplo a API quebra, o código também quebra se trocar os dados do raw data que ta em data.ts.
    
Quais situações ou inputs podem causar falhas?
Resposta: Em todas as situações em que o formato seja diferente do padrão inserido em data.ts, o algoritmo foi feito com base naquele exemplo

O que você faria se o input piorasse?
Resposta: mudaria a abordagem, trocaria para file, e implementaria um algoritmo para cada tipo de situação.

Como lidaria com dados ainda mais inconsistentes?
Resposta: mesmo não sendo adequado eu utilizei regex como parsing do OCR, então eu não vejo uma outra solução a não ser deixar o regex para rigido, agravar mais ainda as validações do regex

O que você deixaria para uma próxima versão?
Resposta: São muitas coisas, mas primeiro de tudo tentaria generalizar o algoritmo para poder ler outros tipos de recibo, como eu não tenho tanto conhecimento com as tecnologias que foram abordadas primeiro de tudo também procuraria uma lib que trabalhasse com isso, adicionaria um file input e faria a mesma coisa só que com file, eu fiz uma API está em src/app/api/route.ts eu tentaria trabalhar em cima dela para conseguir comportar mais tipos de recibos também, tentaria melhorar a interface, pois eu não foquei muito em cima dela, deixei algo bem cru.

Quais melhorias ou funcionalidades ficaram fora do escopo?
Resposta: Algumas melhorias e funcionalidades ficaram fora do escopo inicial deste desafio. Entre elas, a principal é a utilização de OCR real a partir de imagens ou PDFs, utilizando bibliotecas como Tesseract ou serviços externos, já que a abordagem atual trabalha apenas com texto bruto, também ficou fora do escopo a generalização completa do algoritmo para suportar múltiplos layouts de recibos, marcas diferentes de estabelecimentos e variações regionais de formatação. O parsing foi desenvolvido com base em um layout específico (Exemplo 1)

