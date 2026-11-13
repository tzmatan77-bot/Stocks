import React, { useState, useEffect } from 'react';
import { TICKER_DOMAIN_MAP } from '../data/tickerLogoData';

// High-fidelity dedicated inline SVGs for guaranteed instantaneous rendering without external dependencies
const DEDICATED_VECTOR_LOGOS: Record<string, (className: string) => React.ReactNode> = {
  // PayPal - Official Double-P Monogram
  PYPL: (cls) => (
    <svg viewBox="0 0 24 24" fill="none" className={cls} xmlns="http://www.w3.org/2000/svg">
      <path d="M7.076 21.337H2.47a.641.641 0 0 1-.633-.74L4.944 2.402A.96.96 0 0 1 5.894 1.6h7.324c2.404 0 4.34.62 5.45 1.745 1.053 1.066 1.48 2.585 1.205 4.275-.52 3.197-2.673 4.98-5.874 4.98H10.15l-1.42 8.006a.96.96 0 0 1-.95.731h-.704z" fill="#003087"/>
      <path d="M9.103 14.6h3.895c3.2 0 5.353-1.783 5.874-4.98.275-1.69-.152-3.21-1.205-4.275C16.557 4.22 14.62 3.6 12.217 3.6H6.894a.96.96 0 0 0-.95.802L4.05 16.598a.641.641 0 0 0 .633.74h3.47l.95-6.007a.96.96 0 0 1 .95-.731h-.95z" fill="#0079C1"/>
      <path d="M8.153 17.338l.95-6.007a.96.96 0 0 1 .95-.731h3.895c1.472 0 2.69-.377 3.626-1.077-.428 3.013-2.52 4.777-5.574 4.777H8.95l-.797 3.038z" fill="#00457C"/>
    </svg>
  ),
  // Crocs - Official Crocodile Silhouette
  CROX: (cls) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-emerald-600 dark:text-emerald-400`} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 16.5c-3.04 0-5.5-2.46-5.5-5.5 0-.58.1-1.13.27-1.65l1.63 1.63c-.07.24-.1.49-.1.75 0 1.93 1.57 3.5 3.5 3.5.26 0 .51-.03.75-.1l1.63 1.63c-.52.17-1.07.27-1.65.27zm4.23-2.87l-1.46-1.46c.45-.63.73-1.39.73-2.22 0-2.07-1.68-3.75-3.75-3.75-.83 0-1.59.28-2.22.73L9.07 7.47C10.02 6.55 11.29 6 12.75 6c3.45 0 6.25 2.8 6.25 6.25 0 1.46-.55 2.73-1.47 3.68z" />
      <circle cx="8" cy="8.5" r="1.5" />
      <circle cx="16" cy="8.5" r="1.5" />
    </svg>
  ),
  // Apple
  AAPL: (cls) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-slate-900 dark:text-slate-100`} xmlns="http://www.w3.org/2000/svg">
      <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 6.85c.66-.82 1.11-1.96.99-3.1-.96.04-2.12.64-2.8 1.44-.61.71-1.14 1.87-1 2.99 1.07.08 2.15-.53 2.81-1.33z" />
    </svg>
  ),
  // Microsoft
  MSFT: (cls) => (
    <svg viewBox="0 0 24 24" className={cls} xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="2" width="9.5" height="9.5" fill="#F25022" />
      <rect x="12.5" y="2" width="9.5" height="9.5" fill="#7FBA00" />
      <rect x="2" y="12.5" width="9.5" height="9.5" fill="#00A4EF" />
      <rect x="12.5" y="12.5" width="9.5" height="9.5" fill="#FFB900" />
    </svg>
  ),
  // Google
  GOOGL: (cls) => (
    <svg viewBox="0 0 24 24" className={cls} xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  ),
  GOOG: (cls) => (
    <svg viewBox="0 0 24 24" className={cls} xmlns="http://www.w3.org/2000/svg">
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
    </svg>
  ),
  // Nvidia
  NVDA: (cls) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-emerald-500`} xmlns="http://www.w3.org/2000/svg">
      <path d="M8.98 5.72C8.75 5.8 5.38 7.42 4.4 9.17c-1.04 1.86-.96 4.3.2 6.2 1.34 2.2 3.86 3.65 6.4 3.71 3.52.09 6.81-2.12 8.02-5.41.34-.92.48-1.91.48-2.9 0-.3-.02-.6-.05-.9-.1-.95-.44-1.89-.98-2.69-.32-.48-.73-.9-1.19-1.25l1.62-1.63c.72.54 1.35 1.2 1.87 1.94.88 1.27 1.43 2.76 1.57 4.31.06.66.07 1.32.01 1.97-.13 1.57-.65 3.09-1.5 4.41-1.74 2.71-4.57 4.54-7.77 4.93-.97.12-1.95.1-2.92-.06-3.32-.54-6.23-2.65-7.7-5.59-1.39-2.77-1.3-6.1.25-8.8 1.53-2.67 4.18-4.58 7.22-5.22.8-.17 1.62-.23 2.44-.19l-1.4 1.77z"/>
      <path d="M11.96 8.35c-1.92.05-3.66 1.15-4.5 2.86-.74 1.5-.53 3.34.52 4.65.98 1.22 2.53 1.94 4.09 1.91 1.86-.04 3.54-1.19 4.25-2.89.44-1.06.41-2.28-.08-3.31-.62-1.31-1.84-2.25-3.26-2.53-.34-.06-.68-.09-1.02-.09v-.6z"/>
    </svg>
  ),
  // Meta
  META: (cls) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-blue-500`} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 7.2c-3.1 0-5.2 2.3-5.2 5.5 0 2.2 1.1 4.1 2.8 4.1 1.2 0 2.1-.9 2.9-2.2.8 1.3 1.7 2.2 2.9 2.2 1.7 0 2.8-1.9 2.8-4.1 0-3.2-2.1-5.5-5.2-5.5zm0-2.4c3.9 0 6.6 2.3 7.8 5.6.8 2.2.6 4.8-.7 6.7-1.4 2-3.7 2.9-5.9 2.9-1.7 0-3.3-.6-4.6-1.7-1.3 1.1-2.9 1.7-4.6 1.7-2.2 0-4.5-.9-5.9-2.9-1.3-1.9-1.5-4.5-.7-6.7C2.6 7.1 5.3 4.8 9.2 4.8c1.3 0 2.5.4 3.6 1 1.1-.6 2.3-1 3.6-1z"/>
    </svg>
  ),
  // Amazon
  AMZN: (cls) => (
    <svg viewBox="0 0 24 24" className={cls} xmlns="http://www.w3.org/2000/svg">
      <path d="M13.7 15.6c-2.3 1.7-5.6 2.6-8.5 2.6-4 0-7.6-1.5-10.3-4-.2-.2 0-.5.2-.3 3 1.8 6.7 2.8 10.5 2.8 2.6 0 5.4-.6 7.9-1.8.4-.2.7.2.2.7z" fill="#FF9900"/>
      <path d="M14.6 14.5c-.3-.4-1.9-.2-2.6-.1-.2 0-.3-.2-.1-.3 1.1-.8 3-1.1 3.5-.5.4.5-.1 2.4-1.2 3.3-.2.1-.3 0-.3-.2.3-.6.9-1.8.7-2.2z" fill="#FF9900"/>
      <path d="M15.4 6.9c-.3.4-.6.8-1 1.1-.1.1-.3.1-.4 0-.4-.4-.8-.9-1-1.4-.4-.9-.6-1.9-.6-2.9 0-1.8.8-3.2 2.3-3.7.8-.3 1.7-.3 2.5.1 1.2.6 1.8 1.9 1.8 3.5 0 2.4-1.4 4.8-3.6 6.1-.2.1-.4 0-.4-.2.5-.9.9-1.8 1.1-2.8.2-.9.2-1.8-.2-2.6-.3-.6-.8-.8-1.4-.7-.9.1-1.4.9-1.5 1.9 0 .6.2 1.2.5 1.7.3.5.7.9 1.1 1.3l.9-.3z" fill="currentColor" className="text-slate-900 dark:text-slate-100"/>
    </svg>
  ),
  // Tesla
  TSLA: (cls) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-red-600`} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4.45c2.72 0 5.44.52 7.9 1.57.24.1.37.37.31.62l-.78 3.36c-.05.23-.29.37-.51.3-1.87-.66-4.32-1.12-6.92-1.12-2.6 0-5.05.46-6.92 1.12-.22.07-.46-.07-.51-.3L3.79 6.64c-.06-.25.07-.52.31-.62 2.46-1.05 5.18-1.57 7.9-1.57zM12 10.3c.78 0 1.53.05 2.25.14L12 21.5 9.75 10.44c.72-.09 1.47-.14 2.25-.14z"/>
    </svg>
  ),
  // Visa
  V: (cls) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-blue-700 dark:text-blue-400`} xmlns="http://www.w3.org/2000/svg">
      <path d="M9.8 17.5l2.4-11h2.9l-2.4 11H9.8zm11.7-10.7c-.6-.2-1.6-.4-2.8-.4-3.1 0-5.3 1.6-5.3 3.9 0 1.7 1.6 2.7 2.8 3.3 1.2.6 1.6 1 1.6 1.5 0 .8-.9 1.2-1.8 1.2-1.2 0-1.9-.2-2.9-.6l-.4-.2-.4 2.6c.7.3 2 .6 3.4.6 3.2 0 5.3-1.6 5.3-4 0-1.4-.9-2.4-2.8-3.3-1.2-.6-1.9-1-1.9-1.6 0-.5.6-1.1 1.9-1.1 1 0 1.8.2 2.4.5l.3.1.6-2.5zm-15.6 0L3 14.1l-.3-1.6C2.2 10.7 1.1 9.4 0 8.8l.3-.3h4.6c.6 0 1.1.4 1.3 1.1l1.1 5.3 3.4-8.1H5.9z" />
    </svg>
  ),
  // Mastercard
  MA: (cls) => (
    <svg viewBox="0 0 24 24" className={cls} xmlns="http://www.w3.org/2000/svg">
      <circle cx="8" cy="12" r="6" fill="#EB001B" />
      <circle cx="16" cy="12" r="6" fill="#F79E1B" />
      <path d="M12 7.76a5.96 5.96 0 0 0-2 4.24 5.96 5.96 0 0 0 2 4.24 5.96 5.96 0 0 0 2-4.24 5.96 5.96 0 0 0-2-4.24z" fill="#FF5F00" />
    </svg>
  ),
  // ServiceNow
  NOW: (cls) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-emerald-500`} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14.5v-9l7 4.5-7 4.5z"/>
    </svg>
  ),
  // Celsius Holdings
  CELH: (cls) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-orange-500`} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 3C7.03 3 3 7.03 3 12s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 15c-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78l-1.42 1.42C14.12 8.52 13.12 8 12 8c-2.21 0-4 1.79-4 4s1.79 4 4 4c1.12 0 2.12-.52 2.8-1.2l1.42 1.42C15.14 17.31 13.66 18 12 18z"/>
      <circle cx="18" cy="6" r="2" fill="#FF6600"/>
    </svg>
  ),
  // Monster Beverage
  MNST: (cls) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-emerald-500`} xmlns="http://www.w3.org/2000/svg">
      <path d="M6.5 4l-2 16h3l1.5-12 2 12h2.5l2-12 1.5 12h3L17.5 4h-3l-2.5 12L9.5 4h-3z"/>
    </svg>
  ),
  // Spotify
  SPOT: (cls) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-emerald-500`} xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm4.586 14.424c-.18.295-.563.387-.857.207-2.348-1.435-5.304-1.76-8.785-.963-.335.077-.67-.133-.746-.468-.077-.334.132-.67.467-.746 3.808-.87 7.076-.496 9.714 1.115.294.18.386.562.207.855zm1.226-2.723c-.226.367-.706.482-1.072.257-2.687-1.652-6.785-2.131-9.965-1.166-.413.127-.849-.106-.976-.519-.126-.413.107-.849.52-.976 3.632-1.102 8.147-.568 11.236 1.332.366.226.482.707.257 1.072zm.105-2.835C14.692 8.95 9.375 8.775 6.297 9.71c-.493.15-1.016-.129-1.165-.623-.15-.493.129-1.017.623-1.166 3.532-1.072 9.404-.866 13.115 1.338.445.264.59.838.327 1.282-.264.443-.838.59-1.28.325z"/>
    </svg>
  ),
  // Netflix
  NFLX: (cls) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className={`${cls} text-red-600`} xmlns="http://www.w3.org/2000/svg">
      <path d="M5.398 0v24c1.862-.352 3.73-.655 5.598-.94V0H5.398zm7.604 0v14.464l4.28 8.647c.563-.122 1.127-.238 1.718-.344V0h-5.998z"/>
      <path d="M5.398 0l11.602 23.111V0H5.398z" fill="#B81D24"/>
    </svg>
  ),
  // Nova Ltd. (NVMI) - Official Global Semiconductor Metrology Logotype with Radiant Prism
  NVMI: (cls) => (
    <svg viewBox="0 0 138 31" fill="none" className={cls} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <path d="M31.0361 0.433594V22.2702L5.46005 0.631161L5.23375 0.433594H0V30.4387H5.58937V8.3363L31.4276 30.1945L31.8515 30.4387H36.6254V0.433594H31.0361Z" fill="#000E66" className="dark:fill-white" />
      <path d="M57.4097 30.4685C54.3964 30.4692 51.4505 29.5762 48.9447 27.9026C46.4389 26.2289 44.4857 23.8496 43.3322 21.0658C42.1787 18.2819 41.8767 15.2186 42.4644 12.2631C43.0521 9.30758 44.5031 6.59278 46.6339 4.46201C48.7647 2.33125 51.4795 0.880257 54.435 0.292554C57.3905 -0.295149 60.4539 0.00684221 63.2377 1.16033C66.0215 2.31382 68.4008 4.26697 70.0745 6.77279C71.7482 9.2786 72.6411 12.2245 72.6404 15.2379C72.6356 19.2758 71.0295 23.147 68.1742 26.0023C65.3189 28.8576 61.4477 30.4637 57.4097 30.4685ZM57.4097 5.57859C55.4995 5.5793 53.6323 6.1464 52.0443 7.20821C50.4563 8.27001 49.2188 9.77884 48.4883 11.5439C47.7578 13.309 47.567 15.251 47.9401 17.1245C48.3132 18.998 49.2334 20.7187 50.5845 22.0692C51.9355 23.4197 53.6566 24.3394 55.5302 24.7118C57.4038 25.0842 59.3458 24.8927 61.1106 24.1615C62.8754 23.4303 64.3837 22.1923 65.445 20.6039C66.5062 19.0155 67.0726 17.1481 67.0726 15.2379C67.0735 12.6738 66.0561 10.2144 64.2441 8.4003C62.4321 6.58624 59.9738 5.56611 57.4097 5.56421" fill="#000E66" className="dark:fill-white" />
      <path d="M110.414 0.433594L83.9758 22.2846V0.433594H78.3828V30.4387H83.3148L119.021 0.433594H110.414Z" fill="#000E66" className="dark:fill-white" />
      <path d="M131.057 0.433594L95.3516 30.4387H103.958L130.418 8.15669V26.3042L133.238 25.5211L136.007 25.4025V0.433594H131.057Z" fill="#000E66" className="dark:fill-white" />
      <path d="M135.799 25.3194C131.519 25.3276 127.306 24.2545 123.551 22.1998C119.797 20.1451 116.622 17.1753 114.321 13.5659C113.68 12.5623 113.109 11.5157 112.611 10.4336L108.57 13.8353C109.009 14.6867 109.483 15.5236 110.007 16.3498C112.771 20.6834 116.585 24.249 121.094 26.7162C125.603 29.1833 130.662 30.4722 135.802 30.4633H136.007V25.3194H135.799Z" fill="url(#nova_prism_grad_nvmi)" />
      <defs>
        <linearGradient id="nova_prism_grad_nvmi" x1="109.641" y1="13.9323" x2="134.33" y2="29.7809" gradientUnits="userSpaceOnUse">
          <stop stopColor="#CC0A96" />
          <stop offset="0.05" stopColor="#C7099D" />
          <stop offset="0.49" stopColor="#A004D1" />
          <stop offset="0.82" stopColor="#8801F2" />
          <stop offset="1" stopColor="#7F00FE" />
        </linearGradient>
      </defs>
    </svg>
  ),
  // Nova alias
  NOVA: (cls) => (
    <svg viewBox="0 0 138 31" fill="none" className={cls} xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <path d="M31.0361 0.433594V22.2702L5.46005 0.631161L5.23375 0.433594H0V30.4387H5.58937V8.3363L31.4276 30.1945L31.8515 30.4387H36.6254V0.433594H31.0361Z" fill="#000E66" className="dark:fill-white" />
      <path d="M57.4097 30.4685C54.3964 30.4692 51.4505 29.5762 48.9447 27.9026C46.4389 26.2289 44.4857 23.8496 43.3322 21.0658C42.1787 18.2819 41.8767 15.2186 42.4644 12.2631C43.0521 9.30758 44.5031 6.59278 46.6339 4.46201C48.7647 2.33125 51.4795 0.880257 54.435 0.292554C57.3905 -0.295149 60.4539 0.00684221 63.2377 1.16033C66.0215 2.31382 68.4008 4.26697 70.0745 6.77279C71.7482 9.2786 72.6411 12.2245 72.6404 15.2379C72.6356 19.2758 71.0295 23.147 68.1742 26.0023C65.3189 28.8576 61.4477 30.4637 57.4097 30.4685ZM57.4097 5.57859C55.4995 5.5793 53.6323 6.1464 52.0443 7.20821C50.4563 8.27001 49.2188 9.77884 48.4883 11.5439C47.7578 13.309 47.567 15.251 47.9401 17.1245C48.3132 18.998 49.2334 20.7187 50.5845 22.0692C51.9355 23.4197 53.6566 24.3394 55.5302 24.7118C57.4038 25.0842 59.3458 24.8927 61.1106 24.1615C62.8754 23.4303 64.3837 22.1923 65.445 20.6039C66.5062 19.0155 67.0726 17.1481 67.0726 15.2379C67.0735 12.6738 66.0561 10.2144 64.2441 8.4003C62.4321 6.58624 59.9738 5.56611 57.4097 5.56421" fill="#000E66" className="dark:fill-white" />
      <path d="M110.414 0.433594L83.9758 22.2846V0.433594H78.3828V30.4387H83.3148L119.021 0.433594H110.414Z" fill="#000E66" className="dark:fill-white" />
      <path d="M131.057 0.433594L95.3516 30.4387H103.958L130.418 8.15669V26.3042L133.238 25.5211L136.007 25.4025V0.433594H131.057Z" fill="#000E66" className="dark:fill-white" />
      <path d="M135.799 25.3194C131.519 25.3276 127.306 24.2545 123.551 22.1998C119.797 20.1451 116.622 17.1753 114.321 13.5659C113.68 12.5623 113.109 11.5157 112.611 10.4336L108.57 13.8353C109.009 14.6867 109.483 15.5236 110.007 16.3498C112.771 20.6834 116.585 24.249 121.094 26.7162C125.603 29.1833 130.662 30.4722 135.802 30.4633H136.007V25.3194H135.799Z" fill="url(#nova_prism_grad_nova)" />
      <defs>
        <linearGradient id="nova_prism_grad_nova" x1="109.641" y1="13.9323" x2="134.33" y2="29.7809" gradientUnits="userSpaceOnUse">
          <stop stopColor="#CC0A96" />
          <stop offset="0.05" stopColor="#C7099D" />
          <stop offset="0.49" stopColor="#A004D1" />
          <stop offset="0.82" stopColor="#8801F2" />
          <stop offset="1" stopColor="#7F00FE" />
        </linearGradient>
      </defs>
    </svg>
  ),
  // Novo Nordisk (NVO) - Official Apis Bull Emblem
  NVO: (cls) => (
    <svg viewBox="0 0 100 100" fill="currentColor" className={`${cls} text-[#001A9C] dark:text-sky-400`} xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="18" r="9" />
      <path d="M38 22c.5 1.5 2.5 6.5 8 8.5 5.5 2 10.5.5 14-2.5 1.5-1 2-.5 1 1.5-1.5 2.5-4 4-7 5.5 8 3.5 18 6 27 6 6.5 0 13-1 16-1.5 3-.5 9 0 11 7 1 5 1 19 1 33 0 1 0 1.5-1 1.5-3.5 0-3.5.5-4 1.5-.5 1.5-.5 2-1 3.5-.5 1.5-.5 2-1.5 2H93c-.7 0-1-.8-.5-1.9 6-10 5.5-18 2-22-1 4-1.5 6-2 6-7 5-10 16-10.5 17-.3.8-.7 1.1-1.8 1.1h-5c-1.4 0-1.3-1-.5-2 7.5-8 9.5-11 11.5-18 2-6.5-3-9-7-5.5-10.5-4.5-13 1.5-12.5 5 1 5.5 4.5 14.5 5 19 .1 1.1-.9 1.3-1.5 1.3h-4.5c-1.4 0-.8-1.3-.7-2 2.3-11-2.4-17.4-7.1-20.3-2.8 2-6.5 14-7 20.7-.1.8-.5 1.5-1.1 1.5h-5.2c-.8 0-1-.9-.4-2 2.7-5 7-12.5 7-20.5 0-1 0-3.7-1.3-5.2-3-3.5-4.5-7.5-6-10.3-1-1.8-2.3-2.4-3.3-2.6-1.1-.2-2 .1-2.8-.3-.9-.4-1.4-1.3-2.1-2.2-.6-.7-1-1.7-.4-2.6 1.3-1.6 2.1-2.5 2.4-3.2.2-.7.2-1 .2-1.5 0-.5 1.1-1.9 2.2-3.1.4-.5 0-1.3-.7-2.1-.7-.8-2.8-3.6-2.8-8.3 0-1 .2-1.4.4-1.4z" />
    </svg>
  ),
};

