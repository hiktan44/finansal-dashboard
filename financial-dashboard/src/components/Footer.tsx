import React from 'react';
import { ShieldCheck, Database, Code } from 'lucide-react';

const Footer: React.FC = () => {
    return (
        <footer className="mt-12 border-t border-gray-800 bg-gray-900/50 backdrop-blur-sm p-8">
            <div className="max-w-7xl mx-auto space-y-6">

                {/* Yasal Uyarı Bölümü */}
                <div className="flex items-start space-x-3 text-gray-400">
                    <ShieldCheck className="h-5 w-5 mt-1 text-gray-500 shrink-0" />
                    <div className="text-xs leading-relaxed space-y-2">
                        <p className="font-semibold text-gray-300">YASAL UYARI:</p>
                        <p>
                            Burada yer alan yatırım bilgi, yorum ve tavsiyeleri <strong>Yatırım Danışmanlığı kapsamında değildir</strong>.
                            Yatırım danışmanlığı hizmeti; aracı kurumlar, portföy yönetim şirketleri, mevduat kabul etmeyen bankalar ile müşteri arasında
                            imzalanacak yatırım danışmanlığı sözleşmesi çerçevesinde sunulmaktadır.
                        </p>
                        <p>
                            Burada yer alan yorum ve tavsiyeler, yorum ve tavsiyede bulunanların kişisel görüşlerine dayanmaktadır.
                            Bu görüşler mali durumunuz ile risk ve getiri tercihlerinize uygun olmayabilir.
                            Bu nedenle, sadece burada yer alan bilgilere dayanılarak yatırım kararı verilmesi beklentilerinize uygun sonuçlar doğurmayabilir.
                        </p>
                        <p>
                            Uygulamadaki veriler, piyasa koşullarına göre gecikmeli olabilir veya değişkenlik gösterebilir.
                            Kullanıcılar, bu verilere dayanarak alacakları kararlardan bizzat sorumludur.
                        </p>
                    </div>
                </div>

                {/* Alt Bilgi ve Branding */}
                <div className="border-t border-gray-800 pt-6 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                    <div className="flex items-center space-x-2 mb-4 md:mb-0">
                        <Database className="h-4 w-4" />
                        <span>Veriler: Investing.com, TCMB, Yahoo Finance</span>
                    </div>

                    <div className="flex items-center space-x-2 badge-container">
                        <span className="text-gray-600">Designed & Developed by</span>
                        <a href="https://thirdhand.com.tr/" target="_blank" rel="noopener noreferrer" className="flex items-center space-x-1 px-3 py-1 bg-gradient-to-r from-purple-900/40 to-blue-900/40 border border-purple-500/20 rounded-full text-purple-300 font-medium hover:from-purple-900/60 hover:to-blue-900/60 transition-all">
                            <Code className="h-3 w-3 mr-1" />
                            ThirdHand AI
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
