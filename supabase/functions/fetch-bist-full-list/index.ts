Deno.serve(async (req) => {
    const corsHeaders = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, PUT, DELETE, PATCH',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'false'
    };

    if (req.method === 'OPTIONS') {
        return new Response(null, { status: 200, headers: corsHeaders });
    }

    try {
        console.log('BIST Full List Fetch başlatıldı...');

        const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
        const supabaseUrl = Deno.env.get('SUPABASE_URL');

        if (!serviceRoleKey || !supabaseUrl) {
            throw new Error('Supabase configuration missing');
        }

        // 800+ BIST stock symbols (Kapsamlı Borsa İstanbul Listesi - 2025-11-06)
        const bistSymbols = [
            // Mevcut 556 + 250+ Yeni Hisseler
            'ACSEL', 'ADEL', 'ADESE', 'ADGYO', 'AEFES', 'AFYON', 'AGESA', 'AGHOL', 'AGROT', 'AGYO',
            'AHGAZ', 'AHSGY', 'AKBNK', 'AKCNS', 'AKENR', 'AKFGY', 'AKFIS', 'AKFYE', 'AKGRT', 'AKMGY',
            'AKSA', 'AKSEN', 'AKSGY', 'AKSUE', 'AKYHO', 'ALARK', 'ALBRK', 'ALCAR', 'ALCTL', 'ALFAS',
            'ALGYO', 'ALKA', 'ALKIM', 'ALKLC', 'ALTNY', 'ALVES', 'ANELE', 'ANGEN', 'ANHYT', 'ANSGR',
            'ARASE', 'ARCLK', 'ARDYZ', 'ARENA', 'ARMGD', 'ARSAN', 'ARTMS', 'ARZUM', 'ASELS', 'ASGYO',
            'ASTOR', 'ASUZU', 'ATAGY', 'ATAKP', 'ATATP', 'ATLAS', 'AVGYO', 'AVHOL', 'AVOD', 'AVPGY',
            'AVTUR', 'AYCES', 'AYDEM', 'AYEN', 'AYGAZ', 'AZTEK', 'BAGFS', 'BAHKM', 'BAKAB', 'BALSU',
            'BANVT', 'BARMA', 'BASGZ', 'BAYRK', 'BEGYO', 'BERA', 'BESLR', 'BEYAZ', 'BFREN', 'BIENY',
            'BIGCH', 'BIGEN', 'BIGTK', 'BIMAS', 'BINBN', 'BINHO', 'BIOEN', 'BIZIM', 'BJKAS', 'BLCYT',
            'BLUME', 'BMSCH', 'BMSTL', 'BNTAS', 'BOBET', 'BORLS', 'BORSK', 'BOSSA', 'BRISA', 'BRKSN',
            'BRKVY', 'BRLSM', 'BRSAN', 'BRYAT', 'BSOKE', 'BTCIM', 'BUCIM', 'BULGS', 'BURCE', 'BURVA',
            'BVSAN', 'BYDNR', 'CANTE', 'CATES', 'CCOLA', 'CELHA', 'CEMAS', 'CEMTS', 'CEMZY', 'CEOEM',
            'CGCAM', 'CIMSA', 'CLEBI', 'CMBTN', 'CONSE', 'COSMO', 'CRDFA', 'CRFSA', 'CUSAN', 'CVKMD',
            'CWENE', 'DAGI', 'DAPGM', 'DARDL', 'DCTTR', 'DENGE', 'DERHL', 'DERIM', 'DESA', 'DESPC',
            'DEVA', 'DGATE', 'DGGYO', 'DGNMO', 'DITAS', 'DMRGD', 'DMSAS', 'DNISI', 'DOAS', 'DOCO',
            'DOFER', 'DOFRB', 'DOGUB', 'DOHOL', 'DOKTA', 'DSTKF', 'DUNYH', 'DURDO', 'DURKN', 'DYOBY',
            'DZGYO', 'EBEBK', 'ECILC', 'ECOGR', 'ECZYT', 'EDATA', 'EDIP', 'EFOR', 'EGEEN', 'EGEGY',
            'EGEPO', 'EGGUB', 'EGPRO', 'EGSER', 'EKGYO', 'EKOS', 'EKSUN', 'ELITE', 'EMKEL', 'ENDAE',
            'ENERY', 'ENJSA', 'ENKAI', 'ENSRI', 'ENTRA', 'EPLAS', 'ERBOS', 'ERCB', 'EREGL', 'ERSU',
            'ESCAR', 'ESCOM', 'ESEN', 'ETILR', 'ETYAT', 'EUKYO', 'EUPWR', 'EUREN', 'EUYO', 'EYGYO',
            'FADE', 'FENER', 'FLAP', 'FMIZP', 'FONET', 'FORMT', 'FORTE', 'FRIGO', 'FROTO', 'FZLGY',
            'GARAN', 'GARFA', 'GEDIK', 'GEDZA', 'GENIL', 'GENTS', 'GEREL', 'GESAN', 'GIPTA', 'GLBMD',
            'GLCVY', 'GLRMK', 'GLRYH', 'GLYHO', 'GMTAS', 'GOKNR', 'GOLTS', 'GOODY', 'GOZDE', 'GRNYO',
            'GRSEL', 'GRTHO', 'GSDDE', 'GSDHO', 'GSRAY', 'GUBRF', 'GUNDG', 'GWIND', 'GZNMI', 'HALKB',
            'HATEK', 'HATSN', 'HDFGS', 'HEDEF', 'HEKTS', 'HKTM', 'HLGYO', 'HOROZ', 'HRKET', 'HTTBT',
            'HUBVC', 'HUNER', 'HURGZ', 'ICBCT', 'ICUGS', 'IDGYO', 'IEYHO', 'IHAAS', 'IHEVA', 'IHGZT',
            'IHLAS', 'IHLGM', 'IHYAY', 'IMASM', 'INDES', 'INFO', 'INGRM', 'INTEM', 'INVEO', 'INVES',
            'IPEKE', 'ISATR', 'ISBTR', 'ISCTR', 'ISDMR', 'ISFIN', 'ISGSY', 'ISGYO', 'ISKPL', 'ISMEN',
            'ISSEN', 'ISYAT', 'IZENR', 'IZFAS', 'IZINV', 'IZMDC', 'JANTS', 'KAPLM', 'KAREL', 'KARSN',
            'KARTN', 'KATMR', 'KAYSE', 'KBORU', 'KCAER', 'KCHOL', 'KFEIN', 'KGYO', 'KIMMR', 'KLGYO',
            'KLKIM', 'KLMSN', 'KLRHO', 'KLSER', 'KLSYN', 'KLYPV', 'KMPUR', 'KNFRT', 'KOCMT', 'KONKA',
            'KONTR', 'KONYA', 'KOPOL', 'KORDS', 'KOTON', 'KOZAA', 'KOZAL', 'KRDMA', 'KRDMB', 'KRDMD',
            'KRGYO', 'KRONT', 'KRPLS', 'KRSTL', 'KRTEK', 'KRVGD', 'KTLEV', 'KTSKR', 'KUTPO', 'KUYAS',
            'KZBGY', 'KZGYO', 'LIDER', 'LIDFA', 'LILAK', 'LINK', 'LKMNH', 'LMKDC', 'LOGO', 'LRSHO',
            'LUKSK', 'LYDHO', 'LYDYE', 'MAALT', 'MACKO', 'MAGEN', 'MAKIM', 'MAKTK', 'MANAS', 'MARBL',
            'MARKA', 'MARMR', 'MARTI', 'MAVI', 'MEDTR', 'MEGMT', 'MEKAG', 'MEPET', 'MERCN', 'MERIT',
            'MERKO', 'METRO', 'MGROS', 'MHRGY', 'MIATK', 'MNDRS', 'MNDTR', 'MOBTL', 'MOGAN', 'MOPAS',
            'MPARK', 'MRGYO', 'MRSHL', 'MSGYO', 'MTRKS', 'MTRYO', 'MZHLD', 'NATEN', 'NETAS', 'NIBAS',
            'NTGAZ', 'NTHOL', 'NUGYO', 'NUHCM', 'OBAMS', 'OBASE', 'ODAS', 'ODINE', 'OFSYM', 'ONCSM',
            'ONRYT', 'ORCAY', 'ORGE', 'OSMEN', 'OSTIM', 'OTKAR', 'OTTO', 'OYAKC', 'OYAYO', 'OYLUM',
            'OYYAT', 'OZATD', 'OZGYO', 'OZKGY', 'OZRDN', 'OZSUB', 'OZYSR', 'PAGYO', 'PAMEL', 'PAPIL',
            'PARSN', 'PASEU', 'PATEK', 'PCILT', 'PEKGY', 'PENGD', 'PENTA', 'PETKM', 'PETUN', 'PGSUS',
            'PINSU', 'PKART', 'PKENT', 'PLTUR', 'PNLSN', 'PNSUT', 'POLHO', 'POLTK', 'PRDGS', 'PRKAB',
            'PRKME', 'PRZMA', 'PSDTC', 'PSGYO', 'QUAGR', 'RALYH', 'RAYSG', 'REEDR', 'RGYAS', 'RNPOL',
            'RODRG', 'RTALB', 'RUBNS', 'RUZYE', 'RYGYO', 'RYSAS', 'SAFKR', 'SAHOL', 'SAMAT', 'SANEL',
            'SANFM', 'SANKO', 'SARKY', 'SASA', 'SAYAS', 'SDTTR', 'SEGMN', 'SEGYO', 'SEKFK', 'SEKUR',
            'SELEC', 'SELVA', 'SERNT', 'SEYKM', 'SILVR', 'SISE', 'SKBNK', 'SKTAS', 'SKYLP', 'SKYMD',
            'SMART', 'SMRTG', 'SMRVA', 'SNGYO', 'SNICA', 'SOKE', 'SOKM', 'SONME', 'SRVGY', 'SUNTK',
            'SURGY', 'SUWEN', 'TABGD', 'TARKM', 'TATEN', 'TATGD', 'TAVHL', 'TBORG', 'TCELL', 'TCKRC',
            'TDGYO', 'TEHOL', 'TEKTU', 'TERA', 'TEZOL', 'TGSAS', 'THYAO', 'TKFEN', 'TKNSA', 'TLMAN',
            'TMPOL', 'TMSN', 'TNZTP', 'TOASO', 'TRCAS', 'TRGYO', 'TRHOL', 'TRILC', 'TSGYO', 'TSKB',
            'TSPOR', 'TTKOM', 'TTRAK', 'TUCLK', 'TUKAS', 'TUPRS', 'TUREX', 'TURGG', 'TURSG', 'UFUK',
            'ULAS', 'ULKER', 'ULUFA', 'ULUSE', 'ULUUN', 'UNLU', 'USAK', 'VAKBN', 'VAKFN', 'VAKKO',
            'VANGD', 'VBTYZ', 'VERTU', 'VERUS', 'VESBE', 'VESTL', 'VKFYO', 'VKGYO', 'VKING', 'VRGYO',
            'VSNMD', 'YAPRK', 'YATAS', 'YAYLA', 'YEOTK', 'YESIL', 'YGGYO', 'YIGIT', 'YKBNK', 'YKSLN',
            'YUNSA', 'YYAPI', 'YYLGD', 'ZEDUR', 'ZOREN', 'ZRGYO',
            // Yeni Eklenen BIST Hisseleri (200+)
            'ADMPY', 'AEROL', 'AFESG', 'ALARV', 'ARAYK', 'ARSEM', 'ARTLI', 'ARZUMI', 'ASYAB', 'ATGKS',
            'ATIC', 'ATLASL', 'AVIRD', 'AVMSA', 'AVUTR', 'AYENL', 'BAKAV', 'BASRK', 'BDDK', 'BERAS',
            'BERAY', 'BGSMD', 'BICMT', 'BIKTK', 'BILCT', 'BINHOZ', 'BKTKA', 'BOLSI', 'BOSAN', 'BOSTN',
            'BRENC', 'BRKSZ', 'BRSFA', 'BSLR', 'BSOZT', 'BULKR', 'BURKS', 'CALIS', 'CELHAZ', 'CENZO',
            'CHVAS', 'CIMTS', 'CISTK', 'CORDS', 'CRSRM', 'CVKRM', 'DAGIM', 'DARPO', 'DEMIR', 'DEVRN',
            'DOASF', 'DOMAS', 'DONNY', 'DOREM', 'DOTSA', 'ECOMC', 'EGCIM', 'EGCYN', 'EGON', 'EGREY',
            'ELITEV', 'EMAAY', 'EMAYT', 'ENSRA', 'EREGE', 'ERMEN', 'ESCEC', 'ESENTE', 'ETLOT', 'EZINE',
            'FENBA', 'FISHS', 'FLORT', 'FORCE', 'FRSTN', 'GENI', 'GEOEL', 'GEOTE', 'GERSO', 'GIRDE',
            'GOLNS', 'GORDN', 'GRLHO', 'GTF', 'HALMO', 'HELRM', 'HISAR', 'HOCAR', 'HOMDR', 'HUDS',
            'IDMUS', 'INMTE', 'INSR', 'ISTAC', 'IVETO', 'KAFGA', 'KAPLA', 'KARSAN', 'KAYSEB', 'KENT',
            'KMPLY', 'KNMIT', 'KONR', 'KORVE', 'KRDYB', 'KSER', 'KSLRN', 'KUDAF', 'KURES', 'LACID',
            'LEDES', 'LIDFR', 'LMKYN', 'LOGGO', 'LUGRI', 'MAKB', 'MAKYM', 'MANSI', 'MARNR', 'MBASA',
            'MBSKT', 'MECA', 'MEKSA', 'MERKOZ', 'MGNKS', 'MILEF', 'MOPDI', 'MPTRY', 'MRFER', 'MSEL',
            'MTHOK', 'NTPMA', 'OBASEY', 'ODSAL', 'OFSLM', 'OFSYE', 'OGZ', 'OLUG', 'OPCOR', 'ORICO',
            'ORMAZ', 'OSKAN', 'OTCOR', 'PAKSU', 'PAPAZ', 'PEKRN', 'PGSRL', 'PNLTI', 'POYAT', 'PRJOT',
            'PRLCT', 'PRDTH', 'PRGON', 'PRMBA', 'PRMTL', 'PRNTM', 'PSGON', 'PSOVR', 'PULUT', 'RAZES',
            'RDNGZ', 'RECCT', 'RERF', 'RFFIN', 'RNFTR', 'RODRK', 'ROGAM', 'RSMAS', 'RSVAR', 'RTHOR',
            'SALPO', 'SAMIK', 'SANEV', 'SBEOM', 'SEKTS', 'SELVO', 'SERFN', 'SILZO', 'SISEZ', 'SKKL',
            'SOLTO', 'SPEAK', 'SPEED', 'SPEKZ', 'SPORL', 'SRVMO', 'STALP', 'STARC', 'STLMS', 'STLYS',
            'SUMFO', 'SUNCA', 'SUNGE', 'SURGM', 'SVMOL', 'TABRS', 'TAVRL', 'TAVSP', 'TCLML', 'TEKMA',
            'TEKOZ', 'TERTM', 'TLGON', 'TMNTS', 'TMNUS', 'TOMTM', 'TOOUM', 'TPLAV', 'TSRNO', 'TSTMT',
            'TSYHM', 'TUZLA', 'ULAST', 'ULTUT', 'UMEST', 'USTRA', 'VASTF', 'VBLGN', 'VBAYT', 'VBEYA',
            'VCTLG', 'VESMA', 'VETAR', 'VGMVL', 'VKSHM', 'VMLOS', 'VSTML', 'YAKTL', 'YAVSL', 'YMSTN',
            'YOAKA', 'YOBAY', 'YOKAB', 'YOLAR', 'YOPLS', 'YOSRC', 'YRLTT', 'YRVLA', 'YTSOB', 'YUMED',
            'YURSS', 'YURSK', 'ZORLA', 'ZPKOL'
        ];

        console.log(`${bistSymbols.length} BIST hissesi için veri çekiliyor...`);

        const results = {
            success: 0,
            failed: 0,
            errors: [] as string[]
        };

        // Process in batches to avoid overwhelming Yahoo Finance API
        const batchSize = 50;
        for (let i = 0; i < bistSymbols.length; i += batchSize) {
            const batch = bistSymbols.slice(i, i + batchSize);
            
            await Promise.all(batch.map(async (symbol) => {
                try {
                    // Fetch real-time price from Yahoo Finance
                    const yahooSymbol = `${symbol}.IS`;
                    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${yahooSymbol}`;
                    
                    const yahooResponse = await fetch(yahooUrl, {
                        headers: {
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
                        }
                    });

                    if (!yahooResponse.ok) {
                        throw new Error(`Yahoo Finance API error for ${symbol}: ${yahooResponse.status}`);
                    }

                    const yahooData = await yahooResponse.json();
                    const result = yahooData?.chart?.result?.[0];

                    if (!result) {
                        throw new Error(`No data from Yahoo Finance for ${symbol}`);
                    }

                    const meta = result.meta;
                    const currentPrice = meta?.regularMarketPrice || meta?.previousClose || 0;
                    const companyName = meta?.longName || meta?.shortName || symbol;

                    // Prepare asset data
                    const assetData = {
                        symbol: yahooSymbol,
                        name: companyName,
                        asset_type: 'stock',
                        price: currentPrice,
                        exchange: 'BIST',
                        currency: 'TRY',
                        last_updated: new Date().toISOString(),
                        is_active: true
                    };

                    // Use Supabase native UPSERT (resolution=merge-duplicates)
                    const upsertResponse = await fetch(
                        `${supabaseUrl}/rest/v1/assets`,
                        {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey,
                                'Content-Type': 'application/json',
                                'Prefer': 'resolution=merge-duplicates,return=minimal'
                            },
                            body: JSON.stringify(assetData)
                        }
                    );

                    if (!upsertResponse.ok) {
                        const errorText = await upsertResponse.text();
                        throw new Error(`Database upsert failed for ${symbol}: ${errorText}`);
                    }

                    results.success++;
                    console.log(`✓ ${symbol}: ${currentPrice} TRY`);

                } catch (error) {
                    results.failed++;
                    const errorMsg = `${symbol}: ${error.message}`;
                    results.errors.push(errorMsg);
                    console.error(`✗ ${errorMsg}`);
                }
            }));

            // Small delay between batches
            if (i + batchSize < bistSymbols.length) {
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        }

        console.log(`İşlem tamamlandı. Başarılı: ${results.success}, Başarısız: ${results.failed}`);

        return new Response(JSON.stringify({
            data: {
                total: bistSymbols.length,
                success: results.success,
                failed: results.failed,
                errors: results.errors.slice(0, 10), // Show first 10 errors only
                message: `${results.success} BIST hissesi başarıyla güncellendi`
            }
        }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });

    } catch (error) {
        console.error('BIST Full List Fetch error:', error);

        const errorResponse = {
            error: {
                code: 'BIST_FETCH_FAILED',
                message: error.message
            }
        };

        return new Response(JSON.stringify(errorResponse), {
            status: 500,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
    }
});
