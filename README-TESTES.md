# 🍅 PomoChill - Testes Completos

## Visão Geral

Este projeto contém uma suíte completa de testes para a aplicação **PomoChill** (Pomodoro & Chill), incluindo:

- **Testes Unitários** com Jest
- **Testes de Integração** com Jest + Testing Library (DOM)  
- **Testes End-to-End (E2E)** com Cypress

## 📁 Estrutura dos Testes

```
__tests__/
├── unit/                          # Testes unitários
│   ├── timer-functions.test.js     # Funções do timer
│   ├── dom-manipulation.test.js    # Manipulação do DOM
│   └── language-support.test.js    # Suporte a idiomas
├── integration/                   # Testes de integração
│   ├── app-integration.test.js     # Integração da aplicação
│   └── settings-modals.test.js     # Configurações e modais
cypress/
├── e2e/                          # Testes E2E
│   ├── basic-timer.cy.js          # Operações básicas do timer
│   ├── settings-config.cy.js      # Configurações
│   └── stats-workflows.cy.js      # Estatísticas e workflows
├── support/
│   └── e2e.js                     # Comandos customizados
└── fixtures/                     # Dados de teste
```

## 🚀 Instalação

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## 🧪 Executando os Testes

### Testes Unitários

```bash
# Executar todos os testes unitários
npm run test:unit

# Executar com coverage
npm test

# Modo watch (executar ao salvar arquivos)
npm run test:watch
```

### Testes de Integração

```bash
# Executar testes de integração
npm run test:integration

# Todos os testes Jest (unitários + integração)
npm test
```

### Testes E2E (Cypress)

```bash
# Executar E2E em modo headless
npm run test:e2e

# Abrir interface interativa do Cypress
npm run test:e2e:open
```

## 📝 Testes Unitários

### Timer Functions (`__tests__/unit/timer-functions.test.js`)

Testa as funções básicas do timer de forma isolada:

- ✅ Formatação de tempo (25:00, 05:30, etc.)
- ✅ Cálculos de duração
- ✅ Validação de entrada
- ✅ Lógica de troca de modos
- ✅ Cálculo de progresso
- ✅ Rastreamento de estatísticas
- ✅ Seleção de mensagens
- ✅ Geração de sons

### DOM Manipulation (`__tests__/unit/dom-manipulation.test.js`)

Testa interações com elementos DOM:

- ✅ Seleção e binding de elementos
- ✅ Atualizações de display de tempo
- ✅ Atualizações do círculo de progresso
- ✅ Gerenciamento de estado dos botões
- ✅ Estados dos botões de modo
- ✅ Display de estatísticas
- ✅ Gerenciamento de modais
- ✅ Gerenciamento de classes CSS

### Language Support (`__tests__/unit/language-support.test.js`)

Testa funcionalidades de internacionalização:

- ✅ Carregamento de traduções
- ✅ Detecção de idioma do navegador
- ✅ Persistência no localStorage
- ✅ Aplicação de traduções
- ✅ Tradução dinâmica de mensagens
- ✅ Validação de traduções
- ✅ Fallback para inglês

## 🔗 Testes de Integração

### App Integration (`__tests__/integration/app-integration.test.js`)

Testa o funcionamento conjunto de múltiplos módulos:

- ✅ Fluxo Start/Pause/Reset
- ✅ Troca de modos
- ✅ Funcionalidades de sessão de pausa
- ✅ Integração de estatísticas
- ✅ Ciclo de pausa longa
- ✅ Integração de idiomas
- ✅ Display de mensagens
- ✅ Círculo de progresso
- ✅ Atalhos de teclado

### Settings and Modals (`__tests__/integration/settings-modals.test.js`)

Testa integração entre configurações e modais:

- ✅ Gerenciamento de modal de configurações
- ✅ Validação e salvamento de configurações
- ✅ Impacto das configurações no timer
- ✅ Gerenciamento de modal de estatísticas
- ✅ Display de estatísticas
- ✅ Navegação por teclado
- ✅ Validação de formulários
- ✅ Interações entre modais

## 🌐 Testes End-to-End (E2E)

### Basic Timer Operations (`cypress/e2e/basic-timer.cy.js`)

Testa operações básicas do timer no navegador:

- ✅ Display e estado inicial
- ✅ Funcionalidade Start/Pause
- ✅ Funcionalidade Reset
- ✅ Troca de modos
- ✅ Funcionalidades de sessão de pausa
- ✅ Atalhos de teclado
- ✅ Animação do círculo de progresso
- ✅ Atualizações de mensagens

### Settings and Configuration (`cypress/e2e/settings-config.cy.js`)

Testa configurações e personalização:

- ✅ Modal de configurações
- ✅ Configurações de duração
- ✅ Validação de configurações
- ✅ Configurações de som
- ✅ Persistência de configurações
- ✅ Configurações de idioma
- ✅ Integração com timer
- ✅ Navegação por teclado
- ✅ Responsividade mobile

### Statistics and Workflows (`cypress/e2e/stats-workflows.cy.js`)

Testa estatísticas e fluxos completos:

- ✅ Modal de estatísticas
- ✅ Workflow de sessão de trabalho
- ✅ Workflow de sessão de pausa
- ✅ Workflow de múltiplas sessões
- ✅ Ciclo de pausa longa
- ✅ Impacto das configurações
- ✅ Impacto do idioma
- ✅ Tratamento de erros
- ✅ Workflow mobile
- ✅ Acessibilidade

## 🛠 Comandos Customizados do Cypress

