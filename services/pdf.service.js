class PdfService {
    
    generateHeader(doc) {
        doc.image('./img/logo_rc.png', 50, 45, { width: 50 })
        .fillColor('#444444')
        .fontSize(12)
        .text('Reporte de Guias Disponibles', 110, 57)
        .text('Reporte de Guias Disponibles', 110, 77)
        .fontSize(10)
        .text('19/10/2022', 200, 65, { align: 'right' })
        .moveDown();
    }
      
    generateFooter(doc) {
        doc.fontSize(
            10,
        ).text(
            'Payment is due within 15 days. Thank you for your business.',
            50,
            780,
            { align: 'center', width: 500 },
        );
    }
}

module.exports = PdfService;
