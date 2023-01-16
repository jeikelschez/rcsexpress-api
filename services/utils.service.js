class UtilsService {
  constructor() {}

  async paginate(
    model,
    pageSize,
    pageLimit,
    where = {},
    order = [],
    attributes = {},
    include = []
  ) {
    let options = {};
    const limit = parseInt(pageLimit, 10) || 10;
    const page = parseInt(pageSize, 10) || 1;

    if (pageLimit) {
      options = {
        offset: this.getOffset(page, limit),
        limit: limit,
      };
    }

    if (order && order.length) options['order'] = order;
    if (Object.keys(include).length) options['include'] = include;
    if (Object.keys(attributes).length) options['attributes'] = attributes;
    options['where'] = where;

    // take in the model, take in the options
    let { count, rows } = await model.findAndCountAll(options);

    return {
      previousPage: this.getPreviousPage(page),
      currentPage: page,
      nextPage: this.getNextPage(page, limit, count),
      total: count,
      limit: limit,
      data: rows,
    };
  }

  getOffset(page, limit) {
    return page * limit - limit;
  }

  getNextPage(page, limit, total) {
    if (total / limit > page) return page + 1;
    return null;
  }

  getPreviousPage(page) {
    if (page <= 1) return null;
    return page - 1;
  }

  numeroALetras(n) {
    var num = parseInt(n * 100 + '');

    var centavos = num % 100;
    var numero = parseInt(n + '');

    var respuesta = '';

    if (numero > 999) {
      if ((numero + '').length > 6) {
        var residuo = parseInt(numero + '') % 1000000;
        var x = parseInt(numero / 1000000);

        if (x == 1) {
          respuesta = ' UN MILLON ' + this.numeroALetras(residuo);
        } else {
          respuesta =
            this.numeroALetras(x) + ' MILLONES ' + this.numeroALetras(residuo);
        }
      } else if ((numero + '').length > 3) {
        var residuo = parseInt(numero + '') % 1000;
        var x = parseInt(numero / 1000);

        if (x == 1) {
          respuesta = ' MIL ' + this.numeroALetras(residuo);
        } else {
          respuesta =
            this.numeroALetras(x) + ' MIL ' + this.numeroALetras(residuo);
        }
      }
    } else {
      if (numero == 100) {
        respuesta = 'CIEN';
      } else if (numero > 100) {
        var cen = parseInt(numero / 100);
        var dec = numero % 100;

        respuesta =
          ' ' + this.centenas_nal(cen) + ' ' + this.numeroALetras(dec);
      } else {
        var dec = numero % 100;

        if (dec < 20) {
          respuesta = ' ' + this.unidades_nal(dec);
        } else {
          var unis = dec % 10;
          var ddec = parseInt(dec / 10);

          if (unis != 0) {
            respuesta =
              ' ' + this.decenas_nal(ddec) + ' Y ' + this.unidades_nal(unis);
          } else {
            respuesta = ' ' + this.decenas_nal(ddec);
          }
        }
      }
    }
    return respuesta;
  }

  unidades_nal(n) {
    if (n + '' == '1') {
      return 'UNO';
    }
    if (n + '' == '2') {
      return 'DOS';
    }
    if (n + '' == '3') {
      return 'TRES';
    }
    if (n + '' == '4') {
      return 'CUATRO';
    }
    if (n + '' == '5') {
      return 'CINCO';
    }
    if (n + '' == '6') {
      return 'SEIS';
    }
    if (n + '' == '7') {
      return 'SIETE';
    }
    if (n + '' == '8') {
      return 'OCHO';
    }
    if (n + '' == '9') {
      return 'NUEVE';
    }
    if (n + '' == '10') {
      return 'DIEZ';
    }
    if (n + '' == '11') {
      return 'ONCE';
    }
    if (n + '' == '12') {
      return 'DOCE';
    }
    if (n + '' == '13') {
      return 'TRECE';
    }
    if (n + '' == '14') {
      return 'CATORCE';
    }
    if (n + '' == '15') {
      return 'QUINCE';
    }
    if (n + '' == '16') {
      return 'DIECISEIS';
    }
    if (n + '' == '17') {
      return 'DIECISIETE';
    }
    if (n + '' == '18') {
      return 'DIECIOCHO';
    }
    if (n + '' == '19') {
      return 'DIECINUEVE';
    }
    return '';
  }

  decenas_nal(n) {
    if (n + '' == '1') {
      return 'DIEZ';
    }
    if (n + '' == '2') {
      return 'VEINTE';
    }
    if (n + '' == '3') {
      return 'TREINTA';
    }
    if (n + '' == '4') {
      return 'CUARENTA';
    }
    if (n + '' == '5') {
      return 'CINCUENTA';
    }
    if (n + '' == '6') {
      return 'SESENTA';
    }
    if (n + '' == '7') {
      return 'SETENTA';
    }
    if (n + '' == '8') {
      return 'OCHENTA';
    }
    if (n + '' == '9') {
      return 'NOVENTA';
    }
    return '';
  }

  centenas_nal(n) {
    if (n + '' == '1') {
      return 'CIENTO';
    }
    if (n + '' == '2') {
      return 'DOSCIENTOS';
    }
    if (n + '' == '3') {
      return 'TRESCIENTOS';
    }
    if (n + '' == '4') {
      return 'CUATROCIENTOS';
    }
    if (n + '' == '5') {
      return 'QUINIENTOS';
    }
    if (n + '' == '6') {
      return 'SEISCIENTOS';
    }
    if (n + '' == '7') {
      return 'SETECIENTOS';
    }
    if (n + '' == '8') {
      return 'OCHOCIENTOS';
    }
    if (n + '' == '9') {
      return 'NOVECIENTOS';
    }
    return '';
  }

  numerosAMeses(n) {
    if (n + '' == '1') {
      return 'ENERO';
    }
    if (n + '' == '2') {
      return 'FEBRERO';
    }
    if (n + '' == '3') {
      return 'MARZO';
    }
    if (n + '' == '4') {
      return 'ABRIL';
    }
    if (n + '' == '5') {
      return 'MAYO';
    }
    if (n + '' == '6') {
      return 'JUNIO';
    }
    if (n + '' == '7') {
      return 'JULIO';
    }
    if (n + '' == '8') {
      return 'AGOSTO';
    }
    if (n + '' == '9') {
      return 'SEPTIEMBRE';
    }
    if (n + '' == '11') {
      return 'NOVIEMBRE';
    }
    if (n + '' == '12') {
      return 'DICIEMBRE';
    }
    return '';
  }

  numeroADias(n) {
    if (n + '' == '1') {
      return 'LUNES';
    }
    if (n + '' == '2') {
      return 'MARTES';
    }
    if (n + '' == '3') {
      return 'MIERCOLES';
    }
    if (n + '' == '4') {
      return 'JUEVES';
    }
    if (n + '' == '5') {
      return 'VIERNES';
    }
    if (n + '' == '6') {
      return 'SABADO';
    }
    if (n + '' == '0') {
      return 'DOMINGO';
    }
    return '';
  }

  // Pasar un numero a numero con dos decimales en formato correcto para efectuar operaciones
  parseFloatN(number) {
    number = Math.round(number * 100) / 100;
    return number;
  }

  formatNumber(number) {
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: 'EUR',
      currencyDisplay: 'code',
    })
      .format(number)
      .replace('EUR', '')
      .trim();
  }
}

module.exports = UtilsService;
