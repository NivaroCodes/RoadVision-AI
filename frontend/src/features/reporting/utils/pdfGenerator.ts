interface GeneratePdfOptions { element: HTMLElement; filename: string }

export async function generatePdf({ element, filename }: GeneratePdfOptions) {
  const [{ default: html2canvas }, { jsPDF }] = await Promise.all([import('html2canvas'), import('jspdf')])
  const canvas = await html2canvas(element, { backgroundColor: '#ffffff', scale: 2, useCORS: true, logging: false })
  const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
  const pageWidth = pdf.internal.pageSize.getWidth()
  const pageHeight = pdf.internal.pageSize.getHeight()
  const imageHeight = (canvas.height * pageWidth) / canvas.width
  const imageData = canvas.toDataURL('image/jpeg', 0.94)
  let offset = 0
  let remaining = imageHeight
  pdf.addImage(imageData, 'JPEG', 0, offset, pageWidth, imageHeight)
  while (remaining > pageHeight) {
    remaining -= pageHeight
    offset -= pageHeight
    pdf.addPage()
    pdf.addImage(imageData, 'JPEG', 0, offset, pageWidth, imageHeight)
  }
  pdf.save(filename)
}
