# Fainext Client Portal

A front-end demo of a client portal for **Fainext**, a Rwandan financial services
company. It covers the full client journey — registration, login, a dashboard with
balances and spending, and a searchable, filterable, exportable transaction history.

Built with **plain HTML, CSS and vanilla JavaScript only**: no frameworks, no npm,
no build step, no CDNs. Every page runs by double-clicking `index.html` and works
unchanged on GitHub Pages.

---

## Folder structure

```
fainext-portal/
├── index.html              Login page
├── register.html           Registration page
├── dashboard.html          User dashboard (protected)
├── transactions.html       Transactions page (protected)
├── css/
│   └── style.css           One shared stylesheet
├── js/
│   ├── auth.js             Login, registration, session + page protection
│   ├── data.js             Sample transactions, formatters, shared table rows
│   ├── dashboard.js        Greeting, summary cards, chart, recent activity
│   └── transactions.js     Filters, table rendering, CSV export
├── wireframes/
│   ├── login.svg           Low-fidelity wireframe (1440 × 900)
│   ├── dashboard.svg       Low-fidelity wireframe (1440 × 900)
│   └── transactions.svg    Low-fidelity wireframe (1440 × 900)
├── screenshots/            Screenshots used in this README
└── README.md
```

### Wireframes

The three SVGs in `wireframes/` are greyscale, low-fidelity layouts matching the
real screens. They open directly in a browser and can be dragged straight into
Figma, where each box imports as an editable vector layer.

