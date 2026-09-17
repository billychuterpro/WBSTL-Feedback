import { ExcelMappingConfig } from '../types';

export function generateGasCodeGS(config: ExcelMappingConfig): string {
  return `/**
 * Google Apps Script Backend (Code.gs)
 * Feedback Reports Tracker & Action Management Web App
 * Generated for Google Sheets Backend
 */

function doGet(e) {
  return HtmlService.createTemplateFromFile('Index')
    .evaluate()
    .setTitle('Feedback Reports Tracker & Action Center')
    .addMetaTag('viewport', 'width=device-width, initial-scale=1')
    .setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}

/**
 * Creates header row in active sheet if empty
 */
function setupSheet() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
  if (sheet.getLastRow() === 0) {
    var headers = ['ID', 'Date', 'Area', 'Type', 'Feedback Detail', 'Action Taken', 'Status', 'Action Owner', 'Action Due Date'];
    sheet.appendRow(headers);
    sheet.getRange('A1:I1')
      .setFontWeight('bold')
      .setBackground('#1e293b')
      .setFontColor('#ffffff');
    sheet.setFrozenRows(1);
  }
}

/**
 * Fetches all feedback data from Google Sheet
 */
function getFeedbackData() {
  try {
    setupSheet();
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return [];
    }
    
    var data = sheet.getRange(2, 1, lastRow - 1, 9).getValues();
    var result = [];
    
    for (var i = 0; i < data.length; i++) {
      var row = data[i];
      result.push({
        id: String(row[0] || ''),
        date: row[1] ? formatDate(row[1]) : '',
        area: String(row[2] || ''),
        type: String(row[3] || ''),
        feedbackDetail: String(row[4] || ''),
        actionTaken: String(row[5] || ''),
        status: String(row[6] || 'Pending'),
        actionOwner: String(row[7] || ''),
        actionDueDate: row[8] ? formatDate(row[8]) : ''
      });
    }
    
    return result;
  } catch (err) {
    Logger.log('Error in getFeedbackData: ' + err.toString());
    throw new Error('Failed to load feedback records: ' + err.message);
  }
}

/**
 * Appends array of parsed Excel feedback records to Google Sheet
 */
function appendData(dataArray) {
  try {
    if (!dataArray || !dataArray.length) {
      return { success: false, addedCount: 0, message: 'No records to append.' };
    }
    
    setupSheet();
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    
    var nextIdNum = 1001;
    if (lastRow > 1) {
      var existingIds = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
      for (var i = 0; i < existingIds.length; i++) {
        var idStr = String(existingIds[i][0] || '');
        var match = idStr.match(/FB-(\\d+)/i);
        if (match) {
          var num = parseInt(match[1], 10);
          if (num >= nextIdNum) {
            nextIdNum = num + 1;
          }
        }
      }
    }
    
    var todayStr = Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');
    var newRows = [];
    
    for (var j = 0; j < dataArray.length; j++) {
      var item = dataArray[j];
      var uniqueId = 'FB-' + (nextIdNum++);
      newRows.push([
        uniqueId,
        todayStr,
        item.area || '',
        item.type || '',
        item.feedbackDetail || '',
        item.actionTaken || '',
        item.status || 'Pending',
        item.actionOwner || '',
        item.actionDueDate || ''
      ]);
    }
    
    if (newRows.length > 0) {
      sheet.getRange(lastRow + 1, 1, newRows.length, 9).setValues(newRows);
    }
    
    return {
      success: true,
      addedCount: newRows.length,
      message: 'Successfully saved ' + newRows.length + ' feedback reports to Google Sheet.'
    };
  } catch (err) {
    Logger.log('Error in appendData: ' + err.toString());
    return { success: false, addedCount: 0, message: 'Backend error: ' + err.message };
  }
}

/**
 * Updates Action Taken, Status, Action Owner, Action Due Date for a specific record by ID
 */
function updateFeedback(id, actionTaken, status, actionOwner, actionDueDate) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var lastRow = sheet.getLastRow();
    
    if (lastRow <= 1) {
      return { success: false, message: 'No data found in sheet.' };
    }
    
    var idColumn = sheet.getRange(2, 1, lastRow - 1, 1).getValues();
    
    for (var i = 0; i < idColumn.length; i++) {
      if (String(idColumn[i][0]).trim() === String(id).trim()) {
        var rowNum = i + 2;
        sheet.getRange(rowNum, 6).setValue(actionTaken || '');
        sheet.getRange(rowNum, 7).setValue(status || 'Pending');
        sheet.getRange(rowNum, 8).setValue(actionOwner || '');
        sheet.getRange(rowNum, 9).setValue(actionDueDate || '');
        return {
          success: true,
          id: id,
          message: 'Record ' + id + ' updated successfully.'
        };
      }
    }
    
    return { success: false, message: 'Record with ID "' + id + '" was not found.' };
  } catch (err) {
    Logger.log('Error in updateFeedback: ' + err.toString());
    return { success: false, message: 'Update failed: ' + err.message };
  }
}

function formatDate(dateObj) {
  if (dateObj instanceof Date) {
    return Utilities.formatDate(dateObj, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return String(dateObj);
}
`;
}

