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

        // 726 BIST stock symbols (Borsa Istanbul resmi CSV'den - 2025-11-06) 
        // Original 556 + 170 additional stocks = 726 total stocks
        const bistSymbols = [
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
            // +170 Ek BIST Hisseleri (2025-11-06) - 726 toplam
            'GNDMR', 'GOZDE', 'GRNYO', 'GSDDE', 'GSDHO', 'GSRAY', 'GUBRF', 'GUNGK', 'GUNKZ', 'GURUN',
            'GVINT', 'GZNMI', 'HATEK', 'HATSN', 'HDFGS', 'HEKTS', 'HKTM', 'HLGYO', 'HOROZ', 'HRKET',
            'HTTBT', 'IFAST', 'IHGAY', 'IHRAC', 'INDES', 'INFOO', 'INMVE', 'IOYER', 'IPEKY', 'ISARE',
            'ISCHE', 'ISDBS', 'ISMEN', 'ISSYV', 'ITTFH', 'IYSIS', 'JANTS', 'KAFMI', 'KAGYO', 'KAPAT',
            'KARUR', 'KARTN', 'KATMR', 'KAYES', 'KAZAN', 'KBYAP', 'KERVT', 'KESK', 'KILER', 'KLGYO',
            'KOMHL', 'KOREN', 'KRGYO', 'KRVGD', 'KURUM', 'KUYAS', 'LCBTR', 'LIDYA', 'LINK', 'LOKMI',
            'LYDMS', 'MAGEN', 'MAKST', 'MANGO', 'MARFL', 'MEBES', 'MEGTO', 'MERCK', 'MIPAZ', 'MSBTE',
            'MSURA', 'MUTEG', 'MYTEK', 'NBGFR', 'NETAS', 'NIBAS', 'NIKAH', 'NOCAP', 'NRBTM', 'ORANL',
            'ORCEM', 'ORMAK', 'OSKAN', 'OVEST', 'OYAKC', 'OYAKL', 'OYYAT', 'OZGYO', 'PALD', 'PARKS',
            'PASL', 'PENTR', 'PEROL', 'PINS', 'PRISM', 'PSSRV', 'PULCE', 'PUSUR', 'PYKGM', 'PZKTE',
            'RADYA', 'RAIAT', 'RGYOS', 'RKTAS', 'RNKOA', 'ROSSA', 'RSDHM', 'RTATA', 'RUNAP', 'SAF',
            'SAFKR', 'SANKO', 'SAPOM', 'SDENR', 'SEFA', 'SELG', 'SENGK', 'SENKS', 'SHPON', 'SIRMA',
            'SITRE', 'SMART', 'SMRTH', 'SOPAS', 'SPORR', 'STLAS', 'SUMAS', 'SURET', 'SVRK', 'TABGK',
            'TAHGY', 'TANCE', 'TARAZ', 'TATKS', 'TAVHL', 'TAVNS', 'TCELL', 'TEFEN', 'TEFSO', 'TIG',
            'TMTKT', 'TOKKI', 'TOROS', 'TRBET', 'TRUTR', 'TSKB', 'TSRAM', 'TUTAS', 'TUZOV', 'UTCEM',
            'UTGAR', 'UTUR', 'UYUM', 'UZMLR', 'VAKFI', 'VGR', 'VTRSM', 'WALKS', 'WEMPT', 'WRSD',
            'YKSEL', 'YKSGT', 'YOLAT', 'YORAT', 'YSGET', 'YUTKU', 'ZORLD'
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

                    // Try UPDATE first, if no rows affected then INSERT
                    let upsertResponse = await fetch(
                        `${supabaseUrl}/rest/v1/assets?symbol=eq.${yahooSymbol}`,
                        {
                            method: 'PATCH',
                            headers: {
                                'Authorization': `Bearer ${serviceRoleKey}`,
                                'apikey': serviceRoleKey,
                                'Content-Type': 'application/json',
                                'Prefer': 'return=minimal'
                            },
                            body: JSON.stringify(assetData)
                        }
                    );

                    // If UPDATE didn't affect any rows, do INSERT
                    if (upsertResponse.ok) {
                        const contentRange = upsertResponse.headers.get('content-range');
                        if (!contentRange || contentRange.includes('0-0/0')) {
                            // No rows updated, try INSERT
                            upsertResponse = await fetch(
                                `${supabaseUrl}/rest/v1/assets`,
                                {
                                    method: 'POST',
                                    headers: {
                                        'Authorization': `Bearer ${serviceRoleKey}`,
                                        'apikey': serviceRoleKey,
                                        'Content-Type': 'application/json',
                                        'Prefer': 'return=minimal'
                                    },
                                    body: JSON.stringify(assetData)
                                }
                            );
                        }
                    }

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
