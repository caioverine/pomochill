// ===== OTIMIZAÇÕES ADSENSE - LAZY LOADING E PERFORMANCE =====

class AdSenseOptimizer {
    constructor() {
        this.adSlots = [
            { id: 'ad-1', slot: '8199812113', format: 'rectangle', loaded: false },
            { id: 'ad-2', slot: '5390358519', format: 'auto', loaded: false },
            { id: 'ad-3', slot: '1234567890', format: 'rectangle', loaded: false },
            { id: 'ad-4', slot: '9876543210', format: 'banner', loaded: false },
            { id: 'ad-5', slot: '1122334455', format: 'rectangle', loaded: false },
            { id: 'ad-6', slot: '6677889900', format: 'banner', loaded: false },
            { id: 'anchor-ad', slot: '5566778899', format: 'banner', loaded: false }
        ];
        
        this.observer = null;
        this.isInitialized = false;
        
        this.init();
    }

    init() {
        // Wait for AdSense script to load
        if (typeof adsbygoogle !== 'undefined') {
            this.setupLazyLoading();
            this.initializeAnchorAd();
            this.trackPerformance();
            this.isInitialized = true;
        } else {
            setTimeout(() => this.init(), 100);
        }
    }

    setupLazyLoading() {
        // Intersection Observer para lazy loading dos anúncios
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !entry.target.classList.contains('ad-loaded')) {
                    this.loadAd(entry.target);
                }
            });
        }, {
            rootMargin: '200px', // Carregar 200px antes de aparecer na tela
            threshold: 0.1
        });

        // Observar todos os containers de anúncios
        document.querySelectorAll('.ad-strategic').forEach(adContainer => {
            this.observer.observe(adContainer);
        });
    }

    loadAd(adContainer) {
        try {
            // Marcar como carregado para evitar duplicação
            adContainer.classList.add('ad-loaded');
            
            // Push ad to AdSense queue
            (adsbygoogle = window.adsbygoogle || []).push({});
            
            // Add fade-in animation
            adContainer.style.opacity = '0';
            adContainer.style.transition = 'opacity 0.5s ease';
            
            setTimeout(() => {
                adContainer.style.opacity = '1';
            }, 100);

            // Track successful load
            this.trackAdLoad(adContainer);
            
        } catch (error) {
            console.warn('Error loading ad:', error);
            this.handleAdError(adContainer);
        }
    }

    initializeAnchorAd() {
        // Anúncio anchor apenas para mobile
        if (window.innerWidth <= 768) {
            const anchorContainer = document.getElementById('anchor-ad');
            if (anchorContainer) {
                setTimeout(() => {
                    try {
                        (adsbygoogle = window.adsbygoogle || []).push({});
                        this.trackAnchorAdLoad();
                    } catch (error) {
                        console.warn('Error loading anchor ad:', error);
                    }
                }, 2000); // Delay para não interferir na performance inicial
            }
        }
    }

    createStickyAd() {
        // Sticky ad apenas para desktop largo
        if (window.innerWidth >= 1200) {
            const stickyContainer = document.createElement('div');
            stickyContainer.className = 'sticky-ad-container';
            stickyContainer.innerHTML = `
                <ins class="adsbygoogle"
                     data-ad-client="ca-pub-9321995672209438"
                     data-ad-slot="7788990011"
                     data-ad-format="rectangle"
                     data-full-width-responsive="false"
                     style="display:block;width:160px;height:600px"></ins>
            `;
            
            document.body.appendChild(stickyContainer);
            
            setTimeout(() => {
                try {
                    (adsbygoogle = window.adsbygoogle || []).push({});
                } catch (error) {
                    console.warn('Error loading sticky ad:', error);
                }
            }, 5000); // Delay maior para sticky ads
        }
    }

    handleAdError(adContainer) {
        adContainer.classList.add('ad-error');
        adContainer.style.minHeight = '100px';
        adContainer.innerHTML = '<div style="display:flex;align-items:center;justify-content:center;height:100px;color:#999;font-size:14px;">Advertisement</div>';
    }

    trackAdLoad(adContainer) {
        // Analytics tracking (Google Analytics, etc.)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'ad_load', {
                'event_category': 'AdSense',
                'event_label': 'Strategic Ad Loaded',
                'value': 1
            });
        }
        
        // Custom tracking
        console.log('Ad loaded successfully:', adContainer);
    }

    trackAnchorAdLoad() {
        if (typeof gtag !== 'undefined') {
            gtag('event', 'anchor_ad_load', {
                'event_category': 'AdSense',
                'event_label': 'Anchor Ad Loaded',
                'value': 1
            });
        }
    }

    trackPerformance() {
        // Monitor Core Web Vitals impact
        if ('PerformanceObserver' in window) {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === 'largest-contentful-paint') {
                        console.log('LCP:', entry.startTime);
                    }
                    if (entry.entryType === 'layout-shift') {
                        console.log('CLS:', entry.value);
                    }
                }
            });
            
            try {
                observer.observe({ entryTypes: ['largest-contentful-paint', 'layout-shift'] });
            } catch (e) {
                // Fallback para browsers mais antigos
                console.warn('Performance monitoring not fully supported');
            }
        }
    }

    // Método público para forçar carregamento de anúncios
    loadAllAds() {
        document.querySelectorAll('.ad-strategic:not(.ad-loaded)').forEach(adContainer => {
            this.loadAd(adContainer);
        });
    }

    // Método para refresh de anúncios (útil para SPAs)
    refreshAds() {
        if (window.googletag && googletag.pubads) {
            googletag.pubads().refresh();
        }
    }
}

