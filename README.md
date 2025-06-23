# Jouw ideale boek

Een interactieve webapp voor boekentips Engels op maat, met logboek en gedeelde tips via Google Sheets.

## Features

- Boekentips per niveau en genre, met covers
- Leerlingen kunnen eigen boekentips delen (via Google Sheets backend)
- Leeslogboek bijhouden (via Google Sheets)
- Eenvoudig uit te breiden

## Instructies

1. Zet een [Google Sheet](https://docs.google.com/spreadsheets/u/0/) op met tabblad `Tips` (Niveau, Genre, Titel, Auteur, Cover) en tabblad `Logboek`.
2. Voeg het Apps Script toe (zie onder).
3. Deploy als web app (IEDEREEN met de link mag bewerken).
4. Zet de web app URL in `app.js` bij `SHEET_API`.

## Apps Script (Google Sheet backend)

Plak dit in je Google Sheet onder Extensies > Apps Script:

```javascript
function doGet(e) {
  const action = e.parameter.action;
  const niveau = e.parameter.niveau;
  const genre = e.parameter.genre;
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tips");
  if (action === "getTips") {
    const data = sheet.getDataRange().getValues();
    return ContentService.createTextOutput(JSON.stringify(
      data.filter(r=>r[0]===niveau&&r[1]===genre).map(r=>({
        niveau:r[0], genre:r[1], title:r[2], author:r[3], cover:r[4]
      }))
    )).setMimeType(ContentService.MimeType.JSON);
  }
  return ContentService.createTextOutput("[]").setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Tips");
  if (body.action === "addTip") {
    sheet.appendRow([body.niveau, body.genre, body.title, body.author, body.cover||""]);
    return ContentService.createTextOutput("OK");
  }
  if (body.action === "addLog") {
    let logSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Logboek");
    if(!logSheet) logSheet = SpreadsheetApp.getActiveSpreadsheet().insertSheet("Logboek");
    logSheet.appendRow([body.niveau, body.genre, body.title, body.author, body.cover||"", body.timestamp]);
    return ContentService.createTextOutput("OK");
  }
  return ContentService.createTextOutput("ERR");
}
```

## Boeken toevoegen

- Vul je boeken in in het Google Sheet (tabblad `Tips`) of in de `booksFallback` in `app.js` voor fallback.

## Voorbeeld

Zie [Open Library](https://openlibrary.org/) voor covers.

---

Vragen of hulp? Maak een issue aan of neem contact op!
