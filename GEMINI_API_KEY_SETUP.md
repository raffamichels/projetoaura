# Como Obter sua API Key do Google Gemini

Para usar a funcionalidade de gerar resenha com IA, você precisa de uma API key do Google Gemini (Gratuita!).

## Passo a Passo

### 1. Acesse o Google AI Studio

Vá para: https://aistudio.google.com/app/apikey

### 2. Faça Login

- Use sua conta Google
- Aceite os termos de serviço se solicitado

### 3. Crie uma API Key

1. Clique em **"Get API key"** ou **"Create API key"**
2. Escolha um projeto do Google Cloud existente ou crie um novo
3. Sua API key será gerada automaticamente

### 4. Copie a API Key

- Copie a chave gerada (começa com algo como `AIza...`)
- **⚠️ IMPORTANTE**: Guarde essa chave em um lugar seguro! Não compartilhe publicamente.

### 5. Configure no Projeto

Abra o arquivo [.env](.env) na raiz do projeto e substitua:

```env
GEMINI_API_KEY="your_gemini_api_key_here"
```

Por:

```env
GEMINI_API_KEY="SUA_API_KEY_AQUI"
```

### 6. Reinicie o Servidor

Se o servidor estiver rodando, reinicie-o para carregar a nova variável de ambiente:

```bash
# Pare o servidor (Ctrl+C)
# Inicie novamente
npm run dev
```

## Limites Gratuitos

O Google Gemini oferece um plano gratuito generoso:

- ✅ **15 requisições por minuto**
- ✅ **1500 requisições por dia**
- ✅ **1 milhão de tokens por minuto**

Isso é mais do que suficiente para uso pessoal!

## Testando

1. Vá para uma página de livro ou filme na sua biblioteca
2. Adicione algumas impressões, aprendizados ou citações
3. Clique no botão **"Gerar Resenha"**
4. Aguarde alguns segundos
5. A resenha será gerada em primeira pessoa baseada nas suas anotações!

## Solução de Problemas

### Erro: "API key not valid"

- Verifique se copiou a chave completa
- Confirme que a chave está no arquivo `.env` corretamente
- Reinicie o servidor

### Erro: "Quota exceeded"

- Você atingiu o limite de 15 requisições por minuto
- Aguarde 1 minuto e tente novamente

### Erro: "Not authenticated"

- Verifique se você está logado no sistema
- A geração de resenha só funciona para páginas que você criou

## Segurança

⚠️ **NUNCA** compartilhe sua API key publicamente ou faça commit dela no Git!

O arquivo `.env` já está no `.gitignore`, então não será incluído no repositório.

## Mais Informações

- [Documentação do Google Gemini](https://ai.google.dev/docs)
- [Pricing e Limites](https://ai.google.dev/pricing)
- [Google AI Studio](https://aistudio.google.com/)
