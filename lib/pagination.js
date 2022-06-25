const sheet = new CSSStyleSheet();
sheet.replaceSync(/* css */ `
  :host {
    display: flex;
    gap: 4px;
    justify-content: center;
    padding: 8px;
  }

  button {
    appearance: none;
    width: 8px;
    height: 8px;
    background-color: var(--color-pagination);
    border: 0;
    border-radius: 100%;
  }

  button[aria-current="true"] {
    background-color: var(--color-pagination-active);
  }
`);

export class Pagination extends HTMLElement {
  static get observedAttributes() {
    return ["total", "index"];
  }

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.adoptedStyleSheets = [...this.styles];
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
    if (name === "total" && newValue !== null && newValue !== oldValue) {
      this.setup();
    }
    this.update();
  }

  connectedCallback() {
    this.setup();
  }

  setup() {
    for (let i = 0; i < this.total; i++) {
      const button = document.createElement("button");

      button.setAttribute("part", "button");
      button.setAttribute("type", "button");
      button.setAttribute("aria-label", `Position ${i + 1} von ${this.total}`);
      button.setAttribute("aria-current", i === this.index);

      button.addEventListener("click", () => {
        this.dispatchEvent(
          new CustomEvent("paginate", {
            bubbles: true,
            composed: true,
            detail: {
              index: i,
            },
          })
        );
      });

      this.shadowRoot.appendChild(button);
    }
  }

  update() {
    const buttons = this.shadowRoot.querySelectorAll("button");

    buttons.forEach((button, index) => {
      if (index === this.index) {
        button.setAttribute("aria-current", "true");
      } else {
        button.setAttribute("aria-current", "false");
      }
    });
  }
}
