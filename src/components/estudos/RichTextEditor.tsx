'use client';

import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Color } from '@tiptap/extension-color';
import { TextStyle } from '@tiptap/extension-text-style';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Highlight from '@tiptap/extension-highlight';
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

interface RichTextEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ content, onChange, placeholder }: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Underline,
      Highlight.configure({
        multicolor: true,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-invert max-w-none min-h-[200px] focus:outline-none px-4 py-3',
      },
    },
  });

  if (!editor) {
    return null;
  }

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
          isActive={editor.isActive('heading', { level: 1 })}
          icon={Heading1}
          title="Título 1"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          isActive={editor.isActive('heading', { level: 2 })}
          icon={Heading2}
          title="Título 2"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          isActive={editor.isActive('heading', { level: 3 })}
          icon={Heading3}
          title="Título 3"
        />

        <div className="w-px h-8 bg-zinc-700 mx-1" />

        {/* Text formatting */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          isActive={editor.isActive('bold')}
          icon={Bold}
          title="Negrito"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          isActive={editor.isActive('italic')}
          icon={Italic}
          title="Itálico"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleUnderline().run()}
          isActive={editor.isActive('underline')}
          icon={UnderlineIcon}
          title="Sublinhado"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          isActive={editor.isActive('strike')}
          icon={Strikethrough}
          title="Riscado"
        />

        <div className="w-px h-8 bg-zinc-700 mx-1" />

        {/* Lists */}
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          isActive={editor.isActive('bulletList')}
          icon={List}
          title="Lista"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          isActive={editor.isActive('orderedList')}
          icon={ListOrdered}
          title="Lista numerada"
        />

        <div className="w-px h-8 bg-zinc-700 mx-1" />

        {/* Alignment */}
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          isActive={editor.isActive({ textAlign: 'left' })}
          icon={AlignLeft}
          title="Alinhar à esquerda"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          isActive={editor.isActive({ textAlign: 'center' })}
          icon={AlignCenter}
          title="Centralizar"
        />
        <ToolbarButton
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          isActive={editor.isActive({ textAlign: 'right' })}
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
