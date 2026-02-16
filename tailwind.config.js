/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        salviaGreen: '#7E9076', 
        sageGrey: '#D3D8CE',    
        brokenWhite: '#F8F7F3',
        forestDark: '#2C362B',  
        clayAccent: '#A68477',
        statusPending: '#E2E8F0', 
        statusAccepted: '#C6D5C0',
        statusRejected: '#E9D5D5',
      }
    },
  },
  plugins: [],
}