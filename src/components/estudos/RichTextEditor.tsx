'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
import { ResizableImage } from './ResizableImage';
import DOMPurify from 'dompurify';
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Undo,
  Redo,
  Highlighter,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

// Configuração de sanitização para prevenir XSS
const DOMPURIFY_CONFIG = {
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
    'h1', 'h2', 'h3', 'ul', 'ol', 'li', 'blockquote', 'code', 'pre',
    'img', 'a', 'span', 'div', 'mark'
  ],
  ALLOWED_ATTR: [
    'href', 'src', 'alt', 'class', 'style', 'target', 'rel',
    'data-width', 'data-height', 'data-align', 'width', 'height'
  ],
  FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'input', 'button'],
  FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  ALLOW_DATA_ATTR: true,
};

// Função para sanitizar HTML
function sanitizeHTML(html: string): string {
  return DOMPurify.sanitize(html, DOMPURIFY_CONFIG);
}

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      TextStyle,
      Color,
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      ResizableImage,
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      // Sanitizar HTML antes de enviar para prevenir XSS
      const html = editor.getHTML();
      const sanitizedHtml = sanitizeHTML(html);
      onChange(sanitizedHtml);
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[200px] focus:outline-none px-4 py-3',
      },
      handlePaste: (view, event) => {
        const items = event.clipboardData?.items;
        if (!items) return false;

        for (let i = 0; i < items.length; i++) {
          const item = items[i];

          // Verifica se é uma imagem
          if (item.type.indexOf('image') !== -1) {
            event.preventDefault();

            const file = item.getAsFile();
            if (!file) continue;

            // Converter imagem para base64
            const reader = new FileReader();
            reader.onload = (e) => {
              const base64 = e.target?.result as string;

              // Inserir imagem no editor usando resizableImage
              const node = view.state.schema.nodes.resizableImage;
              if (node) {
                view.dispatch(
                  view.state.tr.replaceSelectionWith(
                    node.create({
                      src: base64,
                    })
                  )
                );
              }
            };
            reader.readAsDataURL(file);

            return true;
          }
        }

        return false;
      },
    },
  });

  if (!editor) {
    return null;
  }

  // Função helper para verificar se há algo realmente selecionado/ativo
  const hasActiveSelection = () => {
    const { from, to } = editor.state.selection;
    // Verifica apenas se há uma seleção de texto ou um nó de imagem selecionado
    return from !== to || editor.isActive('resizableImage');
  };

  const ToolbarButton = ({
    onClick,
    isActive,
    icon: Icon,
    title
  }: {
    onClick: () => void;
    isActive?: boolean;
    icon: typeof Bold;
    title: string;
  }) => (
    <Button
      type="button"
      onClick={onClick}
      variant="ghost"
      size="sm"
      className={`h-8 w-8 p-0 ${
        isActive ? 'bg-purple-600 text-white' : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
      }`}
      title={title}
    >
      <Icon className="h-4 w-4" />
    </Button>
  );

  const ColorButton = ({ color, title }: { color: string; title: string }) => (
    <Button
      type="button"
      onClick={() => editor.chain().focus().setColor(color).run()}
      variant="ghost"
      size="sm"
      className="h-8 w-8 p-0"
      title={title}
    >
      <div className="w-4 h-4 rounded" style={{ backgroundColor: color }} />
    </Button>
  );

  const HighlightButton = ({ color, title }: { color: string; title: string }) => (
    <Button
      type="button"
      onClick={() => editor.chain().focus().toggleHighlight({ color }).run()}
      variant="ghost"
      size="sm"
      className={`h-8 w-8 p-0 ${
        editor.isActive('highlight', { color }) ? 'ring-2 ring-purple-500' : ''
      }`}
      title={title}
    >
      <div className="flex items-center justify-center">
        <Highlighter className="h-4 w-4" style={{ color }} />
      </div>
    </Button>
  );

  return (
    <div className="border border-zinc-700 rounded-lg bg-zinc-900 overflow-hidden">
      <style jsx global>{`
        .ProseMirror img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          cursor: pointer;
          user-select: none;
          transition: all 0.2s ease;
        }

        .ProseMirror img:hover {
          box-shadow: 0 0 0 2px rgba(168, 85, 247, 0.4);
        }

        .ProseMirror img.ProseMirror-selectednode {
          outline: 2px solid rgb(168, 85, 247);
          outline-offset: 2px;
        }

        .ProseMirror img[data-resize] {
          resize: both;
          overflow: hidden;
        }
      `}</style>
      {/* Toolbar */}
      <div className="border-b border-zinc-700 bg-zinc-800/50 p-2 flex flex-wrap gap-1">
        {/* Undo/Redo */}
        <ToolbarButton
          onClick={() => editor.chain().focus().undo().run()}
          icon={Undo}
          title="Desfazer"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().redo().run()}
          icon={Redo}
          title="Refazer"
        />

        <div className="w-px h-8 bg-zinc-700 mx-1" />

        {/* Headings */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          isActive={hasActiveSelection() && editor.isActive('heading', { level: 1 })}
          icon={Heading1}
          title="Título 1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={hasActiveSelection() && editor.isActive('heading', { level: 2 })}
          icon={Heading2}
          title="Título 2"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={hasActiveSelection() && editor.isActive('heading', { level: 3 })}
          icon={Heading3}
          title="Título 3"
        />

        <div className="w-px h-8 bg-zinc-700 mx-1" />

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={hasActiveSelection() && editor.isActive('bold')}
          icon={Bold}
          title="Negrito"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={hasActiveSelection() && editor.isActive('italic')}
          icon={Italic}
          title="Itálico"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={hasActiveSelection() && editor.isActive('underline')}
          icon={UnderlineIcon}
          title="Sublinhado"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={hasActiveSelection() && editor.isActive('strike')}
          icon={Strikethrough}
          title="Riscado"
        />

        <div className="w-px h-8 bg-zinc-700 mx-1" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={hasActiveSelection() && editor.isActive('bulletList')}
          icon={List}
          title="Lista"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={hasActiveSelection() && editor.isActive('orderedList')}
          icon={ListOrdered}
          title="Lista numerada"
        />

        <div className="w-px h-8 bg-zinc-700 mx-1" />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => {
            if (editor.isActive('resizableImage')) {
              editor.chain().focus().updateAttributes('resizableImage', { align: 'left' }).run();
            } else {
              editor.chain().focus().setTextAlign('left').run();
            }
          }}
          isActive={
            hasActiveSelection() && (
              (editor.isActive('resizableImage') && editor.isActive('resizableImage', { align: 'left' })) ||
              (!editor.isActive('resizableImage') && editor.isActive({ textAlign: 'left' }))
            )
          }
          icon={AlignLeft}
          title="Alinhar à esquerda"
        />
        <ToolbarButton
          onClick={() => {
            if (editor.isActive('resizableImage')) {
              editor.chain().focus().updateAttributes('resizableImage', { align: 'center' }).run();
            } else {
              editor.chain().focus().setTextAlign('center').run();
            }
          }}
          isActive={
            hasActiveSelection() && (
              (editor.isActive('resizableImage') && editor.isActive('resizableImage', { align: 'center' })) ||
              (!editor.isActive('resizableImage') && editor.isActive({ textAlign: 'center' }))
            )
          }
          icon={AlignCenter}
          title="Centralizar"
        />
        <ToolbarButton
          onClick={() => {
            if (editor.isActive('resizableImage')) {
              editor.chain().focus().updateAttributes('resizableImage', { align: 'right' }).run();
            } else {
              editor.chain().focus().setTextAlign('right').run();
            }
          }}
          isActive={
            hasActiveSelection() && (
              (editor.isActive('resizableImage') && editor.isActive('resizableImage', { align: 'right' })) ||
              (!editor.isActive('resizableImage') && editor.isActive({ textAlign: 'right' }))
            )
          }
          icon={AlignRight}
          title="Alinhar à direita"
        />

        <div className="w-px h-8 bg-zinc-700 mx-1" />

        {/* Text Colors */}
        <ColorButton color="#FFFFFF" title="Branco" />
        <ColorButton color="#EF4444" title="Vermelho" />
        <ColorButton color="#F59E0B" title="Laranja" />
        <ColorButton color="#10B981" title="Verde" />
        <ColorButton color="#3B82F6" title="Azul" />
        <ColorButton color="#8B5CF6" title="Roxo" />

        <div className="w-px h-8 bg-zinc-700 mx-1" />

        {/* Highlight Colors */}
        <HighlightButton color="#FEF3C7" title="Destaque Amarelo" />
        <HighlightButton color="#DBEAFE" title="Destaque Azul" />
        <HighlightButton color="#D1FAE5" title="Destaque Verde" />
        <HighlightButton color="#FCE7F3" title="Destaque Rosa" />
      </div>

      {/* Editor */}
      <EditorContent editor={editor} />
    </div>
  );
}
