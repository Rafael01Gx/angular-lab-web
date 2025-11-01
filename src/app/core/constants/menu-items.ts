import { EMenuRoles, IMenuItem } from "../../shared/interfaces/layout.interface";

export const menuItems: IMenuItem[] = [
    {
      id: 'Info',
      label: 'Info',
      icon: 'heroInformationCircle',
      route: '/',
      rolesAllowed:[EMenuRoles.USUARIO,EMenuRoles.OPERADOR,EMenuRoles.ADMIN],
    },
    {
      id: 'orders',
      label: 'Ordens de Serviço',
      icon: 'heroClipboardDocumentList',
      expanded: false,
      children: [
        { id: 'orders-create', label: 'Criar', icon: 'heroPlus', route:'/ordens/nova' },
        { id: 'orders-pending', label: 'Pendentes', icon: 'heroClock', route: '/ordens/pendentes' },
        { id: 'orders-completed', label: 'Minhas Os', icon: 'heroDocumentMagnifyingGlass', route: '/ordens/minhas' },
      ],
      rolesAllowed:[EMenuRoles.USUARIO,EMenuRoles.ADMIN],
    },
    {
      id: 'samples',
      label: 'Amostras',
      icon: 'heroBeaker',
      route: '/amostras',
      rolesAllowed:[EMenuRoles.USUARIO,EMenuRoles.ADMIN],
    },
    {
      id: 'analysis',
      label: 'Análises',
      icon: 'heroBriefcase',
      expanded: false,
      children: [
        { id: 'analysis-waiting-auth', label: 'Aguardando autorização', icon: 'heroExclamationTriangle', route: '/analises/aguardando-autorizacao' },
        { id: 'analysis-waiting', label: 'Aguardando Análise', icon: 'heroClock', route: '/analises/aguardando-analises' },
        { id: 'analysis-progress', label: 'Em andamento', icon: 'heroPlay', route: '/analises/em-progresso' },
        { id: 'analysis-completed', label: 'Finalizadas', icon: 'heroCheckCircle', route: '/analises/finalizadas' }
      ],
      rolesAllowed:[EMenuRoles.OPERADOR,EMenuRoles.ADMIN],
    },
    {
      id: 'manage-orders',
      label: 'Gerenciar OS',
      icon: 'heroAdjustmentsHorizontal',
      expanded: false,
      children: [
        { id: 'manage-dashboard', label: 'Dashboard', icon: 'heroPresentationChartBar', route: '/gerenciar-ordens/dashboard' },
        { id: 'manage-waiting', label: 'Aguardando', icon: 'heroClock', route: '/gerenciar-ordens/aguardando' },
        { id: 'manage-executing', label: 'Aprovação', icon: 'heroPlay', route: '/gerenciar-ordens/aprovacao' },
        { id: 'manage-filter', label: 'Buscar', icon: 'heroMagnifyingGlass', route: '/gerenciar-ordens/buscar' },
         { id: 'manage-agenda', label: 'Agenda', icon: 'heroCalendarDateRange', route: '/gerenciar-ordens/agenda' }
      ],
      rolesAllowed:[EMenuRoles.ADMIN],
    },
    {
      id: 'external-labs',
      label: 'Laboratórios Externos',
      icon: 'heroListBullet',
      expanded: false,
      children: [
        { id: 'lab-ext-dashboard', label: 'Dashboard', icon: 'heroPresentationChartBar', route: '/laboratorios-externos/dashboard' },
        { id: 'resultados', label: 'Resultados', icon: 'heroTableCells', route: '/laboratorios-externos/visualizar-resultados' },
        { id: 'alcaliszinco', label: 'Álcalis e Zinco', icon: 'heroCubeTransparent', route: '/laboratorios-externos/alcalis-zinco' },
        { id: 'lancamento', label: 'Lançamento', icon: 'heroCalculator', route: '/laboratorios-externos/lancamento' },
        { id: 'remessa', label: 'Remessa', icon: 'heroArchiveBox', route: '/laboratorios-externos/remessa' },
        { id: 'amostras', label: 'Amostras', icon: 'heroSquare2Stack', route: '/laboratorios-externos/amostras' },
        { id: 'chemical-elements', label: 'Elementos Químicos', icon: 'heroBeaker', route: '/laboratorios-externos/elementos-quimicos' },
        { id: 'labs', label: 'Laboratórios', icon: 'heroGlobeAmericas', route: '/laboratorios-externos/laboratorios' },
      ],
      rolesAllowed:[EMenuRoles.OPERADOR,EMenuRoles.ADMIN],
    },
    {
      id: 'access-management',
      label: 'Gerenciar Acesso',
      icon: 'heroUserGroup',
      expanded: false,
      children: [
        { id: 'access-authorize', label: 'Gerenciar Acesso', icon: 'heroCheckCircle', route: '/acessos/gerenciar' },
        { id: 'access-create', label: 'Cadastrar Novo Usuário', icon: 'heroUserPlus', route: '/acessos/novo-usuario' }
      ],
      rolesAllowed:[EMenuRoles.ADMIN],
    },
    {
      id: 'settings',
      label: 'Configurações',
      icon: 'heroCog6Tooth',
      expanded: false,
      children: [
        { id: 'settings-analysis', label: 'Configuração de Análise', icon: 'heroBeaker', route: '/configuracoes/analises' },
        { id: 'settings-parameters', label: 'Parâmetros', icon: 'heroAdjustmentsHorizontal', route: '/configuracoes/parametros' },
        { id: 'settings-materials', label: 'Matéria-prima', icon: 'heroCube', route: '/configuracoes/materias-primas' },
        { id: 'settings-analysis-type', label: 'Tipo de Análise', icon: 'heroTag', route: '/configuracoes/tipos-analise' }
      ],
      rolesAllowed:[EMenuRoles.OPERADOR,EMenuRoles.ADMIN],
    }
  ];

