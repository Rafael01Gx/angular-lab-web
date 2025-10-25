# 🧪 **AngularLabWeb**

<p align="center">
  <img src="https://img.shields.io/badge/Angular-20-DD0031?style=for-the-badge&logo=angular&logoColor=white" alt="Angular 20">
  <img src="https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  <img src="https://img.shields.io/badge/TypeScript-5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript">
  <img src="https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL">
  <img src="https://img.shields.io/badge/NestJS-11.0-E0234E?style=for-the-badge&logo=nestjs&logoColor=white" alt="NestJS">
</p>

<p align="center">
  Sistema web moderno para gerenciamento de ordens de serviço e fluxo de amostras em laboratório físico, construído com Angular 20 e TailwindCSS.
</p>

---

## 📋 **Sobre o Projeto**

O **AngularLabWeb** é uma solução completa para laboratórios que precisam gerenciar ordens de serviço e o ciclo de vida das amostras de forma eficiente. A aplicação atende diferentes perfis de usuário (cliente, executante e administrador) e oferece acompanhamento completo desde a criação da ordem até a entrega dos resultados finais.

### 🎯 **Principais Diferenciais**
- Interface moderna e responsiva com TailwindCSS
- Arquitetura baseada em Angular 20 com performance otimizada
- Sistema de autenticação robusto com JWT
- Dashboard interativo com visualizações em tempo real
- Workflow completo de análises laboratoriais

---

## ⚙️ **Funcionalidades**

### 🔐 **Autenticação e Segurança**
- Sistema de login com validação em tempo real
- Criação de contas com verificação de email
- Recuperação e redefinição de senha segura
- Controle de sessão e tokens JWT

### 🏠 **Página Inicial Inteligente**
- Interface welcome moderna e intuitiva
- Instruções detalhadas para envio de amostras
- Tabela interativa com procedimentos laboratoriais
- Cards informativos sobre serviços disponíveis

### 📊 **Dashboard Analítico**
- Painel visual com gráficos dinâmicos (ApexCharts)
- Indicadores KPI em tempo real sobre análises
- Sistema de agendamento integrado
- Notificações e alertas inteligentes
- Widgets personalizáveis por perfil de usuário

### 👤 **Gerenciamento de Perfil**
- Editor de dados pessoais com validação
- Alteração segura de senhas
- Histórico de atividades do usuário
- Configurações de notificações personalizadas

### 📦 **Ordens de Serviço (OS)**
- **Criação Intuitiva**: Formulário step-by-step com validações em tempo real
- **Geração de Etiquetas**: Sistema automatizado com códigos QR/barras
- **Filtros Avançados**: Por status, data, cliente, tipo de análise
- **Status Tracking**: Aguardando análise, em andamento, concluídas, canceladas

### 🧾 **Gerenciamento Administrativo**
- **Aprovação de OS**: Sistema de workflow com comentários
- **Emissão de Laudos**: Editor WYSIWYG para relatórios profissionais
- **Controle de Qualidade**: Validação de resultados antes da liberação
- **Auditoria Completa**: Log de todas as ações realizadas

### 🧪 **Controle de Amostras**
- **Rastreabilidade Completa**: Histórico detalhado de cada amostra
- **Status em Tempo Real**: Acompanhamento visual do progresso
- **Resultados Interativos**: Visualização gráfica dos dados analíticos
- **Alertas Automatizados**: Notificações sobre prazos e resultados

### 🧬 **Módulo de Análises**
- **Workflow Dinâmico**: Autorização → Execução → Revisão → Liberação
- **Interface Especializada**: Telas otimizadas para operadores
- **Controle de Equipamentos**: Integração com instrumentos laboratoriais
- **Templates de Análise**: Padronização de procedimentos

### ⚙️ **Configurações Avançadas**
- **Parâmetros de Análise**: Configuração flexível de testes
- **Unidades de Medida**: Sistema métrico customizável
- **Matérias-Primas**: Cadastro completo de materiais
- **Equipamentos**: Controle de calibração e manutenção

### 📄 **Relatórios Inteligentes**
- **Geração Automática**: Laudos em PDF com design profissional
- **Templates Customizáveis**: Adaptação à identidade visual do laboratório
- **Exportação Múltipla**: PDF, Excel, CSV
- **Dashboard de Relatórios**: Métricas e análises estatísticas

### 👥 **Administração de Usuários**
- **Controle Granular**: Permissões por módulo e funcionalidade
- **Hierarquia de Acesso**: Cliente → Operador → Administrador
- **Auditoria de Usuários**: Log completo de ações por usuário
- **Integração LDAP**: Possibilidade de integração com Active Directory

---

## 🚀 **Tecnologias de Ponta**

### **Frontend Moderno**
- **Angular 20** - Framework com signals, standalone components e performance otimizada
- **TailwindCSS 3.4** - Utility-first CSS framework para design system consistente
- **Angular Material 20** - Componentes UI seguindo Material Design 3
- **ApexCharts** - Biblioteca de gráficos responsivos e interativos
- **jsPDF** - Geração de PDFs no client-side
- **RxJS 7** - Programação reativa para gerenciamento de estado

### **Backend Robusto**
- **NestJS 10** - Framework Node.js progressivo com arquitetura modular
- **API RESTful** - Endpoints bem estruturados seguindo padrões REST
- **Prisma ORM** - Type-safe database client para MySQL
- **TypeScript 5.7** - Type-safety e prodprodutividade de desenvolvimento
- **JWT Authentication** - Sistema de autenticação stateless e seguro
- **Guards e Middlewares** - Controle de acesso granular por rotas
- **Swagger/OpenAPI** - Documentação automática da API

