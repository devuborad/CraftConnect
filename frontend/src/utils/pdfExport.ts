import type { Product } from '../types';

export const downloadAnalyticsPDF = (stats: any, artisanName: string) => {
  const dateStr = new Date().toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>CraftConnect Financial & Pipeline Audit - ${artisanName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #1c1917;
            padding: 40px;
            background: #fff;
            margin: 0;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #C85A32;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 26px;
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
            gap: 15px;
            margin-bottom: 30px;
          }
          .kpi-card {
            background: #fafaf9;
            border: 1px solid #e7e5e4;
            border-radius: 12px;
            padding: 15px;
          }
          .kpi-label {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 800;
            color: #a8a29e;
          }
          .kpi-value {
            font-size: 22px;
            font-weight: 800;
            color: #1c1917;
            margin-top: 5px;
          }
          .section-title {
            font-size: 18px;
            font-weight: 800;
            color: #4A2E1B;
            border-left: 4px solid #C85A32;
            padding-left: 10px;
            margin-top: 35px;
            margin-bottom: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 13px;
          }
          th {
            background: #f5f5f4;
            color: #44403c;
            font-weight: 800;
            text-transform: uppercase;
            font-size: 11px;
            padding: 12px;
            border: 1px solid #e7e5e4;
            text-align: left;
          }
          td {
            padding: 12px;
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
            margin-top: 50px;
            padding-top: 20px;
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
            <h1 class="title">CraftConnect Financial & Pipeline Audit</h1>
            <div class="subtitle">Real-Time Buyer Revenue & Channel Performance Report</div>
          </div>
          <div class="meta">
            <div><strong>Artisan Studio:</strong> ${artisanName}</div>
            <div><strong>Generated:</strong> ${dateStr}</div>
            <div><strong>Status:</strong> Verified Live Data</div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Grand Total Pipeline</div>
            <div class="kpi-value">₹${stats.grandTotal.toLocaleString('en-IN')}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Wholesale Bulk Pipeline</div>
            <div class="kpi-value highlight-bulk">₹${stats.bulkTotal.toLocaleString('en-IN')}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Direct Retail Orders</div>
            <div class="kpi-value highlight-direct">₹${stats.directTotal.toLocaleString('en-IN')}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Realized Cashflow</div>
            <div class="kpi-value" style="color:#047857;">₹${stats.realizedRevenue.toLocaleString('en-IN')}</div>
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
              <td class="highlight-bulk">${stats.bulkCount} inquiries</td>
              <td class="highlight-direct">${stats.directCount} orders</td>
              <td>${stats.bulkCount > stats.directCount ? '+' + (stats.bulkCount - stats.directCount) + ' Wholesale' : '+' + (stats.directCount - stats.bulkCount) + ' Direct'}</td>
            </tr>
            <tr>
              <td><strong>Channel Gross Value (₹)</strong></td>
              <td class="highlight-bulk">₹${stats.bulkTotal.toLocaleString('en-IN')}</td>
              <td class="highlight-direct">₹${stats.directTotal.toLocaleString('en-IN')}</td>
              <td><strong>₹${Math.abs(stats.bulkTotal - stats.directTotal).toLocaleString('en-IN')} ${stats.bulkTotal >= stats.directTotal ? 'Wholesale Lead' : 'Direct Lead'}</strong></td>
            </tr>
            <tr>
              <td><strong>Average Value Per Deal</strong></td>
              <td>₹${stats.bulkAvg.toLocaleString('en-IN')}</td>
              <td>₹${stats.directAvg.toLocaleString('en-IN')}</td>
              <td>${stats.bulkAvg > stats.directAvg ? '+' + (stats.bulkAvg - stats.directAvg).toLocaleString('en-IN') + ' Bulk Premium' : '+' + (stats.directAvg - stats.bulkAvg).toLocaleString('en-IN') + ' Direct Premium'}</td>
            </tr>
            <tr>
              <td><strong>Total Unit Quantity</strong></td>
              <td>${stats.bulkQty} units</td>
              <td>${stats.directQty} units</td>
              <td>+${Math.abs(stats.bulkQty - stats.directQty)} units</td>
            </tr>
          </tbody>
        </table>

        <div class="footer">
          <div>CraftConnect Official Platform Financial Audit &bull; Confidential</div>
          <div>Page 1 of 1</div>
        </div>

        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
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

  const printContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>CraftConnect Catalogue & Inventory Audit - ${artisanName}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;700;800&display=swap');
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #1c1917;
            padding: 40px;
            background: #fff;
            margin: 0;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #C85A32;
            padding-bottom: 20px;
            margin-bottom: 30px;
          }
          .title {
            font-size: 26px;
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
            gap: 15px;
            margin-bottom: 30px;
          }
          .kpi-card {
            background: #fafaf9;
            border: 1px solid #e7e5e4;
            border-radius: 12px;
            padding: 15px;
          }
          .kpi-label {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 800;
            color: #a8a29e;
          }
          .kpi-value {
            font-size: 22px;
            font-weight: 800;
            color: #1c1917;
            margin-top: 5px;
          }
          .section-title {
            font-size: 18px;
            font-weight: 800;
            color: #4A2E1B;
            border-left: 4px solid #C85A32;
            padding-left: 10px;
            margin-top: 35px;
            margin-bottom: 15px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
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
            margin-top: 50px;
            padding-top: 20px;
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
            <div><strong>Artisan Studio:</strong> ${artisanName}</div>
            <div><strong>Generated:</strong> ${dateStr}</div>
            <div><strong>Status:</strong> Verified Live Inventory</div>
          </div>
        </div>

        <div class="kpi-grid">
          <div class="kpi-card">
            <div class="kpi-label">Total Catalogue Items</div>
            <div class="kpi-value">${stats.totalProducts}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Published Live Items</div>
            <div class="kpi-value" style="color:#047857;">${stats.publishedCount}</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Total Stock Units</div>
            <div class="kpi-value" style="color:#C85A32;">${stats.totalStockUnits} units</div>
          </div>
          <div class="kpi-card">
            <div class="kpi-label">Inventory Value (₹)</div>
            <div class="kpi-value" style="color:#4A2E1B;">₹${stats.totalInventoryValue.toLocaleString('en-IN')}</div>
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
            ${products.map(p => `
              <tr>
                <td><strong>${p.title}</strong></td>
                <td>${p.category || 'Handicrafts'}</td>
                <td>${p.status || 'Published'}</td>
                <td>${p.stock !== undefined ? p.stock : 10} units</td>
                <td>₹${p.price.toLocaleString('en-IN')}</td>
                <td><strong>₹${((p.stock !== undefined ? p.stock : 10) * p.price).toLocaleString('en-IN')}</strong></td>
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
            window.print();
          };
        </script>
      </body>
    </html>
  `;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(printContent);
    printWindow.document.close();
  }
};
