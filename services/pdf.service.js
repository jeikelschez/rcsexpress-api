class PdfService {
    
    generateHeader(doc) {
        doc.image('./img/logo_rc.png', 50, 45, { width: 50 })
        .fillColor('#444444')
        .fontSize(18)
        .text('Reporte de Guias Disponibles', 110, 50)
        .fontSize(12)
        .text('14/11/2022', 200, 50, { align: 'right' })
        .text('Guias Desde: 34234234234', 110, 80)
        .text('Guias Hasta: 234234234234', 270, 80)
        .text('Asignada a:  Agencia - VALENCIA, RCS EXPRESS, S.A', 110, 100)
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
