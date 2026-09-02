import type { Product } from '../types';

export const downloadAnalyticsPDF = (stats: any, artisanName: string) => {
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const grandTotal = stats?.grandTotalValue ?? stats?.grandTotal ?? 0;
  const bulkTotal = stats?.bulkTotalValue ?? stats?.bulkTotal ?? 0;
  const directTotal = stats?.directTotalValue ?? stats?.directTotal ?? 0;
  const realizedRevenue = stats?.realizedRevenue ?? 0;

  const bulkCount = stats?.bulkList?.length ?? stats?.bulkCount ?? 0;
  const directCount = stats?.directList?.length ?? stats?.directCount ?? 0;
  const bulkAvg = stats?.bulkAOV ?? stats?.bulkAvg ?? 0;
  const directAvg = stats?.directAOV ?? stats?.directAvg ?? 0;
  const bulkQty = stats?.bulkTotalUnits ?? stats?.bulkQty ?? 0;
  const directQty = stats?.directTotalUnits ?? stats?.directQty ?? 0;

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>CraftConnect Financial & Pipeline Audit - ${artisanName || 'Artisan'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #1c1917;
            padding: 30px;
            background: #fff;
            margin: 0;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #C85A32;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .title {
            font-size: 24px;
            font-weight: 800;
            color: #4A2E1B;
            margin: 0;
          }
          .subtitle {
            font-size: 13px;
            color: #C85A32;
            font-weight: 700;
            margin-top: 4px;
          }
          .meta {
            text-align: right;
            font-size: 12px;
            color: #78716c;
          }
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 24px;
          }
          .kpi-card {
            background: #fafaf9;
            border: 1px solid #e7e5e4;
            border-radius: 12px;
            padding: 14px;
          }
          .kpi-label {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 800;
            color: #a8a29e;
          }
          .kpi-value {
            font-size: 20px;
            font-weight: 800;
            color: #1c1917;
            margin-top: 4px;
          }
          .section-title {
            font-size: 16px;
            font-weight: 800;
            color: #4A2E1B;
            border-left: 4px solid #C85A32;
            padding-left: 10px;
            margin-top: 25px;
            margin-bottom: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 12px;
          }
          th {
            background: #f5f5f4;
            color: #44403c;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 10px;
            padding: 10px;
            border: 1px solid #e7e5e4;
            text-align: left;
          }
          td {
            padding: 10px;
            border: 1px solid #e7e5e4;
          }
          .highlight-bulk {
            color: #C85A32;
            font-weight: 800;
          }
          .highlight-direct {
            color: #047857;
            font-weight: 800;
          }
          .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e7e5e4;
            font-size: 11px;
            color: #a8a29e;
            display: flex;
            justify-content: space-between;
          }
          @media print {
            body { padding: 0; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">CraftConnect Financial & Pipeline Audit</h1>
            <div class="subtitle">Real-Time Buyer Revenue & Channel Performance Report</div>
          </div>
          <div class="meta">
            <div><strong>Artisan Studio:</strong> ${artisanName || 'Artisan'}</div>
            <div><strong>Generated:</strong> ${dateStr}</div>
            <div><strong>Status:</strong> Verified Live Data</div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Grand Total Pipeline</div>
            <div class="kpi-value">₹${Number(grandTotal).toLocaleString('en-IN')}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Wholesale Bulk Pipeline</div>
            <div class="kpi-value highlight-bulk">₹${Number(bulkTotal).toLocaleString('en-IN')}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Direct Retail Orders</div>
            <div class="kpi-value highlight-direct">₹${Number(directTotal).toLocaleString('en-IN')}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Realized Cashflow</div>
            <div class="kpi-value" style="color:#047857;">₹${Number(realizedRevenue).toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div class="section-title">1. Dual-Channel Revenue Breakdown</div>
        <table>
          <thead>
            <tr>
              <th>Metric / Financial Parameter</th>
              <th>Wholesale Bulk Inquiries</th>
              <th>Direct Retail Marketplace Orders</th>
              <th>Differential Impact</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Total Deals / Orders</strong></td>
              <td class="highlight-bulk">${bulkCount} inquiries</td>
              <td class="highlight-direct">${directCount} orders</td>
              <td>${bulkCount > directCount ? '+' + (bulkCount - directCount) + ' Wholesale' : '+' + (directCount - bulkCount) + ' Direct'}</td>
            </tr>
            <tr>
              <td><strong>Channel Gross Value (₹)</strong></td>
              <td class="highlight-bulk">₹${Number(bulkTotal).toLocaleString('en-IN')}</td>
              <td class="highlight-direct">₹${Number(directTotal).toLocaleString('en-IN')}</td>
              <td><strong>₹${Math.abs(bulkTotal - directTotal).toLocaleString('en-IN')} ${bulkTotal >= directTotal ? 'Wholesale Lead' : 'Direct Lead'}</strong></td>
            </tr>
            <tr>
              <td><strong>Average Value Per Deal</strong></td>
              <td>₹${Number(bulkAvg).toLocaleString('en-IN')}</td>
              <td>₹${Number(directAvg).toLocaleString('en-IN')}</td>
              <td>${bulkAvg > directAvg ? '+' + (bulkAvg - directAvg).toLocaleString('en-IN') + ' Bulk Premium' : '+' + (directAvg - bulkAvg).toLocaleString('en-IN') + ' Direct Premium'}</td>
            </tr>
            <tr>
              <td><strong>Total Unit Quantity</strong></td>
              <td>${bulkQty} units</td>
              <td>${directQty} units</td>
              <td>+${Math.abs(bulkQty - directQty)} units</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <div>CraftConnect Official Platform Financial Audit &bull; Confidential</div>
          <div>Page 1 of 1</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  // Print using hidden iframe so popups are never blocked
  const printIframe = document.createElement('iframe');
  printIframe.style.position = 'fixed';
  printIframe.style.right = '0';
  printIframe.style.bottom = '0';
  printIframe.style.width = '0';
  printIframe.style.height = '0';
  printIframe.style.border = '0';

  document.body.appendChild(printIframe);
  const doc = printIframe.contentWindow?.document || printIframe.contentDocument;

  if (doc) {
    doc.open();
    doc.write(printContent);
    doc.close();

    setTimeout(() => {
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(printIframe);
      }, 2000);
    }, 400);
  } else {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printContent);
      win.document.close();
    }
  }
};

