'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  List,
  ListOrdered,
  CheckSquare,
  Quote,
  FileCode,
  Minus,
  Table as TableIcon,
  Link as LinkIcon,
  Image as ImageIcon,
  PenLine,
  Eye,
  Columns,
  Sparkles,
  HelpCircle,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  Info,
  AlertTriangle,
  Lightbulb,
} from 'lucide-react';

export interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  minHeight?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  helperText?: string;
  onUploadImage?: (file: File) => Promise<string | null>;
}

export default function RichTextEditor({
  value = '',
  onChange,
  placeholder = 'Nhập nội dung chi tiết... (hỗ trợ định dạng Rich Text & Markdown)',
  label,
  minHeight = 'min-h-[180px]',
  required = false,
  disabled = false,
  className = '',
  helperText,
  onUploadImage,
}: RichTextEditorProps) {
  const [mode, setMode] = useState<'write' | 'preview' | 'split'>('write');
  const [showHelp, setShowHelp] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Auto-resize or keep height
  const stats = React.useMemo(() => {
    const text = (value || '').trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const chars = (value || '').length;
    const lines = (value || '').split('\n').length;
    const readMinutes = Math.max(1, Math.ceil(words / 200));
    return { words, chars, lines, readMinutes };
  }, [value]);

  // Insert markdown wrapper helper
  const insertFormatting = useCallback(
    (prefix: string, suffix: string = '', defaultText: string = 'văn bản') => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const current = value || '';
      const selected = current.substring(start, end) || defaultText;
      const replacement = `${prefix}${selected}${suffix}`;

      const nextVal = current.substring(0, start) + replacement + current.substring(end);
      onChange(nextVal);

      // Restore selection
      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(
          start + prefix.length,
          start + prefix.length + selected.length,
        );
      }, 0);
    },
    [value, onChange],
  );

  // Line prefix helper (for lists, quotes, headings)
  const insertLinePrefix = useCallback(
    (linePrefix: string) => {
      const textarea = textareaRef.current;
      if (!textarea) return;

      const start = textarea.selectionStart;
      const current = value || '';
      const lastNewline = current.lastIndexOf('\n', start - 1);
      const lineStart = lastNewline === -1 ? 0 : lastNewline + 1;

      const nextVal =
        current.substring(0, lineStart) + linePrefix + current.substring(lineStart);
      onChange(nextVal);

      setTimeout(() => {
        textarea.focus();
        textarea.setSelectionRange(start + linePrefix.length, start + linePrefix.length);
      }, 0);
    },
    [value, onChange],
  );

  // Insert Link Modal / Prompt
  const handleInsertLink = () => {
    const url = window.prompt('Nhập đường dẫn URL (Link):', 'https://');
    if (!url) return;
    const textarea = textareaRef.current;
    const selected =
      textarea && textarea.selectionStart !== textarea.selectionEnd
        ? (value || '').substring(textarea.selectionStart, textarea.selectionEnd)
        : 'Liên kết';
    insertFormatting('[', `](${url})`, selected);
  };

  // Insert Table template
  const handleInsertTable = () => {
    const tableTemplate = `\n| Tiêu đề 1 | Tiêu đề 2 | Tiêu đề 3 |\n| :--- | :---: | ---: |\n| Dữ liệu A | Dữ liệu B | Dữ liệu C |\n| Dữ liệu D | Dữ liệu E | Dữ liệu F |\n\n`;
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange((value || '') + tableTemplate);
      return;
    }
    const start = textarea.selectionStart;
    const current = value || '';
    const nextVal = current.substring(0, start) + tableTemplate + current.substring(start);
    onChange(nextVal);
  };

  // Insert Callout Box
  const handleInsertCallout = (type: 'NOTE' | 'TIP' | 'WARNING') => {
    const callouts = {
      NOTE: `\n> [!NOTE]\n> **Ghi chú quan trọng**: Nhập nội dung lưu ý tại đây.\n\n`,
      TIP: `\n> [!TIP]\n> **Mẹo hữu ích**: Nhập mẹo học tập hoặc thao tác tại đây.\n\n`,
      WARNING: `\n> [!WARNING]\n> **Cảnh báo**: Nhập lưu ý cảnh giác hoặc điều kiện bắt buộc.\n\n`,
    };
    const template = callouts[type];
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange((value || '') + template);
      return;
    }
    const start = textarea.selectionStart;
    const current = value || '';
    const nextVal = current.substring(0, start) + template + current.substring(start);
    onChange(nextVal);
  };

  // Handle local image upload via hook
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (onUploadImage) {
      setUploadingImage(true);
      try {
        const uploadedUrl = await onUploadImage(file);
        if (uploadedUrl) {
          const imgMarkdown = `\n\n![${file.name.replace(/\.[^/.]+$/, '')}](${uploadedUrl})\n\n`;
          insertFormatting(imgMarkdown, '', '');
        }
      } catch (err) {
        console.error('Lỗi tải ảnh:', err);
      } finally {
        setUploadingImage(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
      }
    } else {
      // Fallback: prompt for URL
      const imgUrl = window.prompt('Nhập đường dẫn ảnh trực tuyến (Image URL):', 'https://');
      if (imgUrl) {
        insertFormatting(`\n\n![Mô tả ảnh](`, `${imgUrl})\n\n`, '');
      }
    }
  };

  // Keyboard shortcut listener
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      insertFormatting('**', '**', 'in đậm');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      insertFormatting('*', '*', 'in nghiêng');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      insertFormatting('<u>', '</u>', 'gạch chân');
    } else if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      handleInsertLink();
    } else if (e.key === 'Tab') {
      e.preventDefault();
      insertFormatting('  ', '', '');
    }
  };

  // Markdown HTML Converter for Live Preview
  const renderPreview = (content: string) => {
    if (!content.trim()) {
      return (
        <div className="py-12 text-center text-slate-400 text-xs italic">
          Chưa có nội dung xem trước. Hãy nhập nội dung ở tab Soạn thảo.
        </div>
      );
    }

    // Process blocks
    const lines = content.replace(/\r\n/g, '\n').split('\n');
    const elements: React.ReactNode[] = [];
    let inList = false;
    let listType: 'ul' | 'ol' = 'ul';
    let listItems: string[] = [];
    let inTable = false;
    let tableRows: string[][] = [];

    const flushList = () => {
      if (listItems.length > 0) {
        const items = listItems.map((item, idx) => (
          <li key={idx} className="leading-relaxed">
            {formatInline(item)}
          </li>
        ));
        if (listType === 'ol') {
          elements.push(
            <ol key={`ol-${elements.length}`} className="list-decimal list-inside space-y-1 my-2 text-slate-700 pl-2">
              {items}
            </ol>,
          );
        } else {
          elements.push(
            <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2 text-slate-700 pl-2">
              {items}
            </ul>,
          );
        }
        listItems = [];
      }
      inList = false;
    };

    const flushTable = () => {
      if (tableRows.length > 0) {
        const header = tableRows[0];
        const body = tableRows.slice(1).filter((r) => !r.every((c) => c.match(/^[:\s-]+$/)));
        elements.push(
          <div key={`table-${elements.length}`} className="overflow-x-auto my-3 border border-slate-200 rounded-xl">
            <table className="w-full text-xs text-left text-slate-700 border-collapse">
              <thead className="bg-slate-100 text-slate-800 font-extrabold uppercase text-[11px] border-b border-slate-200">
                <tr>
                  {header.map((col, idx) => (
                    <th key={idx} className="px-3.5 py-2.5 border-r border-slate-200 last:border-r-0">
                      {formatInline(col.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {body.map((row, rIdx) => (
                  <tr key={rIdx} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    {row.map((cell, cIdx) => (
                      <td key={cIdx} className="px-3.5 py-2 border-r border-slate-100 last:border-r-0">
                        {formatInline(cell.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>,
        );
        tableRows = [];
      }
      inTable = false;
    };

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];

      // Table row
      if (line.trim().startsWith('|') && line.trim().endsWith('|')) {
        flushList();
        inTable = true;
        const cols = line
          .trim()
          .slice(1, -1)
          .split('|')
          .map((c) => c.trim());
        tableRows.push(cols);
        continue;
      } else if (inTable) {
        flushTable();
      }

      // Heading 1
      if (line.startsWith('# ')) {
        flushList();
        elements.push(
          <h1 key={i} className="text-xl sm:text-2xl font-black text-slate-900 mt-4 mb-2 pb-1 border-b border-slate-200">
            {formatInline(line.replace(/^#\s+/, ''))}
          </h1>,
        );
        continue;
      }

      // Heading 2
      if (line.startsWith('## ')) {
        flushList();
        elements.push(
          <h2 key={i} className="text-lg sm:text-xl font-black text-slate-900 mt-3 mb-2">
            {formatInline(line.replace(/^##\s+/, ''))}
          </h2>,
        );
        continue;
      }

      // Heading 3
      if (line.startsWith('### ')) {
        flushList();
        elements.push(
          <h3 key={i} className="text-base sm:text-lg font-bold text-slate-900 mt-2 mb-1.5">
            {formatInline(line.replace(/^###\s+/, ''))}
          </h3>,
        );
        continue;
      }

      // Callout box: Note, Tip, Warning
      if (line.startsWith('> [!NOTE]') || line.startsWith('> [!TIP]') || line.startsWith('> [!WARNING]')) {
        flushList();
        const type = line.includes('NOTE') ? 'NOTE' : line.includes('TIP') ? 'TIP' : 'WARNING';
        const nextLines: string[] = [];
        let j = i + 1;
        while (j < lines.length && lines[j].startsWith('>')) {
          nextLines.push(lines[j].replace(/^>\s?/, ''));
          j++;
        }
        i = j - 1;

        const badgeStyle =
          type === 'NOTE'
            ? 'bg-sky-50 border-sky-300 text-sky-900'
            : type === 'TIP'
            ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
            : 'bg-amber-50 border-amber-300 text-amber-900';

        const Icon = type === 'NOTE' ? Info : type === 'TIP' ? Lightbulb : AlertTriangle;

        elements.push(
          <div key={`callout-${i}`} className={`p-3.5 my-3 rounded-2xl border-l-4 ${badgeStyle} space-y-1 shadow-2xs`}>
            <div className="flex items-center gap-2 font-black text-xs uppercase tracking-wider">
              <Icon className="w-4 h-4 shrink-0" />
              <span>{type === 'NOTE' ? 'Ghi Chú' : type === 'TIP' ? 'Mẹo Thực Hành' : 'Lưu Ý Quan Trọng'}</span>
            </div>
            <div className="text-xs leading-relaxed">
              {nextLines.map((nl, idx) => (
                <p key={idx}>{formatInline(nl)}</p>
              ))}
            </div>
          </div>,
        );
        continue;
      }

      // Standard Blockquote
      if (line.startsWith('> ')) {
        flushList();
        elements.push(
          <blockquote key={i} className="border-l-4 border-slate-300 pl-3.5 py-1 my-2 text-slate-600 italic text-xs sm:text-sm bg-slate-50/70 rounded-r-xl">
            {formatInline(line.replace(/^>\s+/, ''))}
          </blockquote>,
        );
        continue;
      }

      // Horizontal Rule
      if (line.trim() === '---' || line.trim() === '***') {
        flushList();
        elements.push(<hr key={i} className="my-4 border-slate-200" />);
        continue;
      }

      // Image: ![alt](url)
      const imgMatch = line.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        flushList();
        elements.push(
          <div key={i} className="my-3 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imgMatch[2]}
              alt={imgMatch[1] || 'Hình ảnh minh họa'}
              className="max-h-80 mx-auto rounded-2xl border border-slate-200 shadow-sm object-cover"
              loading="lazy"
            />
            {imgMatch[1] && <p className="text-[11px] text-slate-400 mt-1 italic">{imgMatch[1]}</p>}
          </div>,
        );
        continue;
      }

      // Bullet List item
      if (line.match(/^[-*]\s+/)) {
        if (!inList || listType !== 'ul') {
          flushList();
          inList = true;
          listType = 'ul';
        }
        listItems.push(line.replace(/^[-*]\s+/, ''));
        continue;
      }

      // Numbered List item
      if (line.match(/^\d+\.\s+/)) {
        if (!inList || listType !== 'ol') {
          flushList();
          inList = true;
          listType = 'ol';
        }
        listItems.push(line.replace(/^\d+\.\s+/, ''));
        continue;
      }

      // Checkbox list
      if (line.match(/^-\s+\[([ xX])\]\s+/)) {
        flushList();
        const checked = line.includes('[x]') || line.includes('[X]');
        const labelText = line.replace(/^-\s+\[([ xX])\]\s+/, '');
        elements.push(
          <div key={i} className="flex items-center gap-2 my-1 text-xs text-slate-700">
            <input type="checkbox" checked={checked} readOnly className="rounded text-[#1B64B0]" />
            <span className={checked ? 'line-through text-slate-400' : ''}>{formatInline(labelText)}</span>
          </div>,
        );
        continue;
      }

      // Regular Paragraph
      flushList();
      if (line.trim().length > 0) {
        elements.push(
          <p key={i} className="text-xs sm:text-sm text-slate-700 leading-relaxed my-1.5">
            {formatInline(line)}
          </p>,
        );
      }
    }

    flushList();
    flushTable();

    return elements;
  };

  // Helper for inline styles (bold, italic, code, links)
  const formatInline = (text: string): React.ReactNode => {
    if (!text) return null;

    // Replace Markdown links: [text](url)
    const linkRegex = /\[(.*?)\]\((https?:\/\/[^\s)]+)\)/g;
    const parts: React.ReactNode[] = [];
    let lastIdx = 0;
    let match;

    while ((match = linkRegex.exec(text)) !== null) {
      if (match.index > lastIdx) {
        parts.push(renderBasicInline(text.substring(lastIdx, match.index)));
      }
      parts.push(
        <a
          key={`link-${match.index}`}
          href={match[2]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#1B64B0] underline font-semibold hover:text-[#154E8A]"
        >
          {match[1]}
        </a>,
      );
      lastIdx = match.index + match[0].length;
    }

    if (lastIdx < text.length) {
      parts.push(renderBasicInline(text.substring(lastIdx)));
    }

    return parts.length > 0 ? parts : renderBasicInline(text);
  };

  const renderBasicInline = (raw: string): React.ReactNode => {
    // Simple regex replacements for bold, italic, code, underline
    // Split by tags
    const tokens = raw.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`|~~.*?~~|<u>.*?<\/u>)/g);
    return tokens.map((token, idx) => {
      if (token.startsWith('**') && token.endsWith('**')) {
        return <strong key={idx} className="font-black text-slate-900">{token.slice(2, -2)}</strong>;
      }
      if (token.startsWith('*') && token.endsWith('*')) {
        return <em key={idx} className="italic text-slate-800">{token.slice(1, -1)}</em>;
      }
      if (token.startsWith('`') && token.endsWith('`')) {
        return (
          <code key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 text-pink-600 font-mono text-[11px] border border-slate-200">
            {token.slice(1, -1)}
          </code>
        );
      }
      if (token.startsWith('~~') && token.endsWith('~~')) {
        return <del key={idx} className="line-through text-slate-400">{token.slice(2, -2)}</del>;
      }
      if (token.startsWith('<u>') && token.endsWith('</u>')) {
        return <u key={idx} className="underline">{token.slice(3, -4)}</u>;
      }
      return token;
    });
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      {/* Label & Mode Toggles */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        {label ? (
          <label className="text-xs font-black text-slate-700 flex items-center gap-1">
            <span>{label}</span>
            {required && <span className="text-rose-500">*</span>}
          </label>
        ) : (
          <div />
        )}

        <div className="flex items-center gap-1 p-0.5 bg-slate-100 rounded-xl border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setMode('write')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
              mode === 'write' ? 'bg-white text-[#1B64B0] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <PenLine className="w-3.5 h-3.5" />
            <span>Soạn thảo</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('preview')}
            className={`px-2.5 py-1 rounded-lg font-bold transition flex items-center gap-1 cursor-pointer ${
              mode === 'preview' ? 'bg-white text-[#1B64B0] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Xem trước</span>
          </button>
          <button
            type="button"
            onClick={() => setMode('split')}
            className={`hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg font-bold transition cursor-pointer ${
              mode === 'split' ? 'bg-white text-[#1B64B0] shadow-2xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Song song</span>
          </button>
        </div>
      </div>

      {/* Editor Container */}
      <div className="border border-slate-200 rounded-2xl bg-white shadow-2xs overflow-hidden focus-within:border-[#1B64B0] focus-within:ring-2 focus-within:ring-[#1B64B0]/15 transition-all">
        {/* Toolbar */}
        {mode !== 'preview' && (
          <div className="flex flex-wrap items-center gap-0.5 sm:gap-1 p-2 bg-slate-50 border-b border-slate-200 text-slate-700 select-none">
            {/* Headings */}
            <button
              type="button"
              onClick={() => insertLinePrefix('# ')}
              className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition"
              title="Tiêu đề chính (H1)"
            >
              <Heading1 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix('## ')}
              className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition"
              title="Tiêu đề cấp 2 (H2)"
            >
              <Heading2 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix('### ')}
              className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition"
              title="Tiêu đề cấp 3 (H3)"
            >
              <Heading3 className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-300 mx-1" />

            {/* Inline Formatting */}
            <button
              type="button"
              onClick={() => insertFormatting('**', '**', 'in đậm')}
              className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition"
              title="In đậm (Ctrl+B)"
            >
              <Bold className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('*', '*', 'in nghiêng')}
              className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition"
              title="In nghiêng (Ctrl+I)"
            >
              <Italic className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('<u>', '</u>', 'gạch chân')}
              className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition"
              title="Gạch chân (Ctrl+U)"
            >
              <Underline className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('~~', '~~', 'gạch ngang')}
              className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition"
              title="Gạch ngang"
            >
              <Strikethrough className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertFormatting('`', '`', 'mã inline')}
              className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition"
              title="Code inline"
            >
              <Code className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-300 mx-1" />

            {/* Lists & Quotes */}
            <button
              type="button"
              onClick={() => insertLinePrefix('- ')}
              className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition"
              title="Danh sách gạch đầu dòng"
            >
              <List className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix('1. ')}
              className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition"
              title="Danh sách đánh số"
            >
              <ListOrdered className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix('- [ ] ')}
              className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition"
              title="Checklist hoàn thành"
            >
              <CheckSquare className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => insertLinePrefix('> ')}
              className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition"
              title="Trích dẫn"
            >
              <Quote className="w-4 h-4" />
            </button>

            <div className="h-4 w-px bg-slate-300 mx-1" />

            {/* Code Block & Table & Link */}
            <button
              type="button"
              onClick={() => insertFormatting('```\n', '\n```', 'đoạn code mẫu')}
              className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition"
              title="Khối code nhiều dòng"
            >
              <FileCode className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleInsertTable}
              className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition"
              title="Chèn bảng dữ liệu 3 cột"
            >
              <TableIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleInsertLink}
              className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition"
              title="Chèn liên kết URL (Ctrl+K)"
            >
              <LinkIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploadingImage}
              className="p-1.5 rounded-lg hover:bg-slate-200/80 hover:text-slate-900 transition text-[#1B64B0]"
              title="Chèn hình ảnh minh họa"
            >
              <ImageIcon className={`w-4 h-4 ${uploadingImage ? 'animate-bounce' : ''}`} />
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />

            <div className="h-4 w-px bg-slate-300 mx-1" />

            {/* Callouts */}
            <button
              type="button"
              onClick={() => handleInsertCallout('NOTE')}
              className="px-2 py-1 rounded-lg text-[10.5px] font-extrabold bg-sky-100/70 text-sky-800 hover:bg-sky-100 transition"
              title="Hộp ghi chú xanh"
            >
              Ghi chú
            </button>
            <button
              type="button"
              onClick={() => handleInsertCallout('TIP')}
              className="px-2 py-1 rounded-lg text-[10.5px] font-extrabold bg-emerald-100/70 text-emerald-800 hover:bg-emerald-100 transition"
              title="Hộp mẹo xanh lá"
            >
              Mẹo
            </button>
            <button
              type="button"
              onClick={() => handleInsertCallout('WARNING')}
              className="px-2 py-1 rounded-lg text-[10.5px] font-extrabold bg-amber-100/70 text-amber-800 hover:bg-amber-100 transition"
              title="Hộp cảnh báo cam"
            >
              Lưu ý
            </button>

            <div className="ml-auto">
              <button
                type="button"
                onClick={() => setShowHelp((prev) => !prev)}
                className="p-1.5 rounded-lg hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition"
                title="Hướng dẫn định dạng"
              >
                <HelpCircle className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Format Cheat Sheet popup */}
        {showHelp && (
          <div className="p-3 bg-sky-50 border-b border-sky-100 text-xs text-sky-900 flex flex-wrap gap-x-4 gap-y-1.5 animate-in fade-in">
            <span><strong>**in đậm**</strong></span>
            <span><em>*in nghiêng*</em></span>
            <span><code>`code`</code></span>
            <span><code># Tiêu đề 1</code></span>
            <span><code>## Tiêu đề 2</code></span>
            <span><code>- Gạch đầu dòng</code></span>
            <span><code>1. Đánh số</code></span>
            <span><code>&gt; Trích dẫn</code></span>
            <span><code>[Tiêu đề](link)</code></span>
            <span><code>![Mô tả ảnh](link)</code></span>
          </div>
        )}

        {/* Main Content Area */}
        {mode === 'write' && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
            className={`w-full p-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-y font-normal leading-relaxed ${minHeight}`}
          />
        )}

        {mode === 'preview' && (
          <div className={`p-4 bg-white overflow-y-auto ${minHeight}`}>
            {renderPreview(value)}
          </div>
        )}

        {mode === 'split' && (
          <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
            <textarea
              ref={textareaRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              disabled={disabled}
              className={`w-full p-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none resize-y font-normal leading-relaxed ${minHeight}`}
            />
            <div className={`p-4 bg-slate-50/50 overflow-y-auto ${minHeight}`}>
              {renderPreview(value)}
            </div>
          </div>
        )}

        {/* Footer Stats Bar */}
        <div className="flex items-center justify-between px-3.5 py-2 bg-slate-50 border-t border-slate-200 text-[11px] text-slate-500 font-semibold select-none">
          <div className="flex items-center gap-3">
            <span>{stats.words} từ</span>
            <span>•</span>
            <span>{stats.chars} ký tự</span>
            <span>•</span>
            <span>{stats.lines} dòng</span>
          </div>

          <div className="flex items-center gap-2 text-slate-400">
            <span className="hidden sm:inline">Thời gian đọc ước tính: ~{stats.readMinutes} phút</span>
            {value.length > 0 && (
              <span className="inline-flex items-center gap-1 text-emerald-600 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Đã đồng bộ</span>
              </span>
            )}
          </div>
        </div>
      </div>

      {helperText && <p className="text-[11px] text-slate-400 mt-1">{helperText}</p>}
    </div>
  );
}