// ===== AUTO-OPTIMIZATION BASEADA NO VIEWPORT =====

class ResponsiveAdManager {
    constructor() {
        this.currentBreakpoint = this.getBreakpoint();
        this.init();
    }

    init() {
        this.optimizeAdSizes();
        this.handleResize();
    }

    getBreakpoint() {
        const width = window.innerWidth;
        if (width <= 480) return 'mobile';
        if (width <= 768) return 'tablet';
        if (width <= 1024) return 'desktop';
        return 'large-desktop';
    }

    optimizeAdSizes() {
        const ads = document.querySelectorAll('.adsbygoogle');
        
        ads.forEach(ad => {
            const format = ad.getAttribute('data-ad-format');
            
            switch (this.currentBreakpoint) {
                case 'mobile':
                    this.optimizeForMobile(ad, format);
                    break;
                case 'tablet':
                    this.optimizeForTablet(ad, format);
                    break;
                case 'desktop':
                case 'large-desktop':
                    this.optimizeForDesktop(ad, format);
                    break;
            }
        });
    }

    optimizeForMobile(ad, format) {
        if (format === 'rectangle') {
            ad.style.width = '300px';
            ad.style.height = '250px';
        } else if (format === 'banner') {
            ad.style.width = '320px';
            ad.style.height = '50px';
        }
    }

    optimizeForTablet(ad, format) {
        if (format === 'rectangle') {
            ad.style.width = '336px';
            ad.style.height = '280px';
        } else if (format === 'banner') {
            ad.style.width = '468px';
            ad.style.height = '60px';
        }
    }

    optimizeForDesktop(ad, format) {
        if (format === 'rectangle') {
            ad.style.width = '336px';
            ad.style.height = '280px';
        } else if (format === 'banner') {
            ad.style.width = '728px';
            ad.style.height = '90px';
        }
    }

    handleResize() {
        let resizeTimeout;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                const newBreakpoint = this.getBreakpoint();
                if (newBreakpoint !== this.currentBreakpoint) {
                    this.currentBreakpoint = newBreakpoint;
                    this.optimizeAdSizes();
                }
            }, 250);
        });
    }
}

// ===== AD BLOCKER DETECTION =====

class AdBlockDetector {
    constructor() {
        this.isAdBlockActive = false;
        this.detect();
    }

