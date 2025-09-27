# DPIA – Skolapp v3

Senast uppdaterad: 2025‑09‑27
Ägare: DPO

## Beskrivning av behandling
- Lärare skapar quiz/övningar och genomför sessioner med elever.
- Systemet lagrar elevsvar och resultat för pedagogisk uppföljning.
- Realtid används för live‑sessioner. Telemetri används för drift och säkerhet.
- AI‑funktioner kan användas frivilligt av lärare (ej PII i promptar).

## Nödvändighet & proportionalitet
- Uppgifterna är minimerade och begränsade till utbildningssyfte.
- RLS skyddar åtkomst per organisation/användare.
- Telemetri är anonymiserad och aggregerad.

## Riskanalys (exempel)
- Obefogad åtkomst (misskonfiguration/RLS‑fel) → Medel.
- Exfiltration via loggar/telemetri → Låg (PII förbjuden, kontroller på plats).
- AI‑läckage via promptar → Låg/Medel (policy och UI‑varning; innehåll filtreras).
- Leverantörsrisk (biträden) → Medel (biträdesavtal, EU‑region, standardklausuler).

## Åtgärder
- RLS‑policies testas i CI, se `docs/data/rls-review.md`.
- Least privilege för nycklar; server‑side endast.
- Säkerhetsrubriker, CSP, TLS.
- Sentry utan PII; `correlation_id` för spårbarhet.
- Automatisk retention (se dataregister) och SRR‑flöden.

## Intressentdialog
- Skolhuvudmän och lärare informeras om ändamål, lagringstider och rättigheter.
- Elever/vårdnadshavare informeras via integritetssida och samtyckesflöden.

## Rättigheter & SRR
- Export, radering, rättelse implementeras (se AQ3).

## Beslut
- Behandlingen bedöms proportionerlig med föreslagna skyddsåtgärder.
