"use client";

import { Github } from "lucide-react";

export default function Footer() {
  return (
    <footer className=" py-6 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
          <span>Feito por</span>
          <a 
            href="https://github.com/skaduhs5232" 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
          >
            <Github size={16} />
            Thiago de Oliveira
          </a>
        </div>
      </div>
    </footer>
  );
}
