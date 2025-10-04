const axios = require('axios');
const cheerio = require('cheerio');

class TestScriptService {
  constructor() {}

    // Función principal para buscar por número de documento
    async searchByDocumentNumber(documentNumber) {
        if (!documentNumber) {
            throw new Error('Por favor, ingresa un número de documento.');
        }

        const url = 'https://search.sunbiz.org/Inquiry/CorporationSearch/ByDocumentNumber';
        const formData = new URLSearchParams();
        formData.append('SearchTerm', documentNumber);
        formData.append('InquiryType', 'DocumentNumber');

        try {
            const response = await axios.post(url, formData, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Referer': 'https://search.sunbiz.org/Inquiry/CorporationSearch/ByDocumentNumber'
                }
            });

            const htmlText = response.data;
            const $ = cheerio.load(htmlText);

            // Tipo de entidad y nombre
            const entityType = $('.corporationName p').eq(0).text().trim() || 'No encontrado';
            const companyName = $('.corporationName p').eq(1).text().trim() || 'No encontrado';

            // Información de registro
            let documentNumber = 'No encontrado';
            let feiEinNumber = 'No encontrado';
            let fileDate = 'No encontrado';
            let effectiveDate = 'No encontrado';
            let entityState = 'No encontrado';
            let companyStatus = 'No encontrado';
            $('.filingInformation label').each(function() {
                const label = $(this).text().trim();
                const value = $(this).next('span').text().trim();
                if (label === 'Document Number') documentNumber = value;
                if (label === 'FEI/EIN Number') feiEinNumber = value;
                if (label === 'Date Filed') fileDate = value;
                if (label === 'Effective Date') effectiveDate = value;
                if (label === 'State') entityState = value;
                if (label === 'Status') companyStatus = value;
            });

            // Dirección principal
            let principalAddress = 'No encontrado';
            // Dirección de envío
            let mailingAddress = 'No encontrado';
            // Agente registrado
            let registeredAgent = 'No encontrado';
            let registeredAgentAddress = 'No encontrado';
            // Personas autorizadas
            let authorizedPersons = [];
            // Reportes anuales
            let annualReports = [];

            $('.detailSection').each(function() {
                const sectionTitle = $(this).find('span').first().text().trim();
                if (sectionTitle === 'Principal Address') {
                    principalAddress = $(this).find('div').first().text().replace(/\n|\r/g, '').replace(/\s+/g, ' ').trim() || 'No encontrado';
                }
                if (sectionTitle === 'Mailing Address') {
                    mailingAddress = $(this).find('div').first().text().replace(/\n|\r/g, '').replace(/\s+/g, ' ').trim() || 'No encontrado';
                }
                if (sectionTitle === 'Registered Agent Name & Address') {
                    registeredAgent = $(this).find('span').eq(1).text().trim() || 'No encontrado';
                    registeredAgentAddress = $(this).find('div').first().text().replace(/\n|\r/g, '').replace(/\s+/g, ' ').trim() || 'No encontrado';
                }
                if (sectionTitle === 'Authorized Person(s) Detail') {
                    // Buscar nombres y direcciones
                    $(this).find('span').each(function() {
                        const personTitle = $(this).text().trim();
                        if (personTitle.startsWith('Title')) {
                            // El nombre está después del título
                            const next = $(this).parent().contents().filter(function() {
                                return this.nodeType === 3 && this.nodeValue.trim() !== '';
                            });
                            const name = next.text().trim();
                            const address = $(this).parent().find('div').first().text().replace(/\n|\r/g, '').replace(/\s+/g, ' ').trim();
                            authorizedPersons.push({ title: personTitle, name, address });
                        }
                    });
                }
                if (sectionTitle === 'Annual Reports') {
                    $(this).find('table tr').each(function(i) {
                        if (i === 0) return; // Saltar encabezado
                        const year = $(this).find('td').eq(0).text().trim();
                        const filedDate = $(this).find('td').eq(1).text().trim();
                        if (year && filedDate) annualReports.push({ year, filedDate });
                    });
                }
            });

            return {
                entityType,
                companyName,
                documentNumber,
                feiEinNumber,
                fileDate,
                effectiveDate,
                entityState,
                companyStatus,
                principalAddress,
                mailingAddress,
                registeredAgent,
                registeredAgentAddress,
                authorizedPersons,
                annualReports
            };
        } catch (error) {
            throw new Error('No se pudo obtener la información. ' + error.message);
        }
    }
}

module.exports = TestScriptService;