import { Controls } from "./controls.js";
import { Indicator } from "./indicator.js";
import { Pagination } from "./pagination.js";

customElements.define("pauls-carousel-controls", Controls);
customElements.define("pauls-carousel-indicator", Indicator);
customElements.define("pauls-carousel-pagination", Pagination);

const template = document.createElement("template");
template.innerHTML = `
  <pauls-carousel-controls></pauls-carousel-controls>
  <pauls-carousel-indicator total="0" index="0"></pauls-carousel-indicator>
  <slot></slot>
  <pauls-carousel-pagination total="0" index="0"></pauls-carousel-pagination>
`;

export class Carousel extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(this.template);

    this._state = new Proxy(
      {
        items: Array.from(this.querySelector(".pauls-carousel-track").children),
        index: 0,
        get total() {
          return this.items.length;
        },
      },
      {
        set: (target, key, value) => {
          Reflect.set(target, key, value);
          this.update();
          return true;
        },
      }
    );
  }

  get template() {
    return template.content.cloneNode(true);
  }

  connectedCallback() {
    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.intersectionRatio >= 0.75) {
            entry.target.classList.toggle("active", true);
            this._state.index = this._state.items.indexOf(entry.target);
          } else if (entry.intersectionRatio <= 0.25) {
            entry.target.classList.toggle("active", false);
          }
        });
      },
      {
        root: this.querySelector(".pauls-carousel-track"),
        threshold: [0.25, 0.75],
      }
    );

    this._state.items.forEach((slide) => {
      intersectionObserver.observe(slide);
    });

    const indicator = this.shadowRoot.querySelector("pauls-carousel-indicator");
    indicator.setAttribute("total", this._state.total);
    indicator.setAttribute("index", this._state.index);

    const pagination = this.shadowRoot.querySelector(
      "pauls-carousel-pagination"
    );
    pagination.setAttribute("total", this._state.total);
    pagination.setAttribute("index", this._state.index);

    const controls = this.shadowRoot.querySelector("pauls-carousel-controls");
    controls.setAttribute("total", this._state.total);
    controls.setAttribute("index", this._state.index);

    // TODO: Remove listener in disconnectedCallback
    this.addEventListener("paginate", (event) => {
      event.stopPropagation();
      this.navigate({ type: "index", payload: event.detail.index });
    });

    // TODO: Remove listener in disconnectedCallback
    this.addEventListener("controls", (event) => {
      event.stopPropagation();
      this.navigate({ type: event.detail.direction });
    });
  }

  /**
   * @param {"next" | "previous" | number} command either the direction or a specific slide index to navigate to
   */
  navigate(command) {
    let index = null;
    let element = null;

    switch (command.type) {
      case "next": {
        const newIndex = this._state.index + 1;
        if (newIndex <= this._state.total) {
          index = newIndex;
        }
        break;
      }
      case "previous": {
        const newIndex = this._state.index - 1;
        if (newIndex >= 0) {
          index = newIndex;
        }
        break;
      }
      case "index": {
        const newIndex = command.payload;
        if (newIndex >= 0 && newIndex <= this._state.total) {
          index = newIndex;
        }
        break;
      }
      default:
        throw new Error("Unhandled navigation command:", command);
    }

    if (typeof index === "number") {
      element = this._state.items.at(index);
    }

    if (element instanceof HTMLElement) {
      element.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }

  update() {
    if (this._state.total > 1) {
      const indicator = this.shadowRoot.querySelector(
        "pauls-carousel-indicator"
      );
      const pagination = this.shadowRoot.querySelector(
        "pauls-carousel-pagination"
      );
      const controls = this.shadowRoot.querySelector("pauls-carousel-controls");

      [indicator, pagination, controls].forEach((element) => {
        element.setAttribute("index", this._state.index);
      });
    }
  }

  disconnectedCallback() {
    intersectionObserver.disconnect();
  }
}
