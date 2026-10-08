# Vanilla JS Transaction Data Grid

A high-performance, modular, and fully responsive Data Grid component built entirely with Vanilla JavaScript, semantic HTML5, and native CSS. 

## ✨ Features
- **Zero Dependencies**: Built without external UI libraries or frameworks.
- **CSS Grid Layout**: Responsive table structure that scrolls horizontally on mobile devices.
- **Accessible (a11y)**: Fully keyboard navigable with `aria-live` region announcements for screen readers.
- **Debounced Search**: Instantly filter transactions across all columns locally.
- **State Management**: Includes UI states for Loading (Skeleton loaders), Error (Retry button), and Data rendering.
- **Efficient DOM Updates**: Utilizes `DocumentFragment` to minimize reflows and maximize performance.

## 📂 Project Structure
- `index.html`: The entry point that loads the component.
- `transactionStyles.css`: Native CSS styling and themes.
- `TransactionDataTable.js`: Core UI logic, state management, and DOM mounting.
- `apiService.js`: An isolated `async/await` fetch wrapper.
- `api/v1/transactions`: A mock JSON API endpoint.

## 🚀 How to Run Locally

Because the project uses ES Modules (`import/export`) and the `fetch()` API, it must be run via a local web server to avoid browser CORS restrictions. You cannot simply double-click `index.html`.

### Option 1: Using Python (Recommended)
If you have Python installed, open your terminal in the project folder and run:
```bash
python -m http.server 3000
```
Then, open [http://localhost:3000](http://localhost:3000) in your browser.

### Option 2: Using Node.js (npx)
If you have Node.js installed, you can easily serve the directory using:
```bash
npx serve .
```

## ☁️ Deployment
This project is static and can be effortlessly hosted on services like **GitHub Pages**, Vercel, or Netlify. Because the API is mocked as a local static JSON file, the fetch request will work perfectly in a production environment without requiring an external backend server.
