import React, { useState } from 'react';
import { Copy, Check, Code } from 'lucide-react';
import { TranslationResult } from '../types';
import { useTheme } from '../context/ThemeContext';

interface JsonViewerProps {
  data: TranslationResult;
}

export const JsonViewer: React.FC<JsonViewerProps> = ({ data }) => {
  const { theme, styles } = useTheme();
  const [copied, setCopied] = useState(false);

  const formattedJson = JSON.stringify(data, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJson);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden border-2 ${styles.border} ${styles.bgInput} font-mono text-xs shadow-inner`}>
      <div className={`flex items-center justify-between px-4 py-2.5 ${theme === 'black-gold' ? 'bg-[#06070A]' : 'bg-[#0B132B]'} border-b ${styles.border} ${styles.textSecondary}`}>
        <div className="flex items-center gap-2">
          <Code className={`w-3.5 h-3.5 ${styles.textPrimary}`} />
          <span className={`font-semibold ${styles.textPrimary}`}>Định dạng JSON chuẩn</span>
          <span className={`text-[10px] px-2 py-0.5 rounded-full ${styles.bgCardSubtle} ${styles.textLight} border ${styles.border}`}>application/json</span>
        </div>
        <button
          type="button"
          onClick={handleCopy}
          className={`flex items-center gap-1.5 px-3 py-1 ${styles.textLight} hover:${styles.textPrimary} ${styles.bgCardSubtle} hover:${styles.bgElevated} border ${styles.border} rounded-full transition-colors font-medium text-[11px] cursor-pointer`}
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400">Đã sao chép!</span>
            </>
          ) : (
            <>
              <Copy className={`w-3 h-3 ${styles.textSecondary}`} />
              <span>Sao chép JSON</span>
            </>
          )}
        </button>
      </div>

      <div className={`p-4 overflow-x-auto ${styles.textLight} leading-relaxed`}>
        <pre className="text-xs">
          <code>
            {`{\n`}
            <span className={styles.textPrimary}>  "original"</span>: <span className={styles.textLight}>"{data.original}"</span>,{`\n`}
            <span className={styles.textPrimary}>  "meaning_vi"</span>: <span className={styles.textLight}>"{data.meaning_vi}"</span>,{`\n`}
            <span className={styles.textPrimary}>  "ipa"</span>: <span className={styles.textSecondary}>"{data.ipa}"</span>,{`\n`}
            <span className={styles.textPrimary}>  "vi_transliteration"</span>: <span className={`${styles.translitText} font-bold`}>"{data.vi_transliteration}"</span>{`\n`}
            {`}`}
          </code>
        </pre>
      </div>
    </div>
  );
};
