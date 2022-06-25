const template = document.createElement("template");
template.innerHTML = /* html */ `
  <span aria-hidden="true"></span>
`;

const sheet = new CSSStyleSheet();
sheet.replaceSync(/* css */ `
  :host {
    display: flex;
    place-content: center;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.125em;
    position: absolute;
    z-index: 1;
    inset-block-start: 8px;
    inset-inline-end: 8px;
    padding: 0.75em;
    border-radius: 4em;
    font-size: 0.75rem;
    font-family: system-ui, "Helvetica Neue", sans-serif;
    line-height: 1;
    background-color: hwb(0 0% 100% / 0.5);
    color: hwb(0 100% 0%);
    user-select: none;
  }
`);

const OBSERVED_ATTRIBUTES = ["index", "total"];

export class Indicator extends HTMLElement {
  index = 0;
  total = 0;

  static get observedAttributes() {
    return OBSERVED_ATTRIBUTES;
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(this.template);
    this.shadowRoot.adoptedStyleSheets = [...this.styles];
  }

  get template() {
    return template.content.cloneNode(true);
  }

  get styles() {
    return [sheet];
  }

  get index() {
    return Number(this.getAttribute("index"));
  }

  get total() {
    return Number(this.getAttribute("total"));
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this.setAttribute("aria-live", "polite");

    if (OBSERVED_ATTRIBUTES.includes(name) && oldValue !== newValue) {
      this[name] = newValue;
      this.update();
    }
  }

  connectedCallback() {
    this.update();
  }

  update() {
    const current = parseFloat(this.index) + 1;

    this.setAttribute("aria-label", `Position ${current} von ${this.total}`);

    this.shadowRoot.querySelector(
      "[aria-hidden]"
    ).textContent = `${current}/${this.total}`;
  }
}
