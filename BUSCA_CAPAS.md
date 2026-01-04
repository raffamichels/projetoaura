# 🎨 Busca Automática de Capas para Livros e Filmes

## ✨ Funcionalidades Implementadas

A funcionalidade de busca automática de capas foi implementada com sucesso! Agora você pode:

### Para Livros 📚
- **Busca automática via Google Books API** (não requer configuração)
- Digite o título do livro e clique em "Buscar Capas"
- Selecione entre até 6 sugestões de capas
- Preview em tempo real da capa selecionada
- Opção de inserir URL manualmente como fallback

### Para Filmes 🎬
- **Busca automática via TMDB API** (requer configuração - veja abaixo)
- Digite o título do filme e clique em "Buscar Capas"
- Selecione entre até 6 sugestões de capas em alta qualidade
- Preview em tempo real da capa selecionada
- Opção de inserir URL manualmente como fallback

## 🚀 Como Usar

1. **Acesse o módulo de Leituras/Biblioteca** no seu aplicativo
2. **Clique em "Adicionar Livro" ou "Adicionar Filme"**
3. **Preencha o título** do livro ou filme
4. **Na seção "Buscar Capa Automaticamente":**
   - Deixe o campo vazio para buscar pelo título que você digitou acima
   - OU digite um termo de busca diferente
   - Clique em "Buscar Capas"
5. **Selecione uma das capas sugeridas** clicando na imagem
6. **Preview da capa** aparecerá abaixo
7. **Continue preenchendo** o formulário e salve

## ⚙️ Configuração (apenas para Filmes)

### Para habilitar a busca de capas de filmes, você precisa de uma chave API do TMDB:

1. **Crie uma conta gratuita** em [The Movie Database (TMDB)](https://www.themoviedb.org/signup)

2. **Obtenha sua API key:**
   - Acesse [Settings → API](https://www.themoviedb.org/settings/api)
   - Clique em "Create" ou "Request an API Key"
   - Escolha "Developer"
   - Preencha o formulário com informações do seu projeto
   - Aceite os termos de uso
   - Copie sua **API Key (v3 auth)**

3. **Configure no projeto:**
   - Abra o arquivo `.env` na raiz do projeto
   - Adicione a seguinte linha:
     ```env
     TMDB_API_KEY=sua_chave_api_aqui
     ```
   - Substitua `sua_chave_api_aqui` pela chave que você copiou

4. **Reinicie o servidor:**
   ```bash
   npm run dev
   ```

### 📝 Nota sobre Livros
A busca de capas de **livros funciona imediatamente** sem necessidade de configuração, pois usa a API pública do Google Books.

## 🎯 Arquivos Criados/Modificados

### Novos Arquivos:
- `src/app/api/v1/leituras/buscar-capas/route.ts` - API route para buscar capas
- `src/components/leituras/ImageSearchSelector.tsx` - Componente de seleção de capas

### Arquivos Modificados:
- `src/components/leituras/NovaMidiaModal.tsx` - Integração do seletor de capas

## 🔧 Detalhes Técnicos

### APIs Utilizadas:

1. **Google Books API**
   - Endpoint: `https://www.googleapis.com/books/v1/volumes`
   - Não requer autenticação para buscas básicas
   - Retorna informações de livros incluindo capas
   - Limite: até 6 resultados por busca

2. **TMDB API**
   - Endpoint: `https://api.themoviedb.org/3/search/movie`
   - Requer API key gratuita
   - Retorna informações de filmes incluindo pôsteres em alta qualidade
   - Suporta busca em português (language=pt-BR)
   - Limite: até 6 resultados por busca

### Fluxo de Funcionamento:

```
Usuário digita título → Clica em "Buscar" → API Route processa →
APIs externas (Google Books/TMDB) → Retorna sugestões →
Usuário seleciona capa → Preview atualizado → Salva no banco
```

## 🎨 Interface

O componente oferece:
- ✅ Campo de busca inteligente (usa o título se vazio)
- ✅ Indicador de carregamento durante busca
- ✅ Grid responsivo com 3 colunas de capas
- ✅ Hover com informações adicionais (autor/ano)
- ✅ Indicador visual da capa selecionada
- ✅ Preview da capa antes de salvar
- ✅ Botão para remover capa selecionada
- ✅ Mensagens de aviso caso TMDB não esteja configurado
- ✅ Fallback para URL manual

## 🐛 Troubleshooting

### "Nenhuma capa encontrada"
- Verifique se digitou o título corretamente
- Tente variações do título (com/sem subtítulo, em inglês, etc.)
- Para filmes, verifique se a API do TMDB está configurada

### "Busca de capas de filmes requer configuração"
- A chave API do TMDB não está configurada
- Siga as instruções de configuração acima
- Certifique-se de que reiniciou o servidor após adicionar a chave

### Capas não carregam ou aparecem quebradas
- Algumas capas podem ter URLs inválidas
- Use a opção de URL manual como alternativa
- Tente buscar novamente com um termo diferente

## 📱 Compatibilidade

- ✅ Next.js 14+
- ✅ React 18+
- ✅ Tailwind CSS
- ✅ shadcn/ui components

## 🎉 Pronto para Usar!

A funcionalidade está totalmente implementada e pronta para uso. Para livros, funciona imediatamente. Para filmes, basta configurar a chave API do TMDB seguindo as instruções acima.

Aproveite a nova funcionalidade e economize tempo ao adicionar suas leituras e filmes! 🚀