O arquivo `cypress/support/e2e.js` contém comandos customizados para facilitar os testes:

```javascript
cy.waitForAppLoad()              // Aguarda carregamento da app
cy.startTimer()                  // Inicia o timer
cy.pauseTimer()                  // Pausa o timer
cy.resetTimer()                  // Reseta o timer
cy.switchMode('shortBreak')      // Troca de modo
cy.openSettings()                // Abre configurações
cy.saveSettings({work: 30})      // Salva configurações
cy.changeLanguage('pt')          // Muda idioma
cy.verifyTimeFormat('25:00')     // Verifica formato de tempo
cy.verifyModeIndicator('work')   // Verifica indicador de modo
cy.verifyStats({cycles: 5})      // Verifica estatísticas
```

## 📊 Cobertura de Testes

Execute os testes com cobertura:

```bash
npm test
```

O relatório de cobertura será gerado em `coverage/lcov-report/index.html`.

### Metas de Cobertura

- **Statements**: ≥ 90%
- **Branches**: ≥ 85%
- **Functions**: ≥ 90%
- **Lines**: ≥ 90%

## 🔍 Executando Testes Específicos

### Jest (Unitários e Integração)

```bash
# Executar arquivo específico
npm test timer-functions.test.js

# Executar testes que correspondem a um padrão
npm test -- --testNamePattern="Timer Functions"

# Executar em modo debug
npm test -- --verbose
```

### Cypress (E2E)

```bash
# Executar arquivo específico
npx cypress run --spec "cypress/e2e/basic-timer.cy.js"

# Executar com navegador específico
npx cypress run --browser chrome

# Executar em modo headed (com interface)
npx cypress run --headed
```

## 🐛 Debugging

### Jest

1. **Usar debugger:**
   ```javascript
   test('meu teste', () => {
     debugger;
     // seu código de teste
   });
   ```

2. **Executar com Node Inspector:**
   ```bash
   node --inspect-brk node_modules/.bin/jest --runInBand
   ```

### Cypress

1. **Usar cy.debug():**
   ```javascript
   it('meu teste', () => {
     cy.visit('/');
     cy.debug();
     // comandos seguintes pausam para inspeção
   });
   ```

2. **Usar cy.pause():**
   ```javascript
   it('meu teste', () => {
     cy.visit('/');
     cy.pause();
     // teste pausa aqui
   });
   ```

## 📈 Melhores Práticas

### Testes Unitários

- ✅ Teste uma função/comportamento por vez
- ✅ Use mocks para dependências externas
- ✅ Mantenha testes independentes
- ✅ Use nomes descritivos
- ✅ Organize com `describe` e `it`

### Testes de Integração

- ✅ Teste interações entre módulos
- ✅ Use dados realistas
- ✅ Verifique estado e comportamento
- ✅ Teste fluxos de usuário comuns

### Testes E2E

- ✅ Teste do ponto de vista do usuário
- ✅ Use seletores estáveis (IDs, data-cy)
- ✅ Verifique elementos visíveis
- ✅ Teste cenários críticos de negócio
- ✅ Mantenha testes independentes

## 🎯 Cenários de Teste Cobertos

### Funcionalidades Básicas
- [x] Iniciar/pausar/resetar timer
- [x] Troca entre modos (work/short break/long break)
- [x] Display de tempo e progresso
- [x] Atalhos de teclado (spacebar)

### Configurações
- [x] Alterar durações de trabalho e pausa
- [x] Ativar/desativar sons
- [x] Trocar idioma (EN/PT)
- [x] Persistência de configurações

### Estatísticas
- [x] Contagem de ciclos completados
- [x] Tempo total de foco
- [x] Número de pausas realizadas

### Workflows Completos
- [x] Ciclo work → short break → work
- [x] Ciclo de 4 trabalhos → long break
- [x] Sessões com configurações personalizadas
- [x] Uso em dispositivos móveis

### Tratamento de Erros
- [x] Validação de entrada de configurações
- [x] Refresh da página durante sessão ativa
- [x] Mudanças rápidas de estado
- [x] Interrupções de conexão

## 🌍 Suporte a Idiomas

Os testes cobrem a funcionalidade de internacionalização:

- **Inglês (EN)**: Idioma padrão
- **Português (PT)**: Tradução completa
- **Fallback**: Retorna ao inglês se tradução não disponível
- **Persistência**: Idioma salvo no localStorage

## 📱 Responsividade

Testes incluem verificações para diferentes viewports:

- **Desktop**: 1280x720
- **Tablet**: 768x1024  
- **Mobile**: 375x667

## ♿ Acessibilidade

Testes básicos de acessibilidade incluem:

- Navegação por teclado
- Foco visível em elementos
- Atributos ARIA apropriados
- Contraste de cores adequado

## 🔧 Configuração de CI/CD

Para integração contínua, adicione ao seu pipeline:

```yaml
# Exemplo GitHub Actions
- name: Run Tests
  run: |
    npm install
    npm test
    npm run test:e2e
```

## 📚 Recursos Adicionais

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [Testing Library](https://testing-library.com/docs/)
- [Cypress Documentation](https://docs.cypress.io/)
- [Testing Best Practices](https://kentcdodds.com/blog/common-mistakes-with-react-testing-library)

## 🤝 Contribuindo

1. Execute todos os testes antes de fazer commit
2. Mantenha cobertura de teste alta
3. Adicione testes para novas funcionalidades
4. Siga as convenções de nomenclatura
5. Documente cenários de teste complexos

## 📄 Licença

Este projeto de testes está sob a mesma licença da aplicação PomoChill.
