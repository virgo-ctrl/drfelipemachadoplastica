# Site do Dr. Felipe Machado

Site estático em português para consultas sobre cirurgia plástica em Recife e Caruaru. O conteúdo está em revisão. **Não publicar a versão atual**: dados obrigatórios do médico, destino dos leads e política de privacidade ainda precisam de confirmação.

## Rodar localmente

Requer Node.js 20 ou superior.

```bash
npm install
npm run build
npm run dev
```

Abra `http://localhost:4173`. Rode `npm test` para validar páginas, JSON-LD, links internos e o envio simulado do formulário. O servidor local usa a rota real `api/lead.js`; sem `LEAD_WEBHOOK_URL`, o formulário retorna 503 e oferece WhatsApp como alternativa.

## Estrutura

- `scripts/build.mjs`: gera as páginas em `site/` e bloqueia build de produção com dados pendentes.
- `site/`: HTML gerado, CSS, JS e imagens WebP do site anterior. Arquivos gerados são mantidos no repositório para revisão.
- `api/lead.js`: endpoint serverless do formulário, com validação, honeypot e repasse das UTMs/fbclid.
- `tests/`: verificação automatizada sem envio de lead real.

## Variáveis de ambiente

Use `.env.example` como referência. Configure no ambiente de deploy, nunca no Git.

| Variável | Uso |
| --- | --- |
| `CRM_PE` | Número CRM-PE do médico, sem prefixo. |
| `RQE` | Número do registro de especialista, sem prefixo. |
| `CLINIC_REGISTRATION` | Registro da clínica, se o site divulgar o estabelecimento. Confirmar também nome e diretor técnico. |
| `PRIVACY_EMAIL` | Canal para exercício dos direitos dos titulares. |
| `LEAD_WEBHOOK_URL` | HTTPS do receptor de leads. O endpoint retorna erro se estiver ausente. |
| `META_CUSTOM_EVENT_NAME` | Nome exato do evento personalizado de conversão usado nas campanhas antigas. Confirmar no Gerenciador de Eventos. |
| `SITE_READY` | Definir `true` somente após revisão médica, jurídica e operacional. |

O build em `VERCEL_ENV=production` falha se `SITE_READY` não for `true` ou se alguma variável obrigatória estiver vazia. Não há token de API de Conversões no repositório. A integração CAPI depende de aprovação do destino e das credenciais do servidor.

## Pendências antes de publicar

- [ ] [CONFIRMAR: CRM-PE], [CONFIRMAR: RQE], formação, especialidade anunciada e texto de apresentação com o Dr. Felipe.
- [ ] [CONFIRMAR: registro da clínica], razão social, diretor técnico e respectivos registros, se o site representar a clínica.
- [ ] [CONFIRMAR: endereço e horários] das unidades Recife e Caruaru. O site mostra apenas as cidades.
- [ ] Confirmar que **(81) 99170-9654** é o WhatsApp público para ambas as unidades; veio da nota da campanha de 01/10/2026.
- [ ] [CONFIRMAR: webhook de leads] e responsável pelo tratamento; testar entrega no sistema escolhido sem usar dados reais.
- [ ] [CONFIRMAR: e-mail de privacidade], prazo de retenção, operadores e texto final da política com o responsável.
- [ ] [CONFIRMAR: evento de conversão personalizada] exato e se a campanha antiga usava evento ou regra de URL.
- [ ] Confirmar autorização para usar as fotos e o logo do site anterior.
- [ ] Revisão final de copy e publicidade médica pelo médico/assessoria. Os três prints de depoimentos não foram usados.
- [ ] Confirmar hospedagem, domínio e redirecionamentos do WordPress antes da troca.

## Rastreamento e conformidade

Pixel Meta `2335694503515598`: `PageView` nas páginas, `Contact` em cliques de WhatsApp e `Lead` após resposta de sucesso do endpoint. Quando configurado, `META_CUSTOM_EVENT_NAME` também dispara após o sucesso. UTMs e fbclid são preservados na sessão e enviados ao webhook. O formulário não solicita informações clínicas e o Pixel não recebe procedimento ou cidade como parâmetro.

O hero e o rodapé exibem CRM/RQE, com marcadores de confirmação nesta versão de revisão. O conteúdo evita promessa de resultados, antes e depois e depoimentos. Há aviso de que o conteúdo não substitui consulta. A [Resolução CFM 2.336/2023](https://sistemas.cfm.org.br/normas/visualizar/resolucoes/BR/2023/2336) orienta a identificação profissional e a publicidade médica; o material precisa de validação antes de ir ao ar.

## Verificação

- `npm test`: 2 testes aprovados. Validam H1, metadados, JSON-LD, links internos, campos e webhook simulado.
- `npm run test:browser`: Playwright em 390 e 1280 px, todas as rotas, ausência de rolagem horizontal e envio interceptado do formulário. Capturas em `reports/home-390.png` e `reports/home-1280.png` (artefatos locais, fora do Git).
- Lighthouse mobile local, Chrome headless: desempenho **90**, acessibilidade **100**, boas práticas **96**, SEO **100**; LCP 1,9 s e CLS 0. Relatório em `reports/lighthouse-mobile.json` (artefato local). A rede de teste bloqueou Google Fonts e o script da Meta, então a medição deve ser repetida em ambiente de homologação antes de considerar a meta definitiva.
