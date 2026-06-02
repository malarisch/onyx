# Konversations-Logging (Testphase)

Schreibt jede fertige Frage/Antwort aus dem Widget in ein Google Sheet — ohne
Änderung an upstream Onyx und ohne Backend-Eingriff. Das Logging ist **opt-in**:
ist keine URL konfiguriert, passiert nichts.

## Architektur

```
Widget (Browser)  ──POST JSON──►  Apps-Script Web-App  ──►  Google Sheet
```

Die Apps-Script-URL ist write-only (`doPost`) — es wird kein Secret im
Browser exponiert.

## 1. Google Sheet + Apps Script einrichten

1. Neues Google Sheet anlegen. Erste Zeile als Header:
   `timestamp | chatSessionId | agentName | question | answer`
2. **Erweiterungen → Apps Script** öffnen, Inhalt durch das Script unten ersetzen.
3. **Bereitstellen → Neue Bereitstellung → Web-App**:
   - Ausführen als: *Ich selbst*
   - Zugriff: *Jeder* (nötig, damit der Browser ohne Login posten kann)
4. Die erzeugte **Web-App-URL** kopieren (endet auf `/exec`).

```javascript
function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    sheet.appendRow([
      data.timestamp || new Date().toISOString(),
      data.chatSessionId || "",
      data.agentName || "",
      data.question || "",
      data.answer || "",
    ]);
    return ContentService.createTextOutput("ok");
  } catch (err) {
    return ContentService.createTextOutput("error: " + err);
  }
}
```

## 2. Widget bauen

Die URL wird beim Build über die Env-Variable `VITE_CONVO_LOG_URL` eingebacken
(siehe `.env` bzw. die mode-spezifische env-Datei):

```
VITE_CONVO_LOG_URL=https://script.google.com/macros/s/XXXX/exec
```

Dann normal bauen, z.B.:

```
npm run build:self-hosted
```

Ohne gesetzte Variable ist das Logging deaktiviert (kein Request).

## 3. Nach der Testphase abschalten

`VITE_CONVO_LOG_URL` leeren / entfernen und neu bauen. Optional die
Apps-Script-Bereitstellung deaktivieren.

## Datenschutz

Konversationen können personenbezogene Daten enthalten. Vor dem Produktiv-
einsatz Rechtsgrundlage und (bei Google als Auftragsverarbeiter) AVV mit dem/der
Datenschutzbeauftragten klären. Das Sheet sollte nur dem Testteam zugänglich sein.
