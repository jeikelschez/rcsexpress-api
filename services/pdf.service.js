class PdfService {
    
    // generateHeader(doc, t1, st1, st2, date) {
    //     doc.image('./img/logo_rc.png', 50, 45, { width: 50 })
    //     .fillColor('#444444')
    //     .fontSize(18)
    //     .text(t1, 110, 50)
    //     .fontSize(12)
    //     .text(date, 200, 50, { align: 'right' })
    //     .text(st1, 110, 80)
    //     .text(st2, 110, 100)
    //     .moveDown();
    // }

    generateHeader(doc) {
        doc.image('./img/logo_rc.png', 50, 45, { width: 50 })
        .fillColor('#444444')
        .fontSize(13)
        .font('Helvetica-Bold')
        .text('RCS Express, S.A', 110, 89)
        .text('R.I.F. J-31028463-6', 110, 107)
        .fontSize(12)
        .text('Valencia, 17 de Octubre de 2022', 200, 50, { align: 'right' })
        .moveDown();
    }
}

module.exports = PdfService;
