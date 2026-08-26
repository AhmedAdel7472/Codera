export class PaymentModal {
  private modalContainer: HTMLElement | null = null;
  private selectedPlan: string = 'Foundational Coder (L1)';
  private planPrice: string = '$299';
  private onSuccessCallback?: () => void;

  constructor(onSuccessCallback?: () => void) {
    this.onSuccessCallback = onSuccessCallback;
  }

  public render(): HTMLElement {
    let container = document.getElementById('payment-modal-root');
    if (!container) {
      container = document.createElement('div');
      container.id = 'payment-modal-root';
      document.body.appendChild(container);
    }
    this.modalContainer = container;
    this.modalContainer.innerHTML = this.getModalHtml();
    this.attachEventListeners();
    return this.modalContainer;
  }

  public open(planName: string = 'Foundational Coder (L1)', price: string = '$299') {
    this.selectedPlan = planName;
    this.planPrice = price;
    this.render();
    const modalEl = document.getElementById('paymentModalOverlay');
    if (modalEl) {
      modalEl.classList.remove('hidden');
      modalEl.classList.add('flex');
      document.body.style.overflow = 'hidden';
    }
  }

  public close() {
    const modalEl = document.getElementById('paymentModalOverlay');
    if (modalEl) {
      modalEl.classList.add('hidden');
      modalEl.classList.remove('flex');
      document.body.style.overflow = '';
    }
  }

  private getModalHtml(): string {
    return `
      <div id="paymentModalOverlay" class="fixed inset-0 z-[100002] hidden items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto" dir="ltr">
        <div class="relative w-full max-w-xl bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-indigo-100 dark:border-slate-800 overflow-hidden my-8 animate-fadeIn">
          
          <!-- Header -->
          <div class="bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-800 p-6 text-white relative">
            <button id="closePaymentModalBtn" class="absolute right-5 top-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer">
              <i class="fa-solid fa-xmark text-lg"></i>
            </button>
            <div class="inline-flex items-center gap-2 px-3 py-1 bg-emerald-400/20 text-emerald-200 border border-emerald-400/30 rounded-full text-xs font-extrabold mb-2">
              <i class="fa-solid fa-lock text-xs"></i> 256-Bit SSL Encrypted Checkout
            </div>
            <h2 class="text-2xl font-black flex items-center gap-2">
              <span>💳 Secure Enrollment & Booking</span>
            </h2>
            <p class="text-indigo-100 text-xs mt-1">Complete your registration to unlock the personalized CodeRa AI Learning Track.</p>
          </div>

          <!-- Order Summary Card -->
          <div class="p-6 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
            <div>
              <div class="text-xs text-slate-500 font-bold uppercase tracking-wider">Selected Package</div>
              <div class="text-lg font-black text-slate-900 dark:text-white flex items-center gap-2">
                <span>${this.selectedPlan}</span>
                <span class="text-xs px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-bold">Recommended</span>
              </div>
            </div>
            <div class="text-right">
              <div class="text-2xl font-black text-indigo-600 dark:text-indigo-400">${this.planPrice}</div>
              <div class="text-[10px] text-slate-400 font-bold">One-Time / Term</div>
            </div>
          </div>

          <!-- Payment Form -->
          <form id="paymentCheckoutForm" onsubmit="event.preventDefault();" class="p-6 md:p-8 space-y-5">
            <!-- Payment Method Tabs -->
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Select Payment Method</label>
              <div class="grid grid-cols-3 gap-3">
                <label class="flex items-center justify-center gap-2 p-3 rounded-2xl border-2 border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/40 text-indigo-900 dark:text-indigo-200 font-bold text-xs cursor-pointer shadow-sm">
                  <i class="fa-solid fa-credit-card text-base"></i>
                  <span>Card</span>
                </label>
                <label class="flex items-center justify-center gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer hover:border-indigo-400 transition-colors">
                  <i class="fa-brands fa-paypal text-base text-blue-600"></i>
                  <span>PayPal</span>
                </label>
                <label class="flex items-center justify-center gap-2 p-3 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-bold text-xs cursor-pointer hover:border-indigo-400 transition-colors">
                  <i class="fa-solid fa-wallet text-base text-emerald-600"></i>
                  <span>Wallet</span>
                </label>
              </div>
            </div>

            <!-- Card Number -->
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Card Number</label>
              <div class="relative">
                <input type="text" id="payCardNumber" required placeholder="4532 •••• •••• 8892" class="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value="4532 8901 2345 8892" />
                <i class="fa-solid fa-credit-card absolute left-3.5 top-3.5 text-slate-400"></i>
              </div>
            </div>

            <!-- Expiry & CVC -->
            <div class="grid grid-cols-2 gap-4">
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Expiry Date</label>
                <input type="text" id="payCardExpiry" required placeholder="MM / YY" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value="08 / 28" />
              </div>
              <div>
                <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">CVC / CVV</label>
                <input type="password" id="payCardCVC" required placeholder="•••" maxlength="4" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value="888" />
              </div>
            </div>

            <!-- Cardholder Name -->
            <div>
              <label class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Cardholder Name</label>
              <input type="text" id="payCardHolder" required placeholder="e.g. Alex Rivers Parent" class="w-full px-4 py-3 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 font-medium text-sm focus:ring-2 focus:ring-indigo-500 outline-none" value="Parent Account Holder" />
            </div>

            <!-- Submit Payment CTA -->
            <button type="submit" id="submitPaymentBtn" class="w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 via-teal-600 to-emerald-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black shadow-xl shadow-emerald-500/30 transition-all flex items-center justify-center gap-2 text-base cursor-pointer transform hover:scale-[1.01]">
              <i class="fa-solid fa-lock text-lg"></i>
              <span>Pay ${this.planPrice} & Confirm Enrollment</span>
            </button>
          </form>

          <!-- Success Screen (Hidden initially) -->
          <div id="paymentSuccessScreen" class="hidden p-8 text-center space-y-4">
            <div class="w-20 h-20 mx-auto rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center text-4xl shadow-lg shadow-emerald-500/30 animate-bounce">
              <i class="fa-solid fa-circle-check"></i>
            </div>
            <h3 class="text-2xl font-black text-slate-900 dark:text-white">Payment Successful! 🎉</h3>
            <p class="text-xs text-slate-500 dark:text-slate-400 max-w-sm mx-auto leading-relaxed">
              Your enrollment in <strong>${this.selectedPlan}</strong> has been confirmed. Transaction ID: <strong class="text-slate-700 dark:text-slate-200">TXN-${Math.floor(100000 + Math.random() * 900000)}</strong>
            </p>
            <button id="closeSuccessBtn" class="px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-sm shadow-md transition-all cursor-pointer">
              Return to Parent Hub
            </button>
          </div>

        </div>
      </div>
    `;
  }

  private attachEventListeners() {
    const modalOverlay = document.getElementById('paymentModalOverlay');
    if (modalOverlay) {
      modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
          this.close();
        }
      });
    }

    const closeBtn = document.getElementById('closePaymentModalBtn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.close());
    }

    const form = document.getElementById('paymentCheckoutForm');
    const successScreen = document.getElementById('paymentSuccessScreen');
    const submitBtn = document.getElementById('submitPaymentBtn');

    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (submitBtn) {
          submitBtn.innerHTML = `<i class="fa-solid fa-spinner fa-spin text-lg"></i> Processing Payment...`;
        }

        setTimeout(() => {
          form.classList.add('hidden');
          if (successScreen) {
            successScreen.classList.remove('hidden');
          }
          if (this.onSuccessCallback) {
            this.onSuccessCallback();
          }
        }, 1200);
      });
    }

    const closeSuccessBtn = document.getElementById('closeSuccessBtn');
    if (closeSuccessBtn) {
      closeSuccessBtn.addEventListener('click', () => {
        this.close();
      });
    }
  }
}
