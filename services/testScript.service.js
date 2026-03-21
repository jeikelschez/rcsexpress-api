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
                },
                timeout: 20000,
                validateStatus: () => true
            });

            let htmlText = response.data;

            if (response.status === 403) {
                htmlText = await this.fetchByDocumentNumberWithPlaywright(documentNumber);
                if (!htmlText) {
                    throw new Error('Sunbiz bloqueó la solicitud (HTTP 403). Activa el fallback con navegador instalando Playwright: npm i playwright ; npx playwright install chromium.');
                }
            }

            if (response.status < 200 || response.status >= 300) {
                if (response.status === 403 && htmlText) {
                    // Respuesta obtenida por fallback de navegador.
                } else {
                throw new Error(`Sunbiz respondió con estado HTTP ${response.status}.`);
                }
            }

            const $ = cheerio.load(htmlText);

            // Tipo de entidad y nombre
            const entityType = $('.corporationName p').eq(0).text().trim() || 'No encontrado';
            const companyName = $('.corporationName p').eq(1).text().trim() || 'No encontrado';

            // Información de registro
            let parsedDocumentNumber = 'No encontrado';
            let feiEinNumber = 'No encontrado';
            let fileDate = 'No encontrado';
            let effectiveDate = 'No encontrado';
            let entityState = 'No encontrado';
            let companyStatus = 'No encontrado';
            $('.filingInformation label').each(function() {
                const label = $(this).text().trim();
                const value = $(this).next('span').text().trim();
                if (label === 'Document Number') parsedDocumentNumber = value;
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
            // General Partner Detail
            let generalPartnerDetail = [];

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
                if (sectionTitle === 'General Partner Detail') {
                    let generalPartner = {
                        document: '',
                        name: '',
                        address: ''
                    };
                    // Document
                    generalPartner.document = $(this).find('span').filter(function() {
                        return $(this).text().trim().startsWith('Document Number');
                    }).text().replace('Document Number', '').trim();
                    // Name
                    let html = $(this).html();
                    let nameMatch = html.match(/<br\/>\s*([A-Z0-9\.\s,]+)\s*<span>/i);
                    generalPartner.name = nameMatch ? nameMatch[1].trim() : '';
                    // Address
                    generalPartner.address = $(this).find('div').first().text().replace(/\n|\r/g, '').replace(/\s+/g, ' ').trim();
                    generalPartnerDetail.push(generalPartner);
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
                documentNumber: parsedDocumentNumber,
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
                annualReports,
                generalPartnerDetail
            };
        } catch (error) {
            throw new Error(`No se pudo obtener la información desde Sunbiz. ${error.message}`);
        }
    }

    async fetchByDocumentNumberWithPlaywright(documentNumber) {
        let playwright;
        try {
            playwright = require('playwright');
        } catch (error) {
            return null;
        }

        let browser;
        try {
            browser = await playwright.chromium.launch({ headless: true });
            const context = await browser.newContext({
                userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36'
            });
            const page = await context.newPage();
            await page.goto('https://search.sunbiz.org/Inquiry/CorporationSearch/ByDocumentNumber', {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });

            const searchSelectors = [
                'input[name="SearchTerm"]',
                'input#SearchTerm',
                'input[name="searchTerm"]'
            ];

            let inputSelector = null;
            for (const selector of searchSelectors) {
                const count = await page.locator(selector).count();
                if (count > 0) {
                    inputSelector = selector;
                    break;
                }
            }

            if (!inputSelector) {
                return null;
            }

            await page.fill(inputSelector, documentNumber);

            const submitSelectors = [
                'button[type="submit"]',
                'input[type="submit"]',
                'button#search-btn'
            ];

            let submitted = false;
            for (const selector of submitSelectors) {
                const count = await page.locator(selector).count();
                if (count > 0) {
                    await Promise.all([
                        page.waitForLoadState('domcontentloaded', { timeout: 30000 }),
                        page.click(selector)
                    ]);
                    submitted = true;
                    break;
                }
            }

            if (!submitted) {
                await page.keyboard.press('Enter');
                await page.waitForLoadState('domcontentloaded', { timeout: 30000 });
            }

            await page.waitForTimeout(1500);
            return await page.content();
        } catch (error) {
            return null;
        } finally {
            if (browser) {
                await browser.close();
            }
        }
    }
}

module.exports = TestScriptService;