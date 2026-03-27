import { notFound } from "next/navigation"
import { getInvoiceById, getSiteSetting } from "@/lib/db"
import type { Invoice } from "@/lib/db"
import { PrintButton } from "./print-button"

export const dynamic = "force-dynamic"

type LabourItem = { description: string; hours: number; rate: number }
type PartsItem = { description: string; qty: number; unitPrice: number }

function parseItems(invoice: Invoice) {
  let labourItems: LabourItem[] = []
  let partsItems: PartsItem[] = []
  try { labourItems = JSON.parse(invoice.labour_items || "[]") } catch {}
  try { partsItems = JSON.parse(invoice.parts_items || "[]") } catch {}

  const labourSubtotal = labourItems.reduce((s, i) => s + i.hours * i.rate, 0)
  const partsSubtotal = partsItems.reduce((s, i) => s + i.qty * i.unitPrice, 0)
  const discountPct = invoice.labour_discount ?? 0
  const labourDiscountAmount = labourSubtotal * (discountPct / 100)
  const subtotal = (labourSubtotal - labourDiscountAmount) + partsSubtotal
  const vatAmount = invoice.vat_enabled ? (subtotal * invoice.vat_rate) / 100 : 0
  const total = subtotal + vatAmount
  return { labourItems, partsItems, labourSubtotal, partsSubtotal, labourDiscountAmount, discountPct, subtotal, vatAmount, total }
}

const fmt = (n: number) => `£${n.toFixed(2)}`