### **Banco de Dados**
- **MySQL 8.0** - Sistema de gerenciamento de banco relacional robusto
- **Prisma ORM** - Toolkit moderno para acesso ao banco de dados
- **Migrações Automáticas** - Controle de versão do schema do banco
- **Query Builder** - Construção type-safe de consultas SQL
- **Connection Pooling** - Otimização de conexões para alta performance
- **Transações ACID** - Garantia de integridade dos dados

---

## 🔐 **Segurança e Autorização**

### **Sistema de Autenticação**
- **JWT Tokens** com refresh automático
- **Passport.js** integrado ao NestJS
- **bcrypt** para hash de senhas
- **Rate Limiting** para prevenção de ataques
- **HTTPS obrigatório** em produção


### **Perfis de Usuário**
| Perfil | Permissões |
|--------|-----------|
| **Cliente** | Criar OS, visualizar amostras próprias, baixar laudos |
| **Operador** | Executar análises, aprovar resultados, gerenciar amostras |
| **Administrador** | Acesso completo, gerenciar usuários, configurações |

---

## 🗃️ **Arquitetura do Banco**

### **Schema Relacional**
```sql
-- Exemplo de estrutura MySQL
CREATE TABLE order_services (
  id INT PRIMARY KEY AUTO_INCREMENT,
  client_id INT NOT NULL,
  status ENUM('pending', 'approved', 'in_progress', 'completed') DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (client_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE samples (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_service_id INT NOT NULL,
  sample_code VARCHAR(50) UNIQUE NOT NULL,
  material_type VARCHAR(100),
  status VARCHAR(50) DEFAULT 'received',
  FOREIGN KEY (order_service_id) REFERENCES order_services(id)
);
```

### **Prisma Schema**
```prisma
// Exemplo de modelo Prisma
model OrderService {
  id        Int      @id @default(autoincrement())
  clientId  Int      @map("client_id")
  status    Status   @default(PENDING)
  samples   Sample[]
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  client User @relation(fields: [clientId], references: [id])
  
  @@map("order_services")
}

enum Status {
  PENDING
  APPROVED
  IN_PROGRESS
  COMPLETED
}
```

### **Recursos do MySQL**
- **Índices Compostos** para otimização de queries complexas
- **Full-Text Search** para busca inteligente em textos
- **Stored Procedures** para lógica de negócio no banco
- **Views** para consultas complexas pré-definidas
- **Triggers** para auditoria automática de mudanças

---

## 🛠️ **Desenvolvimento Local**

### **Pré-requisitos**
- **Node.js** v20+ (LTS recomendado)
- **Angular CLI** v20
- **MySQL** v8.0+
- **Git** para versionamento

### **Instalação Rápida**
```bash
# Clone o repositório
git clone https://github.com/rafael01gx/angular-lab-web.git
cd angular-lab-web

# Instale as dependências do frontend
npm install

# Configure as variáveis de ambiente
cp .env.example .env

# Configure a conexão com MySQL no .env
# DATABASE_URL="mysql://username:password@localhost:3306/lab_database"

# Instale as dependências do backend (se não estiver separado)
cd backend
npm install

# Execute as migrações do Prisma
npx prisma migrate dev

# Gere o cliente Prisma
npx prisma generate

# Execute o backend NestJS
npm run start:dev

# Em outro terminal, execute o frontend Angular
cd ../
ng serve

# Acesse a aplicação
http://localhost:4200
```

### **Scripts Disponíveis**
```bash
# Frontend (Angular)
npm run dev          # Desenvolvimento com hot reload
npm run build        # Build para produção
npm run test         # Testes unitários
npm run e2e          # Testes e2e
npm run analyze      # Análise de bundle
npm run lint         # Linting e formatação

# Backend (NestJS)
npm run start:dev    # Servidor de desenvolvimento
npm run start:prod   # Servidor de produção
npm run build        # Build da aplicação
npm run test         # Testes unitários
npm run test:e2e     # Testes de integração

# Banco de Dados (Prisma)
npx prisma studio    # Interface visual do banco
npx prisma migrate dev    # Criar nova migração
npx prisma db push   # Aplicar mudanças sem migração
npx prisma generate  # Gerar cliente Prisma
```

---

## 📱 **Responsividade**

O sistema é totalmente responsivo, funcionando perfeitamente em:
- 💻 **Desktop** - Interface completa com todos os recursos
- 📱 **Mobile** - Interface adaptada para dispositivos móveis
- 📟 **Tablet** - Layout otimizado para tablets

---

## 🔄 **Atualizações e Versionamento**

### **Changelog Recente**
- ✅ **v3.0** - Migração para Angular 20 e TailwindCSS
- ✅ **v2.5** - Dashboard renovado com ApexCharts
- ✅ **v2.0** - Sistema de análises automatizado
- ✅ **v1.0** - Lançamento inicial

### **Roadmap**
- 🔄 Integração com APIs de equipamentos laboratoriais
- 🔄 Sistema de notificações push
- 🔄 Mobile App nativo
- 🔄 Inteligência artificial para análise preditiva

---

## 🤝 **Contribuição**

Contribuições são sempre bem-vindas! Para contribuir:

1. Fork o projeto
2. Crie uma feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

---

## 📄 **Licença**

Este projeto está licenciado sob a licença MIT - veja o arquivo [LICENSE](LICENSE) para detalhes.

---

## 📞 **Suporte e Contato**

- **GitHub Issues**: [Reportar problemas](../../issues)
- **Documentação**: [Wiki do projeto](../../wiki)
- **Email**: rafael01gx@exemplo.com

---

<p align="center">
  Desenvolvido com ❤️ para modernizar laboratórios
</p>

<p align="center">
  ⭐ Se este projeto foi útil, considere dar uma estrela no repositório!
</p>
