const moment = require('moment');
const { models, Sequelize } = require('../../libs/sequelize');

const UtilsService = require('../utils.service');
const utils = new UtilsService();

class registroCostosService {
  async generateHeader(doc, tipo, data) {
    switch (tipo) {
      case 'RCT':
        doc.image('./img/logo_rc.png', 35, 42, { width: 80 });
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(18);
        doc.y = 90;
        doc.x = 180;
        doc.text('Resumen de Costos de Transporte', {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.fontSize(12);
        doc.y = 130;
        doc.x = 210;
        doc.text('Desde: ' + data.fecha_desde, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.y = 130;
        doc.x = 330;
        doc.text('Hasta: ' + data.fecha_hasta, {
          align: 'left',
          columns: 1,
          width: 300,
        });
        doc.fontSize(9);
        doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 480, 35);
        doc.text('Fecha Envió', 35, 185);
        doc.text('Transp. Exter. (Bs.)', 92, 185);
        doc.text('Viáticos (Bs.)', 177, 185);
        doc.text('Total Costos (Bs.)', 238, 185);
        doc.text('Ingresos (Bs.)', 319, 185);
        doc.text('Utilidad Oper. (Bs.)', 385, 185);
        doc.text('% Costo', 485, 185);
        doc.text('% Utilidad', 540, 185);
        break;
      default:
        doc.image('./img/logo_rc.png', 155, 170, { width: 300 });
        break;
    }
  }

  async generateCustomerInformation(doc, tipo, data) {
    let totalVenta = 0;
    let totalCosto = 0;
    let totalExterno = 0;
    let totalInterno = 0;
    switch (tipo) {
      case 'RCT':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 210;
        for (var item = 0; item < data.detallesg.length; item++) {
          doc.fontSize(8);
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 35;
          doc.text(
            moment(data.detallesg[item].fecha_envio).format('DD/MM/YYYY'),
            {
              align: 'center',
              columns: 1,
              width: 50,
            }
          );
          doc.y = ymin + i;
          doc.x = 100;
          doc.text(utils.formatNumber(data.detallesg[item].total_externo), {
            align: 'right',
            columns: 1,
            width: 70,
          });
          doc.y = ymin + i;
          doc.x = 180;
          doc.text(utils.formatNumber(data.detallesg[item].total_interno), {
            align: 'right',
            columns: 1,
            width: 50,
          });

          let porcCosto = 0;
          let porcUtilidad = 0;
          let montoVenta =
            data.detallesg[item]['detallesg.movimientos.total_monto'];
          let montoCosto = data.detallesg[item].total_costo;
          let utilidadBs =
            utils.parseFloatN(montoVenta) - utils.parseFloatN(montoCosto);
          if (montoVenta > 0) {
            porcCosto = (montoCosto / montoVenta) * 100;
            porcUtilidad = ((montoVenta - montoCosto) / montoVenta) * 100;
          }

          totalVenta += utils.parseFloatN(montoVenta);
          totalCosto += utils.parseFloatN(montoCosto);
          totalInterno += utils.parseFloatN(data.detallesg[item].total_interno);
          totalExterno += utils.parseFloatN(data.detallesg[item].total_externo);

          doc.y = ymin + i;
          doc.x = 240;
          doc.text(utils.formatNumber(montoCosto), {
            align: 'right',
            columns: 1,
            width: 70,
          });
          doc.y = ymin + i;
          doc.x = 325;
          doc.text(utils.formatNumber(montoVenta), {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 390;
          doc.text(utils.formatNumber(utilidadBs), {
            align: 'right',
            columns: 1,
            width: 70,
          });
          doc.y = ymin + i;
          doc.x = 485;
          doc.text(utils.formatNumber(porcCosto) + '%', {
            align: 'right',
            columns: 1,
            width: 35,
          });
          doc.y = ymin + i;
          doc.x = 545;
          doc.text(utils.formatNumber(porcUtilidad) + '%', {
            align: 'right',
            columns: 1,
            width: 35,
          });
          i += 20;
          if (i >= 480) {
            doc.fillColor('#BLACK');
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc);
          }
        }
        doc.fillColor('#BLACK');
        doc.y = ymin + i + 5;
        doc.x = 35;
        doc.text('TOTALES:', {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 100;
        doc.text(utils.formatNumber(totalExterno), {
          align: 'right',
          columns: 1,
          width: 70,
        });
        doc.y = ymin + i + 5;
        doc.x = 180;
        doc.text(utils.formatNumber(totalInterno), {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 240;
        doc.text(utils.formatNumber(totalCosto), {
          align: 'right',
          columns: 1,
          width: 70,
        });
        doc.y = ymin + i + 5;
        doc.x = 325;
        doc.text(utils.formatNumber(totalVenta), {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 390;
        doc.text(utils.formatNumber(totalVenta - totalCosto), {
          align: 'right',
          columns: 1,
          width: 70,
        });

        let totalPorcCosto = 0;
        let totalPorcUtilidad = 0;
        if (totalVenta > 0) {
          totalPorcCosto = (totalCosto / totalVenta) * 100;
          totalPorcUtilidad = ((totalVenta - totalCosto) / totalVenta) * 100;
        }

        doc.y = ymin + i + 5;
        doc.x = 485;
        doc.text(utils.formatNumber(totalPorcCosto) + '%', {
          align: 'right',
          columns: 1,
          width: 35,
        });
        doc.y = ymin + i + 5;
        doc.x = 545;
        doc.text(utils.formatNumber(totalPorcUtilidad) + '%', {
          align: 'right',
          columns: 1,
          width: 35,
        });
        var end;
        const range = doc.bufferedPageRange();
        for (
          i = range.start, end = range.start + range.count, range.start <= end;
          i < end;
          i++
        ) {
          doc.switchToPage(i);
          doc.fontSize(8);
          doc.fillColor('#444444');
          doc.x = 455;
          doc.y = 50;
          doc.text(`Pagina ${i + 1} de ${range.count}`, {
            align: 'right',
            columns: 1,
            width: 100,
          });
        }
      default:
        break;
    }
  }
}

module.exports = registroCostosService;
