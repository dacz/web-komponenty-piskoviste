customElements.define("dns-record", class DNSRecordElement extends HTMLElement {
  static observedAttributes = ["data-status", "data-nocopy"];
  #debug = true;
  #nocopy = false;

  constructor() {
    super();
    const template = document.createElement('template');
    template.innerHTML = DNSRecordElement.templateContent;
    const shadowRoot = this.attachShadow({ mode: "open" });
    shadowRoot.appendChild(template.content.cloneNode(true));
  }

  connectedCallback() {
    this.shadowRoot.querySelector("[data-type='hostname']").innerText =
      this.querySelector("[data-type='hostname']").innerContent
      || this.querySelector("[data-type='hostname']").innerText
    this.shadowRoot.querySelector("[data-type='domain']").innerText =
      this.querySelector("[data-type='domain']").innerContent
      || this.querySelector("[data-type='domain']").innerText
    this.shadowRoot.querySelector("[data-type='kind']").innerText =
      this.querySelector("[data-type='kind']").innerContent
      || this.querySelector("[data-type='kind']").innerText
    this.shadowRoot.querySelector("[data-type='value']").innerText =
      this.querySelector("[data-type='value']").innerContent
      || this.querySelector("[data-type='value']").innerText

    this.setClassesOnAttributes()
    !this.#nocopy && this.setClickHandlers();
  }

  disconnectedCallback() {
    this.resetClickHandlers();
    this.#debug && console.log("Custom element removed from page.");
  }

  adoptedCallback() {
    this.#debug && console.log("Custom element moved to new page.");
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.#debug && console.log(`Attribute ${name} has changed.`);
    this.setClassesOnAttributes()
    this.resetClickHandlers();
    !this.#nocopy && this.setClickHandlers();
  }

  // ===

  async addToClipboard(ev) {
    const text = ev.srcElement.textContent || ev.srcElement.innerText;
    try {
      navigator.clipboard.writeText(text)
      const el = ev.srcElement;
      el.classList.add("copied");
      await DNSRecordElement.wait(100);
      el.classList.remove("copied");
      console.log("Copied the text: " + text);
    } catch (err) {
      console.error("Async: Could not copy text to clipboard: ", err);
    }
  }

  setClassesOnAttributes() {
    const status = this.getAttribute("data-status");
    this.#nocopy = this.hasAttribute("data-nocopy");
    if (status != "ok" && !this.#nocopy) {
      this.#nocopy = true;
    }
    const rootd = this.shadowRoot.querySelector(".dns-record");
    rootd.classList.remove("ok", "warn", "error");
    status && rootd.classList.add(status);
    this.#nocopy ? rootd.classList.add("nocopy") : rootd.classList.remove("nocopy");
  }

  setClickHandlers() {
    if (!navigator?.clipboard) {
      this.#debug && console.error("Clipboard API not supported");
      return;
    }

    const copyableEls = this.shadowRoot.querySelectorAll(".copyable");
    copyableEls.forEach(el => {
      el.addEventListener("click", this.addToClipboard);
    })
  }

  resetClickHandlers() {
    if (!navigator?.clipboard) {
      this.#debug && console.error("Clipboard API not supported");
      return;
    }

    const copyableEls = this.shadowRoot.querySelectorAll(".copyable");
    copyableEls.forEach(el => el.removeEventListener("click", this.addToClipboard))
  }

  static async wait(ms) {
    return new Promise(resolve => {
      setTimeout(resolve, ms);
    })
  }

  static templateContent = `
  <style>.dns-record{--mainFont:'Courier New',Courier,monospace;--normalFont:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;--baseFontSize:18px;--mainColor:black;--subtleColor:#bababa;--okColor:rgb(242, 255, 242);--warnColor:rgb(255, 247, 231);--errorColor:rgb(255, 223, 223);--unknownColor:rgb(246, 246, 246);--tooltipColor:white;--tooltipBgColor:rgb(32, 32, 32);display:flex;flex-direction:row;align-items:stretch;border:1px solid var(--subtleColor);border-radius:.5rem;width:max-content;max-width:100%;color:var(--mainColor);background-color:var(--unknownColor);transition:background-color .5ms step-end}.dns-record.ok{background-color:var(--okColor)}.dns-record.warn{background-color:var(--warnColor)}.dns-record.error{background-color:var(--errorColor)}.dns-record span{padding:.5rem .75rem;font-family:var(--mainFont);font-size:var(--baseFontSize)}.dns-record .hostname{border-right:1px solid var(--subtleColor);font-weight:700;cursor:pointer}.dns-record .domain{border-right:1px solid var(--subtleColor)}.dns-record .kind{border-right:1px solid var(--subtleColor);font-weight:700}.dns-record .cbc{cursor:pointer;width:auto;user-select:none;padding:0}.dns-record .value{font-weight:700;cursor:pointer}.nocopy .hostname,.nocopy .value{cursor:initial}.tooltip{position:relative;font-weight:400}.tooltip:before{content:attr(data-copy);font-family:var(--normalFont);font-size:.8rem;font-weight:400;position:absolute;top:100%;left:8px;transform:translateY(8px);width:auto;padding:.5rem;border-radius:.4rem;background:var(--tooltipBgColor);color:var(--tooltipColor);text-align:center;display:none}.tooltip:after{content:"";position:absolute;left:1.5rem;margin-left:-5px;top:100%;transform:translateY(-10px);border:10px solid var(--tooltipBgColor);border-color:transparent transparent var(--tooltipBgColor) transparent;display:none}.tooltip:hover:after,.tooltip:hover:before{display:block}.nocopy .tooltip:hover:after,.nocopy .tooltip:hover:before{display:none}.copied{background-color:rgba(0,128,0,.518)!important;color:#fff!important;transition:background-color .1s ease-in}</style><div class="dns-record"><span class="hostname tooltip copyable" data-copy="Click to copy to clipboard" data-type="hostname"></span> <span class="domain" data-type="domain"></span> <span class="kind" data-type="kind"></span> <span class="value tooltip copyable" data-copy="Click to copy to clipboard" data-type="value"></span></div>
  `;
})
