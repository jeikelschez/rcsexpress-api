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
        case '2':
        doc.image('./img/logo_rc.png', 35, 42, { width: 80 });
        doc.font('Helvetica-Bold');
        doc.fillColor('#444444');
        doc.fontSize(18);
        doc.y = 90;
        doc.x = 205;
        doc.text('Costos de Transporte Diario', {
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
        doc.text('Fecha', 35, 185);
        doc.text('Transporte', 85, 185);
        doc.text('Nro. Fact', 160, 185);
        doc.text('Costos (Bs.)', 210, 185);
        doc.text('Vehiculo', 275, 185);
        doc.text('Origen', 320, 185);
        doc.text('Dest.', 360, 185);
        doc.text('Ventas (Bs.)', 390, 185);
        doc.text('Utilidad (Bs.)', 445, 185);
        doc.text('% Costo', 505, 185);
        doc.text('% Utilidad', 545, 185);
        break; 
        case '3':
          doc.image('./img/logo_rc.png', 35, 42, { width: 70 });
          doc.font('Helvetica-Bold');
          doc.fillColor('#444444');
          doc.fontSize(18);
          doc.y = 100;
          doc.x = 190;
          doc.text('Resumen de Costos de Transporte', {
            align: 'left',
            columns: 1,
            width: 300,
          });
          doc.fontSize(12);
          doc.y = 130;
          doc.x = 215;
          doc.text('Desde: 01/01/2022', {
            align: 'left',
            columns: 1,
            width: 300,
          });
          doc.y = 130;
          doc.x = 330;
          doc.text('Hasta: 01/01/2022', {
            align: 'left',
            columns: 1,
            width: 300,
          });
          doc.lineJoin('miter').rect(35, 160, 530, 50).stroke();
          doc.fontSize(10);
          doc.text('Flete O Viatico sin IVA (Bs.)', 50, 172);
          doc.text('Ventas sin IVA (Bs.)', 190, 172);
          doc.text('Utilidad Operativa (Bs.)', 295, 172);
          doc.text('% Costo', 425, 172);
          doc.text('% Utilidad', 490, 172);
          doc.text('Distribución del Costo de Transporte Segun Destino', 35, 223);
          doc.fontSize(8);
          doc.text('Fecha: ' + moment().format('DD/MM/YYYY'), 480, 35);
          doc.y = 190;
          doc.x = 60;
          doc.text('Prueba', {
            align: 'center',
            columns: 1,
            width: 100,
          });
          doc.y = 190;
          doc.x = 185;
          doc.text('Prueba', {
            align: 'center',
            columns: 1,
            width: 100,
          });
          doc.y = 190;
          doc.x = 300;
          doc.text('Prueba', {
            align: 'center',
            columns: 1,
            width: 100,
          });
          doc.y = 190;
          doc.x = 425;
          doc.text('Prueba', {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = 190;
          doc.x = 495;
          doc.text('Prueba', {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.fontSize(9);
          doc.text('Destino', 40, 245);
          doc.text('Cant. Guías', 90, 245);
          doc.text('Nro. Piezas', 150, 245);
          doc.text('Kgs', 212, 245);
          doc.text('Ventas sin IVA', 245, 245);
          doc.text('% Costo p/Dest.', 325, 245);
          doc.text('Costo Distrib.p/Dest. (Bs.)', 410, 245);
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
      break;
      case '2':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 210;
        for (var item = 0; item < 10; item++) {
          doc.fontSize(8);
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 35;
          doc.text(
            '12/10/2022',
            {
              align: 'left',
              columns: 1,
              width: 50,
            }
          );
          doc.y = ymin + i;
          doc.x = 85;
          doc.text('PRUEBAAAAAA', {
            align: 'left',
            columns: 1,
            width: 65,
          });
          doc.y = ymin + i;
          doc.x = 160;
          doc.text('PRUEBA', {
            align: 'left',
            columns: 1,
            width: 45,
          });
          doc.y = ymin + i;
          doc.x = 210;
          doc.text('PRUEBA', {
            align: 'right',
            columns: 1,
            width: 55,
          });
          doc.y = ymin + i;
          doc.x = 270;
          doc.text('PRUEBA', {
            align: 'right',
            columns: 1,
            width: 40,
          });
          doc.y = ymin + i;
          doc.x = 320;
          doc.text('PRUEBA', {
            align: 'left',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 360;
          doc.text('PRUEBA', {
            align: 'left',
            columns: 1,
            width: 30,
          });
          doc.y = ymin + i;
          doc.x = 390;
          doc.text('PRUEBA', {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 445;
          doc.text('PRUEBA', {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 510;
          doc.text('PRUEBA', {
            align: 'right',
            columns: 1,
            width: 35,
          });
          doc.y = ymin + i;
          doc.x = 555;
          doc.text('PRUEBA', {
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
        doc.x = 30;
        doc.text('TOTALES:', {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 210;
        doc.text('PRUEBA', {
          align: 'right',
          columns: 1,
          width: 55,
        });
        doc.y = ymin + i + 5;
        doc.x = 390;
        doc.text('PRUEBA', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 5;
        doc.x = 445;
        doc.text('PRUEBA', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.text('NOTA: Los montos expresados son sin IVA.', 35, ymin + i + 25);
      break;
      case '3':
        var i = 0;
        var page = 0;
        var ymin;
        ymin = 270;
        for (var item = 0; item < 10; item++) {
          doc.fontSize(9);
          doc.fillColor('#444444');
          doc.y = ymin + i;
          doc.x = 40;
          doc.text('123',
            {
              align: 'center',
              columns: 1,
              width: 35,
            }
          );
          doc.y = ymin + i;
          doc.x = 90;
          doc.text('1231311231', {
            align: 'center',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 145;
          doc.text('123131122', {
            align: 'right',
            columns: 1,
            width: 50,
          });
          doc.y = ymin + i;
          doc.x = 200;
          doc.text('12313',
            {
              align: 'center',
              columns: 1,
              width: 40,
            }
          );
          doc.y = ymin + i;
          doc.x = 255;
          doc.text('123131123',
            {
              align: 'right',
              columns: 1,
              width: 50,
            }
          );
          doc.y = ymin + i;
          doc.x = 310;
          doc.text('123131123', {
            align: 'right',
            columns: 1,
            width: 80,
          });
          doc.y = ymin + i;
          doc.x = 405;
          doc.text('12313112', {
            align: 'right',
            columns: 1,
            width: 110,
          });
          i += 15;
          if (i >= 440 || item >= 100) {
            doc.addPage();
            page = page + 1;
            doc.switchToPage(page);
            i = 0;
            await this.generateHeader(doc, data);
          }
        }
        doc.fillColor('#BLACK');
        doc.y = ymin + i + 15;
        doc.x = 35;
        doc.text('TOTAL GENERAL:', {
          align: 'left',
          columns: 1,
          width: 50,
        });doc.y = ymin + i + 15;
        doc.x = 90;
        doc.text('123123', {
          align: 'center',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 15;
        doc.x = 145;
        doc.text('1231', {
          align: 'right',
          columns: 1,
          width: 50,
        });
        doc.y = ymin + i + 15;
        doc.x = 200;
        doc.text('12312',
          {
            align: 'right',
            columns: 1,
            width: 40,
          }
        );
        doc.y = ymin + i + 15;
        doc.x = 240;
        doc.text('1233112',
          {
            align: 'right',
            columns: 1,
            width: 65,
          }
        );
        doc.y = ymin + i + 15;
        doc.x = 310;
        doc.text('123133', {
          align: 'right',
          columns: 1,
          width: 80,
        });
        doc.y = ymin + i + 15;
        doc.x = 405;
        doc.text('123131', {
          align: 'right',
          columns: 1,
          width: 110,
        });
      break;
    }
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
      doc.x = 446;
      doc.y = 50;
      doc.text(`Pagina ${i + 1} de ${range.count}`, {
        align: 'right',
        columns: 1,
        width: 100,
      });
    }
  }
}

module.exports = registroCostosService;