export default async function PrintInvoicePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const invoiceId = parseInt(id, 10)
  if (isNaN(invoiceId)) notFound()

  const invoice = getInvoiceById(invoiceId)
  if (!invoice) notFound()

  const { labourItems, partsItems, labourSubtotal, partsSubtotal, labourDiscountAmount, discountPct, subtotal, vatAmount, total } =
    parseItems(invoice)

  const invoiceDate = new Date(invoice.invoice_date || invoice.created_at).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  })

  const businessPhone = process.env.BUSINESS_PHONE || ""
  const businessAddress = process.env.BUSINESS_ADDRESS || ""
  const bizName = getSiteSetting("business_name") || "Jamie's Auto Care"
  const companyNumber = getSiteSetting("company_number") || ""
  const vatNumber = getSiteSetting("vat_number") || ""
  const registeredAddress = getSiteSetting("registered_address") || ""

  return (
    <>
      <style>{`
        * { box-sizing: border-box; }
        .invoice-print-overlay {
          position: fixed;
          inset: 0;
          background: #fff;
          z-index: 99999;
          overflow-y: auto;
          font-family: Arial, Helvetica, sans-serif;
          font-size: 12px;
          color: #1f2937;
          line-height: 1.4;
        }
        .invoice-print-toolbar {
          display: flex;
          gap: 12px;
          align-items: center;
          padding: 10px 32px;
          background: #f3f4f6;
          border-bottom: 1px solid #e5e7eb;
        }
        .invoice-print-toolbar button {
          background: #1e3a5f;
          color: white;
          border: none;
          padding: 7px 18px;
          border-radius: 5px;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }
        .invoice-print-toolbar a {
          color: #4b5563;
          font-size: 13px;
          text-decoration: none;
        }
        .invoice-page {
          max-width: 760px;
          margin: 0 auto;
          padding: 32px 40px;
        }

        /* ── Header ── */
        .inv-header {
          display: table;
          width: 100%;
          margin-bottom: 20px;
          padding-bottom: 14px;
          border-bottom: 2px solid #1e3a5f;
        }
        .inv-header-left {
          display: table-cell;
          vertical-align: middle;
          width: 58%;
        }
        .inv-header-right {
          display: table-cell;
          vertical-align: middle;
          text-align: right;
          width: 42%;
        }
        .brand-name {
          font-size: 20px;
          font-weight: 700;
          color: #1e3a5f;
          margin: 0 0 3px 0;
          line-height: 1.2;
        }
        .brand-sub {
          font-size: 11px;
          color: #6b7280;
          margin: 1px 0;
        }
        .invoice-word {
          font-size: 22px;
          font-weight: 700;
          color: #1e3a5f;
          letter-spacing: 3px;
          margin: 0 0 3px 0;
        }
        .invoice-num {
          font-size: 12px;
          font-weight: 600;
          color: #374151;
          margin: 0 0 2px 0;
        }
        .invoice-dt {
          font-size: 11px;
          color: #6b7280;
          margin: 0;
        }

        /* ── Bill To (two-column) ── */
        .bill-wrap {
          display: table;
          width: 100%;
          margin-bottom: 18px;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
        }
        .bill-left {
          display: table-cell;
          vertical-align: top;
          width: 58%;
          padding: 10px 14px;
          border-right: 1px solid #e5e7eb;
        }
        .bill-right {
          display: table-cell;
          vertical-align: top;
          width: 42%;
          padding: 10px 14px;
        }
        .bill-label {
          font-size: 9px;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #9ca3af;
          margin: 0 0 5px 0;
          font-weight: 600;
        }
        .customer-name {
          font-size: 14px;
          font-weight: 700;
          color: #111827;
          margin: 0 0 4px 0;
        }
        .detail-row {
          display: table;
          width: 100%;
          margin: 2px 0;
        }
        .detail-key {
          display: table-cell;
          font-size: 10px;
          color: #9ca3af;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          width: 52px;
          vertical-align: top;
          padding-top: 1px;
        }
        .detail-val {
          display: table-cell;
          font-size: 11px;
          color: #374151;
          vertical-align: top;
        }

        /* ── Items tables ── */
        .items-section { margin-bottom: 14px; }
        .items-title {
          font-size: 10px;
          font-weight: 700;
          color: #1e3a5f;
          text-transform: uppercase;
          letter-spacing: 0.07em;
          margin: 0 0 5px 0;
        }
        table { width: 100%; border-collapse: collapse; font-size: 11px; }
        thead tr { background: #eef2f7; }
        th {
          padding: 6px 8px;
          text-align: left;
          font-weight: 600;
          color: #374151;
          border-bottom: 1px solid #d1d5db;
          font-size: 10px;
          text-transform: uppercase;
          letter-spacing: 0.04em;
        }
        th.right { text-align: right; }
        th.center { text-align: center; }
        td { padding: 6px 8px; border-bottom: 1px solid #f3f4f6; color: #374151; }
        td.right { text-align: right; }
        td.center { text-align: center; }
        tfoot td {
          padding: 5px 8px;
          font-weight: 600;
          border-bottom: none;
          background: #f9fafb;
          border-top: 1px solid #e5e7eb;
        }

        /* ── Totals + Notes (side by side) ── */
        .bottom-wrap {
          display: table;
          width: 100%;
          margin-bottom: 16px;
        }
        .notes-cell {
          display: table-cell;
          vertical-align: top;
          width: 54%;
          padding-right: 16px;
        }
        .totals-cell {
          display: table-cell;
          vertical-align: top;
          width: 46%;
        }
        .notes-box {
          background: #f9fafb;
          border: 1px solid #e5e7eb;
          border-radius: 4px;
          padding: 10px 12px;
        }
        .notes-title { font-size: 10px; font-weight: 700; color: #374151; text-transform: uppercase; letter-spacing: 0.05em; margin: 0 0 4px 0; }
        .notes-text { font-size: 11px; color: #6b7280; white-space: pre-line; line-height: 1.5; margin: 0; }
        .totals-table { width: 100%; border-collapse: collapse; }
        .totals-table td { padding: 4px 0; border: none; font-size: 11px; color: #4b5563; }
        .totals-table td:last-child { text-align: right; font-weight: 500; color: #1f2937; }
        .totals-table .sep-row td { border-top: 1px solid #e5e7eb; padding-top: 6px; }
        .totals-table .total-row td {
          font-size: 14px;
          font-weight: 700;
          color: #1e3a5f;
          border-top: 2px solid #1e3a5f;
          padding-top: 6px;
        }

        /* ── Footer ── */
        .inv-footer {
          border-top: 1px solid #e5e7eb;
          padding-top: 12px;
          text-align: center;
        }
        .footer-thank { font-size: 12px; font-weight: 600; color: #1e3a5f; margin: 0 0 3px 0; }
        .footer-terms { font-size: 10px; color: #9ca3af; margin: 2px 0; }

        /* Print styles are in globals.css — see .invoice-print-overlay */
      `}</style>

      <div className="invoice-print-overlay">
        {/* Toolbar */}
        <div className="invoice-print-toolbar">
          <PrintButton />
          <a href={`/admin/invoices/${invoice.id}`}>&larr; Back to Invoice</a>
        </div>

        <div className="invoice-page">

          {/* ── Compact Header ── */}
          <div className="inv-header">
            <div className="inv-header-left">
              <p className="brand-name">{bizName}</p>
              {businessPhone && <p className="brand-sub">{businessPhone}</p>}
              {registeredAddress ? <p className="brand-sub">{registeredAddress}</p> : businessAddress && <p className="brand-sub">{businessAddress}</p>}
              {companyNumber && <p className="brand-sub">Company No. {companyNumber}</p>}
              {vatNumber && <p className="brand-sub">VAT No. {vatNumber}</p>}
            </div>
            <div className="inv-header-right">
              <p className="invoice-word">INVOICE</p>
              <p className="invoice-num">{invoice.invoice_number}</p>
              <p className="invoice-dt">{invoiceDate}</p>
            </div>
          </div>

          {/* ── Customer Details (two-column) ── */}
          <div className="bill-wrap">
            <div className="bill-left">
              <p className="bill-label">Bill To</p>
              <p className="customer-name">{invoice.customer_name}</p>
              {invoice.customer_email && (
                <div className="detail-row">
                  <span className="detail-key">Email</span>
                  <span className="detail-val">{invoice.customer_email}</span>
                </div>
              )}
              {invoice.customer_phone && (
                <div className="detail-row">
                  <span className="detail-key">Phone</span>
                  <span className="detail-val">{invoice.customer_phone}</span>
                </div>
              )}
              {invoice.customer_address && (
                <div className="detail-row">
                  <span className="detail-key">Address</span>
                  <span className="detail-val">{invoice.customer_address}</span>
                </div>
              )}
            </div>
            <div className="bill-right">
              <p className="bill-label">Vehicle</p>
              {invoice.vehicle ? (
                <p className="customer-name" style={{ fontSize: "13px" }}>{invoice.vehicle}</p>
              ) : (
                <p style={{ fontSize: "11px", color: "#9ca3af", fontStyle: "italic" }}>Not specified</p>
              )}
            </div>
          </div>

          {/* ── Labour ── */}
          <div className="items-section">
            <p className="items-title">Labour</p>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="center">Hours</th>
                  <th className="right">Rate/hr</th>
                  <th className="right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {labourItems.length === 0 ? (
                  <tr><td colSpan={4} style={{ color: "#9ca3af", fontStyle: "italic" }}>No labour items</td></tr>
                ) : labourItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.description}</td>
                    <td className="center">{item.hours}</td>
                    <td className="right">{fmt(item.rate)}</td>
                    <td className="right">{fmt(item.hours * item.rate)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="right">Labour Subtotal</td>
                  <td className="right">{fmt(labourSubtotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ── Parts ── */}
          <div className="items-section">
            <p className="items-title">Parts &amp; Materials</p>
            <table>
              <thead>
                <tr>
                  <th>Description</th>
                  <th className="center">Qty</th>
                  <th className="right">Unit Price</th>
                  <th className="right">Amount</th>
                </tr>
              </thead>
              <tbody>
                {partsItems.length === 0 ? (
                  <tr><td colSpan={4} style={{ color: "#9ca3af", fontStyle: "italic" }}>No parts items</td></tr>
                ) : partsItems.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.description}</td>
                    <td className="center">{item.qty}</td>
                    <td className="right">{fmt(item.unitPrice)}</td>
                    <td className="right">{fmt(item.qty * item.unitPrice)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan={3} className="right">Parts Subtotal</td>
                  <td className="right">{fmt(partsSubtotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* ── Notes + Totals side by side ── */}
          <div className="bottom-wrap">
            <div className="notes-cell">
              {invoice.notes ? (
                <div className="notes-box">
                  <p className="notes-title">Notes</p>
                  <p className="notes-text">{invoice.notes}</p>
                </div>
              ) : null}
            </div>
            <div className="totals-cell">
              <table className="totals-table">
                <tbody>
                  <tr>
                    <td>Labour Subtotal</td>
                    <td>{fmt(labourSubtotal)}</td>
                  </tr>
                  {discountPct > 0 && (
                    <tr>
                      <td style={{ color: "#d97706" }}>Labour Discount ({discountPct}%)</td>
                      <td style={{ color: "#d97706" }}>−{fmt(labourDiscountAmount)}</td>
                    </tr>
                  )}
                  <tr>
                    <td>Parts Subtotal</td>
                    <td>{fmt(partsSubtotal)}</td>
                  </tr>
                  <tr className="sep-row">
                    <td>Subtotal</td>
                    <td>{fmt(subtotal)}</td>
                  </tr>
                  {invoice.vat_enabled ? (
                    <tr>
                      <td>VAT ({invoice.vat_rate}%)</td>
                      <td>{fmt(vatAmount)}</td>
                    </tr>
                  ) : null}
                  <tr className="total-row">
                    <td>Total</td>
                    <td>{fmt(total)}</td>
                  </tr>
                  {invoice.parts_deposit_paid && invoice.parts_deposit_paid > 0 ? (
                    <>
                      <tr>
                        <td style={{ color: "#16a34a" }}>Parts Deposit Paid</td>
                        <td style={{ color: "#16a34a" }}>−{fmt(invoice.parts_deposit_paid)}</td>
                      </tr>
                      <tr className="total-row">
                        <td>Balance Due</td>
                        <td>{fmt(Math.max(0, total - invoice.parts_deposit_paid))}</td>
                      </tr>
                    </>
                  ) : null}
                </tbody>
              </table>
            </div>
          </div>

          {/* ── Footer ── */}
          <div className="inv-footer">
            <p className="footer-thank">Thank you for your business!</p>
            <p className="footer-terms">Payment is due on the day of service.</p>
            <p className="footer-terms">If payment was made by card on the day, this invoice serves as your receipt.</p>
          </div>

        </div>
      </div>
    </>
  )
}