export const routeMap: { [key: string]: string } = {
  // --- Início ---
  '/': 'Início',

  // --- Ordens de Serviço ---
  '/ordens': 'Ordens de Serviço',
  '/ordens/nova': 'Criar OS',
  '/ordens/pendentes': 'OS Pendentes',
  '/ordens/minhas': 'Minhas OS',
  '/gerenciar-ordens/dashboard': 'Dashboard de OS',
  '/gerenciar-ordens/aguardando': 'Aguardando',
  '/gerenciar-ordens/aprovacao': 'Aprovação',
  '/gerenciar-ordens/buscar': 'Buscar OS',
  '/gerenciar-ordens/agenda': 'Agenda de OS',

  // --- Amostras ---
  '/amostras': 'Amostras',

  // --- Análises ---
  '/analises': 'Análises',
  '/analises/aguardando-autorizacao': 'Aguardando Autorização',
  '/analises/aguardando-analise': 'Aguardando Análise',
  '/analises/em-andamento': 'Em Andamento',
  '/analises/finalizadas': 'Finalizadas',

  // --- Laboratórios Externos ---
  '/laboratorios-externos': 'Laboratórios Externos',
  '/laboratorios-externos/remessa': 'Remessa',
  '/laboratorios-externos/amostras': 'Amostras Externas',
  '/laboratorios-externos/elementos-quimicos': 'Elementos Químicos',
  '/laboratorios-externos/laboratorios': 'Laboratórios',
  '/laboratorios-externos/resultados': 'Resultados Químicos',

  // --- Acessos ---
  '/acessos': 'Gerenciar Acesso',
  '/acessos/gerenciar': 'Gerenciar Acesso',
  '/acessos/novo-usuario': 'Cadastrar Novo Usuário',

  // --- Configurações ---
  '/configuracoes': 'Configurações',
  '/configuracoes/analises': 'Configuração de Análises',
  '/configuracoes/parametros': 'Parâmetros',
  '/configuracoes/materias-primas': 'Matéria-prima',
  '/configuracoes/tipos-analise': 'Tipos de Análise',
};