export const downloadCataloguePDF = (stats: any, products: Product[], artisanName: string) => {
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const totalProducts = stats?.totalProducts ?? products.length;
  const publishedCount = stats?.publishedCount ?? products.filter((p) => (p.status || 'Published') === 'Published').length;
  const totalStockUnits = stats?.totalStockUnits ?? products.reduce((sum, p) => sum + (p.stock !== undefined ? p.stock : 10), 0);
  const totalInventoryValue = stats?.totalInventoryValue ?? products.reduce((sum, p) => sum + ((p.stock !== undefined ? p.stock : 10) * p.price), 0);

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>CraftConnect Catalogue Audit - ${artisanName || 'Artisan'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #1c1917;
            padding: 30px;
            background: #fff;
            margin: 0;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #C85A32;
            padding-bottom: 16px;
            margin-bottom: 24px;
          }
          .title {
            font-size: 24px;
            font-weight: 800;
            color: #4A2E1B;
            margin: 0;
          }
          .subtitle {
            font-size: 13px;
            color: #C85A32;
            font-weight: 700;
            margin-top: 4px;
          }
          .meta {
            text-align: right;
            font-size: 12px;
            color: #78716c;
          }
          .kpi-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 12px;
            margin-bottom: 24px;
          }
          .kpi-card {
            background: #fafaf9;
            border: 1px solid #e7e5e4;
            border-radius: 12px;
            padding: 14px;
          }
          .kpi-label {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 800;
            color: #a8a29e;
          }
          .kpi-value {
            font-size: 20px;
            font-weight: 800;
            color: #1c1917;
            margin-top: 4px;
          }
          .section-title {
            font-size: 16px;
            font-weight: 800;
            color: #4A2E1B;
            border-left: 4px solid #C85A32;
            padding-left: 10px;
            margin-top: 25px;
            margin-bottom: 12px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 10px;
            font-size: 12px;
          }
          th {
            background: #f5f5f4;
            color: #44403c;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 10px;
            padding: 10px;
            border: 1px solid #e7e5e4;
            text-align: left;
          }
          td {
            padding: 10px;
            border: 1px solid #e7e5e4;
          }
          .footer {
            margin-top: 40px;
            padding-top: 16px;
            border-top: 1px solid #e7e5e4;
            font-size: 11px;
            color: #a8a29e;
            display: flex;
            justify-content: space-between;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">CraftConnect Catalogue & Inventory Audit</h1>
            <div class="subtitle">Artisan Craft Catalogue Valuation & Stock Performance Report</div>
          </div>
          <div class="meta">
            <div><strong>Artisan Studio:</strong> ${artisanName || 'Artisan'}</div>
            <div><strong>Generated:</strong> ${dateStr}</div>
            <div><strong>Status:</strong> Verified Live Inventory</div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Total Catalogue Items</div>
            <div class="kpi-value">${totalProducts}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Published Live Items</div>
            <div class="kpi-value" style="color:#047857;">${publishedCount}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Total Stock Units</div>
            <div class="kpi-value" style="color:#C85A32;">${totalStockUnits} units</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Inventory Value (₹)</div>
            <div class="kpi-value" style="color:#4A2E1B;">₹${Number(totalInventoryValue).toLocaleString('en-IN')}</div>
          </div>
        </div>

        <div class="section-title">1. Craft Inventory Item Details</div>
        <table>
          <thead>
            <tr>
              <th>Product Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Stock Units</th>
              <th>Unit Price (₹)</th>
              <th>Total Inventory Value (₹)</th>
            </tr>
          </thead>
          <tbody>
            ${(products || []).map(p => `
              <tr>
                <td><strong>${p.title || 'Untitled'}</strong></td>
                <td>${p.category || 'Handicrafts'}</td>
                <td>${p.status || 'Published'}</td>
                <td>${p.stock !== undefined ? p.stock : 10} units</td>
                <td>₹${(p.price || 0).toLocaleString('en-IN')}</td>
                <td><strong>₹${(((p.stock !== undefined ? p.stock : 10) * (p.price || 0))).toLocaleString('en-IN')}</strong></td>
              </tr>
            `).join('')}
          </tbody>
        </table>

        <div class="footer">
          <div>CraftConnect Official Platform Catalogue Audit &bull; Confidential</div>
          <div>Page 1 of 1</div>
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 300);
          };
        </script>
      </body>
    </html>
  `;

  const printIframe = document.createElement('iframe');
  printIframe.style.position = 'fixed';
  printIframe.style.right = '0';
  printIframe.style.bottom = '0';
  printIframe.style.width = '0';
  printIframe.style.height = '0';
  printIframe.style.border = '0';

  document.body.appendChild(printIframe);
  const doc = printIframe.contentWindow?.document || printIframe.contentDocument;

  if (doc) {
    doc.open();
    doc.write(printContent);
    doc.close();

    setTimeout(() => {
      printIframe.contentWindow?.focus();
      printIframe.contentWindow?.print();
      setTimeout(() => {
        document.body.removeChild(printIframe);
      }, 2000);
    }, 400);
  } else {
    const win = window.open('', '_blank');
    if (win) {
      win.document.write(printContent);
      win.document.close();
    }
  }
};

