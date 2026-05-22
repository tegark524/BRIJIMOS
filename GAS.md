// --- KONFIGURASI NAMA SHEET ---
const SHEET_MAP = {
pegawai: "Sheet1",
unit: "Data_Unit",
keragaan: "Keragaan_Cabang",
rka: "RKA_Data",
pipeline: "Pipeline_Data",
rmft_ach: "Pencapaian_RMFT"
};

function doGet(e) {
const ss = SpreadsheetApp.getActiveSpreadsheet();
function getSheetData(name) {
const sheet = ss.getSheetByName(name);
if (!sheet) return [];
const data = sheet.getDataRange().getDisplayValues();
const headers = data[0];
return data.slice(1).map(row => {
let obj = {};
headers.forEach((header, i) => {
let val = row[i].toString().trim();
if (val.includes('/')) {
let parts = val.split('/');
if (parts.length === 3 && parts[2].length === 4) {
val = parts[2] + "-" + parts[1].padStart(2, '0') + "-" + parts[0].padStart(2, '0');
}
}
obj[header] = val;
});
return obj;
});
}
return ContentService.createTextOutput(JSON.stringify({
pegawai: getSheetData(SHEET_MAP.pegawai),
unit: getSheetData(SHEET_MAP.unit),
keragaan: getSheetData(SHEET_MAP.keragaan),
rka: getSheetData(SHEET_MAP.rka),
pipeline: getSheetData(SHEET_MAP.pipeline),
rmft_ach: getSheetData(SHEET_MAP.rmft_ach)
})).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
try {
const ss = SpreadsheetApp.getActiveSpreadsheet();
const body = JSON.parse(e.postData.contents);
const action = body.action;
const type = body.type;
const key = type === 'uker' ? 'unit' : type;
const sheet = ss.getSheetByName(SHEET_MAP[key]);
if (!sheet) throw new Error("Sheet tidak ditemukan!");

    // --- LOGIKA HAPUS ---
    if (action === 'delete') {
      const targetDate = body.targetDate.toString().trim();
      const data = sheet.getDataRange().getDisplayValues();
      const headers = data[0];
      const dateColIdx = headers.findIndex(h => h.toLowerCase().includes("tanggal") || h.toLowerCase().includes("bulan"));
      let deletedCount = 0;
      for (let i = data.length - 1; i >= 1; i--) {
        let rowDate = data[i][dateColIdx].toString().trim();
        if (rowDate.includes('/')) {
          let parts = rowDate.split('/');
          rowDate = parts[2] + "-" + parts[1].padStart(2, '0') + "-" + parts[0].padStart(2, '0');
        }
        if (rowDate.includes(targetDate)) { sheet.deleteRow(i + 1); deletedCount++; }
      }
      return response({ status: "success", message: deletedCount + " baris dihapus" });
    }

    // --- LOGIKA SIMPAN (DYNAMIC MAPPING) ---
    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const dataArray = body.data;
    const rowsToInsert = dataArray.map(item => {
      return headers.map(header => {
        // GAS akan otomatis mencocokkan key JSON dengan Nama Kolom di Sheet
        return item[header] !== undefined ? item[header] : "";
      });
    });

    sheet.getRange(sheet.getLastRow() + 1, 1, rowsToInsert.length, headers.length).setValues(rowsToInsert);
    return response({ status: "success", message: rowsToInsert.length + " data berhasil masuk" });

} catch (err) { return response({ status: "error", message: err.message }); }
}

function response(obj) {
return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