    detect() {
        // Criar elemento de teste
        const testAd = document.createElement('div');
        testAd.innerHTML = '&nbsp;';
        testAd.className = 'adsbox';
        testAd.style.position = 'absolute';
        testAd.style.left = '-10000px';
        testAd.style.width = '1px';
        testAd.style.height = '1px';
        
        document.body.appendChild(testAd);
        
        setTimeout(() => {
            if (testAd.offsetHeight === 0) {
                this.isAdBlockActive = true;
                this.handleAdBlockDetected();
            }
            testAd.remove();
        }, 100);
    }

    handleAdBlockDetected() {
        // Mostrar mensagem educativa sobre suporte ao site
        const adContainers = document.querySelectorAll('.ad-strategic');
        adContainers.forEach(container => {
            container.innerHTML = `
                <div style="padding: 20px; text-align: center; color: #666; border: 2px dashed #ddd; border-radius: 8px;">
                    <h4 style="margin-bottom: 10px; color: #333;">💡 Apoie o PomoChill</h4>
                    <p style="font-size: 14px; margin: 0;">Os anúncios nos ajudam a manter esta ferramenta gratuita. Considere desabilitar seu bloqueador de anúncios para este site.</p>
                </div>
            `;
        });

        // Analytics tracking
        if (typeof gtag !== 'undefined') {
            gtag('event', 'adblock_detected', {
                'event_category': 'AdSense',
                'event_label': 'Ad Blocker Active',
                'value': 1
            });
        }
    }
}

// ===== INICIALIZAÇÃO =====

// Aguardar carregamento completo
document.addEventListener('DOMContentLoaded', () => {
    // Inicializar otimizadores com delay para não impactar performance inicial
    setTimeout(() => {
        window.adSenseOptimizer = new AdSenseOptimizer();
        window.responsiveAdManager = new ResponsiveAdManager();
        
        // Detector de ad blocker apenas após 3 segundos
        setTimeout(() => {
            window.adBlockDetector = new AdBlockDetector();
        }, 3000);
        
    }, 1000);
});

// ===== FUNÇÕES UTILITÁRIAS GLOBAIS =====

// Função para refresh manual de anúncios
window.refreshAds = function() {
    if (window.adSenseOptimizer) {
        window.adSenseOptimizer.refreshAds();
    }
};

// Função para forçar carregamento de todos os anúncios
window.loadAllAds = function() {
    if (window.adSenseOptimizer) {
        window.adSenseOptimizer.loadAllAds();
    }
};

// Função para analytics customizado
window.trackAdInteraction = function(adType, action) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'ad_interaction', {
            'event_category': 'AdSense',
            'event_label': `${adType}_${action}`,
            'value': 1
        });
    }
};

// ===== PREVENÇÃO DE LAYOUT SHIFT =====

// Garantir que containers de anúncios tenham altura mínima
function preventLayoutShift() {
    document.querySelectorAll('.ad-strategic').forEach(container => {
        if (!container.style.minHeight) {
            container.style.minHeight = '250px';
        }
    });
}

// Executar ao carregar
document.addEventListener('DOMContentLoaded', preventLayoutShift);

// ===== OTIMIZAÇÃO PARA CORE WEB VITALS =====

// Preload critical AdSense resources
const preloadAdSense = () => {
    const preloadLink = document.createElement('link');
    preloadLink.rel = 'preconnect';
    preloadLink.href = 'https://pagead2.googlesyndication.com';
    preloadLink.crossOrigin = 'anonymous';
    document.head.appendChild(preloadLink);

    const preloadLink2 = document.createElement('link');
    preloadLink2.rel = 'preconnect';
    preloadLink2.href = 'https://googleads.g.doubleclick.net';
    document.head.appendChild(preloadLink2);
};

// Executar preload
preloadAdSense();

// ===== DEBUGGING E MONITORING =====

// Console logs para debugging (remover em produção)
if (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1')) {
    window.debugAdSense = true;
    
    setInterval(() => {
        const loadedAds = document.querySelectorAll('.ad-loaded').length;
        const totalAds = document.querySelectorAll('.ad-strategic').length;
        console.log(`AdSense Status: ${loadedAds}/${totalAds} ads loaded`);
    }, 5000);
}