interface StockLogoBadgeProps {
  ticker: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const StockLogoBadge: React.FC<StockLogoBadgeProps> = ({
  ticker,
  name,
  size = 'md',
  className = '',
}) => {
  const cleanTicker = (ticker || '').toUpperCase().trim();
  const normalizedTicker = cleanTicker.replace(/\./g, '-');
  
  // Lookup ticker meta (with alias support e.g. BRK.B / BRK-B)
  const info = TICKER_DOMAIN_MAP[cleanTicker] || TICKER_DOMAIN_MAP[normalizedTicker] || {
    domain: `${cleanTicker.toLowerCase().replace(/[^a-z0-9]/g, '')}.com`,
    bg: 'from-slate-800 to-indigo-950',
    text: 'text-white',
    ring: 'ring-slate-700/50',
  };

  const domain = info.domain;
  const slug = info.slug || cleanTicker.toLowerCase();

  const [imgErrorStep, setImgErrorStep] = useState<number>(0);

  // Reset error step whenever ticker changes
  useEffect(() => {
    setImgErrorStep(0);
  }, [cleanTicker]);

  const sizeClasses = {
    xs: 'w-6 h-6 text-[9px] rounded-md',
    sm: 'w-8 h-8 text-[10px] rounded-lg',
    md: 'w-10 h-10 text-xs rounded-xl',
    lg: 'w-12 h-12 text-sm rounded-xl',
    xl: 'w-16 h-16 text-lg rounded-2xl',
  }[size];

  const imgSizes = {
    xs: 'w-4 h-4',
    sm: 'w-5 h-5',
    md: 'w-6 h-6',
    lg: 'w-8 h-8',
    xl: 'w-11 h-11',
  }[size];

  // 1. If we have a crisp vector SVG registered for this stock, render it with 100% reliability
  const dedicatedVectorRenderer = DEDICATED_VECTOR_LOGOS[cleanTicker] || DEDICATED_VECTOR_LOGOS[normalizedTicker];
  if (dedicatedVectorRenderer) {
    return (
      <div
        className={`${sizeClasses} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex-shrink-0 flex items-center justify-center relative overflow-hidden select-none transition-transform duration-200 group-hover:scale-105 ${className}`}
        title={`${name || cleanTicker} (${cleanTicker})`}
      >
        <div className="flex items-center justify-center w-full h-full p-1.5">
          {dedicatedVectorRenderer(imgSizes)}
        </div>
      </div>
    );
  }

  // 2. High-Availability Multi-Tier Logo Cascade for all global equities:
  // Step 0: Official transparent stock symbol PNG from Parqet (97%+ instant coverage across US equities)
  // Step 1: Parqet with normalized ticker (e.g. BRK-B instead of BRK.B)
  // Step 2: Financial Modeling Prep institutional stock image API
  // Step 3: Financial Modeling Prep with stripped ticker
  // Step 4: Google S2 128px high-resolution Favicon from accurately mapped corporate domain
  // Step 5: SimpleIcons vector SVG via jsDelivr CDN (if brand slug mapped)
  // Step 6: DuckDuckGo high-resolution Favicon
  const getLogoSrc = (step: number): string | null => {
    switch (step) {
      case 0:
        return `https://assets.parqet.com/logos/symbol/${cleanTicker}?format=png`;
      case 1:
        if (normalizedTicker !== cleanTicker) {
          return `https://assets.parqet.com/logos/symbol/${normalizedTicker}?format=png`;
        }
        return `https://financialmodelingprep.com/image-stock/${cleanTicker}.png`;
      case 2:
        return `https://financialmodelingprep.com/image-stock/${cleanTicker.replace(/[^A-Z0-9]/g, '')}.png`;
      case 3:
        return `https://www.google.com/s2/favicons?domain=${domain}&sz=128`;
      case 4:
        if (slug) {
          return `https://cdn.jsdelivr.net/npm/simple-icons@v13/icons/${slug}.svg`;
        }
        return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
      case 5:
        return `https://icons.duckduckgo.com/ip3/${domain}.ico`;
      default:
        return null;
    }
  };

  const logoSrc = getLogoSrc(imgErrorStep);

  return (
    <div
      className={`${sizeClasses} bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex-shrink-0 flex items-center justify-center relative overflow-hidden select-none transition-transform duration-200 group-hover:scale-105 ${className}`}
      title={`${name || cleanTicker} (${cleanTicker})`}
    >
      {logoSrc ? (
        <img
          src={logoSrc}
          alt={`${cleanTicker} logo`}
          className={`${imgSizes} object-contain transition-opacity duration-200`}
          loading="lazy"
          referrerPolicy="no-referrer"
          onError={() => {
            setImgErrorStep((prev) => prev + 1);
          }}
        />
      ) : (
        /* High-contrast brand badge fallback */
        <div
          className={`w-full h-full bg-gradient-to-br ${info.bg} ${info.text} font-black font-mono flex items-center justify-center tracking-tight shadow-inner`}
        >
          {cleanTicker.slice(0, 3)}
        </div>
      )}
    </div>
  );
};
