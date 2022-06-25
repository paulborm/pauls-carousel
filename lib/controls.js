const template = document.createElement("template");
template.innerHTML = /* html */ `
  <button type="button" value="previous">
    <span class="sr-only">Vorheriges Element</span>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" aria-hidden="true" tabindex="-1">
      <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  </button>
  <button type="button" value="next">
    <span class="sr-only">Nächstes Element</span>
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" aria-hidden="true" tabindex="-1">
      <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  </button>
`;

const sheet = new CSSStyleSheet();
sheet.replaceSync(/* css */ `
  :host {
    position: absolute;
    inset: 8px;
    z-index: 1;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    pointer-events: none;
  }

  button {
    appearance: none;
    border: 0;
    background: transparent;
    width: 24px;
    height: 24px;
    color: black;
    margin: 0;
    padding: 0;
    opacity: 1;
    pointer-events: auto;
    cursor: pointer;
    border-radius: 100%;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.375);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: white;
    will-change: visiblity, opacity;
    transition: visibility 0.125s ease-in-out, opacity 0.125s ease-in-out;
  }

  button[hidden] {
    visibility: hidden;
    opacity: 0;
  }

  :host(:hover) > button {
    opacity: 1;
  }

  button svg {
    pointer-events: none;
  }

  .sr-only {
    position: absolute;
    left: -9999999999px;
    top: auto;
    width: 1px;
    height: 1px;
    overflow: hidden;
  }
`);

export class Controls extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(this.template);
    this.shadowRoot.adoptedStyleSheets = [...this.styles];
    this.buttons = this.shadowRoot.querySelectorAll("button");
  }

  get index() {
    return Number(this.getAttribute("index"));
  }

  get total() {
    return Number(this.getAttribute("total"));
  }

  get template() {
    return template.content.cloneNode(true);
  }

  get styles() {
    return [sheet];
  }

  static get observedAttributes() {
    return ["index", "total"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (newValue !== oldValue) {
      this.update();
    }
  }

  connectedCallback() {
    this.buttons.forEach((button) => {
      button.addEventListener("click", this.onClickHandler);
    });
    this.update();
  }

  disconnectedCallback() {
    this.buttons.forEach((button) => {
      button.removeEventListener("click", this.onClickHandler);
    });
  }

  onClickHandler(event) {
    let direction;

    if (event.target.value === "previous") {
      direction = "previous";
    } else if (event.target.value === "next") {
      direction = "next";
    }

    if (!direction) {
      return;
    }

    this.dispatchEvent(
      new CustomEvent("controls", {
        bubbles: true,
        composed: true,
        detail: {
          direction,
        },
      })
    );
  }

  update() {
    const prev = Array.from(this.buttons).find(
      ({ value }) => value === "previous"
    );
    const next = Array.from(this.buttons).find(({ value }) => value === "next");

    if (this.index === 0 && !prev.hasAttribute("hidden")) {
      prev.setAttribute("hidden", "");
    } else {
      prev.removeAttribute("hidden");
    }

    if (this.index + 1 >= this.total && !next.hasAttribute("hidden")) {
      next.setAttribute("hidden", "");
    } else {
      next.removeAttribute("hidden");
    }
  }
}
