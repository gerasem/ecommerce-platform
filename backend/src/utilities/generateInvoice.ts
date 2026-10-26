import PdfPrinter from 'pdfmake'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const fonts = {
  Roboto: {
    normal: path.resolve(__dirname, '../assets/fonts/Roboto-Regular.ttf'),
    bold: path.resolve(__dirname, '../assets/fonts/Roboto-Bold.ttf'),
    italics: path.resolve(__dirname, '../assets/fonts/Roboto-Regular.ttf'),
    bolditalics: path.resolve(__dirname, '../assets/fonts/Roboto-Bold.ttf')
  }
}

const printer = new (PdfPrinter as any)(fonts)

export const generateInvoice = async (order: any): Promise<Buffer> => {
  return new Promise((resolve, reject) => {
    try {
      const items = order.items || []
      const currency = order.currency || 'EUR'

      const docDefinition = {
        content: [
          { text: 'INVOICE', style: 'header' },
          { text: `Order #${order.id}`, style: 'subheader' },
          {
            text: `Date: ${new Date(order.createdAt || order.orderedAt || new Date()).toLocaleDateString('en-GB')}`,
            margin: [0, 0, 0, 20] as [number, number, number, number]
          },

          {
            columns: [
              {
                text: [
                  { text: 'Customer:\n', bold: true },
                  `${order.customerEmail || 'Not specified'}\n`,
                  order.company ? `Company: ${order.company}\n` : '',
                  `Shipping Address: ${order.shippingAddress?.addressLine1 || order.shippingAddress?.city || 'Not specified'}\n`
                ]
              },
              {
                text: [
                  { text: 'Seller:\n', bold: true },
                  `${process.env.NEXT_PUBLIC_SITE_NAME || process.env.SITE_NAME || 'Aura Store'}\n`,
                  `Email: ${process.env.SMTP_FROM_ADDRESS || 'info@aura-store.com'}\n`
                ],
                alignment: 'right'
              }
            ]
          },

          {
            text: '\n\nOrder Details:',
            bold: true,
            margin: [0, 20, 0, 5] as [number, number, number, number]
          },

          {
            table: {
              headerRows: 1,
              widths: ['*', 'auto', 'auto', 'auto'],
              body: [
                [
                  { text: 'Product', bold: true },
                  { text: 'Qty', bold: true },
                  { text: 'Price', bold: true },
                  { text: 'Total', bold: true }
                ],
                ...items.map((item: any) => {
                  const title =
                    typeof item.product === 'object'
                      ? item.product?.title
                      : `Product ${item.product || ''}`
                  const qty = item.quantity || 1
                  const price = item.amount || 0
                  return [
                    title,
                    qty.toString(),
                    `${price.toFixed(2)} ${currency}`,
                    `${(qty * price).toFixed(2)} ${currency}`
                  ]
                }),
                [
                  { text: 'Shipping', colSpan: 3, alignment: 'right', bold: true },
                  {},
                  {},
                  `${(order.shippingCost || 0).toFixed(2)} ${currency}`
                ],
                [
                  { text: 'TOTAL', colSpan: 3, alignment: 'right', bold: true },
                  {},
                  {},
                  {
                    text: `${(order.amount ? order.amount / 100 : (order.subtotal || 0) + (order.shippingCost || 0)).toFixed(2)} ${currency}`,
                    bold: true
                  }
                ]
              ]
            }
          }
        ],
        styles: {
          header: {
            fontSize: 22,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 10] as [number, number, number, number]
          },
          subheader: {
            fontSize: 16,
            bold: true,
            alignment: 'center',
            margin: [0, 0, 0, 5] as [number, number, number, number]
          }
        },
        defaultStyle: {
          font: 'Roboto'
        }
      }

      // @ts-ignore
      const pdfDoc = printer.createPdfKitDocument(docDefinition)

      const chunks: Uint8Array[] = []
      pdfDoc.on('data', (chunk: Uint8Array) => chunks.push(chunk))
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)))
      pdfDoc.on('error', (err: Error) => reject(err))

      pdfDoc.end()
    } catch (error) {
      reject(error)
    }
  })
}