export function generateIndexHtml(config: ExcelMappingConfig): string {
  const areaColLetter = config.areaCol.toUpperCase();
  const typeColLetter = config.typeCol.toUpperCase();
  const feedbackColLetter = config.feedbackCol.toUpperCase();
  const startRow = config.startRow;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Feedback Reports Tracker & Action Center</title>
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.1/font/bootstrap-icons.css" rel="stylesheet">
  <script src="https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js"></script>

  <style>
    body {
      background-color: #f8fafc;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      color: #0f172a;
    }
    .card {
      border-radius: 12px;
      border: 1px solid #e2e8f0;
      box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05);
    }
    .badge-Pending { background-color: #fff7ed; color: #c2410c; border: 1px solid #ffedd5; }
    .badge-InProgress { background-color: #eff6ff; color: #1d4ed8; border: 1px solid #dbeafe; }
    .badge-Resolved { background-color: #f0fdf4; color: #15803d; border: 1px solid #dcfce7; }
    .action-box {
      background-color: #f1f5f9;
      border-radius: 10px;
      padding: 12px;
      border: 1px solid #e2e8f0;
    }
    .toast-container { position: fixed; bottom: 20px; right: 20px; z-index: 1090; }
  </style>
</head>
<body>

  <nav class="navbar navbar-dark bg-dark py-3">
    <div class="container-fluid px-4">
      <a class="navbar-brand d-flex align-items-center gap-2 fw-bold" href="#">
        <i class="bi bi-chat-square-text-fill text-primary"></i>
        <span>Feedback Reports Tracker & Comment Action Center</span>
      </a>
      <span class="navbar-text text-light opacity-75 fs-7">
        <i class="bi bi-file-earmark-excel me-1"></i> SheetJS + Google Apps Script
      </span>
    </div>
  </nav>

  <div class="container-fluid px-4 py-4">
    <!-- File Import Card -->
    <div class="card mb-4">
      <div class="card-header bg-white py-3 fw-bold text-dark">
        <i class="bi bi-cloud-arrow-up-fill text-primary me-2"></i>
        Import Feedback Excel Document (.xlsx / .xls)
      </div>
      <div class="card-body">
        <div class="row align-items-center g-3">
          <div class="col-md-7">
            <label for="excelFileInput" class="form-label text-secondary fw-semibold">Select Excel Document</label>
            <input type="file" id="excelFileInput" accept=".xlsx, .xls" class="form-control" />
            <div class="form-text">Data starts on Row ${startRow}. Area = Col ${areaColLetter}, Type = Col ${typeColLetter}, Feedback = Col ${feedbackColLetter}.</div>
          </div>
          <div class="col-md-5">
            <button class="btn btn-primary w-100 py-2 fw-bold" onclick="handleFileUpload()">Upload & Process</button>
          </div>
        </div>

        <div id="uploadPreviewAlert" class="alert alert-info mt-3 d-none align-items-center justify-content-between">
          <span id="uploadPreviewText">Parsed records ready.</span>
          <button class="btn btn-sm btn-success fw-bold px-3" onclick="confirmAppendData()">Confirm & Save to Sheet</button>
        </div>
      </div>
    </div>

    <!-- Feedback Register & Action Section per Comment -->
    <div class="card">
      <div class="card-header bg-white py-3">
        <div class="row align-items-center">
          <div class="col-md-6">
            <h5 class="fw-bold mb-0">Comment Action Center</h5>
          </div>
          <div class="col-md-6 text-end">
            <button class="btn btn-outline-secondary btn-sm" onclick="loadTableData()"><i class="bi bi-arrow-clockwise"></i> Refresh</button>
          </div>
        </div>
      </div>
      <div class="card-body p-3" id="commentsContainer">
        <div class="text-center py-5 text-muted">Loading comment records...</div>
      </div>
    </div>
  </div>

  <div class="toast-container" id="toastContainer"></div>

  <script>
    let pendingUploadData = [];
    let masterRecords = [];

    document.addEventListener('DOMContentLoaded', loadTableData);

    function showToast(msg, type = 'success') {
      const bg = type === 'success' ? 'bg-success' : 'bg-danger';
      const html = \`<div class="toast align-items-center text-white \${bg} border-0 show mb-2" role="alert"><div class="toast-body">\${msg}</div></div>\`;
      document.getElementById('toastContainer').insertAdjacentHTML('beforeend', html);
    }

    function colLetterToIndex(letter) {
      let col = 0;
      const str = String(letter).toUpperCase().trim();
      for (let i = 0; i < str.length; i++) col = col * 26 + (str.charCodeAt(i) - 64);
      return col - 1;
    }

    function handleFileUpload() {
      const input = document.getElementById('excelFileInput');
      if (!input.files || !input.files[0]) { showToast('Select an Excel file first', 'danger'); return; }
      const reader = new FileReader();
      reader.onload = function(e) {
        const data = new Uint8Array(e.target.result);
        const wb = XLSX.read(data, { type: 'array' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1, raw: false, defval: '' });

        pendingUploadData = [];
        for (let r = ${startRow - 1}; r < rows.length; r++) {
          const area = String(rows[r][colLetterToIndex('${areaColLetter}')] || '').trim();
          if (!area) break;
          pendingUploadData.push({
            area: area,
            type: String(rows[r][colLetterToIndex('${typeColLetter}')] || 'General').trim(),
            feedbackDetail: String(rows[r][colLetterToIndex('${feedbackColLetter}')] || '').trim(),
            actionTaken: '',
            status: 'Pending'
          });
        }
        document.getElementById('uploadPreviewText').innerText = 'Extracted ' + pendingUploadData.length + ' records.';
        document.getElementById('uploadPreviewAlert').classList.remove('d-none');
        document.getElementById('uploadPreviewAlert').classList.add('d-flex');
      };
      reader.readAsArrayBuffer(input.files[0]);
    }

    function confirmAppendData() {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run.withSuccessHandler(function(res) {
          showToast('Saved to Sheet!');
          document.getElementById('uploadPreviewAlert').classList.add('d-none');
          loadTableData();
        }).appendData(pendingUploadData);
      }
    }

    function loadTableData() {
      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run.withSuccessHandler(function(recs) {
          masterRecords = recs || [];
          renderComments(masterRecords);
        }).getFeedbackData();
      }
    }

    function renderComments(records) {
      const container = document.getElementById('commentsContainer');
      if (!records || !records.length) { container.innerHTML = '<div class="text-center py-4">No records found.</div>'; return; }

      let html = '';
      records.forEach(r => {
        html += \`
          <div class="border rounded-3 p-3 mb-3 bg-white">
            <div class="d-flex justify-content-between align-items-center mb-2">
              <span class="fw-bold text-primary">\${r.id}</span>
              <span class="badge bg-secondary">\${r.area}</span>
              <span class="badge badge-\${r.status}">Status: \${r.status}</span>
            </div>
            <p class="mb-2 text-dark bg-light p-2 rounded">"\${r.feedbackDetail}"</p>
            <div class="action-box">
              <label class="fw-bold text-secondary mb-1 fs-7">Action Taken on Comment:</label>
              <textarea id="act_\${r.id}" class="form-control form-control-sm mb-2" rows="2">\${r.actionTaken || ''}</textarea>
              <div class="row g-2">
                <div class="col-6">
                  <input type="text" id="own_\${r.id}" class="form-control form-control-sm" placeholder="Action Owner" value="\${r.actionOwner || ''}">
                </div>
                <div class="col-6">
                  <select id="sta_\${r.id}" class="form-select form-select-sm">
                    <option value="Pending" \${r.status === 'Pending' ? 'selected' : ''}>Pending</option>
                    <option value="InProgress" \${r.status === 'InProgress' ? 'selected' : ''}>In Progress</option>
                    <option value="Resolved" \${r.status === 'Resolved' ? 'selected' : ''}>Resolved</option>
                  </select>
                </div>
              </div>
              <button class="btn btn-sm btn-primary mt-2 fw-bold" onclick="saveAction('\${r.id}')">Save Action</button>
            </div>
          </div>
        \`;
      });
      container.innerHTML = html;
    }

    function saveAction(id) {
      const actionTaken = document.getElementById('act_' + id).value;
      const actionOwner = document.getElementById('own_' + id).value;
      const status = document.getElementById('sta_' + id).value;

      if (typeof google !== 'undefined' && google.script && google.script.run) {
        google.script.run.withSuccessHandler(function() {
          showToast('Updated action for ' + id);
        }).updateFeedback(id, actionTaken, status, actionOwner, '');
      }
    }
  </script>
</body>
</html>
`;
}
